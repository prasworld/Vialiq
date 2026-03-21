import { TypeConverter, ITypeConverter, normalizeConverter } from './converters';
import { NamingConvention, NamingConventionFn } from './options';

// rule builder for a single member
/**
 * Describes how a single destination property should be populated.
 */
export interface MemberRule<S, D, K extends string = string> {
  destKey: K;
  mapFrom?: (src: S, ctx?: import('./context').MappingContext) => K extends keyof D ? D[K & keyof D] : unknown;
  mapFromAsync?: (src: S, ctx?: import('./context').MappingContext) => Promise<K extends keyof D ? D[K & keyof D] : unknown>;
  ignore?: boolean;
  mapWith?: TypeConverter<S, K extends keyof D ? D[K & keyof D] : unknown>;
  /** Only apply this rule when `condition(src)` returns true. */
  condition?: (src: S) => boolean;
  /** Replace the resolved value when it is null or undefined. */
  nullSubstitution?: K extends keyof D ? D[K & keyof D] : unknown;
  /** Use this value when the resolved value is undefined. */
  defaultValue?: K extends keyof D ? D[K & keyof D] : unknown;
  /** Emit a constant value. Can be set to undefined to omit the property. */
  fromValue?: K extends keyof D ? D[K & keyof D] : unknown;
  /** Track which optional fields were explicitly configured (to distinguish undefined from not-set). */
  __configured?: { fromValue?: boolean; nullSubstitution?: boolean; defaultValue?: boolean };
}

// configuration object collected by profile
/**
 * Internal representation of all rules and hooks for a mapping profile.
 * Plugins may add arbitrary additional keys via `extend`.
 */
export interface MappingConfig<S, D> {
  memberRules: Array<MemberRule<S, D, keyof D & string> | MemberRule<S, D, string>>;
  beforeMap?: (src: S, ctx?: import('./context').MappingContext) => void;
  afterMap?: (dst: D, ctx?: import('./context').MappingContext) => void;
  extensions?: Record<string, unknown>;
  /** Skip entire mapping (return null) when predicate returns false. */
  preCondition?: (src: S) => boolean;
  /** Override the global naming convention for this profile. */
  namingConvention?: NamingConvention | NamingConventionFn;
}

// helper type used by forMember callback
/**
 * Methods exposed to the user inside a `forMember` callback.  These
 * mutate an internal `MemberRule` object.
 */
export interface TypedMemberOpts<S, TDest> {
  mapFrom(fn: (s: S, ctx?: import('./context').MappingContext) => TDest): void;
  mapFromAsync(fn: (s: S, ctx?: import('./context').MappingContext) => Promise<TDest>): void;
  ignore(): void;
  mapWith<U extends TDest>(converter: TypeConverter<S, U> | ITypeConverter<S, U>): void;
  /** Map a constant value — useful for flags, defaults, and version stamps. */
  fromValue(val: TDest): void;
  /** Only run this mapping rule when the predicate returns true. */
  condition(fn: (s: S) => boolean): void;
  /** Use `val` when the resolved value is null or undefined. */
  nullSubstitution(val: TDest): void;
  /** Use `val` when the resolved value is undefined. */
  defaultValue(val: TDest): void;
}

export interface MemberOpts<S> {
  mapFrom(fn: (s: S, ctx?: import('./context').MappingContext) => unknown): void;
  mapFromAsync(fn: (s: S, ctx?: import('./context').MappingContext) => Promise<unknown>): void;
  ignore(): void;
  mapWith<U>(converter: TypeConverter<S, U> | ITypeConverter<S, U>): void;
  fromValue(val: unknown): void;
  condition(fn: (s: S) => boolean): void;
  nullSubstitution(val: unknown): void;
  defaultValue(val: unknown): void;
}

// builder passed to profile callbacks
/**
 * Builder used in profile definitions (`addProfile`).  Users call APIs
 * such as `forMember`, `beforeMap`, and others to populate a
 * `MappingConfig` which the registry will later execute.
 */
export class MappingBuilder<S, D> {
  private config: MappingConfig<S, D> = { memberRules: [] };

  forMember<K extends keyof D & string>(
    dest: K,
    opts: (rule: TypedMemberOpts<S, D[K]>) => void
  ): this;

  forMember(
    dest: string,
    opts: (rule: MemberOpts<S>) => void
  ): this;

  forMember(
    dest: string,
    opts: (rule: MemberOpts<S>) => void
  ): this {
    const rule: MemberRule<S, D> = { destKey: dest as string };

    opts({
      mapFrom(fn: (s: S) => unknown) {
        rule.mapFrom = fn as unknown as MemberRule<S, D>['mapFrom'];
      },
      mapFromAsync(fn: (s: S) => Promise<unknown>) {
        rule.mapFromAsync = fn as unknown as MemberRule<S, D>['mapFromAsync'];
      },
      ignore() {
        rule.ignore = true;
      },
      mapWith<U>(converter: TypeConverter<S, U> | ITypeConverter<S, U>) {
        rule.mapWith = normalizeConverter(converter) as unknown as MemberRule<S, D>['mapWith'];
      },
      fromValue(val: unknown) {
        rule.fromValue = val as unknown as MemberRule<S, D>['fromValue'];
        if (!rule.__configured) rule.__configured = {};
        rule.__configured.fromValue = true;
      },
      condition(fn: (s: S) => boolean) {
        rule.condition = fn;
      },
      nullSubstitution(val: unknown) {
        rule.nullSubstitution = val as unknown as MemberRule<S, D>['nullSubstitution'];
        if (!rule.__configured) rule.__configured = {};
        rule.__configured.nullSubstitution = true;
      },
      defaultValue(val: unknown) {
        rule.defaultValue = val as unknown as MemberRule<S, D>['defaultValue'];
        if (!rule.__configured) rule.__configured = {};
        rule.__configured.defaultValue = true;
      },
    });

    this.config.memberRules.push(rule);
    return this;
  }

  /**
   * Hook executed before mapping begins.
   */
  beforeMap(fn: (src: S, ctx?: import('./context').MappingContext) => void): this {
    this.config.beforeMap = fn;
    return this;
  }
  /**
   * Hook executed after mapping completes.
   */
  afterMap(fn: (dst: D, ctx?: import('./context').MappingContext) => void): this {
    this.config.afterMap = fn;
    return this;
  }
  /**
   * Skip the entire mapping and return `null` when the predicate returns false.
   * Evaluated once per `map()` call before any member rules are applied.
   *
   * @example
   * builder.preCondition(src => src.active === true);
   */
  preCondition(fn: (src: S) => boolean): this {
    this.config.preCondition = fn;
    return this;
  }
  /**
   * Override the global naming convention for this profile only.
   * Accepts a built-in `NamingConvention` or a custom `NamingConventionFn`.
   */
  setNamingConvention(convention: NamingConvention | NamingConventionFn): this {
    this.config.namingConvention = convention;
    return this;
  }
  /**
   * Attach arbitrary data to the configuration; consumed by plugins.
   */
  extend<T>(key: string, value: T): this {
    (this.config as unknown as Record<string, unknown>)[key] = value;
    return this;
  }
  /**
   * Finalize and return the configuration object.
   */
  build(): MappingConfig<S, D> {
    return this.config;
  }
}
