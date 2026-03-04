// configuration interfaces and naming-convention enum

/**
 * Behavior to use when a circular reference is detected during mapping.
 * - `'throw'` will raise an error.
 * - `'ignore'` will skip the property.
 * - `'null'` will replace the value with `null`.
 */
export type CircularRefBehavior = 'throw' | 'ignore' | 'null';

/**
 * Supported naming conventions that the mapper can apply to property keys.
 */
export enum NamingConvention {
  CamelCase = 'camel',
  SnakeCase = 'snake',
  PascalCase = 'pascal',
}

/**
 * Configuration options that modify how the mapper behaves.
 */
export interface MapperOptions {
  /**
   * When true, mapping will throw an error if a source property is
   * not explicitly handled or auto‑mapped.
   */
  strict?: boolean;             // throw on unmapped properties
  /**
   * Automatically copy properties with the same name (after applying
   * naming convention) if no explicit mapping rule exists.
   */
  autoMap?: boolean;            // copy same-named props automatically
  /**
   * Apply a naming convention transformation to all property keys.
   */
  namingConvention?: NamingConvention;
  /**
   * Maximum depth to recurse when mapping nested objects/arrays.
   */
  maxDepth?: number;            // prevent unbounded recursion
  /**
   * Strategy for handling circular references during mapping.
   */
  circularRefBehavior?: CircularRefBehavior;
  /**
   * How strictly to enforce plugin API version compatibility.
   * - `'warn'` (default): emit a console warning when plugin `apiVersion`
   *   differs from the runtime `PLUGIN_API_VERSION`.
   * - `'error'`: throw when the versions differ.
   * - `'off'`: do not validate plugin API versions.
   */
  pluginValidation?: 'warn' | 'error' | 'off';
}
