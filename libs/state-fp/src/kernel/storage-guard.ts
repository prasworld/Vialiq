/**
 * Kernel storage safety guard — Production Security Boundary.
 *
 * ARCHITECTURAL DECISION: @vi/state-fp enforces MEMORY-ONLY storage for all
 * application state. This is a non-negotiable security requirement, not an optional feature.
 *
 * ## Why Browser Persistence is Forbidden
 *
 * All browser-persistent storage (localStorage, sessionStorage, IndexedDB) suffers from
 * the same class of vulnerabilities that make them unsuitable for sensitive data:
 *
 * ### 1. No Default Encryption
 * Data is stored in plaintext (unencrypted) on disk. An attacker with physical access
 * to the device can access raw browser cache files without launching the browser.
 *
 * ### 2. Plaintext in DevTools (Primary Concern)
 * Any developer with 5 minutes of browser DevTools knowledge can inspect application
 * state. This violates the principle of least privilege:
 *   - Internal contractors with DevTools access can read production secrets (API tokens, user PII)
 *   - Disgruntled employees can exfiltrate data before offboarding
 *   - Social engineering: "Open DevTools, click Application → [adapter name] → copy all"
 *
 * ### 3. XSS Attack Surface
 * If a website is compromised via Cross-Site Scripting (XSS), malicious JavaScript can
 * read ALL data from localStorage/sessionStorage/IndexedDB for that origin.
 * The attacker doesn't need admin or elevated privileges — just arbitrary code execution.
 *
 * ### 4. No Application-Level Access Control
 * Browser storage has only Same-Origin Policy protection. Within the same origin,
 * ALL JavaScript (including third-party scripts, ads, analytics) has equal access.
 *
 * ## Comparison to Redux/NgRx Production Posture
 *
 * Redux and NgRx also enforce this boundary:
 *   - DevTools are dev-only (disabled in production builds)
 *   - State is memory-only (ephemeral, cleared on page reload)
 *   - No built-in persistence to localStorage (explicit plugin required)
 *   - Production builds remove all debug code (tree-shaking)
 *
 * ## Solution: Separate @vi/config for Non-Sensitive Data
 *
 * For legitimate use cases (theme, locale, feature flags), use @vi/config:
 *   - Separate library with explicit persistence semantics
 *   - Not subject to the same security constraints as @vi/state-fp
 *   - Can use LocalAdapter, SessionAdapter, IndexedDbAdapter
 *   - Clear separation: "app state" vs "config data"
 */

type GuardStorageConfig = {
  readonly adapter?: unknown;
};

/**
 * Permanently forbidden storage adapter names for application state.
 *
 * See SECURITY.md for detailed architectural rationale:
 *  • 'local' — localStorage: plaintext, DevTools-visible, no encryption
 *  • 'session' — sessionStorage: plaintext, XSS-vulnerable, DevTools-visible
 *  • 'indexeddb' — IndexedDB: plaintext on disk, DevTools-accessible, browser-cached
 *  • 'obfuscated' — False security; data still readable via DevTools even if hashed
 *
 * This is not a list of "not yet supported" adapters. These are explicitly
 * excluded by architectural design for security.
 */
const FORBIDDEN_APPLICATION_STORAGE_ADAPTERS = new Set([
  'local',
  'session',
  'indexeddb',
  'obfuscated',
]);

export function getStorageAdapterName(adapter: unknown): string | undefined {
  if (adapter && typeof adapter === 'object' && 'name' in adapter) {
    const name = (adapter as { name?: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return undefined;
}

export function assertApplicationStoragePolicy(
  atomKey: string,
  storage?: GuardStorageConfig,
): void {
  if (!storage) return;
  if (!storage.adapter) return;

  const adapterName = getStorageAdapterName(storage.adapter)?.toLowerCase();
  if (!adapterName) {
    // An adapter is present but exposes no "name" — the policy cannot be enforced.
    // Fail closed: treat this as a security violation rather than silently allowing it.
    // Every StorageAdapter implementation must declare `readonly name: string`.
    throw new Error(
      `[@vi/state-fp/security] Storage adapter for atom "${atomKey}" exposes no "name" property — ` +
      'the storage policy cannot be enforced. ' +
      'All adapters must implement StorageAdapter with a readonly name string.',
    );
  }
  if (!FORBIDDEN_APPLICATION_STORAGE_ADAPTERS.has(adapterName)) return;

  throw new Error(
    `[@vi/state-fp/security] Forbidden storage adapter "${adapterName}" configured for atom "${atomKey}". ` +
    'Application state must remain memory-only in @vi/state-fp. ' +
    'Do not use localStorage/sessionStorage/IndexedDB for application data.',
  );
}
