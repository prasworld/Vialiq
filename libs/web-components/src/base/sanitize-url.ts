/**
 * Safe schemes allowed for navigation.
 * All other schemes (e.g. javascript:, data:, vbscript:, file:, blob:) are rejected.
 */
export const ALLOWED_URL_SCHEMES = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
]);

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
    if (!ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
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
