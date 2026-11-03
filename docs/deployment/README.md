# Vialiq EDC — Enterprise Deployment Framework

This directory contains the operational and architectural specifications for packaging, containerizing, configuring, and deploying the **Vialiq Electronic Data Capture (EDC)** platform across cloud-native (Linux/Kubernetes) and on-premise enterprise (Windows Server/IIS) infrastructure.

---

## Document Catalog

```
docs/deployment/
├── README.md                                                     # You are here (Master Index & Architecture Overview)
├── 001-web-and-api-enterprise-deployment-framework.md           # VIALIQ-DEPLOY-001: Web & API Enterprise Deployment Framework
└── 002-load-balancer-ingress-and-traffic-routing-guide.md      # VIALIQ-DEPLOY-002: Load Balancer, Ingress & Traffic Routing
```

---

## Document Summaries

### 📄 [001: Web & API Enterprise Deployment Framework](./001-web-and-api-enterprise-deployment-framework.md)
* **Document ID:** `VIALIQ-DEPLOY-001`
* **Status:** Sealed & Approved
* **Key Scope:**
  * **Dual-Platform Architecture:** Complete deployment parity between modern cloud-native Linux containers (Kubernetes, Nginx, Ubuntu Chiseled) and enterprise pharma Windows Server (2022/2025, IIS 10, ASP.NET Core Module ANCM v2 In-Process).
  * **Zero Code Divergence:** 0% changes to Angular 21 or .NET 9 C# source code between platforms.
  * **"Build Once, Deploy Everywhere" (GAMP 5):** Runtime environment and remote module injection via dynamic `env.json` and `loadManifest()`, guaranteeing that exact UAT-validated binaries are promoted to Production.
  * **Hardened Chiseled Containers:** Zero shell, non-root (`UID 1654: app`), ~110 MB minimal attack surface for ASP.NET Core 9.
  * **IIS Performance Optimization:** In-Process hosting (`hostingModel="inprocess"`) running .NET directly inside `w3wp.exe` with native memory bridges.
  * **WebSockets & Concurrency:** Real-time review locks across Nginx proxies and IIS `Web-WebSockets`.
  * **Regulatory Compliance:** CycloneDX Software Bill of Materials (SBOM), Cosign cryptographic image signing, and 21 CFR Part 11 audit logging integration.

---

### 📄 [002: Enterprise Load Balancer, Ingress & Traffic Routing Guide](./002-load-balancer-ingress-and-traffic-routing-guide.md)
* **Document ID:** `VIALIQ-DEPLOY-002`
* **Status:** Sealed & Approved
* **Key Scope:**
  * **Single Ingress Hostname:** Path-based routing for static assets (`/*`), REST API (`/api/*`), and real-time SignalR (`/hubs/*`).
  * **Kubernetes Ingress Manifest:** Production `k8s/vialiq-ingress.yaml` featuring TLS 1.3 termination, EWMA least-connections balancing, 30MB payload bounds, and Part 11 header injection.
  * **Enterprise Windows Server / ARR 3.0:** Dual-pattern guide for hardware load balancers (F5 BIG-IP / Citrix) and software IIS Application Request Routing (ARR 3.0) server farms.
  * **Zero-CORS Local Developer Gateway:** Dockerized Nginx reverse proxy on `http://localhost:80` unifying frontend (`:4200`) and backend (`:5000`) with zero CORS friction.
  * **SignalR WebSocket Routing:** Persistent TCP streaming with distributed state fan-out via the Redis Sentinel backplane.
  * **Health Probes & Draining:** Automatic 2-second eviction via `GET /healthz/ready` and 30-second graceful connection draining.

---

## Quick Reference: Platform Configuration Files

| Purpose | Modern Linux / Kubernetes | Enterprise Windows Server / IIS | Local Developer Ingress |
|---|---|---|---|
| **Web Ingress & SPA Routing** | [`tools/docker/nginx/nginx.conf`](../../tools/docker/nginx/nginx.conf) | [`dist/apps/shell/web.config`](./001-web-and-api-enterprise-deployment-framework.md#34-windows-server--iis-web-deployment-manifest) | [`tools/docker/nginx/nginx.dev.conf`](./002-load-balancer-ingress-and-traffic-routing-guide.md#42-the-solution-local-dockerized-nginx-gateway) |
| **Backend API Hosting** | [`backend/api/Dockerfile`](./001-web-and-api-enterprise-deployment-framework.md#41-linux-container-packaging-hardened-distroless--chiseled) | [`w3wp.exe` + AspNetCoreModuleV2](./001-web-and-api-enterprise-deployment-framework.md#42-windows-server--iis-in-process-hosting) | `dotnet watch` on host port `5000` |
| **Load Balancing Manifest** | [`k8s/vialiq-ingress.yaml`](./002-load-balancer-ingress-and-traffic-routing-guide.md#21-complete-kubernetes-ingress-manifest-k8svialiq-ingressyaml) | IIS ARR Server Farm (`VialiqApiFarm`) | Local Nginx reverse proxy on port `80` |
| **WebSockets Handshake** | `nginx.ingress.kubernetes.io/websocket-services` | `Install-WindowsFeature Web-WebSockets` | Nginx `proxy_set_header Upgrade $http_upgrade;` |
| **Caching Engine** | Docker Compose / K8s Redis 7.2 Sentinel | Azure Cache for Redis / Microsoft Garnet | Docker Compose Redis HA (`6379`, `26379`) |
| **Database Engine** | Docker Compose / StatefulSet Mongo 7+ | Official MongoDB Windows Service (`.msi`) | Docker Compose 3-layer Mongo (`27017-37`) |
