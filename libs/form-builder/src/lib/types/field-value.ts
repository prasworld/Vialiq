// ─── Rich Field Value ──────────────────────────────────────────────────────────
//
// Captures the three representations that complex form controls produce:
//  - `value`        → the canonical serializable string (ISO date, masked string, etc.)
//  - `displayValue` → the human-readable formatted string (locale date, phone with dashes)
//  - `rawValue`     → the structured/unmasked model (DateComponents, bare digits, number)
//
// The form renderer stores these objects in its Signal state tree. The
// FormSerializer then projects the correct key into the API payload at submit
// time, driven by the field's `valueMapping` setting.

/**
 * Minimal date components shape mirroring vi-date-picker's DateComponents.
 * Kept inline to avoid a circular dependency on @vialiq/web-components.
 */
export interface DateComponents {
  day: number;
  month: number;
  year: number;
}

export interface FieldValue<TRaw = unknown> {
  /** The canonical serializable string (e.g. ISO date, formatted masked string). */
  value: string;
  /** The human-readable display string (e.g. locale date, "(123) 456-7890"). */
  displayValue: string;
  /** The structured raw model — type varies per control. */
  rawValue: TRaw;
}

// Concrete aliases for the components that produce dual values

/** vi-masked-input: rawValue is the unmasked digit string. */
export type MaskedFieldValue = FieldValue<string>;

/** vi-date-picker: rawValue is a DateComponents object (or null for range/week). */
export type DateFieldValue = FieldValue<DateComponents | null>;

/**
 * Controls which key of FieldValue is extracted into the API submit payload.
 * Stored on BaseComponentSchema.valueMapping.
 */
export type FieldValueMapping = 'value' | 'rawValue' | 'displayValue';
