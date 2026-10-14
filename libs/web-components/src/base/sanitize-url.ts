/**
 * Private policy set used for URL validation.
 * Internal to this module to prevent external callers from mutating component URL policies.
 */
const INTERNAL_ALLOWED_URL_SCHEMES: ReadonlySet<string> = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
]);

class ReadonlySetSnapshot<T> extends Set<T> {
  private _frozen = false;

  constructor(iterable?: Iterable<T> | null) {
    super(iterable);
    this._frozen = true;
  }

  override add(value: T): this {
    if (!this._frozen) {
      return super.add(value);
    }
    throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
  }
  override delete(value: T): boolean {
    if (!this._frozen) {
      return super.delete(value);
    }
    throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
  }
  override clear(): void {
    if (!this._frozen) {
      super.clear();
      return;
    }
    throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
  }
}

/**
 * Read-only snapshot of safe URL schemes allowed for navigation.
 * All other schemes (e.g. javascript:, data:, vbscript:, file:, blob:) are rejected.
 */
export const ALLOWED_URL_SCHEMES: ReadonlySet<string> = Object.freeze(
  new ReadonlySetSnapshot(INTERNAL_ALLOWED_URL_SCHEMES),
);

/**
 * Returns a fresh read-only snapshot set of the allowed URL schemes.
 */
export function getAllowedUrlSchemes(): ReadonlySet<string> {
  return new Set(INTERNAL_ALLOWED_URL_SCHEMES);
}

/**
 * Checks whether the given URL scheme (e.g. 'https:' or 'https') is allowed.
 */
export function isAllowedUrlScheme(scheme: string): boolean {
  if (typeof scheme !== 'string') return false;
  const normalized = scheme.endsWith(':')
    ? scheme.toLowerCase()
    : `${scheme.toLowerCase()}:`;
  return INTERNAL_ALLOWED_URL_SCHEMES.has(normalized);
}

/**
 * Regex matching dangerous and executable URI schemes.
 */
const DANGEROUS_SCHEMES = /^(?:javascript|data|vbscript|blob|file):/i;

/**
 * Regex matching ASCII control characters (0x00-0x1F, 0x7F).
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS_REGEX = /[\x00-\x1F\x7F]/g;

/**
 * Regex matching ASCII control characters and whitespace.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_AND_WHITESPACE_REGEX = /[\x00-\x1F\x7F\s]+/g;

/**
 * Decodes numeric and hexadecimal HTML character entity references that attackers
 * might use to obfuscate URL schemes (e.g. &#106;avascript: or &#x6a;avascript:).
 */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);?/g, (_, dec) =>
      String.fromCharCode(parseInt(dec, 10)),
    );
}

/**
 * Validates and sanitizes a URL string for safe use in anchor `href` attributes.
 *
 * Enforces an explicit allowlist of safe schemes (http, https, mailto, tel) as well as
 * relative URLs (/path, ./path, ../path, #hash, ?query).
 *
 * Strips ASCII control characters and rejects executable schemes (such as `javascript:`,
 * `data:`, `vbscript:`), preventing DOM-based Cross-Site Scripting (XSS).
 *
 * @param url - The candidate URL string to sanitize.
 * @returns The sanitized URL string, or `undefined` if the URL is invalid or unsafe.
 *
 * @example
 * sanitizeUrl('https://example.com'); // 'https://example.com'
 * sanitizeUrl('/dashboard');          // '/dashboard'
 * sanitizeUrl('#top');                // '#top'
 * sanitizeUrl('mailto:user@corp.io'); // 'mailto:user@corp.io'
 * sanitizeUrl('javascript:alert(1)'); // undefined
 * sanitizeUrl('data:text/html,...');  // undefined
 */
export function sanitizeUrl(url?: string | null): string | undefined {
  if (typeof url !== 'string') {
    return undefined;
  }

  // Remove ASCII control characters and trim whitespace
  const sanitized = url.replace(CONTROL_CHARACTERS_REGEX, '').trim();
  if (sanitized.length === 0) {
    return undefined;
  }

  // Decode potential HTML entity obfuscations and strip inner whitespace to detect hidden schemes
  const decoded = decodeHtmlEntities(sanitized).replace(
    CONTROL_AND_WHITESPACE_REGEX,
    '',
  );
  if (DANGEROUS_SCHEMES.test(decoded)) {
    return undefined;
  }

  // Check using WHATWG URL parsing with an internal dummy base
  try {
    const parsed = new URL(sanitized, 'https://vialiq.internal');
    if (!INTERNAL_ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
      return undefined;
    }
    return sanitized;
  } catch {
    return undefined;
  }
}

/**
 * Returns true if the given URL is safe for navigation, false otherwise.
 *
 * @param url - The candidate URL string to check.
 */
export function isSafeUrl(url?: string | null): boolean {
  return sanitizeUrl(url) !== undefined;
}
