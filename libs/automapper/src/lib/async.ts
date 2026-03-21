import { DefaultStrategy } from './strategy';
import { MappingConfig, MemberRule } from './builder';
import { MapperRegistry } from './core';
import { Constructor } from './types';
import { MapperOptions } from './options';
import { applyNamingConvention } from './naming';
import { setPath, checkCircular, NOT_CIRCULAR, CIRCULAR_IGNORE } from './utils';
import { selectResolver, applySubstitution } from './resolver-helpers';

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
    visited: WeakSet<Record<string, unknown>>,
    ctx?: import('./context').MappingContext
  ): Promise<D> {
    // preCondition — skip entire mapping if predicate fails
    if (config.preCondition && !config.preCondition(src)) {
      return null as unknown as D;
    }

    const dest: Partial<D> = {} as Partial<D>;

    // Per-profile naming convention takes precedence over global option
    const effectiveOptions: MapperOptions = config.namingConvention
      ? { ...options, namingConvention: config.namingConvention }
      : options;

    config.beforeMap?.(src, ctx);

    // Optimization: Identify keys handled by member rules to skip in autoMap
    const explicitKeys = new Set(config.memberRules.map((r) => r.destKey));

    if (options.autoMap !== false) {
      const keys = Object.keys(src as Record<string, unknown>);
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
          (dest as unknown as Record<string, unknown>)[transformed] = mappedValue;
        }
      }
    }

    const typedRules = config.memberRules as MemberRule<S, D, keyof D & string>[];
    for (const r of typedRules) {
      if (r.ignore) {
        delete (dest as Partial<Record<string, unknown>>)[r.destKey];
        continue;
      }

      // Condition guard — skip this rule if condition fails
      if (r.condition && !r.condition(src)) {
        continue;
      }

      // Use shared resolver selection, which may return a Promise
      const resolverResult = selectResolver(r, src, ctx);
      const value = resolverResult instanceof Promise ? await resolverResult : resolverResult;
      const substituted = applySubstitution(value, r);

      if (substituted === undefined) continue;
      if (r.destKey.includes('.')) {
        setPath(dest as unknown as Record<string, unknown>, r.destKey, substituted as unknown);
      } else {
        (dest as Partial<D>)[r.destKey as keyof D] = substituted as unknown as D[keyof D];
      }
    }

      if (effectiveOptions.strict) {
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
      Object.getOwnPropertyNames(src as Record<string, unknown>).forEach((k) => {
        const transformed = applyNamingConvention(k, effectiveOptions.namingConvention);
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

  protected async mapValueAsync(
    registry: MapperRegistry,
    val: unknown,
    depth: number,
    visited: WeakSet<Record<string, unknown>>,
    options: MapperOptions
  ): Promise<unknown> {
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
        const results = await Promise.all(
          val.map((e) => this.mapValueAsync(registry, e, depth + 1, visited, options))
        );
        return results.filter((v) => v !== CIRCULAR_IGNORE);
      }

      const obj = {} as Record<string, unknown>;
      const keys = Object.keys(val as Record<string, unknown>);
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