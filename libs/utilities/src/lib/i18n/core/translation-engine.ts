declare const process: { env: Record<string, string> };
import { TranslationManifest } from './translation-loader';

export class TranslationEngine {
  // Map<namespace, Map<key, string>>
  private registry = new Map<string, Map<string, string>>();
  private manifestRegistry = new Map<string, TranslationManifest>();
  private _currentLocale = 'en';

  /**
   * Optional custom handler for missing keys.
   */
  missingKeyHandler?: (key: string, namespace?: string) => string;
  
  // Custom event target for reactivity without framework deps
  private readonly eventTarget = new EventTarget();

  get currentLocale(): string {
    return this._currentLocale;
  }

  setLocale(locale: string): void {
    if (this._currentLocale !== locale) {
      this._currentLocale = locale;
      this.eventTarget.dispatchEvent(new Event('localeChange'));
    }
  }

  registerManifest(manifest: TranslationManifest): void {
    this.manifestRegistry.set(manifest.namespace, manifest);
  }

  getManifests(): TranslationManifest[] {
    return Array.from(this.manifestRegistry.values());
  }

  /**
   * Registers a map of translations for a specific namespace.
   * Merges with existing keys so that fallback locales (en) can be loaded first
   * and subsequently overridden by the target locale.
   */
  register(namespace: string, translations: Record<string, unknown>): void {
    let nsMap = this.registry.get(namespace);
    if (!nsMap) {
      nsMap = new Map<string, string>();
      this.registry.set(namespace, nsMap);
    }
    
    this.flatten(translations, '', nsMap);
  }

  /**
   * Synchronous translation. Returns the translated string immediately.
   */
  instant(key: string, params?: Record<string, unknown>, namespace?: string): string {
    let rawString: string | undefined;

    if (namespace) {
      rawString = this.registry.get(namespace)?.get(key);
    } else {
      // Find the first namespace that has this key
      for (const map of this.registry.values()) {
        if (map.has(key)) {
          rawString = map.get(key);
          break;
        }
      }
    }

    if (rawString === undefined) {
      if (this.missingKeyHandler) {
        return this.missingKeyHandler(key, namespace);
      }
      // Dev mode missing key reporter
      if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
        console.warn(`[vi18n] Missing key: ${key}`);
      }
      return this.fallback(key);
    }

    return this.interpolate(rawString, params);
  }

  has(key: string, namespace?: string): boolean {
    if (namespace) {
      return this.registry.get(namespace)?.has(key) ?? false;
    }
    for (const map of this.registry.values()) {
      if (map.has(key)) return true;
    }
    return false;
  }

  onChange(listener: () => void): () => void {
    this.eventTarget.addEventListener('localeChange', listener);
    return () => this.eventTarget.removeEventListener('localeChange', listener);
  }

  getNamespaces(): Set<string> {
    return new Set(this.registry.keys());
  }

  dump(namespace: string): Record<string, string> {
    const map = this.registry.get(namespace);
    if (!map) return {};
    return Object.fromEntries(map);
  }
  
  private flatten(obj: Record<string, unknown>, prefix: string, map: Map<string, string>): void {
    for (const [k, v] of Object.entries(obj)) {
      const currentKey = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        map.set(currentKey, v);
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        this.flatten(v as Record<string, unknown>, currentKey, map);
      }
    }
  }

  private interpolate(str: string, params?: Record<string, unknown>): string {
    if (!params) return str;
    return str.replace(/\{\{([\w.]+)\}\}/g, (match, paramPath) => {
      const val = this.getValueByPath(params, paramPath);
      return val !== undefined ? String(val) : match;
    });
  }

  private getValueByPath(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object' && acc !== null) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }

  private fallback(fullKey: string): string {
    // FORM.ADVERSE_EVENT -> Adverse event
    const segments = fullKey.split('.');
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : fullKey;
    const words = lastSegment.split('_');
    if (words.length === 0 || !words[0]) return fullKey;
    
    const first = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    const rest = words.slice(1).map((w: string) => w.toLowerCase());
    return [first, ...rest].join(' ');
  }
}

// Singleton instance exposed for cross-framework sharing
export const engine = new TranslationEngine();
