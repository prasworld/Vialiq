import { engine } from './translation-engine';

describe('TranslationEngine', () => {
  beforeEach(() => {
    // Clear out the engine's internal state (as it is a singleton for the app)
    // To properly test the singleton without adding a test-only method,
    // we can use a fresh instance or manually clear the registry via our knowledge of it,
    // but TS might complain about private fields. Let's just cast it.
    (engine as any).registry.clear();
    (engine as any)._currentLocale = 'en';
    engine.missingKeyHandler = undefined;
  });

  it('should register and flatten nested JSON', () => {
    engine.register('form', 'en', {
      FORM: {
        TITLE: 'Form Builder',
        FIELD: {
          PLACEHOLDER: 'Enter value'
        }
      }
    });

    expect(engine.has('FORM.TITLE', 'form')).toBe(true);
    expect(engine.has('FORM.FIELD.PLACEHOLDER')).toBe(true); // without namespace search
    expect(engine.instant('FORM.TITLE')).toBe('Form Builder');
  });

  it('should interpolate variables', () => {
    engine.register('errors', 'en', {
      ERRORS: {
        MAX_LENGTH: '{{FIELD_NAME}} must not exceed {{MAX}} characters'
      }
    });

    const result = engine.instant('ERRORS.MAX_LENGTH', { FIELD_NAME: 'Email', MAX: 100 });
    expect(result).toBe('Email must not exceed 100 characters');
  });

  it('should retain un-interpolated variables if missing', () => {
    engine.register('test', 'en', { MSG: 'Hello {{NAME}}!' });
    const result = engine.instant('MSG');
    expect(result).toBe('Hello {{NAME}}!');
  });

  it('should interpolate deep object paths', () => {
    engine.register('test', 'en', { MSG: 'Welcome {{user.profile.name}}!' });
    const result = engine.instant('MSG', { user: { profile: { name: 'John' } } });
    expect(result).toBe('Welcome John!');
  });

  it('should fallback to smart sentence case when key is missing', () => {
    // Missing key
    const result = engine.instant('FORM.ADVERSE_EVENT');
    expect(result).toBe('Adverse event');
    
    // Missing key with longer name
    const result2 = engine.instant('ERRORS.MAX_LENGTH_EXCEEDED');
    expect(result2).toBe('Max length exceeded');
    
    // Very simple missing key
    const result3 = engine.instant('SUBMIT');
    expect(result3).toBe('Submit');
  });

  it('should isolate keys per locale and switch correctly', () => {
    engine.register('form', 'en', { FORM: { ADVERSE_EVENT: 'Adverse Event (EN)', OTHER: 'Other (EN)' } });
    engine.register('form', 'fr', { FORM: { ADVERSE_EVENT: 'Événement indésirable (FR)' } });

    // Current locale defaults to 'en'
    expect(engine.instant('FORM.ADVERSE_EVENT')).toBe('Adverse Event (EN)');
    expect(engine.instant('FORM.OTHER')).toBe('Other (EN)');

    engine.setLocale('fr');
    expect(engine.instant('FORM.ADVERSE_EVENT')).toBe('Événement indésirable (FR)');
    expect(engine.instant('FORM.OTHER')).toBe('Other (EN)'); // base layer fallback
    expect(engine.instant('FORM.TOTALLY_MISSING')).toBe('Totally missing'); // humanizer fallback
  });
  it('should interpolate duplicate variables multiple times', () => {
    engine.register('test', 'en', { MSG: '{{count}} items selected. The max limit is {{count}}.' });
    const result = engine.instant('MSG', { count: 5 });
    expect(result).toBe('5 items selected. The max limit is 5.');
  });

  it('should use custom missingKeyHandler if provided', () => {
    engine.missingKeyHandler = (key, ns) => `[MISSING]: ${ns ? ns + ':' : ''}${key}`;
    
    expect(engine.instant('UNKNOWN_KEY')).toBe('[MISSING]: UNKNOWN_KEY');
    expect(engine.instant('UNKNOWN_KEY', undefined, 'custom_ns')).toBe('[MISSING]: custom_ns:UNKNOWN_KEY');
    
    // Restore default for other tests
    engine.missingKeyHandler = undefined;
  });

  it('should resolve cross-namespace collisions by picking the first registered namespace when no namespace is provided', () => {
    engine.register('alpha', 'en', { COMMON: { CANCEL: 'Cancel (Alpha)' } });
    engine.register('beta', 'en', { COMMON: { CANCEL: 'Cancel (Beta)' } });

    // Since 'alpha' was registered first, its map is first in the iteration order.
    // engine.instant() without namespace iterates localeMap.values() which preserves insertion order.
    expect(engine.instant('COMMON.CANCEL')).toBe('Cancel (Alpha)');
    
    // Explicit namespace still works
    expect(engine.instant('COMMON.CANCEL', undefined, 'beta')).toBe('Cancel (Beta)');
  });

  it('should safely ignore arrays in JSON payload during flattening', () => {
    engine.register('test', 'en', { 
      VALID: 'valid string',
      IGNORE_ME: ['a', 'b', 'c'],
      NESTED: {
        VALID: 'nested string',
        IGNORE_THIS_TOO: [1, 2, 3]
      }
    });

    expect(engine.instant('VALID')).toBe('valid string');
    expect(engine.instant('NESTED.VALID')).toBe('nested string');
    
    // Arrays are not flattened, so the keys won't exist
    expect(engine.has('IGNORE_ME')).toBe(false);
    expect(engine.has('NESTED.IGNORE_THIS_TOO')).toBe(false);
    expect(engine.has('IGNORE_ME.0')).toBe(false);
  });

  // ─── has() ──────────────────────────────────────────────────────────────────

  it('has() should return true when key exists in the active locale', () => {
    engine.register('app', 'en', { SUBMIT: 'Submit' });
    expect(engine.has('SUBMIT')).toBe(true);
    expect(engine.has('SUBMIT', 'app')).toBe(true);
  });

  it('has() should return false for a completely unknown key', () => {
    expect(engine.has('TOTALLY_UNKNOWN')).toBe(false);
    expect(engine.has('TOTALLY_UNKNOWN', 'app')).toBe(false);
  });

  it('has() should fall through to en fallback when key is missing in the active locale', () => {
    engine.register('app', 'en', { SHARED: 'English' });
    engine.setLocale('fr');
    // fr doesn't have SHARED, but en does — has() should return true via fallback
    expect(engine.has('SHARED')).toBe(true);
  });

  it('has() should return false when key is missing in both active locale and en', () => {
    engine.register('app', 'fr', { FR_KEY: 'Bonjour' });
    engine.setLocale('fr');
    expect(engine.has('MISSING_EVERYWHERE')).toBe(false);
  });

  // ─── onChange() ─────────────────────────────────────────────────────────────

  it('onChange() should call listener on locale change', () => {
    let calls = 0;
    engine.onChange(() => calls++);
    engine.setLocale('fr');
    expect(calls).toBe(1);
    engine.setLocale('de');
    expect(calls).toBe(2);
  });

  it('onChange() should stop calling listener after returned cleanup is called', () => {
    let calls = 0;
    const cleanup = engine.onChange(() => calls++);
    engine.setLocale('fr');
    expect(calls).toBe(1);
    cleanup(); // unsubscribe
    engine.setLocale('de');
    expect(calls).toBe(1); // must NOT increment
  });

  it('onChange() should NOT fire if setLocale is called with the same locale', () => {
    let calls = 0;
    engine.onChange(() => calls++);
    engine.setLocale('en'); // already 'en' — guard in setLocale should prevent event
    expect(calls).toBe(0);
  });

  // ─── dump() ─────────────────────────────────────────────────────────────────

  it('dump() should return all flattened key-value pairs for the current locale namespace', () => {
    engine.register('app', 'en', { FORM: { TITLE: 'Title', LABEL: 'Label' } });
    const dumped = engine.dump('app');
    expect(dumped).toEqual({ 'FORM.TITLE': 'Title', 'FORM.LABEL': 'Label' });
  });

  it('dump() should return empty object when namespace does not exist for the current locale', () => {
    engine.register('app', 'en', { KEY: 'value' });
    engine.setLocale('fr'); // fr doesn't have 'app' namespace loaded
    expect(engine.dump('app')).toEqual({});
  });

  it('dump() should return empty object for an entirely unknown namespace', () => {
    expect(engine.dump('nonexistent')).toEqual({});
  });

  // ─── getNamespaces() ────────────────────────────────────────────────────────

  it('getNamespaces() should return registered namespaces for the current locale', () => {
    engine.register('alpha', 'en', { KEY: 'a' });
    engine.register('beta', 'en', { KEY: 'b' });
    const ns = engine.getNamespaces();
    expect(ns.has('alpha')).toBe(true);
    expect(ns.has('beta')).toBe(true);
  });

  it('getNamespaces() should return empty set when no namespaces are loaded for the active locale', () => {
    engine.register('app', 'en', { KEY: 'value' });
    engine.setLocale('fr'); // fr has nothing loaded
    expect(engine.getNamespaces().size).toBe(0);
  });
});

