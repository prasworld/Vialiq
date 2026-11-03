# Vialiq EDC — Enterprise Load Balancer, Ingress & Traffic Routing Architecture Guide

> **Document ID:** `VIALIQ-DEPLOY-002`  
> **Status:** Sealed & Approved  
> **Version:** 1.0.0  
> **Date:** November 3, 2026  
> **Author:** Enterprise Architecture Team / Prashant Gupta  
> **Target Systems:** Cloudflare Anycast, AWS ALB / Envoy Ingress, Kubernetes 1.30+, Windows Server 2022/2025 (IIS 10 ARR), Local Developer Nginx Gateway  
> **Compliance Standards:** FDA 21 CFR Part 11, GAMP 5 Category 4/5, HIPAA Security Rule, EU GDPR

---

## Executive Summary

In clinical trials, an unexpected network disconnection or dropped HTTP transaction during a **Database Lock** or **Electronic Signature** submission can invalidate regulatory audits, delay Phase 3 milestones, or violate FDA 21 CFR Part 11 compliance.

The Load Balancer and Ingress layer in **Vialiq EDC** is not merely a round-robin port forwarder; it is an intelligent, high-availability Layer 7 traffic orchestrator that:
1. **Unifies All Platform Services Under a Single Ingress Hostname:** Eliminates cross-origin resource sharing (CORS) complexity and guarantees unified cookie security boundaries.
2. **Eliminates Sticky Sessions for Clinical APIs:** Routes requests statelessly via cryptographically signed JWTs while offloading real-time WebSocket state to a distributed Redis backplane.
3. **Prevents the "Herd Effect" via Advanced Balancing Algorithms:** Uses **Weighted Least-Connections (EWMA)** and **Power of Two Choices (P2C)** to ensure long-running CDISC exports do not starve lightweight audit queries.
4. **Supports Dual-Platform Deployments:** Provides turn-key configurations for both **Cloud-Native Linux/Kubernetes** and **Enterprise Windows Server / IIS Application Request Routing (ARR 3.0)**.
5. **Provides a Zero-CORS Local Developer Gateway:** Allows engineers to work against a single `http://localhost:80` entry point without port juggling.

---

## 1. High-Level Ingress & Load Balancing Architecture

```
                                [ CLINICAL INVESTIGATORS & MONITORS ]
                                                  │
                                                  ▼ HTTPS / TLS 1.3 (Port 443)
                                  ┌───────────────────────────────┐
                                  │      EDGE CDN & WAF TIER      │
                                  │   (Cloudflare / AWS CloudFront│
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    ENTERPRISE L7 LOAD BALANCER│
                                  │  (AWS ALB / NGINX Ingress /   │
                                  │      Windows IIS ARR 3.0)     │
                                  └───────────────┬───────────────┘
                                                  │
        ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
        ▼ Path: /* (Static Assets)                ▼ Path: /api/* (REST)                     ▼ Path: /hubs/* (SignalR)
┌───────────────────────┐                 ┌───────────────────────┐                 ┌───────────────────────┐
│   Angular Web Shell   │                 │   .NET 9 API Cluster  │                 │  .NET 9 WebSocket Hub │
│   - Nginx / S3 / IIS  │                 │   - Stateless REST    │                 │   - Field-Lock PubSub │
│   - Cache: 1yr hashed │                 │   - DynamicDbResolver │                 │   - Redis Backplane   │
│   - env.json: no-cache│                 │   - OCC Concurrency   │                 │   - Upgrade: websocket│
└───────────────────────┘                 └───────────────────────┘                 └───────────────────────┘
```

### Ingress Path Routing Topology:

| URL Path Pattern | Destination Service | Protocol | Session Affinity | Timeout | Cache Policy |
|---|---|---|---|---|---|
| `/*` | Frontend Web (`apps/shell`) | HTTP/2, HTTP/3 | None | 15s | Hashed: 1yr; Entrypoints: `no-cache` |
| `/api/*` | Backend API (`backend/api`) | HTTP/2 | **None (Stateless JWT)** | 60s | `no-store` (Clinical Data) |
| `/hubs/*` | Real-Time SignalR (`/hubs/edc`) | WebSockets / WSS | Pinned Handshake | 3600s | N/A (Persistent Streaming) |
| `/healthz/*` | ASP.NET Core Health Checks | HTTP/1.1 | None | 2s | Internal Load Balancer only |

---

## 2. Environment 1: Cloud-Native Production (Kubernetes / AWS ALB / NGINX Ingress)

In Kubernetes-based cloud environments (AWS EKS, Azure AKS, GCP GKE), a two-stage load balancer topology is employed:
1. **Cloud L7 Edge Balancer (e.g., AWS Application Load Balancer):** Manages external DNS, terminates public TLS 1.3 certificates, handles DDoS protection, and forwards traffic to the Kubernetes cluster worker nodes.
2. **Kubernetes Ingress Controller (NGINX Ingress / Envoy):** Evaluates path rules, injects Part 11 audit headers, enforces rate limits, and load balances across pod replicas.

### 2.1 Complete Kubernetes Ingress Manifest (`k8s/vialiq-ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vialiq-ingress
  namespace: vialiq-edc
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    
    # 1. Advanced Balancing Algorithm: Exponentially Weighted Moving Average (EWMA)
    # Replaces round-robin to prevent heavy CDISC export calculations from overloading pods
    nginx.ingress.kubernetes.io/load-balance: "ewma"
    
    # 2. Maximum Payload Size: 30MB for high-resolution medical imaging & lab attachments
    nginx.ingress.kubernetes.io/proxy-body-size: "30m"
    
    # 3. Connection Timeouts & Keep-Alive
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "5"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    
    # 4. WebSocket & Real-Time Upgrade Headers
    nginx.ingress.kubernetes.io/websocket-services: "vialiq-api-service"
    
    # 5. Security & Regulatory Headers (FDA 21 CFR Part 11 & HSTS)
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Frame-Options: DENY";
      more_set_headers "X-Content-Type-Options: nosniff";
      more_set_headers "Strict-Transport-Security: max-age=31536000; includeSubDomains";
      more_set_headers "Referrer-Policy: strict-origin-when-cross-origin";
      more_set_headers "X-Request-ID: $req_id";
      
    # 6. Anti-Brute-Force Rate Limiting (Part 11 § 11.300)
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-burst-multiplier: "5"
spec:
  tls:
    - hosts:
        - "app.vialiq.cloud"
        - "*.vialiq.cloud"
      secretName: vialiq-wildcard-tls
  rules:
    - host: "app.vialiq.cloud"
      http:
        paths:
          # REST API Route
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: vialiq-api-service
                port:
                  number: 5000
                  
          # Real-Time WebSocket Hub Route
          - path: /hubs
            pathType: Prefix
            backend:
              service:
                name: vialiq-api-service
                port:
                  number: 5000
                  
          # Angular Static Web Shell Route
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vialiq-web-service
                port:
                  number: 80
```

### 2.2 Health Check & Automatic Node Eviction

The load balancer must continuously audit the health of each backend pod. If a pod's MongoDB connection times out or Redis fails, the load balancer automatically evicts the instance from the routing pool:

* **Health Probe Endpoint:** `GET /healthz/ready`
* **Check Interval:** 5 seconds
* **Response Timeout:** 2 seconds
* **Unhealthy Eviction Threshold:** 2 consecutive failures ($\le 10$ seconds to total eviction)
* **Healthy Re-admission Threshold:** 2 consecutive successes

### 2.3 Graceful Connection Draining
To ensure that an active clinical investigator submitting a critical Adverse Event (AE) is never disconnected during a rolling software release:
* When Kubernetes marks a pod for termination, the load balancer stops routing new requests immediately.
* **Deregistration Delay (Connection Draining):** Configured to **30 seconds**. In-flight HTTP transactions and Redis OCC locks are given 30 seconds to commit cleanly to MongoDB before the process is killed.

---

## 3. Environment 2: Enterprise Pharma / Windows Server (Client Mandate Scenario)

In environments where enterprise pharmaceutical IT mandates Windows Server (2022/2025) and on-premise infrastructure, load balancing is achieved through either a hardware load balancer or native IIS software balancing.

```
                           [ CLIENT BROWSER / CLINICAL SITE ]
                                           │
                                           ▼ HTTPS (Port 443)
                        ┌─────────────────────────────────────┐
                        │     HARDWARE / CLOUD LOAD BALANCER  │
                        │ (F5 BIG-IP / Citrix / Azure App GW) │
                        └──────────────────┬──────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼ (Round-Robin / Least-Conn)                  ▼
     ┌──────────────────────────────┐              ┌──────────────────────────────┐
     │  Windows Server 2022 Node 1  │              │  Windows Server 2022 Node 2  │
     ├──────────────────────────────┤              ├──────────────────────────────┤
     │ • IIS 10 (Port 443)          │              │ • IIS 10 (Port 443)          │
     │ • URL Rewrite + ARR 3.0      │              │ • URL Rewrite + ARR 3.0      │
     │ • In-Process ANCM (w3wp.exe) │              │ • In-Process ANCM (w3wp.exe) │
     │ • Web-WebSockets Feature     │              │ • Web-WebSockets Feature     │
     └──────────────────────────────┘              └──────────────────────────────┘
```

### 3.1 Pattern A: Hardware Load Balancer in Front of Windows Server Farm
* **Appliance:** F5 BIG-IP, Citrix ADC (NetScaler), or Azure Application Gateway.
* **Configuration:**
  * Virtual Server listening on port `443` with corporate SSL certificate.
  * Health Monitor: HTTP `GET /healthz/ready` expecting `HTTP 200 OK`.
  * Load Balancing Method: `Least Connections (member)` or `Observed (member)`.
  * Persistence: **None** (stateless JWT authentication).
  * Backend pool: Points to the IP addresses of the Windows Server instances running IIS.

---

### 3.2 Pattern B: IIS Software Load Balancer (Application Request Routing - ARR 3.0)
If the client does not possess a hardware appliance, an IIS server can act as the Layer 7 reverse proxy and load balancer using **Application Request Routing (ARR 3.0)**:

1. **Install IIS Features (PowerShell):**
   ```powershell
   Install-WindowsFeature -Name Web-Server, Web-WebSockets, Web-AppInit
   # Install Application Request Routing 3.0 & URL Rewrite 2.1 via WebPI / MSI
   ```
2. **Configure ARR Server Farm (`VialiqApiFarm`):**
   * In IIS Manager &rarr; **Server Farms** &rarr; **Create Server Farm**: Name: `VialiqApiFarm`.
   * Add Server Nodes: `10.0.1.11`, `10.0.1.12`, `10.0.1.13`.
   * **Load Balance Algorithm:** Select `Least current requests`.
   * **Health Check:** URL: `http://VialiqApiFarm/healthz/ready`, Interval: `5 seconds`, Timeout: `2 seconds`.

#### IIS ARR Routing `web.config`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- 1. Route /api traffic to the ARR Server Farm -->
        <rule name="ARR API Balancing" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://VialiqApiFarm/api/{R:1}" />
        </rule>
        
        <!-- 2. Route /hubs WebSockets traffic to the ARR Server Farm -->
        <rule name="ARR WebSocket Balancing" stopProcessing="true">
          <match url="^hubs/(.*)" />
          <action type="Rewrite" url="http://VialiqApiFarm/hubs/{R:1}" />
        </rule>

        <!-- 3. Local SPA Fallback for Web Shell -->
        <rule name="Angular SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api|hubs)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Enable WebSockets Protocol -->
    <webSocket enabled="true" />
  </system.webServer>
</configuration>
```

---

## 4. Environment 3: Local Development Load Balancer (Zero-CORS Gateway)

### 4.1 The Development Problem
In standard local development, the frontend runs on `http://localhost:4200` and the API runs on `http://localhost:5000`. This causes three friction points:
1. **Cross-Origin Resource Sharing (CORS):** The browser blocks cookies and headers unless permissive CORS headers are configured.
2. **Cookie Mismatches:** Secure cookies (`SameSite=Strict`, `Secure`) fail across differing local ports.
3. **Module Federation Remote URL Conflicts:** Micro-frontend chunks can trigger mixed-port blocking.

### 4.2 The Solution: Local Dockerized Nginx Gateway
We provide a lightweight reverse proxy container listening on **`http://localhost:80`**, unifying frontend and backend under a single origin:

#### Local Gateway Configuration (`tools/docker/nginx/nginx.dev.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    upstream web_shell {
        # Host machine Angular Dev Server
        server host.docker.internal:4200;
    }

    upstream api_backend {
        # Host machine .NET 9 Web API
        server host.docker.internal:5000;
    }

    server {
        listen 80;
        server_name localhost;

        # 1. API Reverse Proxy
        location /api/ {
            proxy_pass http://api_backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 2. Real-Time SignalR WebSockets
        location /hubs/ {
            proxy_pass http://api_backend/hubs/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 3600s;
        }

        # 3. Swagger UI Passthrough
        location /swagger/ {
            proxy_pass http://api_backend/swagger/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }

        # 4. Frontend Web Shell (Fallback)
        location / {
            proxy_pass http://web_shell/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

#### How to Run the Local Gateway:
Developers can spin up the gateway via Docker Compose:
```bash
docker run -d --name vialiq-dev-gateway \
  -p 80:80 \
  --add-host=host.docker.internal:host-gateway \
  -v $(pwd)/tools/docker/nginx/nginx.dev.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```
* **Developer Experience:** Visiting `http://localhost/` loads the Angular Web Shell; all API requests to `/api/...` automatically route to `.NET 9` with **0% CORS configuration required**.

---

## 5. Real-Time WebSockets & SignalR Load Balancing

Vialiq EDC maintains live field-level editing locks and instant discrepancy alerts via **ASP.NET Core SignalR**.

### 5.1 The Sticky Connection vs. Distributed State Problem
* WebSockets require a persistent, stateful TCP socket connection between the client and a specific server instance.
* In traditional setups, if Server A crashes, all users connected to Server A lose connection and fail to receive updates.

### 5.2 Vialiq's Distributed Architecture (Redis Backplane)
1. **Initial Handshake (`POST /hubs/edc/negotiate`):**
   * The load balancer routes the HTTP negotiate request to any healthy API pod.
   * The pod returns supported connection protocols and a connection token.
2. **WebSocket Upgrade (`GET /hubs/edc`):**
   * The client sends `Connection: Upgrade` and `Upgrade: websocket`.
   * The load balancer upgrades the HTTP connection to a persistent bi-directional WebSocket stream with a **3600-second idle timeout**.
3. **Redis Backplane Message Fan-Out:**
   * When User 1 acquires a lock on `Form_VitalSigns` on Pod A, Pod A publishes a message to Redis channel `vialiq:pubsub:locks`.
   * Pods B, C, and D receive the Redis message and push the lock update to their respective connected clients.
   * **Result:** No sticky sessions required for application logic. If Pod A fails, Angular auto-reconnects to Pod B in $< 500\text{ ms}$ and resumes immediately.

---

## 6. FDA 21 CFR Part 11 Regulatory Rules at the Load Balancer

```
=============================================================================================================
LOAD BALANCER REGULATORY & SECURITY SAFEGUARDS
=============================================================================================================
Mandate                   Regulation               Load Balancer Enforcement Mechanism
-------------------------------------------------------------------------------------------------------------
1. Password Guessing      21 CFR Part 11 § 11.300  Rate limit /api/v1/auth/login to max 5 attempts/min/IP.
2. Audit Trail Linkage    21 CFR Part 11 § 11.10   Inject unique X-Request-ID (UUIDv7) on all ingress calls.
3. Man-in-the-Middle      HIPAA Security Rule      Enforce TLS 1.3 only, eliminate TLS 1.0/1.1 and weak ciphers.
4. Clickjacking Defense   OWASP Top 10             Inject 'X-Frame-Options: DENY' to prevent hidden overlays.
5. Buffer Exhaustion      GAMP 5 Security          Enforce client_max_body_size = 30M; drop oversized requests.
6. Zero Dropped Edits     GAMP 5 Availability      Enforce 30s connection draining before terminating pods.
=============================================================================================================
```

---

## 7. Operational Verification & Troubleshooting Runbook

### Check 1: Verifying Health Check Eviction
Simulate a backend pod failure and verify the load balancer stops routing:
```bash
# Verify health check returns 200 OK
curl -I http://localhost:5000/healthz/ready

# Check ingress status in Kubernetes
kubectl describe ingress vialiq-ingress -n vialiq-edc
```

### Check 2: Verifying WebSocket Upgrade Handshake
Verify that the load balancer correctly negotiates and upgrades WebSocket streams:
```bash
# Test WebSocket upgrade handshake via curl
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Host: app.vialiq.cloud" \
  -H "Origin: https://app.vialiq.cloud" \
  https://app.vialiq.cloud/hubs/edc
```
* **Expected Response:** `HTTP/1.1 101 Switching Protocols`

### Check 3: Verifying Ingress Audit Header Propagation
Verify that the load balancer stamps each request with an audit ID:
```bash
curl -I https://app.vialiq.cloud/api/v1/health
```
* **Expected Header:** `X-Request-ID: c56a4180-65aa-42ec-a945-5fd21dec0538`

