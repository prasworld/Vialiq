import { MappingConfig } from '../builder';
import { MapperRegistry } from '../core';
import { MapperOptions } from '../options';
import { MappingStrategy } from '../strategy';

/**
 * Simple example strategy that logs every mapping invocation.
 * This demonstrates how to write a plugin: implement `MappingStrategy`
 * and register it with `mapper.addStrategy()`.
 */
/**
 * Simple example strategy that logs every mapping invocation.
 * This demonstrates how to write a plugin: implement `MappingStrategy`
 * and register it with `mapper.addStrategy()`.
 */
export class LoggingStrategy implements MappingStrategy {
  constructor(private readonly logger: (msg: string) => void = console.log) {}

  canHandle(
    _source: unknown,
    _destType: unknown,
    _config?: MappingConfig<unknown, unknown>
  ): boolean {
    // this strategy can handle anything; it's purely orthogonal
    return true;
  }

  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<Record<string, unknown>>
  ): D | null | Promise<D | null> {
    const srcName = src && typeof src === 'object' ? ((src as unknown) as Record<string, unknown>).constructor.name : String(src);
    const destName = typeof destType === 'string' ? destType : (destType as { name: string }).name || 'Unknown';
    this.logger(`[LoggingStrategy] mapping ${srcName} -> ${destName}`);

    // delegate to default behaviour (use existing strategies by reusing registry)
    // in a more complex plugin you might perform transformations before/after

    // find the next strategy in line (skipping this one) via public accessor
    const next = registry.getStrategies().find((s: MappingStrategy) => s !== this);
    if (!next) {
      throw new Error('No underlying strategy found');
    }
    const result = next.map(registry, src, destType, config, options, visited);
    // if it's a promise, log when resolved
    if (result instanceof Promise) {
      return result.then(r => {
        this.logger(`[LoggingStrategy] finished ${srcName} -> ${destName}`);
        return r;
      }) as Promise<D>;
    }
    this.logger(`[LoggingStrategy] finished ${srcName} -> ${destName}`);
    return result;
  }
}

// Backing plugin wrapper that conforms to MapperPlugin contract
import { PLUGIN_API_VERSION, MapperPlugin, PluginMetadata } from '../plugin';

export class LoggingPlugin implements MapperPlugin {
  readonly metadata: PluginMetadata = {
    id: 'com.vi.logging',
    name: 'Logging Plugin',
    version: '1.0.0',
    apiVersion: PLUGIN_API_VERSION,
    description: 'Logs mapping start/end events',
  };

  readonly strategy: MappingStrategy;

  constructor(private readonly logger: (msg: string) => void = console.log) {
    this.strategy = new LoggingStrategy(this.logger);
  }

  onInstall(): void {
    this.logger('[automapper] LoggingPlugin installed.');
  }

  onMapError(_src: unknown, _dest: unknown, err: Error): void {
    this.logger(`[automapper] ERROR: ${err.message}`);
  }
}
