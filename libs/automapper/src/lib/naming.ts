import { NamingConvention, NamingConventionFn } from './options';

// actual transformer implementations
/**
 * Mapping of naming convention to transformation function.  Each function
 * converts an incoming property name into the desired style.
 */
export const namingTransformers: Record<NamingConvention, (s: string) => string> = {
  [NamingConvention.CamelCase]: (s: string) =>
    s.replace(/([-_][a-z])/gi, (g) => g.toUpperCase().replace(/[-_]/, '')),

  [NamingConvention.SnakeCase]: (s: string) =>
    s
      .replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
      .replace(/^_/, ''),

  [NamingConvention.PascalCase]: (s: string) => {
    const camel = namingTransformers[NamingConvention.CamelCase](s);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  },
};

/**
 * Apply a naming convention to a property key; if no convention is
 * supplied the original key is returned unchanged.
 * Accepts either a built-in `NamingConvention` enum or a custom function.
 */
export function applyNamingConvention(
  prop: string,
  convention?: NamingConvention | NamingConventionFn
): string {
  if (!convention) return prop;
  if (typeof convention === 'function') return convention(prop);
  const transformer = namingTransformers[convention];
  return transformer ? transformer(prop) : prop;
}

/**
 * Create a custom naming convention function from any string transform.
 * The returned function can be used anywhere `NamingConventionFn` is accepted.
 *
 * @example
 * const screamingSnake = createNamingConvention(k => k.toUpperCase().replace(/-/g, '_'));
 * createMapper({ namingConvention: screamingSnake });
 */
export function createNamingConvention(fn: NamingConventionFn): NamingConventionFn {
  return fn;
}
