import { DefaultStrategy } from './strategy';
import { MappingConfig } from './builder';
import { MapperRegistry } from './core';
import { MapperOptions } from './options';
import { applyNamingConvention } from './naming';
import { checkCircular, NOT_CIRCULAR, CIRCULAR_IGNORE } from './utils';

/**
 * Strategy that extends the default synchronous behaviour to support
 * asynchronous member resolvers (`mapFromAsync`).  It mirrors the logic
 * in `DefaultStrategy` but awaits promises and returns a promise when
 * necessary.
 */
export class AsyncStrategy extends DefaultStrategy {
  override canHandle(
    _source: unknown,
    _destType: unknown,
    config?: MappingConfig<unknown, unknown>
  ): boolean {
    return !!config?.memberRules.some((r) => r.mapFromAsync);
  }

  override async map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> = { memberRules: [] },
    options: MapperOptions = {},
    visited: WeakSet<object>
  ): Promise<D> {
    const dest = {} as Record<string, unknown>;

    config.beforeMap?.(src);

    // Optimization: Identify keys handled by member rules to skip in autoMap
    const explicitKeys = new Set(config.memberRules.map((r) => r.destKey));

    if (options.autoMap !== false) {
      const keys = Object.keys(src as object);
      for (const k of keys) {
        const transformed = applyNamingConvention(k, options.namingConvention);
        if (explicitKeys.has(transformed)) {
          continue;
        }
        const mappedValue = await this.mapValueAsync(
          registry,
          (src as Record<string, unknown>)[k],
          0,
          visited,
          options
        );
        if (mappedValue !== CIRCULAR_IGNORE) {
          dest[transformed] = mappedValue;
        }
      }
    }

    for (const r of config.memberRules) {
      if (r.ignore) {
        delete dest[r.destKey];
        continue;
      }

      let value: unknown;
      if (r.mapFromAsync) {
        value = await r.mapFromAsync(src);
      } else if (r.mapFrom) {
        value = r.mapFrom(src);
      }

      if (value !== undefined) {
        this.setValue(dest, r.destKey, value);
      }
    }

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
      Object.getOwnPropertyNames(src as object).forEach((k) => {
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

  protected async mapValueAsync(
    registry: MapperRegistry,
    val: unknown,
    depth: number,
    visited: WeakSet<object>,
    options: MapperOptions
  ): Promise<unknown> {
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
        const results = await Promise.all(
          val.map((e) => this.mapValueAsync(registry, e, depth + 1, visited, options))
        );
        return results.filter((v) => v !== CIRCULAR_IGNORE);
      }

      const obj = {} as Record<string, unknown>;
      const keys = Object.keys(val as object);
      for (const k of keys) {
        const transformed = applyNamingConvention(k, options.namingConvention);
        const res = await this.mapValueAsync(
          registry,
          (val as Record<string, unknown>)[k],
          depth + 1,
          visited,
          options
        );
        if (res !== CIRCULAR_IGNORE) {
          obj[transformed] = res;
        }
      }
      return obj;
    }
    return val;
  }
}