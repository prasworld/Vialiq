# ADR: API Controller Conventions, Decoupled Contracts, Database Migrations, and Seeding Architecture

> **Document ID:** `VIALIQ-ARCH-API-006`  
> **Domain:** Backend Architecture — Controller Design, Seeding & Schema Migrations  
> **Status:** Accepted  
> **Date:** October 20, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** ASP.NET Core 8/9 Web API (`backend/api/src/Vialiq.Api`), `Vialiq.Core`, `Vialiq.Infrastructure`, Angular 21 Host (`apps/shell/`), `@vialiq/automapper` (`libs/automapper`)  
> **Related Documents:**
> - [001: EDC API Architecture ADR](./001-api-architecture-adr.md)
> - [002: API Stack Discussion Agenda & Evaluation Framework](./002-api-stack-discussion-agenda-and-evaluation-framework.md)
> - [003: DTO Architecture Strategy & Rejection of GraphQL](./003-dto-design-and-graphql-evaluation-adr.md)
> - [004: Unified Monorepo Architecture vs. Git Submodules](./004-repository-architecture-monorepo-vs-submodule-adr.md)
> - [005: Hybrid Context, GxP Override Engine & SignalR Real-Time](./005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [002: 3-Cluster & Flexible Tenancy Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md)

---

## 1. Executive Summary & Context

To transition from foundational architectural decisions to concrete backend implementation, this ADR formalizes four essential engineering standards:

```
                      API ARCHITECTURE & OPERATIONS STANDARDS
                                         │
        ┌───────────────────┬────────────┴───────────────┬───────────────────┐
        ▼                   ▼                            ▼                   ▼
1. Dependency Injection 2. Convention Controllers    3. Decoupled Contracts  4. Migration & Seeding
   Clean Scoped Topology   Resource + Action Pattern    Dual AutoMapper Engine  __system_migrations
   (Zero-Reflection GAMP) (Prevents 300+ Routes)        (TS camel $\ne$ C# Pascal) (3-Tier Seeding)
```

1. **Dependency Injection (DI) Topology**: Strict scoped DI registration separating Domain, Infrastructure, and Presentation layers for testability and GAMP 5 validation compliance.
2. **Convention over Configuration Controller Architecture**: Prevents an explosion of 300+ fragmented ad-hoc routes by implementing a **Uniform Resource + Action Dispatcher Convention**.
3. **Decoupled Wire Contracts & Dual AutoMapper**: Re-affirms that TypeScript UI models and C# BSON entities **never** directly couple. The wire contract is a neutral transport boundary; `@vialiq/automapper` on Angular and AutoMapper on .NET manage internal adaptations independently.
4. **Database Change Version Control & 3-Tier Seeding**: Establishes a deterministic, audit-trailed schema migration engine (`__system_migrations`) and a phased database seeding strategy across Layer 1 Admin (`27017`), Layer 2 Dev (`27027`), and Layer 3 Prod (`27037`).

---

## 2. Pillar 1: Dependency Injection Topology & Service Registration

### 2.1 Architectural Rules for DI
- **Pure Dependency Injection**: All services, repositories, and factories are registered via `Microsoft.Extensions.DependencyInjection`.
- **Zero Service Locator Anti-Pattern**: Resolving dependencies via `IServiceProvider` inside domain classes is strictly forbidden.
- **Lifetime Discipline**:
  - `Transient`: Lightweight stateless evaluators (e.g., JsonLogic evaluator, AST parser).
  - `Scoped`: HTTP request boundary objects (e.g., `ITenantStudyContextAccessor`, `IMongoDatabaseFactory`, `ICrfEntryService`, `IOverrideChallengeService`).
  - `Singleton`: Connection pools, distributed caches, and cluster client holders (`IConnectionPoolManager`, `IKeyVaultManager`).

### 2.2 Layered Registration Extensions

```
Vialiq.Api (Host)
  └── Program.cs
        ├── .AddCoreServices()           -> Vialiq.Core (Domain rules, enums, exceptions)
        ├── .AddValidationServices()     -> Vialiq.Validation (JsonLogic parser, AST evaluators)
        └── .AddInfrastructureServices() -> Vialiq.Infrastructure (MongoDB, CSFLE, Redis, Hubs)
```

#### Implementation: `ServiceCollectionExtensions.cs`

```csharp
namespace Vialiq.Infrastructure.Extensions;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vialiq.Core.Interfaces;
using Vialiq.Infrastructure.Data;
using Vialiq.Infrastructure.Repositories;
using Vialiq.Infrastructure.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Singleton Cluster Connection Pools
        services.AddSingleton<IConnectionPoolManager, MongoConnectionPoolManager>();

        // Scoped Multi-Tenant Context & Database Dispatcher
        services.AddScoped<ITenantStudyContextAccessor, TenantStudyContextAccessor>();
        services.AddScoped<IMongoDatabaseFactory, MongoDatabaseFactory>();

        // Scoped Clinical Repositories
        services.AddScoped<ICrfEntryRepository, CrfEntryRepository>();
        services.AddScoped<IClinicalQueryRepository, ClinicalQueryRepository>();
        services.AddScoped<IAuditTrailRepository, AuditTrailRepository>();
        services.AddScoped<IStudyLockRepository, StudyLockRepository>();

        // Scoped Domain Services
        services.AddScoped<ICrfEntryService, CrfEntryService>();
        services.AddScoped<IClinicalQueryService, ClinicalQueryService>();
        services.AddScoped<IStudyLockService, StudyLockService>();
        services.AddScoped<ISignatureService, SignatureService>();
        services.AddScoped<IOverrideChallengeService, OverrideChallengeService>();

        // Database Migration & Seeding Engine
        services.AddScoped<IDatabaseMigrationRunner, MongoDatabaseMigrationRunner>();
        services.AddScoped<IDevelopmentSeeder, DevelopmentSeeder>();

        return services;
    }
}
```

---

## 3. Pillar 2: Convention over Configuration (Preventing 300+ Route Explosion)

### 3.1 The Problem: The 300+ Endpoint Trap
In clinical EDC, an unprincipled routing strategy produces hundreds of micro-endpoints:
```http
// ANTI-PATTERN: Route Explosion (> 300 routes)
POST /api/v1/edc/crfs/save-draft
POST /api/v1/edc/crfs/submit-final
POST /api/v1/edc/crfs/freeze-form
POST /api/v1/edc/crfs/unlock-form
POST /api/v1/edc/crfs/sign-off
POST /api/v1/edc/crfs/re-sign
POST /api/v1/edc/crfs/open-query
POST /api/v1/edc/crfs/answer-query
POST /api/v1/edc/crfs/close-query
// ... multiplied by 15 clinical domain entities = 300+ routes!
```
This bloats the Swagger UI, increases test complexity, breaks REST semantics, and makes client SDK generation chaotic.

### 3.2 The Accepted Pattern: Uniform Resource + Action Dispatcher Convention

We establish three immutable routing conventions across all EDC controllers:

#### 1. Standard Resource Verbs (CRUD & Lookups):
Every clinical entity supports standard RESTful operations:
- `GET    /api/v1/edc/{resource}/{id}` $\rightarrow$ Retrieve single resource by unique primary key (safe, idempotent, no body).
- `POST   /api/v1/edc/{resource}` $\rightarrow$ Initial Creation / Registration.
- `PUT    /api/v1/edc/{resource}/{id}` $\rightarrow$ Full Idempotent Replace.
- `PATCH  /api/v1/edc/{resource}/{id}` $\rightarrow$ Field Delta Update.
- `DELETE /api/v1/edc/{resource}/{id}` $\rightarrow$ Soft Delete / Invalidate.

#### 2. The IETF HTTP `QUERY` Method (Replacing `HttpGet` for Complex Clinical Searching):
In clinical trials, querying data is deeply complex:
- Medical monitors filter across 50+ fields, complex nested JsonLogic ASTs, date ranges, and arrays of 500+ subject IDs.
- **The Failure of `HttpGet` with Query Strings**:
  1. **URL Length Limits**: Standard proxies, AWS ALB, and browsers cap URLs at 2048 bytes; large filter queries crash with HTTP 414 URI Too Long.
  2. **PHI / PII Data Leakage**: Reverse proxies, CDNs, and server access logs record the entire URL query string in plaintext, leaking sensitive patient medical filters into log aggregators (violating HIPAA § 164.312 and GDPR Art. 9).
  3. **Serialization Fragility**: Nested Boolean logic (`(systolic > 140 AND visit = 2) OR (ae_severity = 'Grade 4')`) cannot be cleanly expressed in flat URL parameters.
- **The Failure of `HttpPost` for Searching**:
  - `POST` denotes an unsafe, non-idempotent mutation. It breaks HTTP semantics, triggers browser resubmission warnings, and is non-cacheable by intermediate proxies.
- **The Solution: IETF HTTP `QUERY` (`draft-ietf-httpbis-safe-method-w-body`)**:
  - **Safe & Idempotent**: Exactly like `GET`, it never modifies server state.
  - **Carries a Request Body**: Exactly like `POST`, it passes a structured JSON `StructuredSearchRequest` payload.
  - **Proxy-Resilient Fallback**: For hospital firewalls that strictly block non-standard HTTP verbs, we support dual-binding via `X-HTTP-Method-Override: QUERY` or `POST {resource}/query`.

```http
QUERY /api/v1/edc/crf-entries/query HTTP/1.1
Host: api.vialiq.io
Authorization: Bearer <token>
X-Tenant-Id: ten_novartis_global
X-Study-Id: std_onco101
Content-Type: application/json

{
  "filter": {
    "and": [
      { "==": [{ "var": "visit_id" }, "VISIT_02"] },
      { ">": [{ "var": "field_data.systolic_bp" }, 140] }
    ]
  },
  "projections": ["subject_id", "visit_id", "field_data.systolic_bp", "status"],
  "sort": [{ "field": "updated_at_utc", "direction": "Descending" }],
  "pagination": { "pageNumber": 1, "pageSize": 50 }
}
```

#### 3. The Universal Action Dispatcher:
All state transitions, workflow steps, and regulatory actions use a standardized action route:
```http
POST /api/v1/edc/{resource}/{id}/actions/{actionName}
```
Where `{actionName}` is a well-known domain action verb:
- `crf-entries/{id}/actions/save-draft`
- `crf-entries/{id}/actions/submit`
- `crf-entries/{id}/actions/freeze`
- `crf-entries/{id}/actions/unfreeze`
- `crf-entries/{id}/actions/sign`
- `queries/{id}/actions/answer`
- `queries/{id}/actions/close`
- `queries/{id}/actions/reopen`

---

### 3.3 Custom `[HttpQuery]` Attribute & Base Controller Implementation

#### The `HttpQueryAttribute` in ASP.NET Core:

```csharp
namespace Vialiq.Api.Attributes;

using Microsoft.AspNetCore.Mvc.Routing;

[AttributeUsage(AttributeTargets.Method)]
public sealed class HttpQueryAttribute : HttpMethodAttribute
{
    private static readonly IEnumerable<string> SupportedMethods = new[] { "QUERY", "POST" };

    public HttpQueryAttribute() : base(SupportedMethods)
    {
    }

    public HttpQueryAttribute(string template) : base(SupportedMethods, template)
    {
    }
}
```

#### Base Controller Implementation: `ConventionResourceController<TEntity, TDto>`

```csharp
namespace Vialiq.Api.Controllers.Edc;

using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Vialiq.Api.Attributes;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

[ApiController]
[Route("api/v1/edc/[controller]")]
public abstract class ConventionResourceController<TEntity, TDto> : ControllerBase
    where TEntity : class, IIdentifiable
    where TDto : class
{
    protected readonly IConventionResourceService<TEntity, TDto> Service;
    protected readonly ILogger Logger;

    protected ConventionResourceController(
        IConventionResourceService<TEntity, TDto> service,
        ILogger logger)
    {
        Service = service;
        Logger = logger;
    }

    /// <summary>
    /// Executes structured search using the IETF HTTP QUERY method (with POST fallback for strict hospital firewalls).
    /// </summary>
    [HttpQuery("query")]
    public virtual async Task<ActionResult<PagedResult<TDto>>> Query([FromBody] StructuredSearchRequest request)
    {
        var result = await Service.QueryAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<TDto>> GetById(string id)
    {
        var entity = await Service.GetByIdAsync(id);
        if (entity == null) return NotFound();
        return Ok(entity);
    }

    [HttpPost]
    public virtual async Task<ActionResult<TDto>> Create([FromBody] TDto dto)
    {
        var created = await Service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public virtual async Task<ActionResult<TDto>> Update(string id, [FromBody] TDto dto)
    {
        var updated = await Service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpPost("{id}/actions/{actionName}")]
    public virtual async Task<ActionResult<ActionExecutionResult>> ExecuteAction(
        string id, 
        string actionName, 
        [FromBody] JsonElement actionPayload)
    {
        Logger.LogInformation("Executing action {ActionName} on resource {Id}", actionName, id);
        var result = await Service.DispatchActionAsync(id, actionName, actionPayload);
        return Ok(result);
    }
}
```

### 3.4 Concrete Clinical Controller: `CrfEntriesController`

```csharp
namespace Vialiq.Api.Controllers.Edc;

using Microsoft.AspNetCore.Mvc;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Crf;

[ApiController]
[Route("api/v1/edc/crf-entries")]
public sealed class CrfEntriesController : ConventionResourceController<CrfEntryEntity, CrfEntryDto>
{
    private readonly ICrfEntryService _crfService;

    public CrfEntriesController(
        ICrfEntryService crfService, 
        ILogger<CrfEntriesController> logger) 
        : base(crfService, logger)
    {
        _crfService = crfService;
    }

    // Sub-Resource Navigation: Get all discrepancies for this specific CRF
    [HttpGet("{id}/queries")]
    public async Task<ActionResult<IReadOnlyList<ClinicalQueryDto>>> GetQueriesForCrf(string id)
    {
        var queries = await _crfService.GetQueriesByCrfIdAsync(id);
        return Ok(queries);
    }

    // Sub-Resource Navigation: Get complete chronological audit trail
    [HttpGet("{id}/audit-trail")]
    public async Task<ActionResult<IReadOnlyList<AuditTrailEntryDto>>> GetAuditTrailForCrf(string id)
    {
        var trail = await _crfService.GetAuditTrailByCrfIdAsync(id);
        return Ok(trail);
    }
}
```

By leveraging this convention, **10 controllers** handle all clinical operations across the entire platform, cutting route maintenance by **> 85%**.

---

## 4. Pillar 3: Decoupled Wire Contracts & Dual AutoMapper Strategy

### 4.1 Strict Decoupling Rules
1. **No Shared Binary Classes**: The TypeScript frontend and C# backend **do not share code or binary types**.
2. **Casing & Naming Standards**:
   - C# Domain Entities & DTOs: **PascalCase** (`SubjectId`, `ReasonForChange`, `CrfStatus`).
   - Wire JSON Serialization: Standard **camelCase** (`subjectId`, `reasonForChange`, `crfStatus`) via `System.Text.Json` settings.
   - Angular UI View Models: Optimized for Signals, Form Groups, and Lit Component bindings.
3. **Dual AutoMapper Tier**:
   - **Backend Tier (AutoMapper / Mapster)**: Maps between internal MongoDB BSON Entities $\leftrightarrow$ Public Wire DTOs.
   - **Frontend Tier ([`@vialiq/automapper`](../../../libs/automapper))**: Maps between Public Wire DTOs $\leftrightarrow$ UI Form Signals & View State.

```
┌─────────────────────────┐               ┌─────────────────────────┐
│     BACKEND (.NET)      │               │     FRONTEND (ANGULAR)  │
│                         │               │                         │
│  [MongoDB BSON Entity]  │               │   [UI Signal / Form]    │
│            ▲            │               │            ▲            │
│            │ AutoMapper │               │            │ @vialiq/   │
│            ▼            │               │            │ automapper │
│       [Wire DTO]        │ ◄── JSON ──►  │       [Wire DTO]        │
│   (PascalCase in C#)    │  (camelCase)  │   (camelCase in TS)     │
└─────────────────────────┘               └─────────────────────────┘
```

### 4.2 Frontend Mapping Example (`@vialiq/automapper`)

In `libs/form-renderer`:

```typescript
import { createMapper, createMap, forMember, mapFrom } from '@vialiq/automapper';

// Wire DTO (camelCase contract from API)
export interface CrfEntryWireDto {
  id: string;
  subjectId: string;
  formId: string;
  version: number;
  status: 'Draft' | 'Submitted' | 'Frozen' | 'Signed';
  fieldData: Record<string, unknown>;
  updatedAtUtc: string;
}

// Angular Reactive View Model (Used inside Signals & Lit Web Components)
export interface CrfFormViewModel {
  crfId: string;
  patientIdentifier: string;
  schemaVersion: number;
  isReadOnly: boolean;
  canSubmit: boolean;
  formData: Record<string, unknown>;
  lastSavedFormatted: string;
}

// Configuration Profile
export const crfMapper = createMapper();
createMap<CrfEntryWireDto, CrfFormViewModel>(crfMapper, 'CrfEntryWireDto', 'CrfFormViewModel', [
  forMember((dest) => dest.crfId, mapFrom((src) => src.id)),
  forMember((dest) => dest.patientIdentifier, mapFrom((src) => src.subjectId)),
  forMember((dest) => dest.schemaVersion, mapFrom((src) => src.version)),
  forMember((dest) => dest.isReadOnly, mapFrom((src) => src.status === 'Frozen' || src.status === 'Signed')),
  forMember((dest) => dest.canSubmit, mapFrom((src) => src.status === 'Draft')),
  forMember((dest) => dest.formData, mapFrom((src) => src.fieldData)),
  forMember((dest) => dest.lastSavedFormatted, mapFrom((src) => new Date(src.updatedAtUtc).toLocaleString())),
]);
```

---

## 5. Pillar 4: Database Change Version Control & 3-Tier Seeding Architecture

### 5.1 The Need for MongoDB Migration Version Control
In clinical SaaS with 100+ multi-tenant study databases:
- Relational schema tools (EF Migrations / Flyway) do not understand MongoDB replica set clusters, collection validators, or CSFLE key vaults.
- We must track every index creation, schema validator update, and system collection modification in a deterministic, auditable ledger.

### 5.2 Schema Migration Engine: `__system_migrations`

Every database in the system (Layer 1 Admin, Layer 2 Dev, Layer 3 Prod) maintains a tracking collection:

```json
{
  "_id": "20261020_001_initial_crf_indexes",
  "version": 1,
  "description": "Create compound unique index on crf_entries (study_id, subject_id, form_id, visit_id)",
  "applied_at_utc": "2026-10-20T08:00:00Z",
  "applied_by": "SystemMigrationRunner",
  "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "execution_time_ms": 142,
  "success": true
}
```

#### The GxP Migration Safety Rules:
1. **Additive Only**: Migrations must never drop fields or historical patient collections in production.
2. **Hash Tamper Detection**: If a migration's C# code is modified after being applied, the runner refuses to boot, logging a 21 CFR Part 11 integrity violation.
3. **Multi-Database Fan-out**: Study-level migrations automatically fan out across all provisioned study databases in the target cluster.

#### Interface: `IMongoMigration`

```csharp
namespace Vialiq.Infrastructure.Migrations;

using MongoDB.Driver;

public interface IMongoMigration
{
    string MigrationId { get; }      // e.g. "20261020_001_InitialIndexes"
    int Version { get; }
    string Description { get; }
    MigrationTarget Target { get; }   // AdminClusterOnly | StudyDatabasesAll
    Task UpAsync(IMongoDatabase database, CancellationToken ct);
}

public enum MigrationTarget
{
    AdminClusterOnly,
    StudyDatabasesAll
}
```

#### Migration Implementation: Index Initialization

```csharp
namespace Vialiq.Infrastructure.Migrations;

using MongoDB.Driver;
using Vialiq.Core.Models.Crf;

public sealed class Migration_20261020_001_InitialIndexes : IMongoMigration
{
    public string MigrationId => "20261020_001_InitialIndexes";
    public int Version => 1;
    public string Description => "Create core compound indexes for CRF entries, queries, and audit trail";
    public MigrationTarget Target => MigrationTarget.StudyDatabasesAll;

    public async Task UpAsync(IMongoDatabase database, CancellationToken ct)
    {
        // 1. Compound index on CRF Entries: study_id + subject_id + form_id
        var crfCollection = database.GetCollection<CrfEntryEntity>("crf_entries");
        var crfIndexKeys = Builders<CrfEntryEntity>.IndexKeys
            .Ascending(c => c.StudyId)
            .Ascending(c => c.SubjectId)
            .Ascending(c => c.FormId)
            .Ascending(c => c.VisitId);

        await crfCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<CrfEntryEntity>(crfIndexKeys, new CreateIndexOptions
            {
                Name = "idx_crf_subject_form_visit",
                Unique = true
            }),
            cancellationToken: ct);

        // 2. Audit Trail query index: entity_id + timestamp descending
        var auditCollection = database.GetCollection<AuditTrailEntry>("audit_trail");
        var auditIndexKeys = Builders<AuditTrailEntry>.IndexKeys
            .Ascending(a => a.EntityId)
            .Descending(a => a.TimestampUtc);

        await auditCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<AuditTrailEntry>(auditIndexKeys, new CreateIndexOptions
            {
                Name = "idx_audit_entity_time"
            }),
            cancellationToken: ct);
    }
}
```

---

### 5.3 The 3-Tier Seeding Architecture

Seeding is strictly stratified to guarantee that production never receives test data, while local developers get a fully functional, pre-populated clinical trial environment.

```
                               3-TIER SEEDING ARCHITECTURE
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
Tier 1: System Bootstrap            Tier 2: Study Template Seeding       Tier 3: Local Dev Seeding
(All Environments / Prod)           (On Study Provisioning)              (Development & Local Tests)
• Layer 1 Admin Cluster (`27017`)   • Layer 2/3 Clusters                 • Guarded: IsDevelopment()
• Global System Roles & Perms       • Default Query Severities           • Tenant: Novartis (`ten_novartis`)
• Standard CDISC CT Dictionaries    • 4-Tier Locking Registry            • Study: ONCO-101 (`std_onco101`)
• Platform Admin Root Account       • Electronic Signature Manifests     • Mock Subjects, Forms & CRFs
```

#### Implementation: `DevelopmentSeeder.cs`

```csharp
namespace Vialiq.Infrastructure.Data;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Crf;

public sealed class DevelopmentSeeder : IDevelopmentSeeder
{
    private readonly IConnectionPoolManager _poolManager;
    private readonly IHostEnvironment _env;
    private readonly ILogger<DevelopmentSeeder> _logger;

    public DevelopmentSeeder(
        IConnectionPoolManager poolManager, 
        IHostEnvironment env, 
        ILogger<DevelopmentSeeder> logger)
    {
        _poolManager = poolManager;
        _env = env;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // STRICT GXP SAFETY GUARD: Never seed mock data in Production or Staging!
        if (!_env.IsDevelopment())
        {
            _logger.LogInformation("Skipping development seeding in non-development environment {Env}", _env.EnvironmentName);
            return;
        }

        _logger.LogInformation("Seeding development clinical fixture: ONCO-101...");

        // 1. Seed Layer 1 Admin Control Plane (rs-admin:27017)
        var adminDb = _poolManager.GetAdminClusterClient().GetDatabase("vialiq_control_plane");
        await SeedAdminControlPlaneAsync(adminDb);

        // 2. Seed Layer 2 Dev Study Database (rs-dev:27027)
        var devDb = _poolManager.GetDevClusterClient().GetDatabase("vialiq_ten_novartis_global_std_onco101_dev");
        await SeedStudyDevDatabaseAsync(devDb);

        _logger.LogInformation("Development seeding complete. Ready for API requests.");
    }

    private static async Task SeedAdminControlPlaneAsync(IMongoDatabase adminDb)
    {
        var tenantsCollection = adminDb.GetCollection<TenantRecord>("tenants");
        var existingTenant = await tenantsCollection.Find(t => t.Id == "ten_novartis_global").FirstOrDefaultAsync();
        if (existingTenant == null)
        {
            await tenantsCollection.InsertOneAsync(new TenantRecord(
                Id: "ten_novartis_global",
                Name: "Novartis Pharmaceuticals",
                Tier: "Enterprise",
                IsActive: true,
                CreatedAtUtc: DateTime.UtcNow
            ));
        }

        var studiesCollection = adminDb.GetCollection<StudyRecord>("studies");
        var existingStudy = await studiesCollection.Find(s => s.Id == "std_onco101").FirstOrDefaultAsync();
        if (existingStudy == null)
        {
            await studiesCollection.InsertOneAsync(new StudyRecord(
                Id: "std_onco101",
                TenantId: "ten_novartis_global",
                ProtocolNumber: "ONCO-101",
                Title: "Phase 3 Study of Novel Kinase Inhibitor in Advanced NSCLC",
                Status: "Active",
                CurrentProtocolVersion: "1.0",
                CreatedAtUtc: DateTime.UtcNow
            ));
        }
    }

    private static async Task SeedStudyDevDatabaseAsync(IMongoDatabase studyDb)
    {
        var crfCollection = studyDb.GetCollection<CrfEntryEntity>("crf_entries");
        var existingCrf = await crfCollection.Find(c => c.Id == "crf_demo_subj001").FirstOrDefaultAsync();
        if (existingCrf == null)
        {
            await crfCollection.InsertOneAsync(new CrfEntryEntity
            {
                Id = "crf_demo_subj001",
                TenantId = "ten_novartis_global",
                StudyId = "std_onco101",
                SubjectId = "SUBJ-001",
                FormId = "form_demographics",
                VisitId = "VISIT_SCREENING",
                Version = 1,
                Status = CrfStatus.Draft,
                FieldData = new Dictionary<string, object>
                {
                    { "date_of_birth", "1978-04-12" },
                    { "biological_sex", "Female" },
                    { "informed_consent_date", "2026-10-15" }
                },
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            });
        }
    }
}

public record TenantRecord(string Id, string Name, string Tier, bool IsActive, DateTime CreatedAtUtc);
public record StudyRecord(string Id, string TenantId, string ProtocolNumber, string Title, string Status, string CurrentProtocolVersion, DateTime CreatedAtUtc);
```

---

## 6. Verification & Startup Orchestration

In `backend/api/src/Vialiq.Api/Program.cs`:

```csharp
var app = builder.Build();

// Run Database Migrations on Startup
using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<IDatabaseMigrationRunner>();
    await migrationRunner.ApplyPendingMigrationsAsync();

    // Run Development Fixture Seeding (Safely guarded by IsDevelopment)
    var seeder = scope.ServiceProvider.GetRequiredService<IDevelopmentSeeder>();
    await seeder.SeedAsync();
}

app.UseMiddleware<TenantContextResolutionMiddleware>();
app.MapControllers();
app.Run();
```

---

## 7. Architectural Summary

| Dimension | Architectural Decision | Regulatory / Operational Justification |
|---|---|---|
| **Dependency Injection** | Built-in Scoped & Singleton DI | Clean testability with zero-reflection overhead under GAMP 5. |
| **Routing Convention** | Uniform Resource + Action Dispatcher | Replaces 300+ messy endpoints with ~10 predictable controllers. |
| **Contract Decoupling** | Symmetrical Dual AutoMapper | C# and TypeScript models evolve independently; casing issues eliminated. |
| **Database Migrations** | `__system_migrations` ledger | Deterministic, hash-verified, additive-only GxP schema evolution. |
| **Seeding Strategy** | 3-Tier Stratified Seeding | Zero risk of test data in Prod; instant turn-key onboarding in local dev. |
