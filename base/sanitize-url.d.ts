/**
 * Read-only snapshot of safe URL schemes allowed for navigation.
 * All other schemes (e.g. javascript:, data:, vbscript:, file:, blob:) are rejected.
 */
export declare const ALLOWED_URL_SCHEMES: ReadonlySet<string>;
/**
 * Returns a fresh read-only snapshot set of the allowed URL schemes.
 */
export declare function getAllowedUrlSchemes(): ReadonlySet<string>;
/**
 * Checks whether the given URL scheme (e.g. 'https:' or 'https') is allowed.
 */
export declare function isAllowedUrlScheme(scheme: string): boolean;
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
export declare function sanitizeUrl(url?: string | null): string | undefined;
/**
 * Returns true if the given URL is safe for navigation, false otherwise.
 *
 * @param url - The candidate URL string to check.
 */
export declare function isSafeUrl(url?: string | null): boolean;
//# sourceMappingURL=sanitize-url.d.ts.map