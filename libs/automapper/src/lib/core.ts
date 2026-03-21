import { MappingBuilder, MappingConfig } from './builder';
import { MapperOptions } from './options';
import {
  ConverterRegistry,
  defaultConverterRegistry,
  TypeConverter,
  ConverterToken,
} from './converters';
import { Constructor } from './types';
import { DefaultStrategy, MappingStrategy } from './strategy';
import { MapperPlugin, PluginAwareRegistry, PLUGIN_API_VERSION, PluginMetadata } from './plugin';
import { checkCircular, CIRCULAR_IGNORE, NOT_CIRCULAR } from './utils';
import { createContext } from './context';

/**
 * A function used to configure mappings between a source and destination
 * type.  The provided `MappingBuilder` is used to define member rules,
 * hooks, etc.
 */
export type MappingProfile<S, D> = (builder: MappingBuilder<S, D>) => void;

export interface Mapper<S, D> {
  /**
   * Execute the mapping on a single source object.  Returns either a
   * direct value or a `Promise` when asynchronous strategies are involved.
   */
  (source: S): D | Promise<D>;
}

/**
 * Registry instance returned by `createMapper`.  It maintains profiles,
 * strategies, and converter registrations, and exposes the main
 * mapping API used by consumers.
 */
export interface MapperRegistry {
  addProfile<S, D>(
    source: Constructor<S> | string,
    dest: Constructor<D> | string,
    profile: MappingProfile<S, D>
  ): void;
  getMapper<S, D>(
    source: Constructor<S> | string,
    dest: Constructor<D> | string
  ): Mapper<S, D>;
  map<S, D>(src: S, destType: Constructor<D> | string, visited?: WeakSet<Record<string, unknown>>): D | Promise<D>;
  mapArray<S, D>(src: S[], destType: Constructor<D> | string): D[] | Promise<D[]>;
  addStrategy(strategy: MappingStrategy): void;
  registerConverter<TS, TD>(
    srcType: ConverterToken<TS>,
    destType: ConverterToken<TD>,
    converter: TypeConverter<TS, TD>
  ): void;
  /** Expose current strategy pipeline (read-only) for plugins/tools. */
  getStrategies(): MappingStrategy[];
  /**
   * Validate that every registered member rule has at least one resolver
   * (`mapFrom`, `mapWith`, `fromValue`, `mapFromAsync`, or `ignore`).
   * Throws an `Error` listing all offending rules when any are found.
   */
  assertConfigurationIsValid(): void;
}

function getTypeKey(type: Constructor<unknown> | string): string {
  return typeof type === 'string' ? type : type.name;
}

class MapperRegistryImpl implements MapperRegistry, PluginAwareRegistry {
  private profiles = new Map<string, MappingConfig<unknown, unknown>>();
  private strategies: MappingStrategy[] = [new DefaultStrategy()];
  private converters = new ConverterRegistry();
  private pluginRegistry = new Map<string, MapperPlugin>();

  constructor(private options: MapperOptions = {}) {
    // copy defaults
    this.converters.copyFrom(defaultConverterRegistry);
  }

  private getProfileKey(
    src: Constructor<unknown> | string,
    dest: Constructor<unknown> | string
  ): string {
    return `${getTypeKey(src)}->${getTypeKey(dest)}`;
  }

  addProfile<S, D>(
    source: Constructor<S> | string,
    dest: Constructor<D> | string,
    profileFn: MappingProfile<S, D>
  ): void {
    const builder = new MappingBuilder<S, D>();
    profileFn(builder);
    const config = builder.build();
    const key = this.getProfileKey(source, dest);
    this.profiles.set(key, config as MappingConfig<unknown, unknown>);
    // notify plugins about new profile
    for (const p of this.pluginRegistry.values()) {
      p.onProfileAdded?.(key, config as unknown);
    }
  }

  getMapper<S, D>(
    source: Constructor<S> | string,
    dest: Constructor<D> | string
  ): Mapper<S, D> {
    return (src: S) => this.map(src, dest);
  }

  map<S, D>(
    src: S,
    destType: Constructor<D> | string,
    visited: WeakSet<Record<string, unknown>> = new WeakSet(),
    ctx?: import('./context').MappingContext
  ): D | Promise<D> {
    if (src === null || src === undefined) {
      return src as unknown as D;
    }
    if (src && typeof src === 'object') {
      const check = checkCircular(src as Record<string, unknown>, visited, this.options.circularRefBehavior);
      if (check !== NOT_CIRCULAR) return check as D;
    }
    const srcType = ((src as unknown) as Record<string, unknown>).constructor as Constructor<S>;
    const key = this.getProfileKey(srcType, destType);
    const config = this.profiles.get(key) as MappingConfig<S, D> | undefined;

    const strat = this.strategies.find(s => s.canHandle(src, destType, config as MappingConfig<unknown, unknown> | undefined));
    if (!strat) {
      throw new Error(`No strategy found to map ${srcType} to ${destType}`);
    }

    // Ensure a MappingContext exists so hooks and resolvers can use it.
    ctx = ctx ?? createContext({});

    // Notify plugins about map start and report end/error. Keep mapping
    // result semantics (sync vs async) intact by wrapping promises.
    const start = Date.now();
    for (const p of this.pluginRegistry.values()) {
      try {
        p.onMapStart?.(src as unknown, destType as unknown);
      } catch {
        // plugin errors shouldn't break mapping
      }
    }

    let result: D | Promise<D>;
    try {
      result = strat.map(this, src, destType, config, this.options, visited, ctx);
    } catch (err) {
      // synchronous error from strategy: notify plugins and rethrow
      for (const p of this.pluginRegistry.values()) {
        try {
          p.onMapError?.(src as unknown, destType as unknown, err as Error);
        } catch {
          /* noop */
        }
      }
      throw err;
    }
    const reportEnd = (res: unknown) => {
      const duration = Date.now() - start;
      for (const p of this.pluginRegistry.values()) {
        try {
          p.onMapEnd?.(src as unknown, (res as unknown) as unknown, duration);
        } catch {
          // swallow plugin errors
        }
      }
      return res as D;
    };
    const reportError = (err: Error) => {
      for (const p of this.pluginRegistry.values()) {
        try {
          p.onMapError?.(src as unknown, destType as unknown, err);
        } catch {
          /* noop */
        }
      }
      throw err;
    };

    if (result instanceof Promise) {
      return result.then(reportEnd).catch((e) => {
        reportError(e);
        throw e;
      }) as Promise<D>;
    }

    try {
      return reportEnd(result as unknown) as D;
    } catch (e) {
      return reportError(e as Error) as never;
    }
  }

  mapArray<S, D>(src: S[], destType: Constructor<D> | string): D[] | Promise<D[]> {
    const visited = new WeakSet<Record<string, unknown>>();
    const results = src.map(s => this.map(s, destType, visited));
    if (results.some(r => r instanceof Promise)) {
      return Promise.all(results).then((res) =>
        res.filter((r) => r !== CIRCULAR_IGNORE)
      ) as Promise<D[]>;
    }
    return results.filter((r) => r !== CIRCULAR_IGNORE) as D[];
  }

  addStrategy(s: MappingStrategy) {
    this.strategies.unshift(s);
  }

  getStrategies(): MappingStrategy[] {
    return [...this.strategies];
  }

  assertConfigurationIsValid(): void {
    const errors: string[] = [];
    for (const [profileKey, config] of this.profiles.entries()) {
      for (const rule of config.memberRules) {
        const r = rule as Record<string, unknown>;
        const hasResolver =
          rule.ignore ||
          rule.mapFrom ||
          rule.mapFromAsync ||
          r['mapWith'] !== undefined ||
          r['fromValue'] !== undefined;
        if (!hasResolver) {
          errors.push(
            `Profile '${profileKey}': member '${rule.destKey}' has no resolver (mapFrom, mapWith, fromValue, mapFromAsync, or ignore)`
          );
        }
      }
    }
    if (errors.length) {
      throw new Error(`Mapping configuration is invalid:\n${errors.join('\n')}`);
    }
  }

  use(plugin: MapperPlugin): void {
    const validation = this.options.pluginValidation ?? 'warn';
    if (plugin.metadata.apiVersion !== PLUGIN_API_VERSION) {
      if (validation === 'error') {
        throw new Error(
          `[automapper] Plugin "${plugin.metadata.id}" targets API ${plugin.metadata.apiVersion} but current API is ${PLUGIN_API_VERSION}. Install aborted.`
        );
      }
      if (validation === 'warn') {
        console.warn(
          `[automapper] Plugin "${plugin.metadata.id}" targets API ${plugin.metadata.apiVersion} but current API is ${PLUGIN_API_VERSION}. This may cause issues.`
        );
      }
      // when 'off', do nothing
    }
    if (this.pluginRegistry.has(plugin.metadata.id)) {
      throw new Error(`Plugin "${plugin.metadata.id}" is already installed.`);
    }
    this.pluginRegistry.set(plugin.metadata.id, plugin);
    this.strategies.unshift(plugin.strategy);
    // Call onInstall but rollback if it throws to avoid leaving the
    // registry in a partially installed state.
    try {
      plugin.onInstall?.(this as PluginAwareRegistry);
    } catch (err) {
      // remove plugin and its strategy (first occurrence)
      this.pluginRegistry.delete(plugin.metadata.id);
      const idx = this.strategies.indexOf(plugin.strategy);
      if (idx !== -1) this.strategies.splice(idx, 1);
      throw err;
    }
  }

  installedPlugins(): PluginMetadata[] {
    return [...this.pluginRegistry.values()].map((p) => p.metadata);
  }

  hasPlugin(id: string): boolean {
    return this.pluginRegistry.has(id);
  }

  registerConverter<TS, TD>(
    srcType: ConverterToken<TS>,
    destType: ConverterToken<TD>,
    converter: TypeConverter<TS, TD>
  ) {
    this.converters.register(srcType, destType, converter);
  }
}

/**
 * Factory helper to create a configured mapper registry.  Options like
 * `strict`, naming convention, and circular behavior may be provided.
 */
export function createMapper(options: MapperOptions = {}): MapperRegistry {
  return new MapperRegistryImpl(options);
}
