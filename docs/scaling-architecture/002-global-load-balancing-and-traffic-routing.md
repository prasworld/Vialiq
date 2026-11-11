# Scaling Architecture: Global Load Balancing, Ingress Traffic Routing, and High-Concurrency Compute Autoscaling

> **Document ID:** `VIALIQ-SCALE-002`  
> **Domain:** Platform Scalability — Network Ingress, Load Balancing & Compute Elasticity  
> **Status:** Accepted  
> **Date:** October 22, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** Cloudflare Anycast, AWS Application Load Balancer (ALB) / Envoy Ingress, Kubernetes 1.30+ (HPA & KEDA), ASP.NET Core 9.0 Kestrel  
> **Related Documents:**
> - [Scale 001: Database Horizontal Scaling & Sharding](./001-database-horizontal-scaling-and-sharding.md)
> - [API ADR 005: Foundations, Auth & SignalR Real-Time](../backend-architecture/api/005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [API ADR 006: Controller Conventions & HTTP QUERY](../backend-architecture/api/006-api-controller-conventions-seeding-and-migration-adr.md)

---

## 1. Executive Summary & Clinical Traffic Profile

Clinical EDC systems exhibit a unique traffic profile distinct from consumer social networks or e-commerce:
* **Global Geographic Distribution**: Investigators and clinical research coordinators (CRCs) access the platform from 50+ countries across timezones (Americas, Europe, Asia-Pacific).
* **High-Variance Request Payloads**: Requests range from lightweight form lock status updates and real-time query alerts to heavy 15MB multipart form attachments, complex JsonLogic query ASTs, and 50MB CDISC export jobs.
* **Bursty Operational Milestones**: During "Database Lock" milestones or regulatory submission deadlines, hundreds of monitors simultaneously log in, running bulk discrepancy sweeps and e-signatures.

To maintain **sub-50ms p99 latency** and **99.99% availability** for 100,000+ concurrent active clinical users, Vialiq implements a **4-Tier Ingress and Load Balancing Architecture**:

```
                       THE 4-TIER TRAFFIC INGRESS TOPOLOGY
                                        │
        ┌───────────────────────────────┴───────────────────────────────┐
        ▼                                                               ▼
Tier 1: Global Edge (Cloudflare Anycast)                Tier 2: Cloud L7 Ingress (Envoy / AWS ALB)
• Anycast Geo-DNS & BGP Routing                         • TLS 1.3 Termination & SNI Router
• DDoS Layer 3/4/7 Mitigation                           • Dynamic Path & Host Header Rewriting
• Web Application Firewall (WAF)                        • Weighted Least-Connections Dispatch
        │                                                               │
        └───────────────────────────────┬───────────────────────────────┘
                                        │
        ┌───────────────────────────────┴───────────────────────────────┐
        ▼                                                               ▼
Tier 3: Kubernetes Service Mesh                         Tier 4: Elastic .NET 9 Kestrel Pods
• In-Cluster Kube-Proxy / Cilium eBPF                   • Horizontal Pod Autoscaler (HPA + KEDA)
• Power of Two Choices (P2C) Balancing                  • Zero-Session Affinity (Stateless JWT)
• Connection Draining (Graceful Shutdown)               • Dynamic PGO & High-Throughput HTTP/3
```

---

## 2. Tier 1: Edge Anycast DNS & WAF Perimeter

All public traffic targets global Anycast IP addresses managed by **Cloudflare Enterprise / AWS Route 53**:
1. **BGP Anycast Routing**: User requests automatically route to the nearest of 300+ global edge points of presence (PoPs), minimizing transatlantic TCP handshake latency.
2. **DDoS & Rate Limiting**: Absorbs volumetric Layer 3/4 attacks (SYN floods, UDP amplification) at the edge, protecting Kubernetes cluster ingress nodes from bandwidth saturation.
3. **Clinical Bot & Credential-Stuffing Mitigation**: Enforces strict rate limits on authentication endpoints (`POST /api/v1/auth/login` capped at 5 attempts per IP/minute) to satisfy FDA 21 CFR Part 11 § 11.300 password guessing protection.

---

## 3. Tier 2: Layer 7 Application Load Balancing Architecture

At the Kubernetes cluster boundary, an enterprise **Layer 7 Application Load Balancer** (AWS ALB or Envoy Ingress Controller) orchestrates incoming HTTP, HTTPS, and WebSocket traffic.

### 3.1 Balancing Algorithm: Why Round-Robin Fails
* **The Failure of Round-Robin in Clinical Systems**: A round-robin algorithm naively assigns Request 1 to Pod A, Request 2 to Pod B, etc. If Pod A receives three consecutive 100,000-page CDISC export calculations while Pod B receives three lightweight ping requests, Pod A suffers CPU exhaustion and thread-starvation, leading to timeouts.
* **The Accepted Standard: Weighted Least-Connections + P2C (Power of Two Choices)**:
  * **Weighted Least-Connections**: Envoy tracks the exact number of active open HTTP requests per pod and routes incoming traffic to the pod with the lowest active workload.
  * **Power of Two Choices (P2C)**: Picks two random healthy pods and routes to the one with lower load, avoiding the "herd effect" where all traffic suddenly rushes to a single pod that just booted.

### 3.2 Stateless JWT Routing vs. Sticky Sessions
In legacy monolithic web applications, load balancers require **Sticky Sessions (Session Affinity)**, binding a user's browser cookie to a specific physical server.
* **The Vulnerability of Sticky Sessions**: If Server A hosts 500 active investigators and suddenly crashes, all 500 users lose uncommitted clinical data and are logged out. Furthermore, auto-scaling is crippled because traffic cannot be redistributed smoothly.
* **Vialiq's Stateless Architecture**:
  * **Zero Sticky Sessions for REST APIs**: Every clinical mutation passes a cryptographically verified JWT bearer token containing tenant and user claims. Any of the 50 API pods can process any request from any user at any millisecond.
  * **WebSockets / SignalR Routing**: Real-time connections (`/hubs/edc`) maintain a persistent WebSocket connection to a specific pod, but **state is distributed via the Redis Backplane**. If Pod A dies, the Angular `@microsoft/signalr` client reconnects to Pod B in < 500ms and immediately resumes receiving query and form-level lock state notifications (`ADR 003`).

---

## 4. Tier 3 & 4: Elastic Compute Autoscaling (K8s HPA + KEDA)

To handle massive concurrency swings between clinic off-hours and peak monitoring days, the API tier employs **Dual-Metric Autoscaling**:

```
                                AUTOSCALING METRIC MATRIX
                                            │
        ┌───────────────────────────────────┴───────────────────────────────────┐
        ▼                                                                       ▼
Traditional Resource Metrics (HPA)                      Event-Driven Queue Metrics (KEDA)
• CPU Utilization (> 70% threshold)                     • Active HTTP Request Queue Depth (> 50 / pod)
• Memory Working Set (> 80% threshold)                  • Active SignalR WebSocket Connections (> 2,000 / pod)
• Scale Step: 3 pods baseline to 50 pods max            • Redis Export Job Queue Depth (> 10 pending jobs)
```

### 4.1 Architecture: Unified Elastic Autoscaling via KEDA (`keda.sh/v1alpha1`)

In Kubernetes 1.30+, defining a standalone `HorizontalPodAutoscaler` (`autoscaling/v2`) alongside a KEDA `ScaledObject` that targets the same deployment causes an **infinite reconciliation conflict**: both the native HPA controller and the KEDA operator fight to write `.spec.replicas`.

To eliminate controller split-brain, **KEDA `ScaledObject` serves as the authoritative single source of truth**:
1. KEDA automatically generates and manages the underlying Kubernetes `HorizontalPodAutoscaler` resource.
2. KEDA's in-cluster External Metrics Server exposes custom Prometheus and Redis triggers via the Kubernetes `external.metrics.k8s.io` API.
3. KEDA combines traditional resource triggers (CPU, Memory) with event-driven traffic triggers (SignalR WebSockets, HTTP in-flight queue, Redis export queue) within a unified mathematical evaluation loop.

---

### 4.2 Complete API Pod Autoscaling Manifest (`k8s/vialiq-api-scaledobject.yaml`)

This manifest drives the high-concurrency API compute tier (`vialiq-api`), scaling elastically between 3 baseline pods (for multi-AZ resilience) and 50 pods during peak worldwide investigator monitoring shifts.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: vialiq-api-scaler
  namespace: vialiq-edc
  labels:
    app.kubernetes.io/name: vialiq-api
    app.kubernetes.io/part-of: vialiq-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vialiq-api
  minReplicaCount: 3      # High-Availability baseline across 3 Availability Zones
  maxReplicaCount: 50     # Elastic ceiling for global Phase 3 enrollment bursts
  cooldownPeriod: 300     # 5-minute scale-down cooldown to prevent flapping
  pollingInterval: 15     # KEDA metric polling interval in seconds
  advanced:
    restoreToOriginalReplicaCount: false
    horizontalPodAutoscalerConfig:
      name: vialiq-api-hpa
      behavior:
        # Aggressive Scale-Up: Rapidly add pods during clinical burst traffic
        scaleUp:
          stabilizationWindowSeconds: 0
          policies:
            - type: Percent
              value: 100        # Double pod count if load surges
              periodSeconds: 15
            - type: Pods
              value: 5
              periodSeconds: 15
          selectPolicy: Max
        # Conservative Scale-Down: Prevent flapping during momentary traffic pauses
        scaleDown:
          stabilizationWindowSeconds: 300 # 5-minute cooldown before de-provisioning
          policies:
            - type: Percent
              value: 10
              periodSeconds: 60
          selectPolicy: Min
  triggers:
    # ── 1. Traditional Resource Metrics (Metrics Server) ─────────────────
    - type: cpu
      metricType: Utilization
      metadata:
        value: "70" # Scale out when average pod CPU exceeds 70%

    - type: memory
      metricType: Utilization
      metadata:
        value: "80" # Scale out when average memory working set exceeds 80%

    # ── 2. Event-Driven: Active HTTP Requests In Flight (Prometheus) ──────
    - type: prometheus
      metadata:
        serverAddress: http://prometheus-k8s.monitoring.svc.cluster.local:9090
        metricName: http_requests_in_flight_per_pod
        query: >-
          sum(http_requests_in_flight{namespace="vialiq-edc"}) 
          / 
          count(kube_pod_status_ready{namespace="vialiq-edc",pod=~"vialiq-api-.*"})
        threshold: "50" # Scale out when average concurrent requests per pod exceed 50

    # ── 3. Event-Driven: Active SignalR WebSocket Connections (Prometheus) 
    - type: prometheus
      metadata:
        serverAddress: http://prometheus-k8s.monitoring.svc.cluster.local:9090
        metricName: signalr_active_connections_per_pod
        query: >-
          sum(signalr_connections_active{namespace="vialiq-edc"}) 
          / 
          count(kube_pod_status_ready{namespace="vialiq-edc",pod=~"vialiq-api-.*"})
        threshold: "2000" # Scale out when average active SignalR sockets exceed 2,000 per pod
```

---

### 4.3 Asynchronous Processing Tier Autoscaling: Redis Export Queue (`k8s/vialiq-export-worker-scaledobject.yaml`)

Heavy, asynchronous clinical workloads—such as 100,000-page CDISC ODM-XML exports, PDF patient record books, and batch safety dumps—are offloaded from HTTP threads into Redis queues (Scale 004).

The background worker tier (`vialiq-export-worker`) scales from 0 (or 1 warm baseline) up to 20 worker pods strictly driven by **Redis queue depth**:

```yaml
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: keda-redis-trigger-auth
  namespace: vialiq-edc
spec:
  secretTargetRef:
    - parameter: password
      name: vialiq-redis-credentials
      key: password
---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: vialiq-export-worker-scaler
  namespace: vialiq-edc
  labels:
    app.kubernetes.io/name: vialiq-export-worker
    app.kubernetes.io/part-of: vialiq-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vialiq-export-worker
  minReplicaCount: 1      # Baseline 1 worker to eliminate cold-start lag; supports 0 for dev
  maxReplicaCount: 20     # Maximum worker ceiling for batch export workloads
  cooldownPeriod: 180     # 3-minute cooldown after drain before scaling down
  pollingInterval: 10     # Fast 10-second polling for pending export queue items
  advanced:
    horizontalPodAutoscalerConfig:
      name: vialiq-export-worker-hpa
      behavior:
        scaleUp:
          stabilizationWindowSeconds: 0
          policies:
            - type: Pods
              value: 4
              periodSeconds: 15
          selectPolicy: Max
        scaleDown:
          stabilizationWindowSeconds: 180
          policies:
            - type: Percent
              value: 20
              periodSeconds: 60
  triggers:
    # ── Event-Driven: Redis Pending Export Job Queue Depth ────────────────
    - type: redis
      metadata:
        address: redis-ha-haproxy.redis-cluster.svc.cluster.local:6379
        listName: "edc:export:jobs:pending" # Redis List holding asynchronous export job IDs
        listLength: "10"                    # Scale 1 worker pod for every 10 pending jobs
        enableTLS: "true"
      authenticationRef:
        name: keda-redis-trigger-auth
```

---

### 4.4 Telemetry Instrumentation & Metrics Pipeline

To feed KEDA's Prometheus and Redis scalers with zero delay:

1. **Active HTTP In-Flight Metric**:
   ASP.NET Core 9 registers an in-memory middleware counter that increments on request ingress and decrements on response completion, exposed via the `/metrics` endpoint as `http_requests_in_flight`.
2. **SignalR Active WebSockets Metric**:
   `Vialiq.Api.Hubs.EdcHub` tracks active WebSocket lifetimes:
   ```csharp
   public override async Task OnConnectedAsync()
   {
       MetricsRegistry.SignalRActiveConnections.Add(1);
       await base.OnConnectedAsync();
   }

   public override async Task OnDisconnectedAsync(Exception? exception)
   {
       MetricsRegistry.SignalRActiveConnections.Add(-1);
       await base.OnDisconnectedAsync(exception);
   }
   ```
3. **Redis Export Queue Ingestion**:
   When an investigator requests a 50MB CDISC export, the API enqueues the job via `RPUSH edc:export:jobs:pending {jobId}`. The KEDA Redis scaler reads `LLEN edc:export:jobs:pending` directly against the HAProxy Redis endpoint without querying application pods, triggering worker scale-out before any worker CPU is consumed.

---

## 5. Zero-Downtime Deployments & Connection Draining

During Kubernetes rolling updates or pod scale-down events, active clinical users must **never experience dropped connections, broken transactions, or failed CRF saves**.

### 5.1 The 30-Second Graceful Connection Draining Lifecycle

```
Kubernetes API                Kubelet Node             vialiq-api Pod (Kestrel)       AWS ALB / Ingress
     │                             │                              │                           │
     │ 1. kubectl delete pod       │                              │                           │
     ├────────────────────────────►│                              │                           │
     │                             │ 2. Deregisters from Endpoint │                           │
     │                             ├──────────────────────────────┼──────────────────────────►│ 3. Stops sending
     │                             │                              │                           │    new requests
     │                             │ 4. SIGTERM + preStop Hook    │                           │
     │                             ├─────────────────────────────►│                           │
     │                             │                              │ 5. Closes keep-alive      │
     │                             │                              │    Completes in-flight    │
     │                             │                              │    clinical transactions  │
     │                             │                              │    (Up to 30s timeout)    │
     │                             │                              │                           │
     │                             │                              │ 6. Exits cleanly (Code 0) │
     │                             │                              ├──────────────────────────►│
```

### 5.2 Implementation in `Program.cs` and Deployment Manifest

In `backend/api/src/Vialiq.Api/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel Graceful Shutdown Timeout
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(60);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
    options.Limits.MaxConcurrentConnections = 10000;
    options.Limits.MaxConcurrentUpgradedConnections = 5000; // WebSockets
});

builder.Services.Configure<HostOptions>(options =>
{
    // Give in-flight clinical ACID transactions up to 30 seconds to commit cleanly
    options.ShutdownTimeout = TimeSpan.FromSeconds(30);
});
```

And in the Kubernetes deployment manifest (`spec.template.spec`):

```yaml
spec:
  # MUST exceed preStop (5s) + Kestrel ShutdownTimeout (30s) + safety margin (10s) = 45s
  # Prevents Kubernetes from sending an abrupt SIGKILL while in-flight clinical transactions drain
  terminationGracePeriodSeconds: 45
  containers:
    - name: vialiq-api
      image: vialiq/api:latest
      lifecycle:
        preStop:
          exec:
            command:
              # Sleep 5 seconds to ensure Ingress / ALB endpoint removal propagates globally
              - "/bin/sh"
              - "-c"
              - "sleep 5"
```

> [!IMPORTANT]
> **Pod Graceful Draining Formula:**  
> In Kubernetes, `terminationGracePeriodSeconds` encompasses both the `preStop` hook execution and the container process shutdown. Leaving it at the 30-second default would cause Kubernetes to send `SIGKILL` at $t = 30\text{s}$, giving Kestrel only $25\text{s}$ ($30\text{s} - 5\text{s}$) before killing in-flight clinical transactions. Setting `terminationGracePeriodSeconds: 45` guarantees the full 30-second draining window plus a 10-second margin for container teardown:  
> $$\text{terminationGracePeriodSeconds (45s)} \ge \text{preStop sleep (5s)} + \text{Kestrel ShutdownTimeout (30s)} + \text{OS Buffer (10s)}$$

---

## 6. Real-Time WebSocket Graceful Handoff

When an API pod terminates during a scale-down, connected SignalR WebSockets must not drop silently:
1. When Kestrel initiates shutdown, `EdcCollaborationHub` broadcasts a `ServerDrainingNotification` to all connected browser sessions.
2. The Angular `EdcRealtimeService` receives this notification, preserves the local form dirty state in memory, and triggers an instantaneous reconnection to the load balancer:
   ```typescript
   this.hubConnection.on('ServerDraining', async () => {
     console.log('Server is draining for update; gracefully failing over to sibling pod...');
     await this.hubConnection.stop();
     await this.connectToForm(this.currentStudyId, this.currentSubjectId, this.currentFormId, this.authToken);
   });
   ```
3. The load balancer routes the connection to a healthy sibling pod. Form-level locks remain durably persisted across MongoDB + Redis (`ADR 003`), so the client immediately resumes receiving workspace updates (`FormLockStateChanged` / queries) via Redis Pub/Sub without losing lock state.

---

## 7. Load Balancing Capacity & SLA Scorecard

| Performance Metric | Single-Node Baseline | Multi-Pod Scaled Cluster | Production Guarantee |
|---|---|---|---|
| **Max Concurrent Clinical Users** | 1,500 Users | **100,000+ Users** | **Zero session drops** |
| **HTTP Request Throughput** | 1,200 Req/sec | **35,000+ Req/sec** | **p99 < 50ms latency** |
| **Active Concurrent WebSockets** | 2,000 Connections | **80,000+ Connections** | **SignalR + Redis backplane** |
| **Availability SLA** | 99.5% | **99.99% (Four Nines)** | **Multi-AZ K8s across 3 zones** |
| **Deployment Downtime** | 2-5 minutes | **Zero Seconds (0s)** | **RollingUpdate maxUnavailable: 0** |
