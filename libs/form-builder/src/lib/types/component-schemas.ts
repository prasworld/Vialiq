import type { ValidationRule } from './validation';
import type { ConditionalRule } from './conditional';
import type { OptionSource } from './option-source';
import type { ColumnsConfig, TabsConfig, PanelConfig, FieldsetConfig, RepeaterConfig, ContentSwitcherConfig } from './layout-schemas';
import type { FieldValueMapping } from './field-value';

// ─── Encryption ───────────────────────────────────────────────────────────────

export interface FieldEncryptionConfig {
  enabled: boolean;
  lockedAt?: string;    // ISO-8601 timestamp
  algorithm?: string;
  authorisedRoles?: string[];
}

// ─── Base ─────────────────────────────────────────────────────────────────────

/**
 * Fields shared by every component schema.
 * NOTE (TD-07): validateOn is intentionally NOT here — it lives only on FormSettings.
 */
export interface BaseComponentSchema {
  id: string;
  type: string;
  /** camelCase field key — used as form data key and in conditional references */
  key?: string;
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  locked?: boolean;
  labelPosition?: 'top' | 'left' | 'hidden';
  /** Description/hint text rendered below the control */
  description?: string;
  /** Size scale — controls padding and font size. Not all controls support all sizes. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Stretch the control to fill its container width. Applies to button controls. */
  fullWidth?: boolean;
  /** Custom metadata injected by host applications (e.g., CDISC OID) */
  metadata?: Record<string, unknown>;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  /** Field-level repeating (distinct from RepeaterConfig layout component) */
  isRepeating?: boolean;
  minRepeat?: number;
  maxRepeat?: number;
  addLabel?: string;
  encryption?: FieldEncryptionConfig;
  /**
   * For dual-value controls (masked-input, date-picker), controls which
   * representation is extracted into the API payload at submit time.
   * - 'value'        — the canonical serialized string (default)
   * - 'rawValue'     — the unmasked / structured value
   * - 'displayValue' — the human-readable formatted string
   */
  valueMapping?: FieldValueMapping;
}

// ─── Input Fields ─────────────────────────────────────────────────────────────

export interface InputComponentSchema extends BaseComponentSchema {
  type: 'text-input' | 'email' | 'password' | 'tel';
  placeholder?: string;
  defaultValue?: string;
  autocomplete?: string;
  maxlength?: number;
}

export interface MaskedInputComponentSchema extends BaseComponentSchema {
  type: 'masked-input';
  placeholder?: string;
  defaultValue?: string;
  autocomplete?: string;
  maxlength?: number;
  mask: string;
  inputType?: 'text' | 'tel' | 'email' | 'url' | 'password';
  alwaysShowMask?: boolean;
  // valueMapping inherited from BaseComponentSchema — use 'rawValue' to submit
  // unmasked digits, 'value' (default) to submit the formatted string.
}

export interface NumberComponentSchema extends BaseComponentSchema {
  type: 'number';
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaComponentSchema extends BaseComponentSchema {
  type: 'textarea';
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  maxlength?: number;
  /** CSS resize direction for the textarea handle */
  resize?: 'none' | 'vertical' | 'both';
  /** Show character counter (requires maxlength) */
  charCount?: boolean;
}

// ─── Date / Time Fields ───────────────────────────────────────────────────────

export interface DateComponentSchema extends BaseComponentSchema {
  type: 'date' | 'time' | 'datetime-local';
  defaultValue?: string;  // ISO-8601
  min?: string;
  max?: string;
  step?: number;
  placeholder?: string;
}

// ─── Selection Fields ─────────────────────────────────────────────────────────

export interface SelectComponentSchema extends BaseComponentSchema {
  type: 'select';
  optionSource?: OptionSource;
  // NOTE: multiple selection is intentionally omitted — vi-select has no `multiple` attr.
  // Use ComboboxComponentSchema with freeText or a dedicated multi mode instead.
  clearable?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export interface ComboboxComponentSchema extends BaseComponentSchema {
  type: 'combobox';
  optionSource?: OptionSource;
  freeText?: boolean;
  clearable?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export interface CheckboxGroupComponentSchema extends BaseComponentSchema {
  type: 'checkbox-group';
  optionSource?: OptionSource;
  defaultValue?: string[];
}

export interface RadioGroupComponentSchema extends BaseComponentSchema {
  type: 'radio-group';
  optionSource?: OptionSource;
  defaultValue?: string;
}

// ─── Toggle Fields ────────────────────────────────────────────────────────────

export interface CheckboxComponentSchema extends BaseComponentSchema {
  type: 'checkbox';
  defaultValue?: boolean;
  checkboxLabel?: string;  // label shown next to the checkbox itself
}

export interface RadioComponentSchema extends BaseComponentSchema {
  type: 'radio';
  value: string;  // the value submitted when this radio is selected
}

// ─── Upload Fields ────────────────────────────────────────────────────────────

export interface UploadComponentSchema extends BaseComponentSchema {
  type: 'upload';
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  hideThumbnail?: boolean;
}

// ─── Utility Fields ───────────────────────────────────────────────────────────

export interface HiddenComponentSchema extends BaseComponentSchema {
  type: 'hidden';
  defaultValue?: string;
}

export interface ContentComponentSchema extends BaseComponentSchema {
  type: 'content';
  /** HTML content to display (sanitized by renderer) */
  content?: string;
}

export interface DividerComponentSchema extends BaseComponentSchema {
  type: 'divider';
}

// ─── Button Fields ────────────────────────────────────────────────────────────

export interface ButtonComponentSchema extends BaseComponentSchema {
  type: 'button' | 'submit';
  buttonLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  action?: 'submit' | 'reset' | 'saveState' | 'custom';
}

// ─── Layout Components ────────────────────────────────────────────────────────

export interface LayoutComponentSchema extends BaseComponentSchema {
  type: 'panel' | 'columns' | 'tabs' | 'fieldset' | 'repeater' | 'content-switcher';
  components: ComponentSchema[];
  layoutConfig: PanelConfig | ColumnsConfig | TabsConfig | FieldsetConfig | RepeaterConfig | ContentSwitcherConfig;
}

// ─── Discriminated Union ──────────────────────────────────────────────────────

export type ComponentSchema =
  | InputComponentSchema
  | MaskedInputComponentSchema
  | NumberComponentSchema
  | TextareaComponentSchema
  | DateComponentSchema
  | SelectComponentSchema
  | ComboboxComponentSchema
  | CheckboxGroupComponentSchema
  | RadioGroupComponentSchema
  | CheckboxComponentSchema
  | RadioComponentSchema
  | HiddenComponentSchema
  | ContentComponentSchema
  | DividerComponentSchema
  | ButtonComponentSchema
  | UploadComponentSchema
  | LayoutComponentSchema;

/** Component types that can hold children */
export type LayoutType = 'panel' | 'columns' | 'tabs' | 'fieldset' | 'repeater' | 'content-switcher';

/** Component types that are leaf field inputs (not layout containers) */
export type FieldType = Exclude<ComponentSchema['type'], LayoutType>;
