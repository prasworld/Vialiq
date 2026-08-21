import { describe, it, expect, beforeEach } from 'vitest';
import { loadLocale, __clearLocaleCacheForTest } from './locale-registry.js';

describe('locale-registry', () => {
  beforeEach(() => {
    __clearLocaleCacheForTest();
  });

  it('returns null for english locales (built-in)', async () => {
    expect(await loadLocale('en')).toBeNull();
    expect(await loadLocale('en-US')).toBeNull();
    expect(await loadLocale('en-GB')).toBeNull();
  });

  it('returns null for unsupported locale', async () => {
    expect(await loadLocale('xx-YY')).toBeNull();
  });

  it('loads valid full locale tag', async () => {
    const locale = await loadLocale('fr-FR');
    expect(locale).toBeDefined();
    // flatpickr french locale typically has 'lundi' for monday
    expect(locale?.weekdays?.longhand).toContain('lundi');
  });

  it('falls back to language tag if full tag not mapped but language is', async () => {
    const locale = await loadLocale('de-AT'); // We have 'de', but no 'de-AT'
    expect(locale).toBeDefined();
    expect(locale?.weekdays?.longhand).toContain('Montag');
  });

  it('caches the loaded locale (second call is fast, no new import)', async () => {
    const locale1 = await loadLocale('it');
    const locale2 = await loadLocale('it');
    
    expect(locale1).toBe(locale2);
  });
});
