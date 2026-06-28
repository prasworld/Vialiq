# Form Builder — Offline / Disconnected Mode

> **Status:** Technical Reference — Architecture Pending  
> **Date:** 2026-05-24  
> **Phase:** Phase 4 (deferred — see [roadmap](./form-builder-roadmap.md) §8 P4.3)  
> Related docs: [overview](./form-builder-overview.md) · [renderer](./form-builder-renderer.md) · [roadmap](./form-builder-roadmap.md)

---

## 1. Problem Context

Clinical trial EDC sites often operate under poor or intermittent network conditions:

- Sites in developing countries (rural hospitals, research clinics)
- Hospital networks with aggressive firewalls that drop long-lived connections
- Field-study forms completed on tablets taken outside the office / Wi-Fi range
- Train / plane use by traveling investigators

The current renderer (`FormRendererComponent`) assumes a live HTTP connection for:

1. **Codelist prefetch** — `CODELIST_SERVICE.prefetch()` on init; blocking if the network is unavailable.
2. **Form submission** — `FORM_DATA_SERVICE.onSubmit()` calls the server synchronously.
3. **Pre-population** — `FORM_DATA_SERVICE.load()` fetches existing data from server.

Offline mode removes all three blocking dependencies, allowing the renderer to function identically whether connected or not, and syncing with the server when connectivity is restored.

---

## 2. Goals and Non-Goals

### Goals

- Allow form data to be **captured offline** and submitted automatically when connectivity is restored.
- Allow a previously loaded form to be **reopened offline** (schema and codelists cached).
- Provide a **clear connectivity status indicator** to the user.
- Ensure **no data loss** if the browser is closed mid-entry while offline.
- Remain transparent to the renderer: the renderer calls the same `FORM_DATA_SERVICE` interface regardless of online/offline state.

### Non-Goals (Phase 4 scope only)

- Real-time multi-user conflict resolution (CRDT / OT). See §7.
- Full PWA with add-to-home-screen install flow.
- Push notifications for query responses or monitor comments.
- Offline _builder_ (schema editing). Only the renderer needs offline support.

---

## 3. Browser Storage Options

| Storage | Max Size | Async | Service Worker accessible | Notes |
|---|---|---|---|---|
| **IndexedDB** | ~60% disk (Chrome) / ~50% disk (FF) / ~1 GB (Safari) | Yes | Yes | **Primary choice** for form data and codelists |
| Cache API | Same quota as IndexedDB | Yes | Yes | Used for caching static assets (HTML, JS, CSS, schema JSON blobs) |
| Origin Private File System (OPFS) | Same quota | Yes | Yes (sync in worker) | Best for large binary blobs — not needed for form data |
| localStorage | ~5 MB | No (blocks main thread) | No | **Avoid** — too small, synchronous, no service worker access |
| SessionStorage | ~5 MB | No | No | **Avoid** — tab-scoped, lost on close |
| Cookies | ~4 KB | No | No | **Avoid** — sent with every request, wrong semantics |

**Decision:** Use **IndexedDB** for form data, draft submissions, and codelists. Use **Cache API** for schema JSON files, static assets, and codelist responses. Use `idb` (Jake Archibald's ~1.4 KB promise wrapper) to avoid raw IndexedDB callback verbosity.

### 3.1 Storage Quota Management

```typescript
// Check available storage before starting a session
const quota = await navigator.storage.estimate();
const percentageUsed = (quota.usage! / quota.quota!) * 100;
if (percentageUsed > 80) {
  // warn user — eviction risk
}

// Request persistent storage to prevent browser eviction
if (navigator.storage && navigator.storage.persist) {
  const granted = await navigator.storage.persist();
  // granted = true means data won't be evicted without user action
}
```

> **Safari caveat:** Safari evicts IndexedDB data after 7 days of inactivity in browser mode. Installed PWAs (add-to-home-screen) are exempt. Request persistent storage immediately on app init.

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Host Angular App                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FormRendererComponent                                │  │
│  │  (unchanged interface — FORM_DATA_SERVICE token)      │  │
│  └──────────────┬────────────────────────────────────────┘  │
│                 │ calls same interface                       │
│  ┌──────────────▼────────────────────────────────────────┐  │
│  │  OfflineFormDataService  (implements FormDataService) │  │
│  │  - load()   → IndexedDB first, then network          │  │
│  │  - onSubmit() → write to IndexedDB outbox, then sync │  │
│  └──────────────┬────────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼────────────────────────────────────────┐  │
│  │  OfflineCodelistService (implements CodelistService)  │  │
│  │  - prefetch() → Cache API first, then network        │  │
│  └──────────────┬────────────────────────────────────────┘  │
│                 │                                           │
└─────────────────┼───────────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │ Service Worker  │   ← sw.ts (Workbox or custom)
         │ - Cache assets  │
         │ - Background    │
         │   Sync trigger  │
         └────────┬────────┘
                  │ Background Sync API
                  │ (fires when connectivity restored)
         ┌────────▼────────┐
         │  Server API     │
         └─────────────────┘
```

The renderer is **completely unaware** of offline state. The `OfflineFormDataService` and `OfflineCodelistService` are provided at the host application level via Angular DI — they are transparent adapters over the online services.

---

## 5. IndexedDB Schema

Three object stores are required:

### 5.1 `form_drafts` — In-Progress Form Data

```typescript
interface FormDraft {
  id: string;              // `{formId}:{subjectId}:{visitId}` composite key
  formId: string;
  subjectId?: string;
  visitId?: string;
  schemaVersion: string;
  data: Record<string, unknown>;   // current field values
  savedAt: number;         // Unix ms timestamp
  status: 'draft' | 'ready_to_sync';
}
```

Object store: `{ keyPath: 'id' }` — one draft per form+subject+visit context.

### 5.2 `submission_outbox` — Queued Submissions

```typescript
interface OutboxEntry {
  id: string;              // auto-increment or UUID
  formId: string;
  subjectId?: string;
  visitId?: string;
  schemaVersion: string;
  payload: unknown;        // the final submission payload
  queuedAt: number;        // Unix ms timestamp
  attempts: number;        // retry count
  lastAttemptAt?: number;
  lastError?: string;
}
```

Object store: `{ keyPath: 'id', autoIncrement: true }` — supports multiple queued submissions.

### 5.3 `codelist_cache` — Offline Codelist Store

```typescript
interface CachedCodelist {
  name: string;            // keyPath — codelist name
  items: CodelistItem[];
  cachedAt: number;        // Unix ms — used to decide staleness
  etag?: string;           // HTTP ETag for conditional requests
}
```

Object store: `{ keyPath: 'name' }` — one entry per codelist.

---

## 6. Data Flow

### 6.1 Online → App Load (Warm Cache)

```
1. Service Worker intercepts GET /assets/schemas/{formId}.json
   → Cache API: network-first, cache on success
2. OfflineCodelistService.prefetch(names)
   → For each name: check codelist_cache (IndexedDB)
   → If cached and fresh (< maxAgeMs): return cached
   → If stale or missing: fetch from network, update cache
3. OfflineFormDataService.load(context)
   → Check form_drafts store for in-progress draft
   → If found: return draft (user can choose to discard or continue)
   → If not found: fetch from server (edit flow)
```

### 6.2 Offline → App Load (Cold Cache)

```
1. Service Worker returns cached schema from Cache API
2. OfflineCodelistService.prefetch(names)
   → Network fetch fails → falls back to codelist_cache
   → Missing codelists cause a degraded-mode warning (not a crash)
3. OfflineFormDataService.load(context)
   → Network fetch fails → falls back to form_drafts
```

### 6.3 Field Value Changed (always)

```
FormRendererComponent.fieldChange
  → OfflineFormDataService.saveDraft(context, currentData)
    → IndexedDB: upsert form_drafts[id]
    → No network call — purely local
```

> This runs on every field change. At 400 fields × 1 KB average = ~400 KB per form — well within IndexedDB limits.

### 6.4 Submit Attempt

```
FormRendererComponent calls FORM_DATA_SERVICE.onSubmit(payload)
  → OfflineFormDataService.onSubmit(payload)

  [IF online]
    → POST to server directly
    → On success: delete form_drafts[id] + any outbox entry
    → Return { success: true }

  [IF offline]
    → Write to submission_outbox
    → Register Background Sync tag: 'form-submission-sync'
    → Delete form_drafts[id] (draft is now in outbox)
    → Return { success: true, queued: true }
      ↑ Renderer shows "Saved — will submit when online" message
```

### 6.5 Background Sync (Connectivity Restored)

```
service-worker.ts:
  self.addEventListener('sync', async (event) => {
    if (event.tag === 'form-submission-sync') {
      event.waitUntil(flushOutbox());
    }
  });

async function flushOutbox() {
  const db = await openDB();
  const pending = await db.getAll('submission_outbox');

  for (const entry of pending) {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(entry.payload),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        await db.delete('submission_outbox', entry.id);
      } else {
        // increment attempt count, log server error
        await db.put('submission_outbox', {
          ...entry,
          attempts: entry.attempts + 1,
          lastAttemptAt: Date.now(),
          lastError: `HTTP ${response.status}`
        });
      }
    } catch (networkError) {
      // Still offline — leave in outbox, SW will retry
    }
  }
}
```

---

## 7. Conflict Resolution Strategy

A conflict occurs when: the user edited a form offline → came back online → the server has a newer version of the same record (because another user or system updated it while the device was offline).

### 7.1 Strategy Options

| Strategy | Description | Suitable for |
|---|---|---|
| **Last Write Wins (LWW)** | Highest `savedAt` timestamp wins. Simple. | Low-collision environments, single-user forms |
| **Server Always Wins** | Server version always takes precedence; local changes are discarded. | Read-only resync flows |
| **Client Always Wins** | Client version submitted regardless of server state. | High-trust single-user isolated forms |
| **Manual Merge UI** | Show both versions to the user; user resolves field-by-field. | Regulated / audited data |
| **CRDT (Conflict-free Replicated Data Types)** | Data structures that merge automatically without conflicts. | Real-time collaborative editing |
| **Operational Transform (OT)** | Transform operations so they commute regardless of order. | Real-time collaborative text (Google Docs model) |

### 7.2 Recommended Strategy for this Platform

**Phase 4 default: Last Write Wins (LWW) with server conflict detection.**

Rationale:
- Clinical forms are single-user by definition (one site user enters one subject's data)
- True concurrent edits of the same record by two different users are extremely rare
- CRDT/OT adds significant complexity for negligible gain in this domain
- The server should detect conflicts via `If-Match: <etag>` / `If-Unmodified-Since` headers and return `HTTP 409 Conflict`

```typescript
// In OfflineFormDataService.onSubmit():
const response = await fetch('/api/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'If-Match': entry.etag ?? '*',  // optimistic concurrency
  },
  body: JSON.stringify(entry.payload)
});

if (response.status === 409) {
  // Conflict — surface to the user
  // Options: discard local, overwrite server, or present diff UI
  return { success: false, conflict: true, serverVersion: await response.json() };
}
```

**Phase 4+ optional: Manual merge UI** — if conflict is detected, show a side-by-side diff of field values and let the user choose per-field. This is the safest model for regulated data.

### 7.3 Conflict Detection on the Server

The server must support optimistic locking:

- Return `ETag` header on all GET responses (e.g. hash of record version or `updatedAt` timestamp)
- Validate `If-Match` header on POST/PUT — return `409 Conflict` if stale
- Return the current server version in the 409 response body for client-side merge

---

## 8. Connectivity Status UI

The renderer must surface connectivity state to the user. This should be an **application-level concern** (host app or renderer wrapper), not embedded in the form fields themselves.

### 8.1 Network Detection

```typescript
// Angular service — injectable
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online',  () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }
}
```

> **Caveat:** `navigator.onLine` can return `true` even when behind a captive portal or when DNS resolves but the API server is unreachable. For more reliable detection, make a lightweight ping to a known health-check endpoint:

```typescript
private async checkRealConnectivity(): Promise<boolean> {
  try {
    await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
    return true;
  } catch {
    return false;
  }
}
```

### 8.2 Status Banner Design

```html
<!-- Shown when offline -->
<div role="status" aria-live="polite" class="connectivity-banner offline">
  You are offline. Your data is being saved locally and will submit automatically
  when your connection is restored.
</div>

<!-- Shown when sync completes -->
<div role="status" aria-live="polite" class="connectivity-banner synced">
  Connection restored. Your form data has been submitted successfully.
</div>
```

### 8.3 Outbox Badge

If the user navigates away while items are queued in the outbox, the app should show a badge / warning:

```typescript
const pendingCount = await db.count('submission_outbox');
if (pendingCount > 0) {
  // Show: "1 form submission is waiting to sync"
}
```

---

## 9. Service Worker Setup

### 9.1 Recommended Tool: Workbox

[Workbox](https://developer.chrome.com/docs/workbox/) (Google) provides pre-built strategies and avoids writing raw service worker code. For Angular apps, use `@angular/pwa` which scaffolds a Workbox-based service worker:

```bash
npx nx add @angular/pwa --project=<app-name>
```

This generates:
- `ngsw-config.json` — caching strategy configuration
- `manifest.webmanifest` — PWA metadata

### 9.2 Caching Strategy per Resource Type

| Resource | Strategy | TTL |
|---|---|---|
| App shell (HTML, JS, CSS) | **Cache First** → Stale While Revalidate | Long (uses content hash) |
| Schema JSON files | **Network First** → Cache fallback | 24 h |
| Codelist API responses | **Stale While Revalidate** | 1 h |
| Form submission POST | **Background Sync** | Until success |
| Health check (`/api/health`) | **Network Only** — never cache | — |
| Images / icons | **Cache First** | Indefinite |

### 9.3 Manual Service Worker (without Workbox)

For full control, register a custom service worker in the Angular app:

```typescript
// app.config.ts
import { isDevMode, ApplicationConfig } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
```

---

## 10. Angular Integration

### 10.1 `OfflineFormDataService`

Implement `FormDataService` (defined in renderer) with offline-aware load/submit:

```typescript
@Injectable()
export class OfflineFormDataService implements FormDataService {
  private readonly db = inject(IndexedDBService);
  private readonly connectivity = inject(ConnectivityService);

  async load(context: FormContext): Promise<FormData | null> {
    // 1. Check for in-progress draft
    const draft = await this.db.get('form_drafts', context.id);
    if (draft) return draft.data;

    // 2. Try server
    if (this.connectivity.isOnline()) {
      const data = await fetch(`/api/forms/${context.formId}/data`).then(r => r.json());
      return data;
    }

    return null;
  }

  async saveDraft(context: FormContext, data: Record<string, unknown>): Promise<void> {
    await this.db.put('form_drafts', {
      id: context.id,
      ...context,
      data,
      savedAt: Date.now(),
      status: 'draft',
      schemaVersion: context.schemaVersion
    });
  }

  async onSubmit(payload: FormSubmissionPayload): Promise<SubmissionResult> {
    if (this.connectivity.isOnline()) {
      return this.submitOnline(payload);
    } else {
      return this.queueOffline(payload);
    }
  }

  private async submitOnline(payload: FormSubmissionPayload): Promise<SubmissionResult> {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    await this.db.delete('form_drafts', payload.context.id);
    return { success: true };
  }

  private async queueOffline(payload: FormSubmissionPayload): Promise<SubmissionResult> {
    await this.db.add('submission_outbox', {
      ...payload.context,
      payload,
      queuedAt: Date.now(),
      attempts: 0
    });
    // Register background sync
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register('form-submission-sync');
    // Remove draft — it's now in the outbox
    await this.db.delete('form_drafts', payload.context.id);
    return { success: true, queued: true };
  }
}
```

### 10.2 `OfflineCodelistService`

```typescript
@Injectable()
export class OfflineCodelistService implements CodelistService {
  private readonly db = inject(IndexedDBService);
  private readonly connectivity = inject(ConnectivityService);

  async prefetch(names: string[]): Promise<Map<string, CodelistItem[]>> {
    const result = new Map<string, CodelistItem[]>();

    await Promise.all(names.map(async (name) => {
      const cached = await this.db.get('codelist_cache', name);
      const isFresh = cached && (Date.now() - cached.cachedAt) < CODELIST_CACHE_TTL_MS;

      if (isFresh) {
        result.set(name, cached.items);
        return;
      }

      if (!this.connectivity.isOnline()) {
        if (cached) {
          result.set(name, cached.items); // stale but available
        }
        // Missing codelist — degraded mode; caller handles
        return;
      }

      const items = await fetch(`/api/codelists/${name}`).then(r => r.json());
      await this.db.put('codelist_cache', {
        name,
        items,
        cachedAt: Date.now()
      });
      result.set(name, items);
    }));

    return result;
  }
}
```

### 10.3 Providing Offline Services

```typescript
// In the host application's providers (offline-enabled variant)
export const offlineFormProviders: Provider[] = [
  { provide: FORM_DATA_SERVICE,    useClass: OfflineFormDataService },
  { provide: CODELIST_SERVICE,     useClass: OfflineCodelistService },
];

// In the standard (online-only) variant — unchanged
export const onlineFormProviders: Provider[] = [
  { provide: FORM_DATA_SERVICE,    useClass: OnlineFormDataService },
  { provide: CODELIST_SERVICE,     useClass: OnlineCodelistService },
];
```

The renderer code is identical in both cases. Switching between online and offline capability is purely a provider swap at the host application level.

---

## 11. Browser Support and Limitations

| Feature | Chrome | Firefox | Safari (desktop) | Safari (iOS) | Edge |
|---|---|---|---|---|---|
| IndexedDB | ✓ | ✓ | ✓ (7-day eviction*) | ✓ (7-day*) | ✓ |
| Cache API | ✓ | ✓ | ✓ | ✓ | ✓ |
| Service Worker | ✓ | ✓ | ✓ (14+) | ✓ (14.5+) | ✓ |
| Background Sync | ✓ | ✗ (not supported) | ✗ (not supported) | ✗ | ✓ |
| Persistent Storage | ✓ | ✓ | ✗ | ✗ | ✓ |
| StorageManager.estimate() | ✓ | ✓ | ✓ | ✓ | ✓ |

**(*) Safari 7-day eviction** applies to browser mode. Installed PWAs (added to home screen) are exempt.

**Background Sync on Firefox/Safari:** These browsers do not support the Background Sync API. Fallback strategy: poll on `window 'online'` event (less reliable but works):

```typescript
// Fallback for browsers without Background Sync
window.addEventListener('online', async () => {
  const pending = await db.count('submission_outbox');
  if (pending > 0) {
    await flushOutbox(); // same logic as SW background sync
  }
});
```

---

## 12. Security Considerations

1. **IndexedDB same-origin policy:** Data is scoped to the origin (`https://yourdomain.com`). Cross-origin access is impossible. No additional security configuration required.

2. **Sensitive field data at rest:** IndexedDB data is not encrypted by the browser. If the form contains sensitive PII or clinical data, evaluate device-level encryption (disk encryption on managed devices) or use the Web Crypto API to encrypt IndexedDB values before storing:
   ```typescript
   // Example: encrypt draft data before writing
   const encrypted = await crypto.subtle.encrypt(
     { name: 'AES-GCM', iv },
     encryptionKey,
     JSON.stringify(data)
   );
   ```
   > **Note:** Key management for browser-side encryption is non-trivial. This is an advanced requirement to evaluate per deployment context.

3. **Outbox tampering:** The submission outbox in IndexedDB is readable by any script on the same origin. Do not store authentication tokens or private keys in IndexedDB. Rely on `httpOnly` cookies or session authentication at the time of sync.

4. **Service Worker scope:** Ensure the service worker is registered at the application root (`/`) and not a subdirectory. Misconfigured scope can cause unexpected caching behaviour.

5. **Content Security Policy:** Service workers require `script-src 'self'`. If the worker file is served from a CDN, the CDN origin must be listed in CSP. Workbox-generated service workers should be served from the same origin as the app.

---

## 13. Open Questions (for Phase 4 Architecture Session)

1. **Draft auto-expiry** — How long should an unsubmitted draft be retained? 7 days? 30 days? Should there be a TTL enforced by the app on open?

2. **Multi-device drafts** — If a user starts a form on device A (offline), and another user (different login) opens the same form on device B, what happens? Is the draft server-synced between devices, or device-local only?

3. **Encryption requirement** — Is field-level encryption at rest required by the organization's data classification policy? If yes, Web Crypto + key derivation from user session token is the path.

4. **Outbox retry policy** — Maximum number of retries? Backoff strategy (linear vs exponential)? What happens after max retries? Alert the administrator?

5. **`navigator.onLine` reliability** — Should we implement a periodic heartbeat ping to determine real connectivity, rather than trusting the browser event?

6. **PWA install requirement** — Should offline mode require the user to install the PWA (add to home screen), or should it work in the browser tab? Safari's 7-day eviction is only bypassed for installed PWAs.

7. **Codelist staleness policy** — What is the acceptable staleness window for cached codelists? If a codelist is updated on the server, how does the client know to invalidate its cache?

---

## 14. Recommended Libraries

| Library | Purpose | Size | Notes |
|---|---|---|---|
| [`idb`](https://www.npmjs.com/package/idb) | Promise-based IndexedDB wrapper | ~1.4 KB | Minimal API surface; maintained by Jake Archibald |
| [`idb-keyval`](https://www.npmjs.com/package/idb-keyval) | Simple key-value store over IndexedDB | ~600 B | Only for simple cases; no cursor support |
| [Workbox](https://developer.chrome.com/docs/workbox/) | Service worker strategies | ~20 KB (tree-shaken) | Google-maintained; integrates with `@angular/pwa` |
| [`@angular/pwa`](https://angular.dev/ecosystem/service-workers) | Angular Service Worker + PWA config | — | Wraps Workbox; handles caching config via `ngsw-config.json` |
| [RxDB](https://rxdb.info/) | Full offline-first reactive database over IndexedDB | ~200 KB | Overkill for form data; relevant if full data replication is needed |
| [PouchDB](https://pouchdb.com/) | CouchDB-compatible local DB with CouchDB sync | ~140 KB | Good for multi-user sync; CouchDB dependency on server |

**Recommended minimum stack:**
```
idb                ← IndexedDB access
@angular/pwa       ← Service worker + caching
```

No need for PouchDB or RxDB unless multi-device / multi-user real-time sync is required.

---

## 15. Implementation Checklist (When Phase 4 Begins)

### Infrastructure
- [ ] `@angular/pwa` added to the renderer app; `ngsw-config.json` configured
- [ ] `idb` added as a direct dependency to `@vi/form-renderer`
- [ ] `IndexedDBService` Angular service created — wraps `idb`, provides `get/put/add/delete/count/getAll` methods
- [ ] `ConnectivityService` created with `isOnline` Signal + `online/offline` event listeners
- [ ] IndexedDB schema: `form_drafts`, `submission_outbox`, `codelist_cache` object stores with correct `keyPath` and indexes

### Offline Data Services
- [ ] `OfflineFormDataService` implementing `FormDataService`: `load()` (IndexedDB-first), `saveDraft()` (always local), `onSubmit()` (network-first + outbox fallback)
- [ ] `OfflineCodelistService` implementing `CodelistService`: `prefetch()` (IndexedDB-first + network refresh)
- [ ] `offlineFormProviders` array exported for host application use
- [ ] `onSubmit()` returns `{ success: true, queued: true }` when offline — renderer surfaces appropriate message

### Background Sync
- [ ] Service worker `sync` event handler: `flushOutbox()` — attempts all queued submissions
- [ ] Fallback `window 'online'` event listener for Firefox/Safari (no Background Sync API)
- [ ] Retry tracking (`attempts`, `lastAttemptAt`, `lastError`) on outbox entries
- [ ] Max retry limit (configurable via token) — escalation path after max retries

### UI
- [ ] `ConnectivityBannerComponent` — shows offline/syncing/synced status strip
- [ ] Outbox badge / warning when navigating away with pending submissions
- [ ] `navigator.storage.persist()` requested on app init
- [ ] Storage quota check on app init — warn user if > 80% used

### Testing
- [ ] Unit: `OfflineFormDataService` — load from draft, submit online, queue offline, sync on reconnect
- [ ] Unit: `OfflineCodelistService` — return cached, refresh stale, degrade gracefully when missing
- [ ] Integration: full offline round-trip — fill form → go offline → submit → verify outbox → go online → verify submitted
- [ ] E2E (Playwright): use `page.route()` to simulate network failure mid-form

### Security Review
- [ ] Confirm IndexedDB stores no authentication tokens
- [ ] Confirm CSP allows service worker from same origin
- [ ] Evaluate PII / data classification requirement for encryption at rest
