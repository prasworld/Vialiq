import { MappingConfig } from './builder';
import { MapperRegistry } from './core';
import { MapperOptions } from './options';
import { MappingStrategy } from './strategy';

/**
 * Wrapper strategy that measures and logs the time taken by an inner
 * strategy.  Useful for diagnostics and performance tuning.
 */
export class ProfilingStrategy implements MappingStrategy {
  constructor(
    private readonly strategy: MappingStrategy,
    private readonly log: (msg: string) => void = console.log
  ) {}

  canHandle(
    source: unknown,
    destType: unknown,
    config?: MappingConfig<unknown, unknown>
  ): boolean {
    return this.strategy.canHandle(source, destType, config);
  }

  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<object>
  ): D | Promise<D> {
    const start = Date.now();
    const result = this.strategy.map(
      registry,
      src,
      destType,
      config,
      options,
      visited
    );

    if (result instanceof Promise) {
      return result.then((res) => {
        this.report(src, destType, Date.now() - start);
        return res;
      }) as Promise<D>;
    }

    this.report(src, destType, Date.now() - start);
    return result;
  }

  private report(src: unknown, destType: unknown, duration: number) {
    const srcName =
      src && typeof src === 'object'
        ? (src as object).constructor.name
        : String(src);
    const destName =
      typeof destType === 'string'
        ? destType
        : (destType as { name: string }).name || 'Unknown';
    this.log(`[AutoMapper] ${srcName} -> ${destName} took ${duration}ms`);
  }
}