import { expect } from '@wdio/globals';
import {
  sanitizeUrl,
  isSafeUrl,
  ALLOWED_URL_SCHEMES,
  getAllowedUrlSchemes,
  isAllowedUrlScheme,
} from './sanitize-url.js';

describe('sanitize-url utility', () => {
  describe('safe URLs', () => {
    it('allows https and http protocols', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com/page?query=1')).toBe(
        'http://example.com/page?query=1',
      );
    });

    it('allows mailto and tel protocols', () => {
      expect(sanitizeUrl('mailto:support@vialiq.io')).toBe(
        'mailto:support@vialiq.io',
      );
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('allows relative paths and anchors', () => {
      expect(sanitizeUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeUrl('./assets/logo.png')).toBe('./assets/logo.png');
      expect(sanitizeUrl('../settings')).toBe('../settings');
      expect(sanitizeUrl('#section-1')).toBe('#section-1');
      expect(sanitizeUrl('?tab=settings')).toBe('?tab=settings');
    });

    it('allows protocol-relative URLs', () => {
      expect(sanitizeUrl('//cdn.example.com/script.js')).toBe(
        '//cdn.example.com/script.js',
      );
    });

    it('allows URLs with colons in path or query', () => {
      expect(sanitizeUrl('/view:detail')).toBe('/view:detail');
      expect(sanitizeUrl('/search?q=foo:bar')).toBe('/search?q=foo:bar');
      expect(sanitizeUrl('#anchor:test')).toBe('#anchor:test');
    });

    it('returns true for isSafeUrl on safe URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
      expect(isSafeUrl('/about')).toBe(true);
      expect(isSafeUrl('#top')).toBe(true);
    });
  });

  describe('dangerous and executable schemes', () => {
    it('rejects javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects case-variations of javascript:', () => {
      expect(sanitizeUrl('JavaScript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('javaScript:alert(1)')).toBeUndefined();
    });

    it('rejects javascript: with whitespace or control characters', () => {
      expect(sanitizeUrl('  javascript:alert(1)  ')).toBeUndefined();
      expect(sanitizeUrl('java\tscript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('java\nscript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('java\rscript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('\x00javascript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('\x01javascript:alert(1)')).toBeUndefined();
    });

    it('rejects obfuscated HTML entities in schemes', () => {
      expect(sanitizeUrl('&#106;avascript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('&#x6a;avascript:alert(1)')).toBeUndefined();
      expect(sanitizeUrl('jav&#x09;ascript:alert(1)')).toBeUndefined();
    });

    it('rejects data:, vbscript:, blob:, and file: schemes', () => {
      expect(
        sanitizeUrl('data:text/html,<script>alert(1)</script>'),
      ).toBeUndefined();
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBeUndefined();
      expect(sanitizeUrl('blob:https://example.com/id')).toBeUndefined();
      expect(sanitizeUrl('file:///etc/passwd')).toBeUndefined();
    });

    it('rejects custom or unknown schemes', () => {
      expect(sanitizeUrl('ftp://ftp.example.com')).toBeUndefined();
      expect(sanitizeUrl('custom-app:token')).toBeUndefined();
    });
  });

  describe('empty and invalid inputs', () => {
    it('returns undefined for empty or whitespace-only strings', () => {
      expect(sanitizeUrl('')).toBeUndefined();
      expect(sanitizeUrl('   ')).toBeUndefined();
    });

    it('returns undefined for null or undefined', () => {
      expect(sanitizeUrl(null)).toBeUndefined();
      expect(sanitizeUrl(undefined)).toBeUndefined();
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
    });

    it('exposes ALLOWED_URL_SCHEMES read-only snapshot set', () => {
      expect(ALLOWED_URL_SCHEMES.has('https:')).toBe(true);
      expect(ALLOWED_URL_SCHEMES.has('http:')).toBe(true);
      expect(ALLOWED_URL_SCHEMES.has('mailto:')).toBe(true);
      expect(ALLOWED_URL_SCHEMES.has('tel:')).toBe(true);
      expect(ALLOWED_URL_SCHEMES.has('javascript:')).toBe(false);
    });

    it('prevents callers from mutating ALLOWED_URL_SCHEMES snapshot', () => {
      const mutableRef = ALLOWED_URL_SCHEMES as unknown as Set<string>;
      expect(() => mutableRef.add('ftp:')).toThrow();
      expect(() => mutableRef.delete('https:')).toThrow();
      expect(() => mutableRef.clear()).toThrow();
      expect(ALLOWED_URL_SCHEMES.has('ftp:')).toBe(false);
      expect(ALLOWED_URL_SCHEMES.has('https:')).toBe(true);
    });

    it('keeps validation policy intact regardless of caller actions', () => {
      // Even if callers create their own sets or attempt mutation
      expect(sanitizeUrl('ftp://example.com')).toBeUndefined();
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('provides getAllowedUrlSchemes snapshot query', () => {
      const schemes = getAllowedUrlSchemes();
      expect(schemes.has('https:')).toBe(true);
      expect(schemes.has('http:')).toBe(true);
      expect(schemes.has('mailto:')).toBe(true);
      expect(schemes.has('tel:')).toBe(true);
      expect(schemes.size).toBe(4);
    });

    it('provides isAllowedUrlScheme query function', () => {
      expect(isAllowedUrlScheme('https:')).toBe(true);
      expect(isAllowedUrlScheme('https')).toBe(true);
      expect(isAllowedUrlScheme('http:')).toBe(true);
      expect(isAllowedUrlScheme('mailto:')).toBe(true);
      expect(isAllowedUrlScheme('tel:')).toBe(true);
      expect(isAllowedUrlScheme('ftp:')).toBe(false);
      expect(isAllowedUrlScheme('javascript:')).toBe(false);
    });
  });
});
