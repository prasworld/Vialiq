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
* **High-Variance Request Payloads**: Requests range from lightweight 200-byte heartbeat pings and real-time field-lock acquisitions to heavy 15MB multipart form attachments, complex JsonLogic query ASTs, and 50MB CDISC export jobs.
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
  * **WebSockets / SignalR Routing**: Real-time connections (`/hubs/edc`) maintain a persistent WebSocket connection to a specific pod, but **state is distributed via the Redis Backplane**. If Pod A dies, the Angular `@microsoft/signalr` client reconnects to Pod B in < 500ms and immediately resumes receiving field-lock notifications.

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

### Complete Kubernetes HPA Manifest (`k8s/vialiq-api-hpa.yaml`)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vialiq-api-hpa
  namespace: vialiq-edc
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vialiq-api
  minReplicas: 3      # High-Availability baseline across 3 Availability Zones
  maxReplicas: 50     # Elastic ceiling for global Phase 3 enrollment spikes
  metrics:
    # 1. CPU Target
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    # 2. Memory Target
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    # 3. Custom Metric: Active Concurrent Requests per Pod (via Prometheus)
    - type: Pods
      pods:
        metric:
          name: http_requests_in_flight
        target:
          type: AverageValue
          averageValue: "50"
  behavior:
    # Aggressive Scale-Up: Double pods rapidly when clinical burst occurs
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 5
          periodSeconds: 15
      selectPolicy: Max
    # Conservative Scale-Down: Prevent flapping during temporary pauses
    scaleDown:
      stabilizationWindowSeconds: 300 # 5-minute cooldown
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

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

And in the Kubernetes deployment manifest `lifecycle.preStop`:

```yaml
lifecycle:
  preStop:
    exec:
      command:
        # Sleep 5 seconds to ensure ALB endpoint removal propagates globally
        - "/bin/sh"
        - "-c"
        - "sleep 5"
```

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
3. The load balancer routes the connection to a healthy sibling pod. The client re-registers its active field leases via Redis, achieving a **100% transparent failover without user disruption**.

---

## 7. Load Balancing Capacity & SLA Scorecard

| Performance Metric | Single-Node Baseline | Multi-Pod Scaled Cluster | Production Guarantee |
|---|---|---|---|
| **Max Concurrent Clinical Users** | 1,500 Users | **100,000+ Users** | **Zero session drops** |
| **HTTP Request Throughput** | 1,200 Req/sec | **35,000+ Req/sec** | **p99 < 50ms latency** |
| **Active Concurrent WebSockets** | 2,000 Connections | **80,000+ Connections** | **SignalR + Redis backplane** |
| **Availability SLA** | 99.5% | **99.99% (Four Nines)** | **Multi-AZ K8s across 3 zones** |
| **Deployment Downtime** | 2-5 minutes | **Zero Seconds (0s)** | **RollingUpdate maxUnavailable: 0** |
