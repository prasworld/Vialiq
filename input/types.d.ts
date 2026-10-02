/**
 * Supported input types.
 * Constrained to the subset that renders as a single-line text field —
 * multi-line (textarea) and specialised pickers (date, color, file) are
 * separate components.
 */
export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';
/**
 * Standard HTML autocomplete attribute values.
 * Exported as an array for consuming applications (like form builders) to use as options.
 */
export declare const AUTOCOMPLETE_VALUES: readonly ["on", "off", "name", "given-name", "family-name", "email", "username", "new-password", "current-password", "one-time-code", "organization", "street-address", "address-line1", "address-line2", "address-level2", "address-level1", "postal-code", "country", "tel", "url"];
export type AutocompleteValue = (typeof AUTOCOMPLETE_VALUES)[number] | (string & {});
//# sourceMappingURL=types.d.ts.map