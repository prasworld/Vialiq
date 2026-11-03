# ADR: API Operational Foundations — Hybrid Context, GxP Override Engine, and Real-Time SignalR Architecture

> **Document ID:** `VIALIQ-ARCH-API-005`  
> **Domain:** Backend Architecture — Core API Foundations & Protocols  
> **Status:** Accepted  
> **Date:** October 20, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** ASP.NET Core 8/9 Web API (`backend/api/src/Vialiq.Api`), Angular 21 Host (`apps/shell/`), Form Renderer (`libs/form-renderer`)  
> **Related Documents:**
> - [001: EDC API Architecture ADR](./001-api-architecture-adr.md)
> - [002: API Stack Discussion Agenda & Framework Evaluation](./002-api-stack-discussion-agenda-and-evaluation-framework.md)
> - [003: DTO Architecture Strategy & Rejection of GraphQL](./003-dto-design-and-graphql-evaluation-adr.md)
> - [004: Unified Monorepo Architecture vs. Git Submodules](./004-repository-architecture-monorepo-vs-submodule-adr.md)
> - [002: 3-Cluster & Flexible Tenancy Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [005: Concurrency Control, Locking & Query Management](../database/005-concurrency-control-locking-and-query-management.md)

---

## 1. Executive Summary & Context

To support the Vialiq Clinical EDC SaaS platform across both Web Desktop and Mobile ePRO clients, the API layer must establish three foundational operational pillars before individual feature endpoints are finalized:

```
                            API OPERATIONAL FOUNDATIONS
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
Pillar 1: Context Resolution     Pillar 2: GxP Override Engine    Pillar 3: Real-Time Grid
(JWT Claims + HTTP Headers)      (Challenge-Response Sidepanels)  (SignalR + Redis Backplane)
```

1. **Pillar 1 — Hybrid Security & Context Resolution**: Combines cryptographically signed **JWT Claims** (identity, roles, tenant boundary) with explicit **Operational HTTP Headers** (`X-Tenant-Id`, `X-Study-Id`, `X-Environment`, `X-Correlation-Id`). This eliminates brittle, deeply nested route hierarchies (`/tenants/{id}/studies/{id}/...`) in favor of clean RESTful resource URIs while preventing cross-tenant data leakage.
2. **Pillar 2 — The Regulatory GxP "Override Engine"**: Replaces binary allow/deny authorizations with a standardized **HTTP 428 Precondition Required Challenge-Response Protocol**. When an action requires clinical justification, electronic re-authentication (21 CFR Part 11 § 11.200), protocol deviation clearance, or dual-authorization ("Four-Eyes Principle"), the API issues an `OverrideChallengeDto`. The Angular UI intercepts this response and mounts the corresponding Sidepanel drawer dynamically.
3. **Pillar 3 — Unified Real-Time Foundation (ASP.NET Core SignalR)**: Deploys a minimal, zero-infrastructure in-memory real-time hub today that scales into a distributed multi-pod event grid tomorrow. It supports active field-level Optimistic Concurrency Control (OCC) leases, real-time clinical discrepancy alerts, long-running CDISC export notifications, and hospital firewall bypass via automated transport fallback (WebSockets $\rightarrow$ Server-Sent Events $\rightarrow$ Long Polling).

---

## 2. Pillar 1: Hybrid Security & Context Resolution Engine

### 2.1 The Architectural Dilemma: Path vs. Header vs. Claims
In our [3-Cluster Database Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md), physical routing targets three distinct MongoDB clusters:
- **Layer 1 Admin (`rs-admin:27017`)**: Global tenants, study registry, user accounts, and Key Vault.
- **Layer 2 Dev Phase (`rs-dev:27027`)**: Sandbox study databases for protocol testing and schema design.
- **Layer 3 Production (`rs-prod:27037`)**: Qualified, validated live clinical study databases subject to 21 CFR Part 11.

Relying solely on URL paths causes "URL Bloat":
```http
// ANTI-PATTERN: Brittle, redundant URL nesting
PUT /api/v1/tenants/novartis/environments/prod/studies/onco-101/subjects/SUBJ-001/crfs/crf-vitals-01
```

Relying solely on JWT claims prevents a single user (e.g., a Principal Investigator or Clinical Monitor) from switching between studies or environments without re-authenticating and generating a new token.

### 2.2 The Accepted Hybrid Convention

We implement a **Defense-in-Depth Hybrid Contract**:
1. **JWT Bearer Token** provides **Cryptographic Identity & Boundary Enforcement**.
2. **HTTP Custom Headers** provide **Operational Context & Call Routing**.
3. **REST Route Parameters** represent **Pure Clinical Resources**.

```http
PUT /api/v1/edc/subjects/SUBJ-001/crfs/crf-vitals-01 HTTP/1.1
Host: api.vialiq.io
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: ten_novartis_global
X-Study-Id: std_onco101
X-Environment: prod
X-Api-Version: 1.0
X-Correlation-Id: c8b9e1d2-7f3a-4e5c-9d1a-8f2b3c4d5e6f
X-Client-Platform: Web
Content-Type: application/json
```

### 2.3 JWT Claims Specification

Every JWT issued by our OpenID Connect (OIDC) Identity Provider (Keycloak / Entra ID) contains the following validated claims:

```json
{
  "iss": "https://auth.vialiq.io/realms/vialiq",
  "sub": "usr_9b2e4f1a-8c3d-4e5a-9f1b-2c3d4e5f6a7b",
  "aud": "vialiq-edc-api",
  "exp": 1792464000,
  "nbf": 1792460400,
  "tenant_id": "ten_novartis_global",
  "email": "dr.smith@oncology-center.org",
  "given_name": "Eleanor",
  "family_name": "Smith",
  "session_id": "sess_4a8f9b2c-1d3e",
  "roles": [
    "PrincipalInvestigator",
    "ClinicalStudyCoordinator"
  ],
  "permitted_studies": [
    "std_onco101",
    "std_cardio202"
  ],
  "allowed_environments": [
    "dev",
    "prod"
  ]
}
```

### 2.4 HTTP Header Contracts & Enforcement Matrix

| Header Name | Type | Mandatory? | Validation Rule | Purpose |
|---|---|---|---|---|
| `Authorization` | String | Yes | Valid Bearer JWT signed by trusted OIDC JWKS. | Security perimeter authentication. |
| `X-Tenant-Id` | String | Yes | Must match `tenant_id` claim in JWT. | Multi-tenant isolation; prevents cross-tenant injection. |
| `X-Study-Id` | String | Yes | Must exist in `permitted_studies` claim array. | Determines specific study database context. |
| `X-Environment` | String | Yes | Must be `"dev"` or `"prod"`, and exist in `allowed_environments`. | Directs database factory to Layer 2 (`27027`) vs Layer 3 (`27037`). |
| `X-Api-Version` | String | Yes | SemVer format (e.g., `"1.0"`). | Contract versioning and deprecation handling. |
| `X-Correlation-Id` | UUID | Yes | Client-generated or injected by gateway if missing. | End-to-end distributed tracing across Angular $\rightarrow$ API $\rightarrow$ MongoDB $\rightarrow$ Audit. |
| `X-Client-Platform` | Enum | Yes | `"Web"` \| `"Mobile"` \| `"ePRO"` \| `"SystemWorker"`. | Audit trail client categorization. |
| `X-Override-Token` | String | Conditional | Validated by Override Engine when fulfilling a challenge. | Links mutation request to approved GxP override. |

### 2.5 ASP.NET Core Implementation: `TenantContextResolutionMiddleware`

This middleware runs immediately after `AuthenticationMiddleware` on every incoming request.

```csharp
namespace Vialiq.Api.Middleware;

using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Vialiq.Core.Exceptions;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public sealed class TenantContextResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantContextResolutionMiddleware> _logger;

    public TenantContextResolutionMiddleware(RequestDelegate next, ILogger<TenantContextResolutionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantStudyContextAccessor contextAccessor)
    {
        // 1. Bypass context checks for health probes and public metadata
        if (context.Request.Path.StartsWithSegments("/health") || 
            context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.StartsWithSegments("/api/v1/auth"))
        {
            await _next(context);
            return;
        }

        var user = context.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            throw new UnauthorizedException("Missing or invalid Bearer authentication token.");
        }

        // 2. Extract and Validate Tenant Context
        if (!context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) || string.IsNullOrWhiteSpace(tenantHeader))
        {
            throw new MissingRequiredHeaderException("Header 'X-Tenant-Id' is required.");
        }

        var claimTenant = user.FindFirst("tenant_id")?.Value;
        if (!string.Equals(claimTenant, tenantHeader, StringComparison.Ordinal))
        {
            _logger.LogWarning("Security violation: Token tenant {ClaimTenant} does not match header {HeaderTenant}", claimTenant, tenantHeader);
            throw new ForbiddenTenantAccessException("Token tenant does not match requested tenant boundary.");
        }

        // 3. Extract and Validate Study Context
        if (!context.Request.Headers.TryGetValue("X-Study-Id", out var studyHeader) || string.IsNullOrWhiteSpace(studyHeader))
        {
            throw new MissingRequiredHeaderException("Header 'X-Study-Id' is required.");
        }

        var permittedStudies = user.FindAll("permitted_studies").Select(c => c.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!permittedStudies.Contains(studyHeader.ToString()))
        {
            throw new ForbiddenStudyAccessException($"User does not have access permissions for study '{studyHeader}'.");
        }

        // 4. Extract and Validate Environment Context (Cluster Target)
        if (!context.Request.Headers.TryGetValue("X-Environment", out var envHeader) || 
            !Enum.TryParse<ClusterEnvironment>(envHeader, true, out var environment))
        {
            throw new InvalidHeaderValueException("Header 'X-Environment' must be 'dev' or 'prod'.");
        }

        // 5. Correlation ID Management
        var correlationId = context.Request.Headers.TryGetValue("X-Correlation-Id", out var corrHeader) && !string.IsNullOrWhiteSpace(corrHeader)
            ? corrHeader.ToString()
            : Guid.NewGuid().ToString("N");
        
        context.Response.Headers["X-Correlation-Id"] = correlationId;

        // 6. Bind Scoped Context Accessor for downstream Services and Repositories
        contextAccessor.CurrentContext = new TenantStudyContext(
            TenantId: tenantHeader.ToString(),
            StudyId: studyHeader.ToString(),
            Environment: environment,
            UserId: user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedException("Missing 'sub' claim."),
            Email: user.FindFirst(ClaimTypes.Email)?.Value ?? "unknown@vialiq.io",
            Roles: user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray(),
            CorrelationId: correlationId,
            ClientPlatform: context.Request.Headers["X-Client-Platform"].ToString() switch
            {
                "Mobile" => ClientPlatform.Mobile,
                "ePRO" => ClientPlatform.EPro,
                _ => ClientPlatform.Web
            }
        );

        await _next(context);
    }
}
```

### 2.6 Dynamic MongoDB Cluster Dispatch via `IMongoDatabaseFactory`

With `ITenantStudyContext` resolved, the data layer routes dynamically to the physical cluster:

```csharp
namespace Vialiq.Infrastructure.Data;

using MongoDB.Driver;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public sealed class MongoDatabaseFactory : IMongoDatabaseFactory
{
    private readonly IConnectionPoolManager _poolManager;
    private readonly ITenantStudyContextAccessor _contextAccessor;

    public MongoDatabaseFactory(IConnectionPoolManager poolManager, ITenantStudyContextAccessor contextAccessor)
    {
        _poolManager = poolManager;
        _contextAccessor = contextAccessor;
    }

    public IMongoDatabase GetStudyDatabase()
    {
        var ctx = _contextAccessor.CurrentContext;

        // Route to physical cluster port based on environment
        var clusterConnection = ctx.Environment switch
        {
            ClusterEnvironment.Dev => _poolManager.GetDevClusterClient(),   // rs-dev:27027
            ClusterEnvironment.Prod => _poolManager.GetProdClusterClient(), // rs-prod:27037
            _ => throw new InvalidOperationException($"Invalid environment {ctx.Environment}")
        };

        // Standardized isolated database naming convention
        var databaseName = $"vialiq_{ctx.TenantId}_{ctx.StudyId}_{ctx.Environment.ToString().ToLowerInvariant()}";
        return clusterConnection.GetDatabase(databaseName);
    }

    public IMongoDatabase GetAdminDatabase()
    {
        // Layer 1 Admin Cluster (rs-admin:27017)
        return _poolManager.GetAdminClusterClient().GetDatabase("vialiq_admin_control");
    }
}
```

---

## 3. Pillar 2: The Regulatory GxP "Override Engine"

### 3.1 The Problem: The Inadequacy of Binary HTTP Codes
In clinical trials governed by FDA 21 CFR Part 11 § 11.10(e), ICH GCP E6(R3), and GAMP 5, actions cannot simply be authorized or denied based on user roles:
- A user may have the right to modify a subject's blood pressure, but **if the form was already signed or submitted, they cannot do so without providing a formal "Reason for Change"**.
- A Principal Investigator may submit an out-of-range lab value, but **if an edit check triggers a critical warning, they must provide a "Protocol Deviation Clinical Justification"**.
- A user may initiate patient crypto-shredding (GDPR Art. 17) or emergency blinding unmasking, but **it requires a second authorized user to authenticate (Four-Eyes Principle)**.

Rejecting with `403 Forbidden` is inaccurate because the user *does* have permissions; returning `400 Bad Request` gives the client no actionable path forward.

### 3.2 The Challenge-Response Architectural Flow

We formalize an **Override Engine** using standard **HTTP 428 Precondition Required**:

```
Angular UI (Client)                                   ASP.NET Core API (.NET 8/9)
       │                                                          │
       │ 1. PUT /crfs/{formId} (Attempts field edit)              │
       ├─────────────────────────────────────────────────────────►│ 2. Data Access Interceptor:
       │                                                          │    Form is in 'Submitted' state.
       │                                                          │    Requires Reason for Change!
       │ 3. HTTP 428 Precondition Required                        │
       │    Body: OverrideChallengeDto                            │
       │◄─────────────────────────────────────────────────────────┤
       │                                                          │
       │ 4. Angular OverrideInterceptor catches 428               │
       │    Reads UiConfig.SidepanelComponentKey                  │
       │    Opens Dynamic Sidepanel: "vi-reason-drawer"           │
       │                                                          │
       │ 5. User selects Category ("DataEntryError")              │
       │    Types Reason ("Corrected transcription from source")  │
       │    Clicks "Sign & Submit"                                │
       │                                                          │
       │ 6. PUT /crfs/{formId}                                    │
       │    Headers: X-Override-Token: "ch_7f8a9b1c..."           │
       │    Body: { ...data, overridePayload: { ... } }           │
       ├─────────────────────────────────────────────────────────►│ 7. Validate Override Token:
       │                                                          │    - Matches ChallengeId in cache
       │                                                          │    - Not expired (5-min TTL)
       │                                                          │    - Consumes token (single-use)
       │                                                          │ 8. Atomic MongoDB Transaction:
       │                                                          │    - Updates CRF entry
       │                                                          │    - Appends to audit_trail
       │ 9. HTTP 200 OK (Data Committed)                          │
       │◄─────────────────────────────────────────────────────────┤
```

### 3.3 The 4 Core Clinical Challenge Types

```
                                  GXP OVERRIDE TAXONOMY
                                             │
        ┌────────────────────┬───────────────┴───────────────┬────────────────────┐
        ▼                    ▼                               ▼                    ▼
Reason For Change     Electronic Signature           Protocol Deviation     Dual Authorization
(21 CFR §11.10(e))    (21 CFR §11.200)               (Clinical Edit Checks) (Four-Eyes Principle)
```

| Challenge Type | Trigger Condition | Sidepanel Rendered | Required Input Fields |
|---|---|---|---|
| **`ReasonForChange`** | Mutating any field on a submitted/frozen CRF. | `vi-reason-drawer` | `category` (enum: `TranscriptionError`, `SourceUpdate`, `LabRescan`), `justification` (text, min 10 chars). |
| **`ElectronicSignature`** | Formal CRF sign-off or study lock approval. | `vi-signature-drawer` | `reAuthPassword`, `claimMeaning` (`Author`, `Reviewer`, `InvestigatorApproval`), `<vi-signature>` canvas vector. |
| **`ProtocolDeviation`** | JsonLogic soft edit check warning (e.g., Diastolic BP > Systolic BP). | `vi-deviation-drawer` | `clinicalRationale`, `medicalMonitorNotified` (boolean), `protocolClauseReference`. |
| **`DualAuthorization`** | Emergency unblinding, site soft-freeze release, crypto-shredding. | `vi-dual-auth-drawer` | `secondSignerUsername`, `secondSignerPassword`, `witnessReason`. |

### 3.4 Data Contracts: `OverrideChallengeDto` and `SidepanelConfig`

```csharp
namespace Vialiq.Core.Models.Override;

public record OverrideChallengeDto(
    string ChallengeId,
    ChallengeType Type,
    string ResourceId,
    string Message,
    SidepanelConfig UiConfig,
    DateTime ExpiresAtUtc
);

public enum ChallengeType
{
    ReasonForChange,
    ElectronicSignature,
    ProtocolDeviation,
    DualAuthorization
}

public record SidepanelConfig(
    string ComponentKey,              // e.g. "vi-reason-drawer", "vi-signature-drawer"
    string DrawerTitle,
    string LegalStatement,
    IReadOnlyList<FieldRequirement> RequiredFields
);

public record FieldRequirement(
    string FieldKey,
    string Label,
    FieldDataType DataType,           // Text, Select, Password, SignatureVector, Boolean
    bool IsRequired,
    IReadOnlyList<string>? AllowedOptions = null
);

public enum FieldDataType
{
    Text,
    Select,
    Password,
    SignatureVector,
    Boolean
}
```

### 3.5 Server-Side Challenge Service: `IOverrideChallengeService`

```csharp
namespace Vialiq.Core.Interfaces;

using Vialiq.Core.Models.Override;

public interface IOverrideChallengeService
{
    Task<OverrideChallengeDto> IssueChallengeAsync(
        ChallengeType type,
        string resourceId,
        string message,
        SidepanelConfig uiConfig,
        TimeSpan? ttl = null);

    Task<bool> ValidateAndConsumeChallengeAsync(
        string challengeId,
        string expectedResourceId,
        ChallengeType expectedType,
        string consumedByUserId);
}
```

Implementation with in-memory / Redis cache:

```csharp
namespace Vialiq.Infrastructure.Services;

using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using Vialiq.Core.Exceptions;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Override;

public sealed class OverrideChallengeService : IOverrideChallengeService
{
    private readonly IDistributedCache _cache;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(5);

    public OverrideChallengeService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<OverrideChallengeDto> IssueChallengeAsync(
        ChallengeType type,
        string resourceId,
        string message,
        SidepanelConfig uiConfig,
        TimeSpan? ttl = null)
    {
        var challengeId = $"ch_{Guid.NewGuid():N}";
        var duration = ttl ?? DefaultTtl;
        var expiresAtUtc = DateTime.UtcNow.Add(duration);

        var challenge = new OverrideChallengeDto(
            ChallengeId: challengeId,
            Type: type,
            ResourceId: resourceId,
            Message: message,
            UiConfig: uiConfig,
            ExpiresAtUtc: expiresAtUtc
        );

        var cacheKey = $"override:{challengeId}";
        var serialized = JsonSerializer.Serialize(challenge);

        await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
        {
            AbsoluteExpiration = expiresAtUtc
        });

        return challenge;
    }

    public async Task<bool> ValidateAndConsumeChallengeAsync(
        string challengeId,
        string expectedResourceId,
        ChallengeType expectedType,
        string consumedByUserId)
    {
        var cacheKey = $"override:{challengeId}";
        var data = await _cache.GetStringAsync(cacheKey);

        if (string.IsNullOrEmpty(data))
        {
            throw new GxpOverrideValidationException("The override challenge token is invalid, expired, or has already been consumed.");
        }

        var challenge = JsonSerializer.Deserialize<OverrideChallengeDto>(data);
        if (challenge == null || 
            challenge.Type != expectedType || 
            !string.Equals(challenge.ResourceId, expectedResourceId, StringComparison.Ordinal))
        {
            throw new GxpOverrideValidationException("Override challenge payload mismatch.");
        }

        // Atomically delete token to enforce single-use
        await _cache.RemoveAsync(cacheKey);
        return true;
    }
}
```

### 3.6 Frontend Angular Interceptor: `OverrideChallengeInterceptor`

In the Angular client (`apps/shell` or `libs/form-renderer`), this interceptor catches HTTP 428 and coordinates the UI drawer automatically:

```typescript
import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { SidepanelDrawerService } from './sidepanel-drawer.service';

export interface OverrideChallengeDto {
  challengeId: string;
  type: 'ReasonForChange' | 'ElectronicSignature' | 'ProtocolDeviation' | 'DualAuthorization';
  resourceId: string;
  message: string;
  uiConfig: {
    componentKey: string;
    drawerTitle: string;
    legalStatement: string;
    requiredFields: Array<{ fieldKey: string; label: string; dataType: string; isRequired: boolean; allowedOptions?: string[] }>;
  };
}

@Injectable({ providedIn: 'root' })
export class OverrideChallengeInterceptor implements HttpInterceptor {
  private readonly drawerService = inject(SidepanelDrawerService);
  private readonly http = inject(HttpClient);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 428) {
          const challenge = error.error as OverrideChallengeDto;

          // Open the dynamic drawer based on the component key from backend
          return this.drawerService.openChallengeDrawer(challenge).pipe(
            switchMap((overridePayload) => {
              if (!overridePayload) {
                return throwError(() => new Error('User cancelled override challenge.'));
              }

              // Re-issue original request with the verified challenge token & audit justification
              const clonedRequest = req.clone({
                setHeaders: {
                  'X-Override-Token': challenge.challengeId,
                },
                body: {
                  ...(req.body as object),
                  gxpOverride: overridePayload,
                },
              });

              return next.handle(clonedRequest);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
```

---

## 4. Pillar 3: Unified Real-Time Foundation (ASP.NET Core SignalR)

### 4.1 Evaluation & Technology Selection
For clinical trial operations, real-time communication spans two primary requirements:
1. **Interactive Form Collaboration**: Field-level OCC locking ("Coordinator Smith is currently editing Systolic BP").
2. **Asynchronous Notification Streaming**: Alerts for query discrepancies, adverse events, session inactivity, and batch CDISC exports.

| Feature | Raw WebSockets (`ws://`) | Server-Sent Events (SSE) | ASP.NET Core SignalR |
|---|---|---|---|
| **Bi-directional Communication** | Yes | No (Server $\rightarrow$ Client only) | Yes (Full duplex) |
| **Hospital Proxy / Firewall Fallback** | None (Fails if port 80/443 WS blocked) | None | **Automatic fallback** (WS $\rightarrow$ SSE $\rightarrow$ Long Polling) |
| **Group / Room Multiplexing** | Manual tracking in code | Manual tracking | **Native `.Groups.AddToGroupAsync()`** |
| **Horizontal Multi-Pod Scale** | Complex Redis pub/sub broker | Complex | **1-line Redis backplane (`.AddStackExchangeRedis()`)** |
| **TypeScript SDK** | Generic websocket APIs | Native `EventSource` | **`@microsoft/signalr`** (type-safe, reconnection) |

**Decision:** **ASP.NET Core SignalR** is accepted as the enterprise standard.

### 4.2 Architecture: Dual-Hub Partitioning

```
                               SIGNALR DUAL-HUB TOPOLOGY
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
1. EdcCollaborationHub (`/hubs/edc`)                       2. PlatformNotificationHub (`/hubs/notifications`)
   • Active CRF Form Editing Session                          • User-level & Site-level Async Stream
   • Rooms: `study:{id}:subject:{id}:form:{id}`               • Rooms: `user:{userId}`, `site:{siteId}`
   • Field-level OCC Lock Leases                              • Long-running CDISC Export Progress
   • Real-time Concurrency Avoidance                          • Safety / ePRO Adverse Event Broadcasts
   • Active User Presence Indicators                          • 21 CFR Part 11 Inactivity Warning Sweeps
```

### 4.3 Implementation: `EdcCollaborationHub`

```csharp
namespace Vialiq.Api.Hubs;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Vialiq.Core.Interfaces;

public interface IEdcCollaborationClient
{
    Task FieldLockAcquired(FieldLockEventDto evt);
    Task FieldLockReleased(FieldLockEventDto evt);
    Task UserJoinedForm(UserPresenceDto user);
    Task UserLeftForm(UserPresenceDto user);
    Task FormSoftFrozen(FormFreezeEventDto evt);
}

[Authorize]
public sealed class EdcCollaborationHub : Hub<IEdcCollaborationClient>
{
    private readonly IFieldLockManager _lockManager;
    private readonly ILogger<EdcCollaborationHub> _logger;

    public EdcCollaborationHub(IFieldLockManager lockManager, ILogger<EdcCollaborationHub> logger)
    {
        _lockManager = lockManager;
        _logger = logger;
    }

    public async Task JoinFormSession(string studyId, string subjectId, string formId)
    {
        var groupName = BuildGroupName(studyId, subjectId, formId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        var user = GetUserPresence();
        await Clients.OthersInGroup(groupName).UserJoinedForm(user);
    }

    public async Task LeaveFormSession(string studyId, string subjectId, string formId)
    {
        var groupName = BuildGroupName(studyId, subjectId, formId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        var user = GetUserPresence();
        await Clients.OthersInGroup(groupName).UserLeftForm(user);

        // Release any active locks held by this connection
        var releasedLocks = await _lockManager.ReleaseAllLocksForConnectionAsync(Context.ConnectionId);
        foreach (var lk in releasedLocks)
        {
            await Clients.OthersInGroup(groupName).FieldLockReleased(lk);
        }
    }

    public async Task<bool> AcquireFieldLock(string studyId, string subjectId, string formId, string fieldKey)
    {
        var groupName = BuildGroupName(studyId, subjectId, formId);
        var user = GetUserPresence();

        var acquired = await _lockManager.TryAcquireLockAsync(
            studyId, subjectId, formId, fieldKey, user.UserId, user.DisplayName, Context.ConnectionId, TimeSpan.FromSeconds(30));

        if (acquired)
        {
            await Clients.OthersInGroup(groupName).FieldLockAcquired(new FieldLockEventDto(
                FieldKey: fieldKey,
                HeldByUserId: user.UserId,
                HeldByDisplayName: user.DisplayName,
                AcquiredAtUtc: DateTime.UtcNow,
                LeaseDurationSeconds: 30
            ));
        }

        return acquired;
    }

    public async Task ReleaseFieldLock(string studyId, string subjectId, string formId, string fieldKey)
    {
        var groupName = BuildGroupName(studyId, subjectId, formId);
        var user = GetUserPresence();

        await _lockManager.ReleaseLockAsync(studyId, subjectId, formId, fieldKey, user.UserId);

        await Clients.OthersInGroup(groupName).FieldLockReleased(new FieldLockEventDto(
            FieldKey: fieldKey,
            HeldByUserId: user.UserId,
            HeldByDisplayName: user.DisplayName,
            AcquiredAtUtc: DateTime.UtcNow,
            LeaseDurationSeconds: 0
        ));
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Cleanup all leases held by disconnected client
        await _lockManager.ReleaseAllLocksForConnectionAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    private static string BuildGroupName(string studyId, string subjectId, string formId) =>
        $"study:{studyId}:subject:{subjectId}:form:{formId}";

    private UserPresenceDto GetUserPresence() =>
        new(
            UserId: Context.UserIdentifier ?? "unknown",
            DisplayName: Context.User?.FindFirst("name")?.Value ?? Context.User?.Identity?.Name ?? "Investigator",
            Role: Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "Coordinator"
        );
}

public record FieldLockEventDto(string FieldKey, string HeldByUserId, string HeldByDisplayName, DateTime AcquiredAtUtc, int LeaseDurationSeconds);
public record UserPresenceDto(string UserId, string DisplayName, string Role);
public record FormFreezeEventDto(string FormId, string Reason, string FrozenByDisplayName);
```

### 4.4 Implementation: `PlatformNotificationHub`

```csharp
namespace Vialiq.Api.Hubs;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

public interface IPlatformNotificationClient
{
    Task OnCdiscExportCompleted(CdiscExportCompletedNotification notification);
    Task OnQueryDiscrepancyRaised(QueryDiscrepancyNotification notification);
    Task OnSafetyAdverseEventAlert(SafetyAlertNotification notification);
    Task OnInactivitySessionWarning(InactivityWarningNotification notification);
}

[Authorize]
public sealed class PlatformNotificationHub : Hub<IPlatformNotificationClient>
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            // Add connection to private user room
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
        }

        var siteId = Context.User?.FindFirst("site_id")?.Value;
        if (!string.IsNullOrEmpty(siteId))
        {
            // Add connection to site-level room
            await Groups.AddToGroupAsync(Context.ConnectionId, $"site:{siteId}");
        }

        await base.OnConnectedAsync();
    }
}

public record CdiscExportCompletedNotification(string JobId, string StudyId, string DownloadUrl, long FileSizeBytes, DateTime CompletedAtUtc);
public record QueryDiscrepancyNotification(string QueryId, string SubjectId, string FieldKey, string Severity, string Message);
public record SafetyAlertNotification(string SubjectId, string AdverseEventCode, string SeverityGrade, DateTime OnsetUtc);
public record InactivityWarningNotification(int RemainingSecondsBeforeLogout);
```

### 4.5 Scaling Strategy: Zero-Infrastructure Now $\rightarrow$ Redis Backplane Tomorrow

In `backend/api/src/Vialiq.Api/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configure SignalR
var signalRBuilder = builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// ZERO-INFRA TODAY vs DISTRIBUTED TOMORROW:
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrWhiteSpace(redisConnectionString))
{
    // Production multi-pod Kubernetes scale:
    signalRBuilder.AddStackExchangeRedis(redisConnectionString, options =>
    {
        options.Configuration.ChannelPrefix = "Vialiq.SignalR";
    });
}
// If redis is not configured (e.g. local dev), SignalR automatically runs in-memory!

var app = builder.Build();

app.MapHub<EdcCollaborationHub>("/hubs/edc");
app.MapHub<PlatformNotificationHub>("/hubs/notifications");
```

### 4.6 Angular Client Service: `EdcRealtimeService`

In `libs/form-renderer` / `apps/shell`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';

export interface FieldLock {
  fieldKey: string;
  heldByUserId: string;
  heldByDisplayName: string;
  acquiredAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class EdcRealtimeService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly activeLocks = signal<Map<string, FieldLock>>(new Map());

  // Public readonly signal for UI binding
  public readonly locks = computed(() => this.activeLocks());

  public async connectToForm(studyId: string, subjectId: string, formId: string, authToken: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/edc', {
        accessTokenFactory: () => authToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    this.registerEventHandlers();

    await this.hubConnection.start();
    await this.hubConnection.invoke('JoinFormSession', studyId, subjectId, formId);
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('FieldLockAcquired', (evt: FieldLock) => {
      this.activeLocks.update((current) => {
        const next = new Map(current);
        next.set(evt.fieldKey, evt);
        return next;
      });
    });

    this.hubConnection.on('FieldLockReleased', (evt: { fieldKey: string }) => {
      this.activeLocks.update((current) => {
        const next = new Map(current);
        next.delete(evt.fieldKey);
        return next;
      });
    });
  }

  public async acquireFieldLock(studyId: string, subjectId: string, formId: string, fieldKey: string): Promise<boolean> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return false;
    }
    return await this.hubConnection.invoke<boolean>('AcquireFieldLock', studyId, subjectId, formId, fieldKey);
  }

  public async releaseFieldLock(studyId: string, subjectId: string, formId: string, fieldKey: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('ReleaseFieldLock', studyId, subjectId, formId, fieldKey);
    }
  }

  public async disconnect(studyId: string, subjectId: string, formId: string): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.invoke('LeaveFormSession', studyId, subjectId, formId);
      await this.hubConnection.stop();
      this.activeLocks.set(new Map());
      this.hubConnection = null;
    }
  }
}
```

---

## 5. Architectural Summary & Compliance Verifications

```
========================================================================================
VIALIQ EDC API FOUNDATIONS MATRIX
========================================================================================
Operational Dimension    Design Choice                Compliance / Operational Justification
----------------------------------------------------------------------------------------
Routing & Multitenancy   JWT Claims + HTTP Headers    Eliminates path bloat, guarantees cryptographic
                                                      tenant boundary, enables study switching.
Cluster Selection        Dynamic IMongoDatabaseFactory Routes Dev requests to Layer 2 (27027) and
                                                      Prod requests to Layer 3 (27037).
Regulatory Workflows     GxP "Override Engine" (428)  Standardizes Reason for Change (§11.10(e)),
                                                      e-Signatures (§11.200), and Four-Eyes checks.
Dynamic UI Dispatch      SidepanelDrawer via 428      Decouples backend rules from Angular drawers;
                                                      generic metadata drives UI form layout.
Real-Time Protocol       ASP.NET Core SignalR         In-memory hub on Day 1; 1-line Redis scale
                                                      on Day 2; automatic firewall fallback.
OCC Field Concurrency    Lease-based EdcCollaborationHub Eliminates clinical coordinator overwrite
                                                      collisions during live monitoring.
Async Event Grid         PlatformNotificationHub      Instant push for batch CDISC exports, ePRO
                                                      safety alerts, and 15-min timeout warnings.
========================================================================================
```
