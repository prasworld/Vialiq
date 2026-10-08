import type { ComponentSchema, FormSchema, LayoutComponentSchema } from '../types';

/**
 * Projects the raw values from a FormGroup into the final API payload based on the schema.
 * Respects `valueMapping` for dual-value controls like Date Picker and Masked Input.
 *
 * @param schema The FormSchema to project against
 * @param formValues The raw values from `FormGroup.getRawValue()`
 * @returns The final serialized object mapping schema keys to projected values
 */
export function serializeForm(schema: FormSchema, formValues: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const processComponent = (comp: ComponentSchema) => {
    // If it has children, traverse them
    if ('components' in comp && Array.isArray((comp as LayoutComponentSchema).components)) {
      (comp as LayoutComponentSchema).components.forEach(processComponent);
    }

    // Only process fields that have a key
    if (comp.key) {
      const value = formValues[comp.key];
      
      if (value !== undefined && value !== null) {
        // If it's a rich FieldValue shape (has value, rawValue, displayValue properties)
        if (
          typeof value === 'object' &&
          'value' in value &&
          'rawValue' in value &&
          'displayValue' in value
        ) {
          // Extract the exact property requested by the schema (default to 'value')
          const mapping = comp.valueMapping || 'value';
          result[comp.key] = (value as Record<string, unknown>)[mapping];
        } else {
          // Standard primitive value or array
          result[comp.key] = value;
        }
      } else {
        result[comp.key] = value; // pass null/undefined through
      }
    }
  };

  schema.components.forEach(processComponent);

  return result;
}
