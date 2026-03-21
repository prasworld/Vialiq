import { MappingConfig, MemberRule } from './builder';
import { MapperOptions } from './options';
import { applyNamingConvention } from './naming';
import type { MapperRegistry } from './core';
import { Constructor } from './types';
import { setPath, checkCircular, NOT_CIRCULAR, CIRCULAR_IGNORE } from './utils';
import { selectResolver, applySubstitution } from './resolver-helpers';

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
    visited: WeakSet<Record<string, unknown>>,
    ctx?: import('./context').MappingContext
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
    visited: WeakSet<Record<string, unknown>>,
    ctx?: import('./context').MappingContext
  ): D | Promise<D> {
    const dest: Partial<D> = {} as Partial<D>;

    config.beforeMap?.(src, ctx);

    // Optimization: Identify keys handled by member rules to skip in autoMap
    const explicitKeys = new Set(config.memberRules.map((r) => r.destKey));

    if (options.autoMap !== false) {
      Object.keys(src as Record<string, unknown>).forEach(k => {
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
          (dest as unknown as Record<string, unknown>)[transformed] = mappedValue;
        }
      });
    }

    // Handle typed member rules where possible so assignments are type-checked
    const typedRules = config.memberRules as MemberRule<S, D, keyof D & string>[];
    for (const r of typedRules) {
      // Condition guard — check FIRST so condition() cannot bypass ignore()
      if (r.condition && !r.condition(src)) {
        continue;
      }

      if (r.ignore) {
        // remove property if present
        delete (dest as Partial<Record<string, unknown>>)[r.destKey];
        continue;
      }

      // Use shared resolver selection
      const value = selectResolver(r, src, ctx);
      const substituted = applySubstitution(value, r);

      if (substituted === undefined) continue;
      if (r.destKey.includes('.')) {
        // nested path — fall back to dynamic setPath
        setPath(dest as unknown as Record<string, unknown>, r.destKey, substituted as unknown);
      } else {
        (dest as Partial<D>)[r.destKey as keyof D] = substituted as unknown as D[keyof D];
      }
    }

    // strict mode validation: require explicit mapping or allowed destination props
    if (options.strict) {
      let allowedKeys: string[] | undefined;
      if (typeof destType === 'function') {
        try {
          const inst = new (destType as Constructor<unknown>)() as Record<string, unknown>;
          allowedKeys = Object.keys(inst);
        } catch {
          allowedKeys = undefined;
        }
      }
      const srcName = ((src as unknown) as Record<string, unknown>).constructor.name;
      const destName =
        typeof destType === 'string'
          ? destType
          : (destType as { name?: string }).name || 'Unknown';

      Object.keys(src as Record<string, unknown>).forEach(k => {
        const transformed = applyNamingConvention(k, options.namingConvention);
        if (allowedKeys) {
          if (!allowedKeys.includes(transformed)) {
            throw new Error(
              `Strict mapping failed: property '${k}' was not mapped to destination ${destName} from source ${srcName}`
            );
          }
        } else {
          if ((dest as unknown as Record<string, unknown>)[transformed] === undefined) {
            throw new Error(
              `Strict mapping failed: property '${k}' was not mapped to destination ${destName} from source ${srcName}`
            );
          }
        }
      });
    }

    config.afterMap?.(dest as D, ctx);

    return dest as D;
  }

  /**
   * Helper that assigns a value to a destination object, supporting
   * dotted paths to create nested objects.
   */
  protected setValue<D>(dest: Partial<D>, key: string, value: unknown) {
    if (key.includes('.')) {
      setPath(dest as unknown as Record<string, unknown>, key, value);
    } else {
      (dest as Partial<Record<string, unknown>>)[key] = value;
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
    visited: WeakSet<Record<string, unknown>>,
    options: MapperOptions
  ): unknown {
    if (val === null || val === undefined) return val;

    if (val && typeof val === 'object') {
      const circularCheck = checkCircular(val as Record<string, unknown>, visited, options.circularRefBehavior);
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
      Object.keys(val as Record<string, unknown>).forEach(k => {
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