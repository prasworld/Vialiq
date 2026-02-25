import { MappingConfig } from './builder';
import { MapperOptions } from './options';
import { applyNamingConvention } from './naming';
import type { MapperRegistry } from './core';
import { setPath, checkCircular, NOT_CIRCULAR, CIRCULAR_IGNORE } from './utils';

/**
 * A pluggable strategy is responsible for mapping a source object to a
 * destination representation.  Multiple strategies may be registered; the
 * registry chooses the first one whose `canHandle` returns `true`.
 */
export interface MappingStrategy {
  canHandle(source: unknown, destType: unknown, config?: MappingConfig<unknown, unknown>): boolean;
  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<object>
  ): D | Promise<D>;
}

/**
 * Default mapping strategy which handles plain objects, arrays, and
 * recursive mapping.  This is registered automatically in the mapper
 * registry and performs the bulk of the work unless a plugin overrides
 * it.
 */
export class DefaultStrategy implements MappingStrategy {
  canHandle(_source: unknown, _destType: unknown, _config?: MappingConfig<unknown, unknown>): boolean {
    return true;
  }

  /**
   * Perform the mapping according to the provided configuration and
   * options.  This method handles auto‑mapping, member rules, strict
   * mode validation, and recursion.  It returns either a value or a
   * promise (the latter when used via `AsyncStrategy`).
   */
  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> = { memberRules: [] },
    options: MapperOptions = {},
    visited: WeakSet<object>
  ): D | Promise<D> {
    const dest = {} as Record<string, unknown>;

    config.beforeMap?.(src);

    // Optimization: Identify keys handled by member rules to skip in autoMap
    const explicitKeys = new Set(config.memberRules.map((r) => r.destKey));

    if (options.autoMap !== false) {
      Object.keys(src as object).forEach(k => {
        const transformed = applyNamingConvention(k, options.namingConvention);
        if (explicitKeys.has(transformed)) {
          return;
        }
        const mappedValue = this.mapValue(
          registry,
          (src as Record<string, unknown>)[k],
          0,
          visited,
          options
        );
        if (mappedValue !== CIRCULAR_IGNORE as unknown) {
          dest[transformed] = mappedValue;
        }
      });
    }

    config.memberRules.forEach(r => {
      if (r.ignore) {
        delete dest[r.destKey];
        return;
      }
      
      const value = r.mapFrom ? r.mapFrom(src) : undefined;
      if (value === undefined) return;

      this.setValue(dest, r.destKey, value);
    });

    // strict mode validation: require explicit mapping or allowed destination props
    if (options.strict) {
      let allowedKeys: string[] | undefined;
      if (typeof destType === 'function') {
        try {
          allowedKeys = Object.keys(new (destType as any)());
        } catch {
          allowedKeys = undefined;
        }
      }
      const srcName = (src as object).constructor.name;
      const destName =
        typeof destType === 'string'
          ? destType
          : (destType as { name?: string }).name || 'Unknown';

      Object.keys(src as object).forEach(k => {
        const transformed = applyNamingConvention(k, options.namingConvention);
        if (allowedKeys) {
          if (!allowedKeys.includes(transformed)) {
            throw new Error(
              `Strict mapping failed: property '${k}' was not mapped to destination ${destName} from source ${srcName}`
            );
          }
        } else {
          if (dest[transformed] === undefined) {
            throw new Error(
              `Strict mapping failed: property '${k}' was not mapped to destination ${destName} from source ${srcName}`
            );
          }
        }
      });
    }

    config.afterMap?.(dest);

    return dest as D;
  }

  /**
   * Helper that assigns a value to a destination object, supporting
   * dotted paths to create nested objects.
   */
  protected setValue(dest: Record<string, unknown>, key: string, value: unknown) {
    if (key.includes('.')) {
      setPath(dest, key, value);
    } else {
      dest[key] = value;
    }
  }

  /**
   * Recursive helper that maps an arbitrary value, respecting depth
   * limits, circular checks, and naming conventions.  Called for
   * nested objects and array elements.
   */
  protected mapValue(
    registry: MapperRegistry,
    val: unknown,
    depth: number,
    visited: WeakSet<object>,
    options: MapperOptions
  ): unknown {
    if (val === null || val === undefined) return val;

    if (val && typeof val === 'object') {
      const circularCheck = checkCircular(val as object, visited, options.circularRefBehavior);
      if (circularCheck !== NOT_CIRCULAR) {
        return circularCheck;
      }

      if (options.maxDepth !== undefined && depth >= options.maxDepth) {
        return val;
      }
      if (Array.isArray(val)) {
        return val
          .map((e) => this.mapValue(registry, e, depth + 1, visited, options))
          .filter((v) => v !== CIRCULAR_IGNORE);
      }
      const obj = {} as Record<string, unknown>;
      Object.keys(val as object).forEach(k => {
        const transformed = applyNamingConvention(k, options.namingConvention);
        const res = this.mapValue(
          registry,
          (val as Record<string, unknown>)[k],
          depth + 1,
          visited,
          options
        );
        if (res !== CIRCULAR_IGNORE as unknown) {
          obj[transformed] = res;
        }
      });
      return obj;
    }
    return val;
  }
}