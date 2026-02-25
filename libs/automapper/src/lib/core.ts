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
import { checkCircular, CIRCULAR_IGNORE, NOT_CIRCULAR } from './utils';

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
  map<S, D>(src: S, destType: Constructor<D> | string, visited?: WeakSet<object>): D | Promise<D>;
  mapArray<S, D>(src: S[], destType: Constructor<D> | string): D[] | Promise<D[]>;
  addStrategy(strategy: MappingStrategy): void;
  registerConverter<TS, TD>(
    srcType: ConverterToken<TS>,
    destType: ConverterToken<TD>,
    converter: TypeConverter<TS, TD>
  ): void;
}

function getTypeKey(type: Constructor<unknown> | string): string {
  return typeof type === 'string' ? type : type.name;
}

class MapperRegistryImpl implements MapperRegistry {
  private profiles = new Map<string, MappingConfig<unknown, unknown>>();
  private strategies: MappingStrategy[] = [new DefaultStrategy()];
  private converters = new ConverterRegistry();

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
    visited: WeakSet<object> = new WeakSet()
  ): D | Promise<D> {
    if (src === null || src === undefined) {
      return src as unknown as D;
    }
    if (src && typeof src === 'object') {
      const check = checkCircular(src, visited, this.options.circularRefBehavior);
      if (check !== NOT_CIRCULAR) return check as D;
    }
    const srcType = (src as object).constructor as Constructor<S>;
    const key = this.getProfileKey(srcType, destType);
    const config = this.profiles.get(key) as MappingConfig<S, D> | undefined;

    const strat = this.strategies.find(s => s.canHandle(src, destType, config as MappingConfig<unknown, unknown> | undefined));
    if (!strat) {
      throw new Error(`No strategy found to map ${srcType} to ${destType}`);
    }

    return strat.map(this, src, destType, config, this.options, visited);
  }

  mapArray<S, D>(src: S[], destType: Constructor<D> | string): D[] | Promise<D[]> {
    const visited = new WeakSet<object>();
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
