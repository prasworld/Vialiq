import { engine } from './translation-engine';

describe('TranslationEngine', () => {
  beforeEach(() => {
    // Clear out the engine's internal state (as it is a singleton for the app)
    // To properly test the singleton without adding a test-only method,
    // we can use a fresh instance or manually clear the registry via our knowledge of it,
    // but TS might complain about private fields. Let's just cast it.
    (engine as any).registry.clear();
    (engine as any)._currentLocale = 'en';
  });

  it('should register and flatten nested JSON', () => {
    engine.register('form', {
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
    engine.register('errors', {
      ERRORS: {
        MAX_LENGTH: '{{FIELD_NAME}} must not exceed {{MAX}} characters'
      }
    });

    const result = engine.instant('ERRORS.MAX_LENGTH', { FIELD_NAME: 'Email', MAX: 100 });
    expect(result).toBe('Email must not exceed 100 characters');
  });

  it('should retain un-interpolated variables if missing', () => {
    engine.register('test', { MSG: 'Hello {{NAME}}!' });
    const result = engine.instant('MSG');
    expect(result).toBe('Hello {{NAME}}!');
  });

  it('should interpolate deep object paths', () => {
    engine.register('test', { MSG: 'Welcome {{user.profile.name}}!' });
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

  it('should merge keys from multiple registrations of the same namespace (for fallback locales)', () => {
    engine.register('form', { FORM: { ADVERSE_EVENT: 'Adverse Event (EN)', OTHER: 'Other (EN)' } });
    engine.register('form', { FORM: { ADVERSE_EVENT: 'Événement indésirable (FR)' } });

    // FR overrides EN, but OTHER is retained from EN
    expect(engine.instant('FORM.ADVERSE_EVENT')).toBe('Événement indésirable (FR)');
    expect(engine.instant('FORM.OTHER')).toBe('Other (EN)');
  });
});
