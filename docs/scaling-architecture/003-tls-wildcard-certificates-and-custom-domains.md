# Scaling Architecture: Multi-Tenant Ingress Routing, Wildcard TLS/SSL Certificates, and Custom Domains

> **Document ID:** `VIALIQ-SCALE-003`  
> **Domain:** Platform Scalability — Public Key Infrastructure (PKI), TLS Architecture & Custom Domains  
> **Status:** Accepted  
> **Date:** October 22, 2026 (Updated: November 2026)  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** Cloudflare SSL for SaaS, Kubernetes Cert-Manager (ACME / Let's Encrypt), AWS Certificate Manager (ACM), Envoy Proxy / NGINX Ingress, ASP.NET Core 9.0  
> **Related Documents:**
> - [Scale 002: Global Load Balancing & Ingress Routing](./002-global-load-balancing-and-traffic-routing.md)
> - [API ADR 005: Hybrid Context & Auth Foundations](../backend-architecture/api/005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [Database Spec 002: Flexible Tenancy Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)

---

## 1. Executive Summary & Core Architectural Decision

In an enterprise multi-tenant clinical EDC SaaS platform, sponsors require clean, branded, and segregated domain URLs:
1. **Tenant-Level Domain (`*.vialiq.com`)**:  
   `https://novartis.vialiq.com`, `https://roche.vialiq.com`, `https://pfizer.vialiq.com`.
2. **Central SaaS Landing (`vialiq.com`)**:  
   `https://vialiq.com` and `https://www.vialiq.com` for global SaaS login, public marketing, and platform documentation.
3. **Enterprise Vanity Domains (Custom Sponsor FQDNs)**:  
   `https://edc.novartis.com` or `https://trials.roche.com` pointing to the Vialiq SaaS platform via CNAME delegation.

---

### Architectural Invariant: Complete Exclusion of "Study" from the URL Hostname

> [!IMPORTANT]
> **Foundational Architectural Decision: Zero Study in the URL**  
> Under no circumstances does the clinical study identifier appear in the URL hostname or subdomain (neither nested `study.tenant.vialiq.com` nor hyphenated `tenant-study.vialiq.com`).  
> The hostname identifies **strictly the Sponsor Tenant** (or platform portal).  
> **Study and Environment are selected upon login and managed via in-app global switching**, completely decoupled from DNS and TLS boundaries.

```
                  ENTERPRISE URL TOPOLOGY: ZERO STUDY IN THE HOSTNAME
                                           │
       ┌───────────────────────────────────┼───────────────────────────────────┐
       ▼                                   ▼                                   ▼
SaaS Tenant Portal                 Central SaaS Landing                Enterprise Vanity CNAME
novartis.vialiq.com                vialiq.com                          edc.novartis.com
roche.vialiq.com                   (Global Login / Marketing)          (CNAME -> Cloudflare SaaS)
Matches *.vialiq.com (1 Cert)      Apex SAN on base cert               Fail-closed registry lookup
```

---

### Why "Study in the Subdomain" Was Formally Rejected (5 Critical Invariants)

Earlier exploratory drafts considered study subdomains (`onco101.novartis.vialiq.com` or `novartis-onco101.vialiq.com`). Rigorous clinical operations, regulatory compliance (FDA 21 CFR Part 11), and systems engineering review proved this to be a severe anti-pattern:

#### 1. Multi-Study Monitor & CRA Workflow (Same-Origin Policy Wall)
In clinical trials, Clinical Research Associates (CRAs), Medical Monitors, Data Managers, and Principal Investigators (PIs) routinely oversee **10 to 30 clinical trials simultaneously**:
* If each study was a separate hostname (`onco101.novartis.vialiq.com` vs `cardio202.novartis.vialiq.com`), switching studies in the browser would trigger a hard cross-origin navigation.
* **The Performance & Session Penalty:** Every study switch forces the browser to unmount the Angular SPA, drop in-memory state, re-download 5–10 MB of JavaScript bundles, and drop active SignalR WebSocket connections.
* **Auth Fragmentation:** Browser `localStorage` is strictly origin-bound. Cross-origin study hops would force silent OAuth iframe round-trips to Okta/Azure AD on every click, degrading clinical site usability.

#### 2. FDA 21 CFR Part 11 Session & Audit Integrity
Under FDA 21 CFR Part 11 and ICH GCP E6(R3), investigator actions must maintain unbroken audit trail attribution. An investigator reviewing laboratory queries across 5 subjects in 3 different studies must remain within a continuous, authenticated clinical session. Decoupling study context from the domain prevents session hijacking and token-spoofing vectors.

#### 3. Cryptographic Reality & RFC 6125 TLS Wildcard Constraint
Under the **IETF TLS Standard (RFC 6125 § 6.4.3 & RFC 2818)**:
> **A wildcard asterisk (`*`) in an SSL/TLS certificate ONLY matches a SINGLE domain label.** It NEVER matches multiple dots.  
> Certificate Authorities (Let's Encrypt, DigiCert, AWS ACM) **strictly refuse to issue multi-label certificates with two asterisks (e.g. `*.*.vialiq.com`)**.

* If studies were subdomains (`study.tenant.vialiq.com`), a single `*.vialiq.com` certificate **cannot validate them**.
* The platform would be forced to provision a dynamic per-tenant wildcard certificate (`*.novartis.vialiq.com`) via `cert-manager` for every single customer, hitting ACME rate limits and requiring continuous DNS-01 API access to public DNS zones.
* By keeping the hostname at `tenant.vialiq.com`, **a single wildcard certificate (`*.vialiq.com`) validates 100% of all tenants, all studies, and all environments**.

#### 4. Infrastructure & Ingress Complexity Explosion
A global sponsor like Novartis or Roche operates 300 to 800 active protocols. Embedding studies in hostnames requires hundreds of DNS records and bloated Kubernetes Ingress manifests, increasing Envoy/NGINX routing table memory and reload latency.

#### 5. Protocol Naming Constraints vs. RFC 1123 DNS Standards
Pharma protocol codes contain characters and formats illegal in DNS labels:
* Protocols frequently use underscores (e.g., `CA209-003_OLE`, `P05823_EXT`), which violate RFC 1123 host syntax.
* Protocol names change across amendments (`ONCO-101` $\to$ `ONCO-101-EU`). If URLs were tied to study names, protocol amendments would break bookmarked clinical site links.

---

## 2. In-App Study & Environment Selection Architecture

Because the hostname is strictly bound to the **Tenant**, the user selects and switches **Study** and **Environment** directly within the application.

```
                              IN-APP CONTEXT SWITCHING LIFECYCLE
                                              │
    1. User navigates to: https://novartis.vialiq.com
       │
       ▼
    2. Corporate IdP / Keycloak Authentication (Email+Password / AD / Okta / Entra per study_registry.identityConfig)
       Returns JWT containing:
       - tenant_id: "ten_novartis"
       - roles & mfa_verified / acr ("step-up") claims
       - allowed_environments: ["prod", "staging", "training"]
       (Assigned studies resolve via live Redis-cached user_study_access for instant revocation)
       │
       ▼
    3. Study & Environment Selection:
       ┌────────────────────────────────────────────────────────────────────────┐
       │ • Single-Study Investigator: Automatically enters primary study/env.   │
       │ • Multi-Study CRA / Monitor: Promoted via Initial Context Modal.       │
       └────────────────────────────────────────────────────────────────────────┘
       │
       ▼
    4. Top Navigation Bar: Persistent Global Context Switcher
       ┌────────────────────────────────────────────────────────────────────────┐
       │ [ Novartis EDC ]  Study: [ ONCO-101 (Phase 3) ▼ ]  Env: [ PROD ▼ ]    │
       └────────────────────────────────────────────────────────────────────────┘
       │
       ▼
    5. In-Flight Switching (0 ms Latency, ZERO Browser Reload):
       • CRA switches to CARDIO-202 from dropdown.
       • Angular Signal in TenantStudyContextService updates immediately.
       • SPA routes update in-place (/crf/subjects, /builder).
       • Subsequent API calls automatically send updated explicit headers:
         X-Tenant-Id: ten_novartis
         X-Study-Id: std_cardio_202
         X-Environment: prod
```

### The Universal API Contract: Explicit Headers (ADR 005)

As codified in [ADR 005 (Pillar 1: Core API Operational Foundations)](../backend-architecture/api/005-api-foundations-auth-override-engine-and-realtime-adr.md#L105-L130), **the backend API does NOT derive or compute `X-Tenant-Id`, `X-Study-Id`, or `X-Environment` from the incoming `Host` header**.

Every authenticated HTTP request from the Angular frontend, mobile ePRO, or system integration passes separate, strongly typed headers:

```http
POST /api/v1/clinical/crf/data HTTP/1.1
Host: api.vialiq.com
Authorization: Bearer eyJhbGciOiJSUzI1Ni...
X-Tenant-Id: ten_novartis
X-Study-Id: std_onco_101
X-Environment: prod
Content-Type: application/json
```

#### Why Explicit Headers Are Mandatory:
1. **Cryptographic Anti-Spoofing:** The backend `TenantContextResolutionMiddleware` verifies that `X-Tenant-Id` strictly matches the `tenant_id` claim in the signed JWT, and `X-Study-Id` is authorized in Redis-cached `user_study_access` while satisfying the study's `study_registry.identityConfig` MFA policy.
2. **Zero-Reload CRA Workflow:** When switching from `std_onco_101` to `std_cardio_202`, the SPA simply changes the outgoing header value, keeping WebSocket leases and cached component views alive.
3. **Zero Hyphen / Delimiter Ambiguity:** Eliminates all string-splitting heuristics, double-hyphen parsing (`--`), and regex parsing of study names.

---

## 3. The 2 Production Domain Patterns

With study removed from the URL, the platform operates on **two clean, robust patterns**:

```
                              PRODUCTION DOMAIN PATTERNS
                                          │
        ┌─────────────────────────────────┴─────────────────────────────────┐
        ▼                                                                   ▼
Pattern 1: SaaS Tenant Wildcard                                     Pattern 2: Cloudflare SSL for SaaS
(Single Platform Wildcard Standard)                                 (Enterprise Vanity Domains)
• novartis.vialiq.com                                               • edc.novartis.com
• roche.vialiq.com                                                  • trials.roche.com
• Matches *.vialiq.com (1 Single Cert)                              • Cloudflare Custom Hostnames API / ACM
• 100% turnkey, 0 ms provisioning                                   • Client CNAME delegation with auto-renewal
```

---

### Pattern 1: SaaS Tenant Wildcard (`*.vialiq.com`) — The Default Standard

Every customer provisioned on the platform receives an immediate, turnkey subdomain:
* `https://novartis.vialiq.com`
* `https://roche.vialiq.com`
* `https://pfizer.vialiq.com`

* **Operational Highlights:**
  1. **A Single Wildcard Certificate (`*.vialiq.com` + `vialiq.com`)** covers 100% of all sponsor tenants and environments.
  2. **Zero Ingress / PKI Maintenance:** No certificates are requested when a new sponsor signs up or when a sponsor launches 100 new clinical trials.
  3. **Turnkey Speed (0 ms):** A single wildcard DNS record (`*.vialiq.com CNAME ingress.vialiq.com`) resolves all present and future tenants instantly.

---

### Pattern 2: Enterprise Vanity Domains (`edc.novartis.com`)

Enterprise pharmaceutical sponsors often mandate that investigator-facing applications reside on their own corporate domain (e.g., `https://edc.novartis.com` or `https://trials.roche.com`).

#### How it Works:
1. **Corporate DNS Delegation:** The sponsor creates a CNAME in their corporate DNS:
   ```dns
   edc.novartis.com.  IN  CNAME  ingress.vialiq.com.
   ```
2. **Automated TLS Issuance:** Vialiq's control plane uses **Cloudflare SSL for SaaS** (or AWS Certificate Manager) to automate HTTP-01 or DNS-01 verification. A dedicated certificate for `edc.novartis.com` is issued and bound to the ingress edge in $< 2\text{ minutes}$.
3. **Fail-Closed Context Binding:** When traffic arrives at the ingress router, `CustomVanityDomainMiddleware` validates the custom domain against the Redis domain registry and binds `ten_novartis` to the request pipeline.

---

## 4. Kubernetes Implementation: Automated PKI & Ingress Routing

### 4.1 The ClusterIssuer Manifest (ACME DNS-01 / Cloudflare)

A single `ClusterIssuer` manages platform certificates:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-wildcard-issuer
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: security-pki@vialiq.io
    privateKeySecretRef:
      name: letsencrypt-account-key
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-token
              key: api-token
```

---

### 4.2 The Single Platform Wildcard Certificate

Because hostnames stop at the tenant level, a single `Certificate` resource covers the entire platform:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: vialiq-platform-wildcard-cert
  namespace: vialiq-edc
spec:
  secretName: vialiq-platform-wildcard-tls
  issuerRef:
    name: letsencrypt-wildcard-issuer
    kind: ClusterIssuer
  dnsNames:
    - "vialiq.com"
    - "*.vialiq.com"
  renewBefore: 720h # Auto-renew 30 days before expiration
```

---

### 4.3 Clean Kubernetes Ingress Manifest

Ingress configuration is streamlined into static, high-performance rules:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vialiq-multi-tenant-ingress
  namespace: vialiq-edc
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
    # 1. Base Platform Wildcard (Covers vialiq.com and all *.vialiq.com tenants)
    - hosts:
        - "*.vialiq.com"
        - "vialiq.com"
      secretName: vialiq-platform-wildcard-tls
      
    # 2. Verified Enterprise Vanity Domains (Edge SSL for SaaS / ACM)
    - hosts:
        - "edc.novartis.com"
      secretName: edc-novartis-custom-tls

  rules:
    # ── Tier 1: SaaS Tenant Subdomains (*.vialiq.com) ─────────────────────
    - host: "*.vialiq.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vialiq-ingress-router
                port:
                  number: 80

    # ── Tier 2: Central SaaS Portal / Apex (vialiq.com) ───────────────────
    - host: "vialiq.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vialiq-ingress-router
                port:
                  number: 80

    # ── Tier 3: Verified Enterprise Vanity Domains ────────────────────────
    - host: "edc.novartis.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vialiq-ingress-router
                port:
                  number: 80

    # ── Tier 4: Ingress Catch-All Constrained by Registry Middleware ──────
    # Catch-all ensures dynamically certified enterprise vanity domains route
    # directly to the ingress router where CustomVanityDomainMiddleware validates
    # them against Redis (returning 404 if unmapped), preventing dead-end drops.
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vialiq-ingress-router
                port:
                  number: 80
```

---

## 5. Hostname Discovery & Fail-Closed Vanity Middleware

Hostname resolution exists **strictly as an unauthenticated bootstrap discovery mechanism** for browser users navigating to the portal:

```
UNAUTHENTICATED BROWSER DISCOVERY (Web Entry)                 AUTHENTICATED OPERATIONAL API (Transactions)
---------------------------------------------                 --------------------------------------------
• Triggered ONLY on initial portal load                       • Enforced on EVERY operational clinical request
• Browser visits: https://novartis.vialiq.com                 • Explicit headers passed by Angular HttpInterceptor:
• API endpoint: GET /api/v1/auth/discovery                    • Authorization: Bearer <jwt>
• Resolves Hostname/Study -> study_registry.identityConfig    • X-Tenant-Id: ten_novartis
  (EmailPassword / AD LDAP / Okta / Entra / Hybrid + MFA)     • X-Study-Id: std_onco_101, X-Environment: prod
• ZERO impact on transactional clinical database queries       • ZERO hostname parsing; validated against JWT + Redis policy
```

---

### 5.1 Safe Host Resolution: `TenantDiscoveryService`

With studies decoupled from hostnames, the subdomain is **strictly the tenant slug**. No hyphen splitting, no nested dot parsing, and zero regex heuristics.

> [!WARNING]
> **The Apex Host Slicing Pitfall (`ArgumentOutOfRangeException`):**  
> In naive hostname parsing implementations, checking `if (host.EndsWith("vialiq.com"))` allows the root domain `vialiq.com` to pass because `"vialiq.com".EndsWith("vialiq.com")` is true.  
> However, `"vialiq.com".Length` is **10**, whereas `".vialiq.com".Length` is **11** (including the leading dot delimiter). Slicing `host[..^".vialiq.com".Length]` on the apex host calculates `host[0..(10 - 11)]` $\to$ `host[0..-1]`, which throws `System.ArgumentOutOfRangeException: Specified argument was out of the range of valid values. (Parameter 'length')` at runtime.  
> 
> To prevent this exception and ensure reliable platform portal routing:
> 1. **Normalize Host First**: Incoming ports (`:443`, `:80`) and trailing whitespace are stripped, and the host is normalized to lowercase.
> 2. **Handle Apex Platform Portal First**: `vialiq.com` and `www.vialiq.com` are explicitly matched and routed to `TenantDiscoveryResult.GlobalSaaS()` *before* any slicing is attempted.
> 3. **Strict Length & Suffix Guard**: Subdomain prefix slicing is strictly guarded by `normalizedHost.Length > DomainSuffix.Length && normalizedHost.EndsWith(DomainSuffix, StringComparison.OrdinalIgnoreCase)`.

```csharp
namespace Vialiq.Api.Services;

using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Auth;

public sealed class TenantDiscoveryService : ITenantDiscoveryService
{
    private const string ApexDomain = "vialiq.com";
    private const string DomainSuffix = ".vialiq.com";
    private readonly IStudyRoutingRegistry _registry;

    // RFC 1123 DNS label regex (single label: lowercase letters, numbers, hyphens)
    private static readonly Regex DnsLabelRegex = new(
        @"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$", 
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public TenantDiscoveryService(IStudyRoutingRegistry registry)
    {
        _registry = registry;
    }

    public async Task<TenantDiscoveryResult> DiscoverTenantByHostAsync(string host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return TenantDiscoveryResult.NotFound("Empty or missing host header.");
        }

        // Normalize host: strip port if present, trim whitespace, convert to lowercase
        var normalizedHost = host.Split(':')[0].Trim().ToLowerInvariant();

        // 1. Apex Domain / Central Platform Portal (vialiq.com / www.vialiq.com)
        // Handled before slicing: "vialiq.com".Length (10) < ".vialiq.com".Length (11).
        if (normalizedHost == ApexDomain || normalizedHost == $"www.{ApexDomain}")
        {
            return TenantDiscoveryResult.GlobalSaaS();
        }

        // 2. SaaS Tenant Subdomain Routing (*.vialiq.com)
        // Guard: length must strictly exceed DomainSuffix.Length before slicing
        if (normalizedHost.Length > DomainSuffix.Length && 
            normalizedHost.EndsWith(DomainSuffix, StringComparison.OrdinalIgnoreCase))
        {
            // Prefix is exclusively the tenant slug (e.g. "novartis", "roche", "pfizer")
            var tenantSlug = normalizedHost[..^DomainSuffix.Length];
            if (!IsValidLabel(tenantSlug))
            {
                return TenantDiscoveryResult.NotFound("Invalid tenant label format.");
            }

            // Authoritative cached registry lookup in Redis (< 1ms)
            var tenantConfig = await _registry.ResolveTenantBySlugAsync(tenantSlug);
            if (tenantConfig == null || !tenantConfig.IsActive)
            {
                return TenantDiscoveryResult.NotFound($"Tenant '{tenantSlug}' is not registered or is inactive.");
            }

            return TenantDiscoveryResult.ForTenant(tenantConfig);
        }

        // 3. Custom Client Vanity Domains (e.g. edc.novartis.com, trials.roche.com)
        // FAIL-CLOSED: Authoritative cached lookup in Redis (< 1ms)
        var vanityConfig = await _registry.ResolveCustomDomainAsync(normalizedHost);
        if (vanityConfig == null || !vanityConfig.IsActive)
        {
            return TenantDiscoveryResult.NotFound("Unmapped, unverified, or inactive custom domain.");
        }

        return TenantDiscoveryResult.ForTenant(vanityConfig);
    }

    private static bool IsValidLabel(string label) =>
        !string.IsNullOrWhiteSpace(label) && DnsLabelRegex.IsMatch(label);
}
```

---

### 5.2 Custom Vanity Domain Middleware (Fail-Closed Context Binding)

When requests arrive on custom enterprise vanity domains (`https://edc.novartis.com`), the middleware binds the tenant context to the pipeline under a strict fail-closed contract:

```csharp
namespace Vialiq.Api.Middleware;

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Auth;

public sealed class CustomVanityDomainMiddleware
{
    private const string ApexDomain = "vialiq.com";
    private const string DomainSuffix = ".vialiq.com";
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomVanityDomainMiddleware> _logger;

    public CustomVanityDomainMiddleware(RequestDelegate next, ILogger<CustomVanityDomainMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context, 
        IStudyRoutingRegistry routingRegistry,
        ITenantStudyContextAccessor contextAccessor)
    {
        var rawHost = context.Request.Host.Host;
        var host = rawHost?.Split(':')[0].Trim().ToLowerInvariant() ?? string.Empty;

        // 1. Skip standard SaaS platform portal / apex and tenant wildcard subdomains
        if (host == ApexDomain ||
            host == $"www.{ApexDomain}" ||
            (host.Length > DomainSuffix.Length && host.EndsWith(DomainSuffix, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        // 2. Pattern 2: Custom Client Vanity Domain (e.g. edc.novartis.com)
        // FAIL-CLOSED: Authoritative cached lookup in Redis (< 1ms)
        var vanityConfig = await ResolveCustomVanityDomainAsync(host, routingRegistry);
        if (vanityConfig == null || !vanityConfig.IsActive)
        {
            _logger.LogWarning("Rejecting request to unmapped or inactive custom domain: {Host}", host);
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"UNMAPPED_CUSTOM_DOMAIN\",\"message\":\"Custom domain is not mapped, verified, or is inactive.\"}");
            return; // STRICT FAIL-CLOSED: Abort pipeline immediately
        }

        // 3. Bind validated Tenant context to the request pipeline
        contextAccessor.SetTenant(vanityConfig.TenantId, vanityConfig.TenantSlug, vanityConfig.Environment);
        context.Request.Headers["X-Tenant-Id"] = vanityConfig.TenantId;
        context.Request.Headers["X-Environment"] = vanityConfig.Environment;

        _logger.LogDebug("Bound custom vanity domain {Host} to TenantId: {TenantId}", host, vanityConfig.TenantId);

        await _next(context);
    }

    private static async Task<VanityDomainConfig?> ResolveCustomVanityDomainAsync(
        string host, 
        IStudyRoutingRegistry registry)
    {
        return await registry.ResolveCustomDomainAsync(host.ToLowerInvariant());
    }
}
```

---

## 6. Architecture Comparison & Evaluation Matrix

| Dimension | Standard SaaS Tenant Wildcard | Enterprise Vanity Domain | REJECTED ANTI-PATTERN: Study-in-Subdomain |
|---|---|---|---|
| **URL Example** | `https://novartis.vialiq.com` | `https://edc.novartis.com` | `https://onco101.novartis.vialiq.com` |
| **Study & Env Context** | **In-App Selection / Global Switcher** | **In-App Selection / Global Switcher** | Embedded in Hostname (Anti-Pattern) |
| **TLS Certificate Architecture** | **1 Single `*.vialiq.com` Wildcard Cert** | Dedicated Edge Cert (Cloudflare SaaS) | Violates RFC 6125; requires hundreds of dynamic certs |
| **CRA Multi-Study Switching** | **0 ms (Zero page reload, SPA route update)** | **0 ms (Zero page reload, SPA route update)** | Hard page reload; drops WebSockets & JWT tokens |
| **New Study Provisioning Latency** | **Instant (0 ms, zero DNS/TLS change)** | **Instant (0 ms, zero DNS/TLS change)** | ~60s (wait for cert-manager DNS-01 ACME challenge) |
| **Subdomain Parsing Complexity** | **Trivial (`tenantSlug = host[..^11]`)** | Authoritative Redis Cache Lookup | Fragile hyphen/dot string-splitting heuristics |
| **Ingress Operational Overhead** | **1 Static Wildcard Rule** | CNAME Delegation + Catch-All | Hundreds of host rules, bloated routing tables |
| **Production Recommendation** | **DEFAULT STANDARD (95% of Sponsors)** | **ENTERPRISE CUSTOM (Top-tier Pharma)** | **STRICTLY PROHIBITED** |
