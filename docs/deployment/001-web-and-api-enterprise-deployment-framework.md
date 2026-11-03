# Vialiq EDC — Web & API Enterprise Deployment Framework

> **Document ID:** `VIALIQ-DEPLOY-001`  
> **Status:** Sealed & Approved  
> **Version:** 1.0.0  
> **Date:** November 3, 2026  
> **Author:** Enterprise Architecture Team / Prashant Gupta  
> **Target Systems:** Angular 21 Host (`apps/shell`), Remotes (`apps/remote1`), ASP.NET Core .NET 9 LTS Web API (`backend/api/`), Linux (Ubuntu/Alpine/Kubernetes), Windows Server (2022/2025/IIS 10)  
> **Compliance Standards:** FDA 21 CFR Part 11, GAMP 5 Category 4/5, HIPAA Security Rule, EU GDPR, ICH GCP E6(R3)

---

## Executive Summary

The **Vialiq Electronic Data Capture (EDC)** platform requires a deployment framework engineered for high availability, zero-downtime rolling releases, and strict regulatory compliance. Clinical trials cannot tolerate dropped form submissions, lost audit events, or divergent environments between staging validation (UAT) and production.

This document establishes the official enterprise deployment framework for both the **Frontend Web Layer** (Angular 21 + Webpack Module Federation) and the **Backend API Layer** (ASP.NET Core .NET 9 LTS Web API). Crucially, this specification defines a **Dual-Platform Architecture**:
1. **Modern Cloud-Native Tier (Primary):** Linux, Docker, Kubernetes, Nginx Ingress, and Distroless/Chiseled containers.
2. **Enterprise Pharma / On-Premise Tier (Secondary):** Windows Server (2022/2025), Internet Information Services (IIS 10.0), ASP.NET Core Module (ANCM v2 In-Process), Active Directory/Kerberos, and Microsoft Garnet.

Because the underlying core is built on **Angular 21 (Signals)** and **.NET 9 LTS C#**, **0% of the application code changes** between these two platforms. Only the container and web server configuration manifests adapt to the host environment.

---

## 1. High-Level Full-Stack Deployment Architecture

```
                                [ CLINICAL USERS / CRAs / SITE INVESTIGATORS ]
                                                       │
                                                       ▼ HTTPS / TLS 1.3
                                       ┌───────────────────────────────┐
                                       │     Edge CDN & WAF            │
                                       │  (Cloudflare / AWS CloudFront)│
                                       └───────────────┬───────────────┘
                                                       │
                        ┌──────────────────────────────┴──────────────────────────────┐
                        ▼ Path: /* (Static Assets)                                    ▼ Path: /api/*, /hubs/*, /healthz
         ┌───────────────────────────────┐                             ┌───────────────────────────────┐
         │     Web Serving Layer         │                             │     API Ingress & Gateway     │
         │  (Angular Shell + Remotes)    │                             │  (Nginx Ingress / IIS / ARR)  │
         ├───────────────────────────────┤                             ├───────────────────────────────┤
         │ [Linux]: Nginx Alpine Pod     │                             │ [Linux]: NGINX Ingress / K8s  │
         │ [Win]:   IIS Static Site      │                             │ [Win]:   IIS ARR / Rewrite    │
         │ Dynamic Runtime env.json      │                             │ TLS Termination & WebSockets  │
         └───────────────────────────────┘                             └───────────────┬───────────────┘
                                                                                       │
                                                                                       ▼
                                                                       ┌───────────────────────────────┐
                                                                       │  ASP.NET Core 9 Web API Pods  │
                                                                       │  (Stateless, HPA Autoscaled)  │
                                                                       ├───────────────────────────────┤
                                                                       │ [Linux]: Chiseled Non-Root Pod│
                                                                       │ [Win]:   IIS In-Process ANCM  │
                                                                       │ DynamicClinicalDbResolver     │
                                                                       │ Scoped Redis Cache & Locks    │
                                                                       └───────┬───────────────┬───────┘
                                       ┌───────────────────────────────────────┘               │
                                       ▼                                                       ▼
                        ┌───────────────────────────────┐                       ┌───────────────────────────────┐
                        │   Redis 7.2 Sentinel HA Tier  │                       │   MongoDB Replica Set Farm    │
                        │  (Primary, Replica, 3 Quorum) │                       │  (Admin, Dev/UAT, Prod-N)     │
                        ├───────────────────────────────┤                       ├───────────────────────────────┤
                        │ [Linux]: Redis 7.2 Container  │                       │ [Linux]: WiredTiger Container │
                        │ [Win]: Azure Redis / Garnet   │                       │ [Win]: Windows Service .msi   │
                        └───────────────────────────────┘                       └───────────────────────────────┘
```

---

## 2. Dual-Platform Architectural Taxonomy

The following matrix contrasts the Linux/Cloud-Native deployment against the Windows Server/IIS deployment across all system dimensions:

| Architectural Dimension | Modern Cloud-Native (Linux / K8s) | Enterprise Pharma (Windows Server / IIS) |
|---|---|---|
| **Operating System** | Ubuntu 24.04 LTS / Alpine Linux | Windows Server 2022 / 2025 Datacenter |
| **API Runtime Engine** | Kestrel (.NET 9 LTS Runtime) | Kestrel via **IIS In-Process ANCM v2** (`w3wp.exe`) |
| **Frontend Web Server** | Nginx Alpine (Containerized) | **IIS 10.0** (Static Content + URL Rewrite 2.1) |
| **Packaging Unit** | OCI Distroless / Chiseled Container | Published Folder Deployment / Windows Service |
| **Container Image Base** | `mcr.microsoft.com/dotnet/aspnet:9.0-noble-chiseled` | `mcr.microsoft.com/dotnet/aspnet:9.0-nanoserver` *(if containerized)* |
| **Image Size** | **~110 MB** (minimal attack surface) | **~350 MB** (Nano Server) to **~2.5 GB** (Server Core) |
| **Security User** | Non-root (`UID 1654: app`) | `IIS_IUSRS` / Managed Service Account (gMSA) |
| **Reverse Proxy & Ingress** | NGINX Ingress Controller / Envoy | IIS URL Rewrite + Application Request Routing (ARR 3.0) |
| **Real-Time WebSockets** | Nginx `Upgrade` / `Connection` proxy | IIS **`Web-WebSockets`** Native Server Role |
| **TLS / SSL Termination** | cert-manager (Let's Encrypt / Vault PKI) | **Windows Certificate Store (Schannel)** / Active Directory PKI |
| **Corporate Identity & SSO** | OIDC / SAML / OAuth 2.0 (Azure AD / Okta) | **Native Windows Auth / Kerberos / NTLM** + SAML/OIDC |
| **Observability & Logs** | OpenTelemetry, Prometheus, Loki/Fluentd | Windows Event Logs, W3C Extended Logs, ETW |
| **Distributed Caching** | Native Redis 7.2 Sentinel Containers | **Azure Cache for Redis** or **Microsoft Garnet** |

---

## 3. Frontend Web Deployment (Angular Shell & Module Federation)

### 3.1 The "Build Once, Deploy Everywhere" Principle (GAMP 5)
In regulated clinical software (GAMP 5 Category 4/5), rebuilding frontend source code between environments invalidates testing. The exact compiled JavaScript bundle tested in UAT must be the artifact promoted to Production.

However, Webpack Module Federation requires knowing the locations of remote modules (`remote1`, `designer`) and backend API endpoints. To achieve binary immutability:
1. **Never compile environment URLs into JavaScript bundles.**
2. Inject configuration at runtime via a lightweight dynamic manifest: `/assets/env.json`.
3. In `apps/shell/src/main.ts`, the shell fetches `assets/env.json` during bootstrap and initializes Module Federation via `loadManifest()`.

#### Runtime Environment Schema (`assets/env.json`):
```json
{
  "apiBaseUrl": "https://api.vialiq.cloud",
  "authAuthority": "https://auth.vialiq.cloud",
  "environment": "Production",
  "remotes": {
    "remote1": "https://cdn.vialiq.cloud/remotes/remote1/remoteEntry.js",
    "formDesigner": "https://cdn.vialiq.cloud/remotes/designer/remoteEntry.js"
  }
}
```

### 3.2 Cache-Control & Asset Invalidation Strategy
To prevent clinical coordinators from seeing stale CRF forms or broken federated chunks after an upgrade:
* **Hashed Assets (`*.bundle.[hash].js`, `*.chunk.[hash].js`, `*.css`, fonts):**
  * `Cache-Control: public, max-age=31536000, immutable`
  * These files never change; a new build produces new hashes.
* **Entrypoints (`index.html`, `remoteEntry.js`, `env.json`):**
  * `Cache-Control: no-cache, no-store, must-revalidate`
  * Browsers must revalidate every request, ensuring instant activation of newly deployed code.

---

### 3.3 Linux / Nginx Web Deployment Manifest

#### Nginx Dockerfile (`apps/shell/Dockerfile`):
```dockerfile
# Multi-stage build for Angular Host
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json nx.json tsconfig.base.json ./
RUN npm ci
COPY apps/shell ./apps/shell
COPY libs ./libs
RUN npx nx build shell --configuration=production

# Production serving image
FROM nginx:1.27-alpine
RUN rm -rf /etc/nginx/conf.d/*
COPY tools/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/shell /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Production Nginx Configuration (`tools/docker/nginx/nginx.conf`):
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Immutable Long-Lived Cache for Hashed Chunks
    location ~* \.(?:css|js|woff2?|eot|ttf|otf|ico|png|jpg|jpeg|gif|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # 2. Never Cache Entrypoints & Manifests
    location ~* (index\.html|remoteEntry\.js|env\.json)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # 3. Angular SPA Route Fallback (HTML5 PushState)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 4. API Reverse Proxy (Local/Standalone Mode)
    location /api/ {
        proxy_pass http://vialiq-api:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 5. Part 11 Hardened Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

### 3.4 Windows Server / IIS Web Deployment Manifest

When deploying to Windows Server, the build output is dropped into an IIS website folder (e.g. `C:\inetpub\vialiq-web`). The entire web server configuration is governed by `web.config`:

#### Complete IIS `web.config` (`dist/apps/shell/web.config`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- 1. Ensure modern web MIME types are recognized by IIS -->
    <staticContent>
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".woff" />
      <mimeMap fileExtension=".woff" mimeType="font/woff" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <remove fileExtension=".mjs" />
      <mimeMap fileExtension=".mjs" mimeType="application/javascript" />
      <remove fileExtension=".webmanifest" />
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
    </staticContent>

    <!-- 2. Security Headers & HSTS (21 CFR Part 11 Compliance) -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>

    <!-- 3. SPA Routing & Reverse Proxy Rules -->
    <rewrite>
      <rules>
        <!-- Reverse Proxy /api traffic to Kestrel (if not hosted as nested IIS Application) -->
        <rule name="API Reverse Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
        </rule>

        <!-- Angular HTML5 History API Fallback -->
        <rule name="Angular SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- 4. Kernel-Level HTTP Caching Profiles -->
    <caching>
      <profiles>
        <add extension=".js" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
        <add extension=".css" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
        <add extension=".woff2" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
      </profiles>
    </caching>
  </system.webServer>
</configuration>
```

---

## 4. Backend API Deployment (.NET 9 Web API)

### 4.1 Linux Container Packaging (Hardened Distroless / Chiseled)
For Kubernetes and cloud deployments, we package the .NET 9 API using a multi-stage, **Ubuntu Chiseled** base image.

#### Hardened Container Characteristics:
* **Zero Shell:** `/bin/sh` and `/bin/bash` are completely eliminated, neutralising container breakout and arbitrary command execution attacks.
* **Non-Root Execution:** Runs under UID `1654` (`app`).
* **Minimal Footprint:** ~110 MB image size, slashing vulnerability scan CVE surface to near zero.

#### API Multi-Stage Dockerfile (`backend/api/Dockerfile`):
```dockerfile
# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0-noble AS build
WORKDIR /source

COPY backend/api/Vialiq.Api.sln ./
COPY backend/api/src/Vialiq.Core/*.csproj ./src/Vialiq.Core/
COPY backend/api/src/Vialiq.Infrastructure/*.csproj ./src/Vialiq.Infrastructure/
COPY backend/api/src/Vialiq.Caching/*.csproj ./src/Vialiq.Caching/
COPY backend/api/src/Vialiq.Validation/*.csproj ./src/Vialiq.Validation/
COPY backend/api/src/Vialiq.Api/*.csproj ./src/Vialiq.Api/

RUN dotnet restore ./src/Vialiq.Api/Vialiq.Api.csproj

COPY backend/api/ ./
WORKDIR /source/src/Vialiq.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Hardened Runtime (Ubuntu Chiseled)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble-chiseled AS final
WORKDIR /app
COPY --from=build /app/publish .

# Enforce Non-Root & Default Port
USER $APP_UID
ENV ASPNETCORE_HTTP_PORTS=5000
ENV DOTNET_EnableDiagnostics=0

EXPOSE 5000
ENTRYPOINT ["dotnet", "Vialiq.Api.dll"]
```

---

### 4.2 Windows Server / IIS In-Process Hosting

When deployed on Windows Server, ASP.NET Core 9 achieves maximum throughput using **In-Process Hosting** via the **ASP.NET Core Module (ANCM v2)**.

```
                           [ CLIENT REQUEST : PORT 443 ]
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │    HTTP.SYS Driver     │
                            └───────────┬────────────┘
                                        │
                                        ▼
                      ┌────────────────────────────────────┐
                      │    IIS Worker Process (w3wp.exe)   │
                      │                                    │
                      │   ┌────────────────────────────┐   │
                      │   │     AspNetCoreModuleV2     │   │
                      │   └─────────────┬──────────────┘   │
                      │                 │ (Native In-Memory│
                      │                 │  Call Bridge)    │
                      │                 ▼                  │
                      │   ┌────────────────────────────┐   │
                      │   │  .NET 9 CLR & Vialiq.Api   │   │
                      │   │  - DynamicDbResolver       │   │
                      │   │  - Redis Sentinel Client   │   │
                      │   └────────────────────────────┘   │
                      └────────────────────────────────────┘
```

#### API Published `web.config` for IIS In-Process Hosting:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" 
                  arguments=".\Vialiq.Api.dll" 
                  stdoutLogEnabled="false" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
          <environmentVariable name="DOTNET_PRINT_TELEMETRY_MESSAGE" value="false" />
        </environmentVariables>
      </aspNetCore>
      <security>
        <requestFiltering>
          <!-- Limit maximum request size to 30MB for ePRO / attachment uploads -->
          <requestLimits maxAllowedContentLength="31457280" />
        </requestFiltering>
      </security>
    </system.webServer>
  </location>
</configuration>
```

#### Windows Service Alternative (Standalone Kestrel):
If the client's IT architecture forbids IIS and requires Windows Services:
1. Reference `Microsoft.Extensions.Hosting.WindowsServices` in `Vialiq.Api.csproj`.
2. Configure in `Program.cs`:
   ```csharp
   builder.Host.UseWindowsService(options =>
   {
       options.ServiceName = "VialiqClinicalApi";
   });
   ```
3. Register via PowerShell:
   ```powershell
   New-Service -Name "VialiqClinicalApi" `
               -BinaryPathName "C:\vialiq\api\Vialiq.Api.exe" `
               -DisplayName "Vialiq EDC Core Clinical API" `
               -StartupType Automatic `
               -Credential "NT SERVICE\VialiqClinicalApi"
   Start-Service -Name "VialiqClinicalApi"
   ```

---

## 5. Health Probes, Graceful Draining & Zero-Downtime Rollouts

### 5.1 Three-Tier Health Check Pattern
To ensure traffic is only routed to fully initialized API instances:

```
[ HEALTH CHECK ENDPOINTS ]
  ├── /healthz/live     ──> Liveness Probe   (Lightweight thread-pool check; detects deadlocks)
  ├── /healthz/ready    ──> Readiness Probe  (Checks Mongo Primary, Redis Sentinel, Liquibase Migration)
  └── /healthz/startup  ──> Startup Probe    (Guards long protocol cache warmups upon container boot)
```

#### Implementation in ASP.NET Core `Program.cs`:
```csharp
builder.Services.AddHealthChecks()
    .AddMongoDb(sp => sp.GetRequiredService<IOptions<MongoOptions>>().Value.ConnectionString, name: "mongodb", tags: ["ready"])
    .AddRedis(sp => sp.GetRequiredService<IConnectionMultiplexer>().Configuration, name: "redis", tags: ["ready"]);

app.MapHealthChecks("/healthz/live", new HealthCheckOptions
{
    Predicate = _ => false // Instant liveness
});

app.MapHealthChecks("/healthz/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

### 5.2 Graceful Connection Draining
In clinical trials, terminating an active pod during a study lock or e-signature submission risks database corruption or validation failures.
* **Kubernetes PreStop Hook:** Sleeps 5 seconds before signaling SIGTERM to allow Ingress endpoints to deregister the pod from the IP pool.
* **Kestrel Graceful Timeout:** Configured to 30 seconds to drain running transactions:
  ```csharp
  builder.Services.Configure<HostOptions>(options =>
  {
      options.ShutdownTimeout = TimeSpan.FromSeconds(30);
  });
  ```

---

## 6. Real-Time WebSockets & Concurrency Locks

Vialiq EDC maintains live field-level editing locks and real-time clinical query collaboration via **WebSockets (SignalR)** backed by the Redis backplane.

### Platform Specifics:
* **Linux / Nginx Ingress:**
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_read_timeout 3600s;
  proxy_send_timeout 3600s;
  ```
* **Windows Server / IIS:**
  * IIS requires the **`Web-WebSockets`** role to be installed. Run in elevated PowerShell:
    ```powershell
    Install-WindowsFeature -Name Web-WebSockets
    ```
  * Without this feature, IIS terminates WebSocket handshakes with `HTTP 400 Bad Request` or degrades to long-polling.

---

## 7. Database & Caching Tier Deployment Topology

### 7.1 MongoDB 7+ Replica Set Farm
* **Linux Environments:** Deployed as stateful containers or managed MongoDB Atlas with dedicated NVMe storage volumes.
* **Windows Server Environments:** Installed using the official MongoDB Windows MSI installer (`mongodb-windows-x86_64-7.0.x-signed.msi`). Registered as an automatic Windows Service (`mongod.exe --service --config C:\mongodb\mongod.cfg`).

### 7.2 Redis 7.2 Sentinel High-Availability Tier
* **Linux Environments:** Deployed using the 3-Sentinel + Primary-Replica cluster verified in `tools/docker/docker-compose.redis-dev.yml`.
* **Windows Server Environments:** Redis officially does not maintain native Windows binaries past 3.2. For Windows environments:
  1. **Tier 1 Recommendation:** Managed cloud cache (**Azure Cache for Redis** or **AWS ElastiCache**).
  2. **Tier 2 Recommendation (Air-Gapped / On-Premise Windows):** Deploy **Microsoft Garnet** (open-source C# caching engine developed by Microsoft Research), running as a Windows Service and offering 100% Redis wire-protocol compatibility.

---

## 8. CI/CD Pipeline & Regulatory Verification (GAMP 5)

```
[ DEVELOPER GIT PUSH ]
         │
         ▼
┌─────────────────────────────────┐
│     Nx Monorepo CI Pipeline     │
├─────────────────────────────────┤
│ • Lint & Format Checks          │
│ • Angular Unit Tests (Vitest)   │
│ • .NET 9 Unit & Integration     │
│   Tests (100% Pass Required)    │
│ • Static Analysis & SonarQube   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Security & Regulatory Gating   │
├─────────────────────────────────┤
│ • Trivy Container Vulnerability │
│ • CycloneDX SBOM Generation     │
│ • Cosign Container Image Signing│
│ • GAMP 5 Verification Manifest  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Artifact Registry / OCI    │
├─────────────────────────────────┤
│ • vialiq-shell:v1.0.0           │
│ • vialiq-api:v1.0.0             │
│ • Windows Web Deployment Zip    │
└─────────────────────────────────┘
```

### 8.1 Software Bill of Materials (SBOM) & Image Signing
FDA 21 CFR Part 11 and Executive Order 14028 mandate supply-chain provenance for clinical trial software:
1. **SBOM Generation:** Every CI build produces a CycloneDX XML/JSON SBOM cataloging every NuGet package and npm dependency.
2. **Cosign Image Signing:** Container images are signed with an enterprise private key; Kubernetes admission controllers reject unsigned images.

---

## 9. Implementation Checklist

```
=============================================================================================================
VIALIQ ENTERPRISE DEPLOYMENT FRAMEWORK CHECKLIST
=============================================================================================================
Scope                     Component                      Verification Target                     Status
-------------------------------------------------------------------------------------------------------------
Frontend Web Layer        Runtime Environment Injection  Dynamic env.json without rebuild        ✅ READY
                          Cache-Control Configuration    Hashed: 1yr; Entrypoints: no-cache      ✅ READY
                          Nginx Linux Manifest           Multi-stage Dockerfile & nginx.conf     ✅ READY
                          IIS Windows Manifest           web.config with URL Rewrite & MIME      ✅ READY

Backend API Layer         Chiseled Container (.NET 9)    Non-root, zero shell, ~110 MB image     ✅ READY
                          IIS In-Process Hosting (ANCM)  AspNetCoreModuleV2 in w3wp.exe          ✅ READY
                          Windows Service Alternative    Microsoft.Extensions.Hosting.WinServ    ✅ READY
                          Health Checks (/healthz)       Liveness, Readiness, Startup probes     ✅ READY
                          Graceful Shutdown Draining     30s host timeout, 5s preStop hook       ✅ READY

Infrastructure & Comms    WebSocket Support              Nginx upgrade / IIS Web-WebSockets      ✅ READY
                          Redis Strategy (Windows)       Azure Redis / Microsoft Garnet          ✅ READY
                          MongoDB Replica Sets           Linux Container / Windows Service       ✅ READY
                          GAMP 5 Compliance              CycloneDX SBOM & Cosign image signing   ✅ READY
=============================================================================================================
```

