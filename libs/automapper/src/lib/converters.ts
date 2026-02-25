// type converter registry and helpers

import { Constructor } from './types';

/**
 * A simple function that converts a value of type `S` to type `D`.
 */
export type TypeConverter<S, D> = (src: S) => D;

/**
 * Token used to identify a type in the registry.  Can be a constructor,
 * a string name, or any object with a `name` property (useful for unions).
 */
export type ConverterToken<T> = Constructor<T> | string | { name: string };

/**
 * Registry storing converters keyed by [source][destination] type pair.
 * Used by strategies and builders when mapping values explicitly via
 * `mapWith` or when the destination type is known.
 */
export class ConverterRegistry {
  private map = new Map<unknown, Map<unknown, TypeConverter<unknown, unknown>>>();

  register<S, D>(
    srcType: ConverterToken<S>,
    destType: ConverterToken<D>,
    converter: TypeConverter<S, D>
  ) {
    let srcMap = this.map.get(srcType);
    if (!srcMap) {
      srcMap = new Map();
      this.map.set(srcType, srcMap);
    }
    srcMap.set(destType, converter as TypeConverter<unknown, unknown>);
  }

  get<S, D>(
    srcType: ConverterToken<S>,
    destType: ConverterToken<D>
  ): TypeConverter<S, D> | undefined {
    return this.map.get(srcType)?.get(destType) as TypeConverter<S, D> | undefined;
  }

  copyFrom(other: ConverterRegistry) {
    for (const [src, destMap] of other.map.entries()) {
      for (const [dest, converter] of destMap.entries()) {
        this.register(
          src as ConverterToken<unknown>,
          dest as ConverterToken<unknown>,
          converter
        );
      }
    }
  }
}

// shared default registry and built‑ins
export const defaultConverterRegistry = new ConverterRegistry();

// populate defaults
defaultConverterRegistry.register(String, Number, (v: string) => Number(v));
defaultConverterRegistry.register(Number, String, (v: number) => String(v));
defaultConverterRegistry.register(String, Date, (v: string) => new Date(v));
defaultConverterRegistry.register(Date, String, (v: Date) => v.toISOString());
