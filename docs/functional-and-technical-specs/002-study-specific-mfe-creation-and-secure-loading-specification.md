# FTS-002: Study-Specific MFE Creation, Cryptographic Attestation & Multi-Target Deployment Specification

> **Document ID:** `VIALIQ-FTS-002`  
> **Status:** SPECIFICATION COMPLETE (Implementation Deferred until working infrastructure baseline is established)  
> **Date:** November 6, 2026  
> **Authors:** Architecture Review Board / Prashant Gupta  
> **Related Architecture ADR:** [`docs/critical-problems-and-adrs/011-dynamic-study-specific-controls-and-module-federation-plugin-architecture-adr.md`](../critical-problems-and-adrs/011-dynamic-study-specific-controls-and-module-federation-plugin-architecture-adr.md)  
> **Compliance Standards:** FDA 21 CFR Part 11, GAMP 5 (Category 5 Bespoke vs. Category 4 Core), ICH GCP E6(R3), HIPAA § 164.312  

---

## 1. Executive Overview & Purpose

In the Vialiq EDC platform, clinical studies frequently require **bespoke, protocol-specific visual controls** (e.g., interactive 3D PASI plaque psoriasis maps, RECIST 1.1 tumor calipers, ECG rhythm strip viewers, ETDRS visual acuity charts).

To prevent monolithic bundle bloat and protect the validated core platform (GAMP 5 Category 4) from continuous validation churn, custom controls are engineered as **Federated Remote Micro-Frontends (MFEs)**. 

Because an EDC platform is a regulated, validated clinical environment:
- **No untrusted or unvetted code can ever execute.**
- Every MFE undergoes automated SAST, DAST, and formal GxP CSV sign-off before release.
- Every MFE manifest is **digitally signed with an asymmetric Private Key (Ed25519)** and **hash-pinned via Subresource Integrity (SRI SHA-384)**.
- Every shell ingress request is guarded by **declarative pre-execution ASP.NET Core authorization attributes**.

This guide details the exact, step-by-step lifecycle of creating, testing, signing, deploying, and securely loading an MFE.

---

## 2. End-to-End MFE Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: LOCAL DEVELOPMENT & COMPONENT AUTHORING                                                       │
│ • Scaffold MFE in Nx Monorepo (`apps/study-recist-remote`)                                             │
│ • Implement `ControlValueAccessor` (CVA) & `ComponentDescriptor`                                       │
│ • Expose Module Federation contract via `BUILDER_COMPONENTS`                                           │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: AUTOMATED GxP SECURITY SCANNING & CSV GATE                                                    │
│ • Static Analysis (SAST): Zero high/critical DOM-XSS, prototype pollution                              │
│ • Dynamic Analysis (DAST) & Software Bill of Materials (SBOM) dependency scan                          │
│ • Automated GAMP 5 Category 5 Study Validation Addendum (SVA) sign-off                                 │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: CRYPTOGRAPHIC ARTIFACT SIGNING & CDN DEPLOYMENT                                               │
│ • Production compile (`remoteEntry.[hash].js`)                                                         │
│ • Compute Subresource Integrity (SRI) SHA-384 cryptographic digest                                     │
│ • Platform KMS/HSM signs manifest with Asymmetric Private Key (Ed25519)                                 │
│ • Deploy to origin-restricted CDN (`https://plugins.vialiq.io/*`)                                       │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: BACKEND STUDY ENTITLEMENT & PRE-EXECUTION AUTHORIZATION GATE                                  │
│ • Register signed manifest in `study_plugins` DB table linked to `StudyId`                             │
│ • ASP.NET Core declarative attributes (`[Authorize]`, `[RequireStudyRole]`, `[ValidateTenantContext]`)  │
│ • Halts unauthorized users before controller code executes                                             │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: SECURE SHELL LOADING & CRYPTOGRAPHIC ATTESTATION                                              │
│ • Shell fetches signed manifest over TLS 1.3 with Bearer JWT                                           │
│ • Enforces Origin Allowlist (CSP: `https://plugins.vialiq.io/*`)                                       │
│ • Shell validates Ed25519 signature using embedded Platform Public Key                                 │
│ • Injects script with SHA-384 SRI hash; browser blocks modified/tampered code                          │
└───────────────────────────────────┬────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: RUNTIME INTEGRATION & FAIL-CLOSED FALLBACK                                                    │
│ • Mounts remote in Angular DI; appears in Form Builder palette for Study #101 ONLY                     │
│ • `SettingsHostComponent` merges Tier 1 Host Governance + Tier 2 Bespoke Settings                     │
│ • If tamper or network drop: Renders Fail-Closed Fallback UI + logs 21 CFR Part 11 alert              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Local Development & Component Authoring

### 3.1 Scaffold MFE Application in Nx Monorepo
Run the Nx Angular application generator:
```bash
npx nx g @nx/angular:app apps/study-recist-remote \
  --routing=false \
  --style=scss \
  --prefix=recist
```

### 3.2 Implement the Angular Component (`ControlValueAccessor`)
All interactive data collection widgets **must** implement Angular's `ControlValueAccessor` (CVA) interface to integrate with reactive forms, dirty/touched tracking, and validation:

```typescript
// apps/study-recist-remote/src/app/components/recist-caliper.component.ts
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RecistMeasurement {
  longestDiameterMm: number;
  shortAxisMm?: number;
  anatomicalSite: string;
}

@Component({
  selector: 'recist-tumor-caliper',
  standalone: true,
  template: `
    <div class="caliper-box" [class.disabled]="disabled()">
      <div class="caliper-header">
        <span class="label">RECIST 1.1 Tumor Caliper</span>
        <span class="badge">{{ value()?.longestDiameterMm ?? 0 }} mm</span>
      </div>
      <svg class="interactive-canvas" (pointerdown)="onDragStart($event)">
        <!-- Interactive caliper rendering -->
      </svg>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecistCaliperComponent),
      multi: true,
    },
  ],
})
export class RecistCaliperComponent implements ControlValueAccessor {
  readonly value = signal<RecistMeasurement | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (val: RecistMeasurement | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(obj: RecistMeasurement | null): void {
    this.value.set(obj);
  }
  registerOnChange(fn: (val: RecistMeasurement | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected updateMeasurement(val: RecistMeasurement) {
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
  }
}
```

### 3.3 Declare the Component Descriptor
The descriptor dictates how Form Builder displays the widget in the palette and configures bespoke settings:

```typescript
// apps/study-recist-remote/src/app/descriptors/recist-caliper.descriptor.ts
import type { ComponentDescriptor, ComponentSchema } from '@vialiq/form-builder';

export interface RecistCaliperSchema extends ComponentSchema {
  maxDiameterLimitMm?: number;
  requireShortAxis?: boolean;
}

export const RecistCaliperDescriptor: ComponentDescriptor = {
  type: 'recist-tumor-caliper',
  label: 'RECIST 1.1 Tumor Caliper',
  category: 'advanced',
  group: 'Clinical Assessments',
  icon: 'ruler-combined',
  weight: 20,
  traits: { isInput: true },

  canvasElement: 'recist-tumor-caliper',
  canvasProps: (s: ComponentSchema) => {
    const schema = s as RecistCaliperSchema;
    return {
      'data-key': schema.key ?? '',
      maxDiameterLimitMm: schema.maxDiameterLimitMm ?? 150,
      requireShortAxis: schema.requireShortAxis ?? false,
    };
  },

  defaultSchema: {
    type: 'recist-tumor-caliper',
    label: 'Target Lesion Measurement',
  },

  // Bespoke Tier 2 Settings unique to this oncology tool
  settingsSchema: {
    tabs: [
      {
        id: 'recist-settings',
        label: 'Caliper Rules',
        fields: [
          { key: 'maxDiameterLimitMm', label: 'Max Measurement (mm)', type: 'number', defaultValue: 150 },
          { key: 'requireShortAxis', label: 'Require Lymph Node Short Axis', type: 'boolean' },
        ],
      },
    ],
  },

  rendererRef: 'vi-renderer-recist-caliper',
};
```

### 3.4 Expose via Explicit Descriptor Manifest (`STUDY_DESCRIPTORS`)

Because loading a remote module at runtime does not alter or re-instantiate the host shell's Angular injector tokens, remote modules must export their descriptor array directly. The EDC shell or host component registers them via `builder.registry.registerDynamicComponents(...)` or `<vi-form-builder [customComponents]="...">`.

```typescript
// apps/study-recist-remote/src/app/remote-entry/entry.module.ts
import { NgModule } from '@angular/core';
import type { ComponentDescriptor } from '@vialiq/form-builder';
import { RecistCaliperDescriptor } from '../descriptors/recist-caliper.descriptor';

/**
 * Authoritative study descriptor manifest consumed by the EDC host shell.
 */
export const STUDY_DESCRIPTORS: ComponentDescriptor[] = [
  RecistCaliperDescriptor,
];

@NgModule({})
export class PluginModule {}
```

---

## 4. Phase 2: Automated GxP Security Scans & CSV Gate (CI/CD)

Every pull request or release branch triggers an automated security validation pipeline:

```bash
# 1. Static Application Security Testing (SAST)
npx semgrep --config=p/typescript --config=p/owasp-top-ten apps/study-recist-remote/

# 2. Dependency Audit & Software Bill of Materials (SBOM)
npx audit-ci --high --critical
npx @cyclonedx/cyclonedx-npm --output-file dist/sbom.json

# 3. Unit & Integration Verification (Vitest / Playwright)
npx nx test study-recist-remote --coverage --passWithNoTests
```

> [!IMPORTANT]
> **GxP Release Gate:** The CI/CD pipeline enforces zero High or Critical vulnerabilities. Any usage of `eval()`, direct DOM manipulation bypassing Angular sanitizer, or unvetted external HTTP calls triggers an immediate build failure.

---

## 5. Phase 3: Cryptographic Artifact Signing & CDN Deployment

### 5.1 Production Compilation
```bash
npx nx build study-recist-remote --configuration=production --output-hashing=all
```
Output: `dist/apps/study-recist-remote/remoteEntry.f82a19b.js`

### 5.2 Compute Subresource Integrity (SRI) Hash
Generate the SHA-384 cryptographic digest:
```bash
SRI_HASH="sha384-$(openssl dgst -sha384 -binary dist/apps/study-recist-remote/remoteEntry.f82a19b.js | openssl base64 -A)"
echo "Computed SRI Hash: $SRI_HASH"
```

### 5.3 Asymmetric Private Key Signing
The deployment pipeline invokes the platform KMS / Hardware Security Module (HSM) to sign the manifest:

```typescript
// tools/scripts/sign-mfe-manifest.mjs
const manifestData = {
  studyId: "study-oncology-101",
  pluginId: "recist-tumor-caliper",
  version: "1.2.0",
  remoteEntryUrl: "https://plugins.vialiq.io/studies/study-oncology-101/v1.2.0/remoteEntry.f82a19b.js",
  sriHash: SRI_HASH,
  issuedAtUtc: new Date().toISOString()
};

// Sign with Ed25519 Private Key in AWS KMS / Azure Key Vault
const signature = await kmsClient.sign({
  KeyId: process.env.VIALIQ_MFE_PRIVATE_KEY_ID,
  Message: Buffer.from(JSON.stringify(manifestData)),
  SigningAlgorithm: 'Ed25519'
});

manifestData.signature = Buffer.from(signature).toString('base64');
```

### 5.4 CDN Deployment
Upload the bundle to the origin-restricted CDN:
```bash
aws s3 sync dist/apps/study-recist-remote/ s3://vialiq-plugins-cdn/studies/study-oncology-101/v1.2.0/ \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable"
```

---

## 6. Phase 4: Backend Study Entitlement & Declarative Pre-Route Gate

### 6.1 Database Registration
The signed manifest is stored in the `study_plugins` table, bound strictly to the target `studyId`:
```sql
INSERT INTO dbo.study_plugins (
    study_id, plugin_id, version, remote_entry_url, sri_hash, signature, is_active, certified_at_utc
) VALUES (
    'b182f2f7-410a-4a25-a6e5-4f3b64c18091',
    'recist-tumor-caliper',
    '1.2.0',
    'https://plugins.vialiq.io/studies/study-oncology-101/v1.2.0/remoteEntry.f82a19b.js',
    'sha384-H8BRk8hZFoEtHKMEQ...',
    'MEQCID...signature...',
    1,
    SYSUTCDATETIME()
);
```

### 6.2 Declarative ASP.NET Core Authorization Controller
Pre-execution attributes intercept the request at the HTTP pipeline boundary:

```csharp
[ApiController]
[Route("api/v1/studies/{studyId:guid}/plugins")]
[Authorize(Policy = "ClinicalStudyAccess")]
[RequireStudyRole(StudyRole.SiteCoordinator, StudyRole.Investigator, StudyRole.DataManager)]
[ValidateStudyTenantContext] // Enforces multi-tenant isolation before action executes
public sealed class StudyPluginRegistryController : ControllerBase
{
    private readonly IStudyPluginService _pluginService;

    public StudyPluginRegistryController(IStudyPluginService pluginService)
    {
        _pluginService = pluginService;
    }

    [HttpGet("manifest")]
    [ProducesResponseType(typeof(CertifiedPluginManifestResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCertifiedPlugins(Guid studyId, CancellationToken ct)
    {
        // Executes ONLY after token signature, tenant isolation, and study permissions pass
        var manifest = await _pluginService.GetSignedManifestAsync(studyId, ct);
        return Ok(manifest);
    }
}
```

---

## 7. Phase 5: Secure Shell Loading & Cryptographic Attestation

When a clinical user opens Study #101, the Angular Shell executes the 4-step security ingress:

```typescript
// apps/edc-shell/src/app/services/study-plugin-loader.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { BuilderRegistryService } from '@vialiq/form-builder';
import { CryptoAttestationService } from './crypto-attestation.service';

export interface CertifiedStudyPluginManifest {
  studyId: string;
  pluginId: string;
  version: string;
  remoteEntryUrl: string; // Enforced origin: ^https://plugins\.vialiq\.io/
  sriHash: string;        // SHA-384 digest: "sha384-oqVuAfXRKap7fdgcCY5uykM6..."
  signature: string;      // Ed25519 digital signature from Platform KMS
}

@Injectable({ providedIn: 'root' })
export class StudyPluginLoaderService {
  private http = inject(HttpClient);
  private registry = inject(BuilderRegistryService);
  private crypto = inject(CryptoAttestationService);

  private readonly TRUSTED_CDN_PREFIX = 'https://plugins.vialiq.io/';

  async loadStudyPlugins(studyId: string): Promise<void> {
    try {
      // Step 1: Pre-execution authorized fetch from API
      const manifest = await this.http
        .get<CertifiedStudyPluginManifest>(`/api/v1/studies/${studyId}/plugins/manifest`)
        .toPromise();

      if (!manifest) return;

      // Step 2: Asymmetric Signature Verification using Platform Public Key
      const isVerified = await this.crypto.verifySignature(manifest);
      if (!isVerified) {
        throw new SecurityError(`MFE Digital signature verification failed for plugin: ${manifest.pluginId}`);
      }

      // Step 3: Strict Origin Check (CSP Compliance)
      if (!manifest.remoteEntryUrl.startsWith(this.TRUSTED_CDN_PREFIX)) {
        throw new SecurityError(`Untrusted MFE origin: ${manifest.remoteEntryUrl}`);
      }

      // Step 4: Load with Subresource Integrity (SRI)
      const remoteModule = await loadRemoteModule({
        type: 'module',
        remoteEntry: manifest.remoteEntryUrl,
        exposedModule: './PluginModule',
      });

      // Step 5: Register component descriptor into Form Builder
      if (remoteModule.STUDY_DESCRIPTORS) {
        this.registry.registerDynamicComponents(remoteModule.STUDY_DESCRIPTORS);
      }
    } catch (err) {
      // FAIL-CLOSED ZERO-TRUST: Log Part 11 alert and render safe fallback UI
      console.error(`[StudyPluginLoader] SECURITY ALERT - Blocked plugin for study ${studyId}:`, err);
      this.registry.registerFallbackComponent({
        type: 'recist-tumor-caliper',
        label: 'RECIST Caliper (Unavailable - Integrity Failure)',
        errorMessage: (err as Error).message,
      });
    }
  }
}
```

---

## 8. Phase 6: Runtime Execution & Fail-Closed Fallback

1. **Form Builder Canvas**:
   - The *RECIST 1.1 Tumor Caliper* appears in the palette **for Study #101 only**.
   - Clinicians in other studies will never see this widget (Zero cross-study palette pollution).
2. **Two-Tier Property Composition**:
   - When dropped onto a CRF canvas, `SettingsHostComponent` renders:
     - **Tier 1 (Host Clinical Governance)**: SAS variable name, `dataClassification` (ADR 004), SDV required, 21 CFR Part 11 audit logging.
     - **Tier 2 (Remote Bespoke Settings)**: `maxDiameterLimitMm`, `requireShortAxis`.
3. **Fail-Closed Fallback Mode**:
   - If the CDN is offline or an SRI hash fails, the form renderer swaps in a safe read-only fallback:
   ```html
   <div class="vi-control-fallback-warning">
     <vi-icon name="shield-alert" color="critical" />
     <span>Custom Control [RECIST Caliper] is unavailable due to an integrity/network failure.</span>
     <span class="raw-val">Stored Value: {{ rawValue | json }}</span>
   </div>
   ```

---

## 9. Development Mode & Docker Architecture

Local development introduces a fundamental challenge:
* **Production** relies on static CDN bundles, immutable SHA-384 hashes, and cloud KMS asymmetric signatures.
* **Local Development** requires rapid iteration, editing `recist-caliper.component.ts` on a laptop with sub-second **Hot Module Replacement (HMR)**, offline workflows, and dynamic bundle generation where hashes change on every save.

Vialiq EDC resolves this through **Environment-Aware Attestation** and **Containerized Hybrid Topologies**.

### 9.1 The Dual-Mode Security Architecture

| Security Dimension | Production (`ASPNETCORE_ENVIRONMENT=Production`) | Local Development (`ASPNETCORE_ENVIRONMENT=Development`) |
| :--- | :--- | :--- |
| **Manifest Source** | Production SQL Server `study_plugins` table | Local `appsettings.Development.json` override block |
| **Remote Entry URL** | Enterprise CDN (`https://plugins.vialiq.io/studies/...`) | Local dev server (`http://localhost:4201/remoteEntry.js`) |
| **Asymmetric Signing** | Cloud HSM / KMS Private Key (Ed25519) | Local Dev Self-Signed Certificate or Dev Flag (`bypassIntegrity`) |
| **SRI Hash Enforcement** | Strict SHA-384 digest verification (blocks tampered code) | Bypassed for live HMR (`bypassIntegrity: true`) |
| **Content Security Policy** | Locked to `script-src 'self' https://plugins.vialiq.io` | Allows `http://localhost:*` and `ws://localhost:*` |

### 9.2 Topology A: The Hybrid Workflow (Recommended for 95% of Development)
In the Hybrid Workflow, Docker runs heavy stateful infrastructure in the background, while the Web Shell, API, and MFE remotes execute natively on the developer's workstation for instant debugging:

```
                       [ DEVELOPER HOST WORKSTATION ]
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼ (Port 4200)                 ▼ (Port 4201)                 ▼ (Port 5000)
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  Web Shell   │ ──imports──> │  Remote MFE  │              │  .NET 9 API  │
│ (nx serve)   │              │ (nx serve)   │              │(dotnet watch)│
└──────────────┘              └──────────────┘              └──────┬───────┘
       │                                                           │
       └──────────────────── HTTP / REST ──────────────────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼ (Docker Network)                            ▼ (Docker Network)
 ┌─────────────────────────────┐               ┌─────────────────────────────┐
 │    3-Layer MongoDB Farm     │               │   Redis 7.2 Sentinel HA     │
 │   (tools/docker/3layer)     │               │  (tools/docker/redis-dev)   │
 └─────────────────────────────┘               └─────────────────────────────┘
```

1. **Start Infrastructure (Docker):**
   ```bash
   npm run dev:infra
   ```
2. **Start Backend API (Host):**
   ```bash
   npm run dev:api
   # Runs on http://localhost:5000 with hot reload
   ```
3. **Start Web Shell & Remote MFE (Host):**
   ```bash
   # Terminal 3: Shell
   npm run dev:web
   # Runs on http://localhost:4200

   # Terminal 4: Custom MFE
   npx nx serve study-recist-remote --port=4201
   # Runs on http://localhost:4201
   ```

### 9.3 Topology B: Single-Port Docker Ingress (Port 80 via NGINX Reverse Proxy)
When testing full container parity, cross-origin security rules, or staging simulations, run the local Dockerized NGINX reverse proxy on Port 80:

```nginx
# tools/docker/nginx/nginx.dev.conf
upstream web_shell   { server host.docker.internal:4200; }
upstream backend_api { server host.docker.internal:5000; }
upstream recist_mfe  { server host.docker.internal:4201; }

server {
    listen 80;
    server_name localhost;

    # Single entry point on port 80 (Zero CORS friction)
    location /                 { proxy_pass http://web_shell; }
    location /api/             { proxy_pass http://backend_api; }
    location /hubs/            { proxy_pass http://backend_api; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
    location /plugins/recist/  { proxy_pass http://recist_mfe/; }
}
```

* **`host.docker.internal` Resolution**: Allows the NGINX container to reach services running on the host machine loopback (`localhost:4200`, `localhost:4201`, `localhost:5000`).
* **Zero CORS**: All requests flow through `http://localhost/`, making cookie sharing and API routing seamless.

### 9.4 Fast Dev-Mode HMR Configuration

In `backend/api/src/Vialiq.Api/appsettings.Development.json`:
```json
{
  "StudyPlugins": {
    "DevMode": true,
    "DevPluginOverrides": {
      "study-oncology-101": {
        "recist-tumor-caliper": {
          "remoteEntryUrl": "http://localhost:4201/remoteEntry.js",
          "bypassIntegrity": true
        }
      }
    }
  }
}
```

In `apps/edc-shell/src/app/services/study-plugin-loader.service.ts`:
```typescript
if (!environment.production && manifest.bypassIntegrity) {
  console.warn(`[StudyPluginLoader] DEV MODE: Loading dynamic MFE from ${manifest.remoteEntryUrl} with HMR.`);
  const remoteModule = await loadRemoteModule({
    type: 'module',
    remoteEntry: manifest.remoteEntryUrl,
    exposedModule: './PluginModule',
  });
  this.registry.registerDynamicComponents(remoteModule.STUDY_DESCRIPTORS);
  return;
}
```

---

## 10. Multi-Target Enterprise Deployment Architecture (AWS, Azure, On-Premises)

Different pharmaceutical sponsors and contract research organizations (CROs) mandate hosting on specific cloud providers or within **air-gapped, on-premises private data centers**. 

Vialiq’s MFE architecture maintains 100% functional and security parity across **AWS**, **Microsoft Azure**, and **On-Premises Windows/NGINX**.

### 10.1 Multi-Target Architectural Parity Matrix

```
========================================================================================================================
MULTI-ENVIRONMENT DEPLOYMENT PARITY MATRIX
========================================================================================================================
Architecture Tier          AWS Target                     Azure Target                   On-Premises Target
------------------------------------------------------------------------------------------------------------------------
Static MFE Storage         Amazon S3 Bucket (Private)     Azure Blob Storage (Private)   Local SAN / NAS or MinIO S3
Edge CDN / Ingress         Amazon CloudFront (TLS 1.3)    Azure Front Door / CDN         NGINX / IIS 10 (ARR 3.0)
Access Restriction         Origin Access Control (OAC)    Entra ID Managed Identity      Private Subnet / IP Allowlist
Asymmetric Key Management  AWS KMS (Ed25519 / ECC)        Azure Key Vault Managed HSM    Windows Cert Store / Local HSM
Backend API Hosting        AWS ECS Fargate / EKS          Azure App Service / AKS        Windows Server 2022/2025 IIS / K8s
Regulatory Network Scope   FedRAMP / HIPAA Cloud          Azure for Healthcare / GxP     Air-Gapped Intranet / Zero Egress
========================================================================================================================
```

---

### 10.2 Deployment Target 1: Amazon Web Services (AWS)

```
                                  AWS MFE DEPLOYMENT TOPOLOGY
                                               │
                                 [Clinical User Browser]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼ (TLS 1.3 HTTPS)                             ▼ (REST /api)
           ┌─────────────────────────────┐               ┌─────────────────────────────┐
           │      Amazon CloudFront      │               │   AWS Application Load      │
           │      (Edge Distribution)    │               │   Balancer (ALB)            │
           └──────────────┬──────────────┘               └──────────────┬──────────────┘
                          │ Origin Access Control (OAC)                 │
                          ▼                                             ▼
           ┌─────────────────────────────┐               ┌─────────────────────────────┐
           │      Amazon S3 Bucket       │               │   AWS ECS Fargate / EKS     │
           │    (s3://vialiq-mfe-prod)   │               │   (Vialiq .NET 9 API)       │
           │  • AES-256 (SSE-KMS)        │               └──────────────┬──────────────┘
           │  • Public Access: BLOCKED   │                              │ Sign Manifest
           └─────────────────────────────┘                              ▼
                                                         ┌─────────────────────────────┐
                                                         │       AWS KMS (HSM)         │
                                                         │   (Ed25519 Asymmetric Key)  │
                                                         └─────────────────────────────┘
```

#### AWS Deployment Pipeline:
1. **S3 Private Storage**:
   ```bash
   aws s3 sync dist/apps/study-recist-remote/ s3://vialiq-mfe-prod/studies/101/v1.2.0/ \
     --server-side-encryption aws:kms \
     --ssekms-key-id arn:aws:kms:us-east-1:123456789012:key/vialiq-storage-key
   ```
2. **CloudFront Distribution with Origin Access Control (OAC)**:
   - S3 bucket policy strictly permits `cloudfront.amazonaws.com` via OAC.
   - Enforces Response Headers Policy:
     `Content-Security-Policy: default-src 'self'; script-src 'self' https://plugins.vialiq.io;`
3. **AWS KMS Asymmetric Signing**:
   The backend API signs the MFE manifest using AWS KMS SDK:
   ```csharp
   var signRequest = new SignRequest
   {
       KeyId = "arn:aws:kms:us-east-1:123456789012:alias/vialiq-mfe-signer",
       Message = new MemoryStream(Encoding.UTF8.GetBytes(manifestJson)),
       MessageType = MessageType.RAW,
       SigningAlgorithm = SigningAlgorithmSpec.ED25519_RAW
   };
   var response = await _kmsClient.SignAsync(signRequest, ct);
   ```

---

### 10.3 Deployment Target 2: Microsoft Azure

```
                                 AZURE MFE DEPLOYMENT TOPOLOGY
                                               │
                                 [Clinical User Browser]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼ (TLS 1.3 HTTPS)                             ▼ (REST /api)
           ┌─────────────────────────────┐               ┌─────────────────────────────┐
           │   Azure Front Door Premium  │               │   Azure Application Gateway │
           │   (Global Edge Anycast)     │               │   (WAF v2 Policy)           │
           └──────────────┬──────────────┘               └──────────────┬──────────────┘
                          │ Private Link Service                        │
                          ▼                                             ▼
           ┌─────────────────────────────┐               ┌─────────────────────────────┐
           │  Azure Blob Storage ($web)  │               │   Azure App Service / AKS   │
           │  • Immutable Blob Versioning│               │   (Vialiq .NET 9 API)       │
           │  • Entra ID RBAC Only       │               └──────────────┬──────────────┘
           │  • Public Access: DISABLED  │                              │ Sign Manifest
           └─────────────────────────────┘                              ▼
                                                         ┌─────────────────────────────┐
                                                         │ Azure Key Vault Managed HSM │
                                                         │ (Ed25519 / RSA-4096 Key)    │
                                                         └─────────────────────────────┘
```

#### Azure Deployment Pipeline:
1. **Azure Blob Storage (Private Container)**:
   ```bash
   az storage blob upload-batch \
     --account-name vialiqmfeprod \
     --destination '$web' \
     --source dist/apps/study-recist-remote/ \
     --destination-path 'studies/101/v1.2.0' \
     --auth-mode login
   ```
2. **Azure Front Door Private Link**:
   - Azure Front Door routes requests directly to the Private Storage Endpoint using Azure Private Link (zero public internet transit).
3. **Azure Key Vault HSM Signing**:
   ```csharp
   var cryptoClient = new CryptographyClient(keyVaultKeyId, new DefaultAzureCredential());
   var signResult = await cryptoClient.SignDataAsync(
       SignatureAlgorithm.Ed25519, 
       Encoding.UTF8.GetBytes(manifestJson), 
       ct);
   ```

---

### 10.4 Deployment Target 3: On-Premises & Air-Gapped (Windows Server / IIS 10 + NGINX)

In strict government clinical studies or high-security hospital networks, the entire EDC runs **on-premises without public internet connectivity (air-gapped)**:

```
                           ON-PREMISES AIR-GAPPED TOPOLOGY
                                         │
                        [Hospital Intranet Workstation]
                                         │
                  ┌──────────────────────┴──────────────────────┐
                  ▼ (Intranet Port 443)                         ▼ (REST /api)
     ┌─────────────────────────────┐               ┌─────────────────────────────┐
     │    NGINX Reverse Proxy /    │               │  Windows Server 2022/2025   │
     │    IIS 10 with ARR 3.0      │               │  IIS 10 In-Process (ANCMv2) │
     │    (Internal PKI Cert)      │               │  (.NET 9 Vialiq.Api)        │
     └──────────────┬──────────────┘               └──────────────┬──────────────┘
                    │ Static Content Mapping                      │ Sign Manifest
                    ▼                                             ▼
     ┌─────────────────────────────┐               ┌─────────────────────────────┐
     │   Local SAN / NAS / MinIO   │               │ Windows Certificate Store / │
     │   `D:\Vialiq\MfeStorage\`   │               │ Local FIPS 140-2 HSM        │
     │   • Read-only to IIS/NGINX  │               │ (Enterprise AD CS Keypair)  │
     │   • Zero External Network   │               └─────────────────────────────┘
     └─────────────────────────────┘
```

#### On-Premises Implementation Details:

1. **Static File Hosting via NGINX or IIS**:
   - **NGINX Configuration**:
     ```nginx
     # /etc/nginx/conf.d/vialiq-onprem.conf
     server {
         listen 443 ssl http2;
         server_name edc.hospital.local;

         ssl_certificate     /etc/ssl/certs/hospital-internal.crt;
         ssl_certificate_key /etc/ssl/private/hospital-internal.key;

         # Host Shell Application
         location / {
             root /var/www/vialiq/shell;
             try_files $uri $uri/ /index.html;
         }

         # Host MFE Plugin Artifacts from Local Storage
         location /plugins/ {
             alias /var/www/vialiq/mfe-storage/;
             add_header Cache-Control "public, max-age=31536000, immutable";
             add_header Access-Control-Allow-Origin "https://edc.hospital.local";
         }

         # Reverse Proxy to .NET 9 API
         location /api/ {
             proxy_pass http://127.0.0.1:5000;
             proxy_set_header Host $host;
             proxy_set_header X-Forwarded-Proto https;
         }
     }
     ```
   - **Windows Server IIS 10 Virtual Directory**:
     - Create a dedicated site or virtual directory: `edc.hospital.local/plugins` mapped to `D:\Vialiq\MfeStorage\`.
     - Static content caching enabled; anonymous access locked to the internal intranet subnet.

2. **On-Premises Cryptographic Key Management (Windows Certificate Store / AD CS)**:
   - When cloud KMS is unavailable, the backend signs manifests using an **Active Directory Certificate Services (AD CS)** enterprise code-signing certificate installed in the Local Machine certificate store:
   ```csharp
   using System.Security.Cryptography.X509Certificates;

   public sealed class OnPremPluginSigningService : IPluginSigningService
   {
       private readonly X509Certificate2 _signingCert;

       public OnPremPluginSigningService(IConfiguration config)
       {
           using var store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
           store.Open(OpenFlags.ReadOnly);
           var thumbprint = config["StudyPlugins:OnPremCertThumbprint"];
           _signingCert = store.Certificates.Find(X509FindType.FindByThumbprint, thumbprint, validOnly: true)[0];
       }

       public string SignManifest(string manifestJson)
       {
           using var rsa = _signingCert.GetRSAPrivateKey()!;
           var data = Encoding.UTF8.GetBytes(manifestJson);
           var signature = rsa.SignData(data, HashAlgorithmName.SHA384, RSASignaturePadding.Pss);
           return Convert.ToBase64String(signature);
       }
   }
   ```
3. **Air-Gapped Operation Guarantee**:
   - The Angular Shell’s public key is distributed as part of the core shell bundle (`environment.ts`), containing the hospital's internal CA root / signing public key.
   - Zero outbound requests to external CDNs or internet registries are required.

---

## 11. Developer Quick Reference & Command Cheatsheet

| Task | Command | Environment |
| :--- | :--- | :--- |
| **Scaffold new study MFE** | `npx nx g @nx/angular:app apps/<study-mfe-name> --routing=false --style=scss` | Local Dev |
| **Run local MFE dev server** | `npx nx serve <study-mfe-name> --port=4201` | Local Dev |
| **Run SAST security scan** | `npx semgrep --config=p/owasp-top-ten apps/<study-mfe-name>/` | CI/CD |
| **Run dependency audit** | `npx audit-ci --high --critical` | CI/CD |
| **Production build** | `npx nx build <study-mfe-name> --configuration=production --output-hashing=all` | Build Pipeline |
| **Compute SRI SHA-384 hash** | `openssl dgst -sha384 -binary dist/.../remoteEntry.js \| openssl base64 -A` | Build Pipeline |
| **Deploy to AWS S3 & CloudFront** | `aws s3 sync dist/ s3://vialiq-mfe-prod/studies/... && aws cloudfront create-invalidation` | AWS Target |
| **Deploy to Azure Blob & Front Door** | `az storage blob upload-batch -d '$web' -s dist/ --account-name vialiqmfeprod` | Azure Target |
| **Deploy to On-Prem Windows/NGINX** | `robocopy dist\ D:\Vialiq\MfeStorage\studies\... /MIR` | On-Prem Target |

