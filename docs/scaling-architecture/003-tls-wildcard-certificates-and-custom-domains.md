# Scaling Architecture: Multi-Level Wildcard TLS/SSL Certificates, Custom Domains, and Dynamic Ingress Routing

> **Document ID:** `VIALIQ-SCALE-003`  
> **Domain:** Platform Scalability — Public Key Infrastructure (PKI), TLS Architecture & Custom Domains  
> **Status:** Accepted  
> **Date:** October 22, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** Cloudflare SSL for SaaS, Kubernetes Cert-Manager (ACME / Let's Encrypt), AWS Certificate Manager (ACM), Envoy Proxy / NGINX Ingress, ASP.NET Core 9.0  
> **Related Documents:**
> - [Scale 002: Global Load Balancing & Ingress Routing](./002-global-load-balancing-and-traffic-routing.md)
> - [API ADR 005: Hybrid Context & Auth Foundations](../backend-architecture/api/005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [Database Spec 002: Flexible Tenancy Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)

---

## 1. Executive Summary & Problem Statement

In a multi-tenant clinical EDC SaaS platform, sponsors require clean, branded, and segregated domain URLs:
1. **Tenant-Level Domain (`*.vialiq.com`)**:  
   `https://novartis.vialiq.com`, `https://roche.vialiq.com`, `https://pfizer.vialiq.com`.
2. **Study-Level Nested Subdomains (`*.*.vialiq.com`)**:  
   `https://onco101.novartis.vialiq.com` or `https://cardio202.roche.vialiq.com`.
3. **Enterprise Vanity Domains (Custom Client FQDNs)**:  
   `https://edc.novartis.com` or `https://trials.roche.com` pointing to the Vialiq SaaS platform.

### The Cryptographic Reality & RFC 6125 Wildcard Constraint
A critical technical constraint governed by the **IETF TLS Standard (RFC 6125 § 6.4.3 & RFC 2818)** dictates:
> **A wildcard asterisk (`*`) in an SSL/TLS certificate ONLY matches a SINGLE domain label.** It NEVER matches multiple dots.  
> Furthermore, Certificate Authorities (Let's Encrypt, DigiCert, Sectigo, AWS ACM) **strictly refuse to issue multi-label certificates with two asterisks (e.g. `*.*.vialiq.com`)** as it is an invalid syntax prohibited by internet PKI standards.

```
                          RFC 6125 TLS WILDCARD VALIDATION RULES
                                             │
        ┌────────────────────────────────────┴────────────────────────────────────┐
        ▼                                                                         ▼
Certificate: *.vialiq.com                                                 Multi-Label: *.*.vialiq.com
• novartis.vialiq.com          ──► ✅ MATCHES (Valid TLS)                 • PROHIBITED BY IETF & CAs
• roche.vialiq.com             ──► ✅ MATCHES (Valid TLS)                 • Browsers reject with SSL error:
• api.vialiq.com               ──► ✅ MATCHES (Valid TLS)                   ERR_CERT_COMMON_NAME_INVALID
• onco101.novartis.vialiq.com  ──► ❌ FAILS (Does NOT match *.vialiq.com)
```

To resolve this constraint while providing seamless branded study URLs, Vialiq implements a **Hybrid 3-Pattern Domain & TLS Architecture**.

---

## 2. The 3 Architectural Patterns for Subdomain & TLS Scalability

```
                               HYBRID DOMAIN & TLS PATTERNS
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        ▼                                    ▼                                    ▼
Pattern 1: Hyphenated Subdomains     Pattern 2: Dynamic Per-Tenant        Pattern 3: Cloudflare SSL for SaaS
(Single-Wildcard Industry Standard)  Wildcards (*.tenant.vialiq.com)      (Client Custom Vanity Domains)
• novartis-onco101.vialiq.com        • onco101.novartis.vialiq.com        • edc.novartis.com
• Matches *.vialiq.com (1 cert)      • Automated via K8s cert-manager     • Cloudflare Custom Hostnames API
• 100% turnkey, zero maintenance     • Dynamic SNI in Envoy Ingress       • CNAME delegation with auto-renewal
```

---

### Pattern 1: Hyphenated Single-Level Subdomains (The Industry Standard)

This pattern is the battle-tested standard adopted by Salesforce (`company-app.my.salesforce.com`), Medidata Rave, and Veeva Vault:
* Instead of nesting dots (`onco101.novartis.vialiq.com`), the tenant and study identifiers are hyphenated into a single DNS label:
  ```
  https://novartis-onco101.vialiq.com
  https://roche-cardio202.vialiq.com
  ```
* **Why this is the recommended default:**
  1. **A Single Wildcard Certificate (`*.vialiq.com`)** covers 100% of all tenants, studies, and environments.
  2. **Zero Ingress Maintenance**: No need to provision new SSL certificates when a sponsor launches 50 new clinical trials.
  3. **Instant Provisioning**: The trial URL is accessible within milliseconds of study creation via a single wildcard DNS A-record (`*.vialiq.com -> Ingress ALB`).

---

### Pattern 2: Dynamic Per-Tenant Wildcards (`*.tenant.vialiq.com`)

For enterprise sponsors that mandate a true nested subdomain structure (`onco101.novartis.vialiq.com`), we deploy **Dynamic Per-Tenant Wildcards**:

#### How it Works:
1. **Root Certificate**: A wildcard certificate for `*.vialiq.com` covers all tenant root sites (`novartis.vialiq.com`).
2. **Dedicated Tenant Wildcard**: When tenant `novartis` is provisioned, the system automatically requests a dedicated wildcard certificate for:
   `*.novartis.vialiq.com`
3. Any study created under Novartis (`onco101.novartis.vialiq.com`, `cardio202.novartis.vialiq.com`, `phase1-trial.novartis.vialiq.com`) matches `*.novartis.vialiq.com` and validates seamlessly with zero browser warnings.

#### Server Name Indication (SNI) Routing in Envoy / Ingress:
When a browser connects, the TLS ClientHello specifies the hostname via SNI. The ingress load balancer selects the matching certificate:
* Connecting to `novartis.vialiq.com` $\rightarrow$ Envoy serves `*.vialiq.com`.
* Connecting to `onco101.novartis.vialiq.com` $\rightarrow$ Envoy serves `*.novartis.vialiq.com`.

---

### Pattern 3: Custom Client Vanity Domains (`edc.novartis.com`)

Top-tier pharmaceutical enterprises frequently require their clinical portals to reside on their corporate domain:
`https://edc.novartis.com` or `https://trials.roche.com`.

We support this using **Cloudflare SSL for SaaS** or **AWS Certificate Manager (ACM)**:
1. The sponsor creates a CNAME in their corporate DNS:
   `edc.novartis.com CNAME ingress.vialiq.com`
2. Vialiq's control plane calls the Cloudflare Custom Hostnames API (or AWS ACM API) to initiate automated HTTP-01 or DNS-01 verification.
3. An isolated, dedicated SSL certificate for `edc.novartis.com` is issued and bound to the ingress edge in under 2 minutes, with automated 90-day renewal.

---

## 3. Kubernetes Implementation: Automated PKI via `cert-manager`

To manage hundreds of tenant wildcard certificates without manual human intervention, we deploy **Kubernetes `cert-manager`** with ACME (Let's Encrypt) DNS-01 challenges.

### 3.1 The ClusterIssuer Manifest (DNS-01 Route53 / Cloudflare Challenge)

DNS-01 challenge is mandatory for wildcard certificates:

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
      # DNS-01 challenge solver using AWS Route53 or Cloudflare
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-token
              key: api-token
```

### 3.2 Automated Certificate CRD Generation on Tenant Creation

When a new enterprise tenant (e.g. Novartis) is registered in the Layer 1 Admin database, the `TenantProvisioningService` automatically applies a `Certificate` manifest to the Kubernetes cluster:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: novartis-wildcard-cert
  namespace: vialiq-edc
spec:
  secretName: novartis-wildcard-tls-secret
  issuerRef:
    name: letsencrypt-wildcard-issuer
    kind: ClusterIssuer
  dnsNames:
    - "novartis.vialiq.com"
    - "*.novartis.vialiq.com" # Covers all current and future studies!
  renewBefore: 720h # Auto-renew 30 days before expiration
```

---

## 4. Ingress Configuration: Multi-Certificate SNI Mapping

In the Kubernetes Ingress resource, multiple TLS secrets are registered simultaneously. The ingress controller dynamically presents the correct certificate matching the incoming SNI hostname:

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
    # 1. Base Platform Wildcard
    - hosts:
        - "*.vialiq.com"
        - "vialiq.com"
      secretName: vialiq-root-wildcard-tls
      
    # 2. Dedicated Tenant Wildcards (Provisioned dynamically)
    - hosts:
        - "novartis.vialiq.com"
        - "*.novartis.vialiq.com"
      secretName: novartis-wildcard-tls-secret
      
    - hosts:
        - "roche.vialiq.com"
        - "*.roche.vialiq.com"
      secretName: roche-wildcard-tls-secret
      
    # 3. Enterprise Vanity Custom Domains
    - hosts:
        - "edc.novartis.com"
      secretName: edc-novartis-custom-tls

  rules:
    # Route all traffic to the stateless Vialiq API / Shell frontend
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
```

---

## 5. ASP.NET Core Middleware: Subdomain Host Resolution

Once TLS termination succeeds at the Ingress boundary, the request arrives at Kestrel. The `SubdomainTenantResolutionMiddleware` parses the `Host` header to resolve the tenant and study context automatically if not passed in custom headers:

```csharp
namespace Vialiq.Api.Middleware;

using Microsoft.AspNetCore.Http;
using Vialiq.Core.Interfaces;

public sealed class SubdomainTenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public SubdomainTenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantStudyContextAccessor contextAccessor)
    {
        var host = context.Request.Host.Host; // e.g. "onco101.novartis.vialiq.com" or "novartis-onco101.vialiq.com"

        if (!host.EndsWith("vialiq.com", StringComparison.OrdinalIgnoreCase))
        {
            // Custom Vanity Domain (e.g. edc.novartis.com) - resolved via Admin Registry lookup
            await ResolveCustomVanityDomainAsync(host, contextAccessor);
            await _next(context);
            return;
        }

        var prefix = host[..^".vialiq.com".Length]; // e.g. "onco101.novartis" or "novartis-onco101"

        if (prefix.Contains('.'))
        {
            // Pattern 2: Nested Subdomain (study.tenant.vialiq.com)
            var parts = prefix.Split('.');
            var studySlug = parts[0];   // "onco101"
            var tenantSlug = parts[1];  // "novartis"
            context.Request.Headers["X-Tenant-Id"] = $"ten_{tenantSlug}";
            context.Request.Headers["X-Study-Id"] = $"std_{studySlug}";
        }
        else if (prefix.Contains('-'))
        {
            // Pattern 1: Hyphenated Subdomain (tenant-study.vialiq.com)
            var parts = prefix.Split('-');
            var tenantSlug = parts[0];  // "novartis"
            var studySlug = parts[1];   // "onco101"
            context.Request.Headers["X-Tenant-Id"] = $"ten_{tenantSlug}";
            context.Request.Headers["X-Study-Id"] = $"std_{studySlug}";
        }
        else
        {
            // Tenant Root Portal (e.g. novartis.vialiq.com)
            context.Request.Headers["X-Tenant-Id"] = $"ten_{prefix}";
        }

        await _next(context);
    }

    private static Task ResolveCustomVanityDomainAsync(string host, ITenantStudyContextAccessor accessor)
    {
        // Looks up custom domain in cached Admin Registry (e.g. "edc.novartis.com" -> Novartis)
        return Task.CompletedTask;
    }
}
```

---

## 6. Architecture & SLA Comparison Matrix

| Domain Strategy | URL Structure | SSL Certificate Strategy | Turnkey Speed | Browser Compatibility | Recommended Use Case |
|---|---|---|---|---|---|
| **Pattern 1: Hyphenated** | `novartis-onco101.vialiq.com` | **Single `*.vialiq.com`** | **Instant (0 ms)** | 100% (All devices) | **Default for 95% of Trials** |
| **Pattern 2: Per-Tenant Wildcard** | `onco101.novartis.vialiq.com` | **Dedicated `*.novartis.vialiq.com`** | ~60 seconds (cert-manager) | 100% (SNI standard) | **Sponsors requiring nested subdomains** |
| **Pattern 3: Custom Vanity** | `edc.novartis.com` | **Cloudflare SSL for SaaS / ACM** | ~2 minutes (DNS CNAME) | 100% | **Sponsors requiring corporate branding** |
