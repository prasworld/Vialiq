import { TypeConverter } from './converters';

// rule builder for a single member
/**
 * Describes how a single destination property should be populated.
 */
export interface MemberRule<S, D> {
  destKey: string;
  mapFrom?: (src: S) => unknown;
  mapFromAsync?: (src: S) => Promise<unknown>;
  ignore?: boolean;
}

// configuration object collected by profile
/**
 * Internal representation of all rules and hooks for a mapping profile.
 * Plugins may add arbitrary additional keys via `extend`.
 */
export interface MappingConfig<S, D> {
  memberRules: MemberRule<S, D>[];
  beforeMap?: (src: any) => void;
  afterMap?: (dst: any) => void;
  [key: string]: unknown; // extension point
}

// helper type used by forMember callback
/**
 * Methods exposed to the user inside a `forMember` callback.  These
 * mutate an internal `MemberRule` object.
 */
export interface MemberOpts<S> {
  mapFrom(fn: (s: S) => unknown): void;
  mapFromAsync(fn: (s: S) => Promise<unknown>): void;
  ignore(): void;
  mapWith<U>(converter: TypeConverter<S, U>): void;
}

// builder passed to profile callbacks
/**
 * Builder used in profile definitions (`addProfile`).  Users call APIs
 * such as `forMember`, `beforeMap`, and others to populate a
 * `MappingConfig` which the registry will later execute.
 */
export class MappingBuilder<S, D> {
  private config: MappingConfig<S, D> = { memberRules: [] };

  forMember<T extends keyof D>(
    dest: T | string,
    opts: (rule: MemberOpts<S>) => void
  ): this {
    const rule: MemberRule<S, D> = { destKey: dest as string };

    opts({
      mapFrom(fn: (s: S) => unknown) {
        rule.mapFrom = fn;
      },
      mapFromAsync(fn: (s: S) => Promise<unknown>) {
        rule.mapFromAsync = fn;
      },
      ignore() {
        rule.ignore = true;
      },
      mapWith<U>(converter: TypeConverter<S, U>) {
        rule.mapFrom = converter as unknown as (src: S) => unknown;
      },
    });

    this.config.memberRules.push(rule);
    return this;
  }

  /**
   * Hook executed before mapping begins.
   */
  beforeMap(fn: (src: S) => void): this {
    this.config.beforeMap = fn;
    return this;
  }
  /**
   * Hook executed after mapping completes.
   */
  afterMap(fn: (dst: D) => void): this {
    this.config.afterMap = fn;
    return this;
  }
  /**
   * Attach arbitrary data to the configuration; consumed by plugins.
   */
  extend<T>(key: string, value: T): this {
    (this.config as Record<string, unknown>)[key] = value;
    return this;
  }
  /**
   * Finalize and return the configuration object.
   */
  build(): MappingConfig<S, D> {
    return this.config;
  }
}
