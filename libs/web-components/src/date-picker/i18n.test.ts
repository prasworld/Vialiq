import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveLocale, resolveSegmentOrder, formatDisplay, resolveTimeZone } from './i18n.js';

describe('i18n utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('resolveLocale', () => {
    it('returns provided locale if present', () => {
      expect(resolveLocale('fr-FR')).toBe('fr-FR');
    });

    it('falls back to navigator.language', () => {
      vi.stubGlobal('navigator', { language: 'de-DE' });
      expect(resolveLocale(null)).toBe('de-DE');
      expect(resolveLocale('')).toBe('de-DE');
    });

    it('falls back to "en" if navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);
      expect(resolveLocale(null)).toBe('en');
    });
  });

  describe('resolveSegmentOrder', () => {
    it('resolves DMY for en-GB', () => {
      expect(resolveSegmentOrder('en-GB')).toBe('DMY');
    });

    it('resolves MDY for en-US', () => {
      expect(resolveSegmentOrder('en-US')).toBe('MDY');
    });

    it('resolves YMD for zh-CN', () => {
      expect(resolveSegmentOrder('zh-CN')).toBe('YMD');
    });

    it('resolves DMY for de-DE', () => {
      expect(resolveSegmentOrder('de-DE')).toBe('DMY');
    });

    it('resolves DMY for ar', () => {
      expect(resolveSegmentOrder('ar')).toBe('DMY');
    });

    it('overrides with format string', () => {
      expect(resolveSegmentOrder('en-GB', 'YYYY-MM-DD')).toBe('YMD');
      expect(resolveSegmentOrder('en-US', 'DD/MM/YYYY')).toBe('DMY');
    });
    
    it('falls back to locale if format string is missing components', () => {
      expect(resolveSegmentOrder('en-US', 'DD/MM')).toBe('MDY');
    });
  });

  describe('formatDisplay', () => {
    const date = new Date(2025, 5, 15); // June 15, 2025

    it('formats date mode', () => {
      expect(formatDisplay(date, 'en-GB', 'date')).toMatch(/15 June 2025/i);
    });

    it('formats month mode', () => {
      expect(formatDisplay(date, 'en-GB', 'month')).toMatch(/June 2025/i);
    });

    it('formats year mode', () => {
      expect(formatDisplay(date, 'en-GB', 'year')).toBe('2025');
    });
  });


  
  describe('resolveTimeZone', () => {
    it('returns a string', () => {
      expect(typeof resolveTimeZone()).toBe('string');
    });
  });
});
