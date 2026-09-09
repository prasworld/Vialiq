import type { ComponentSchema } from './component-schemas';

// ─── Form Settings ────────────────────────────────────────────────────────────

/**
 * Form-level settings.
 * NOTE (TD-07): validateOn lives HERE — never on BaseComponentSchema.
 */
export interface FormSettings {
  /**
   * When to trigger validation.
   * - 'onBlur'   — validate when field loses focus
   * - 'onChange' — validate on every value change
   * - 'onSubmit' — validate only on form submission
   */
  validateOn: 'onBlur' | 'onChange' | 'onSubmit';
  /** Max width of the rendered form (CSS value, e.g. '720px') */
  maxWidth?: string;
  /** Submit button label (default: 'Submit') */
  submitLabel?: string;
  /** Cancel button label (default: 'Cancel') */
  cancelLabel?: string;
  /** Message shown after successful submission */
  successMessage?: string;
  /** URL to redirect to after successful submission */
  successRedirectUrl?: string;
}

// ─── Form Schema ──────────────────────────────────────────────────────────────

export interface FormSchema {
  /** Schema format version — used for migration. Currently '1'. */
  schemaVersion: string;
  /** Unique identifier for this form definition */
  id: string;
  title: string;
  display: 'form' | 'wizard';  // wizard is v2+
  components: ComponentSchema[];
  settings?: FormSettings;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
  /** Arbitrary host-application metadata — never interpreted by form-builder/renderer */
  metadata?: Record<string, unknown>;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Creates a valid empty FormSchema with sensible defaults */
export function EMPTY_FORM_SCHEMA(): FormSchema {
  const now = new Date().toISOString();
  return {
    schemaVersion: '1',
    id: crypto.randomUUID(),
    title: 'Untitled Form',
    display: 'form',
    components: [],
    settings: {
      validateOn: 'onBlur',
    },
    createdAt: now,
    updatedAt: now,
  };
}
