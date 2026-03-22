/**
 * Zod integration for @vi/automapper.
 *
 * Provides `profileFromZod()` which auto-generates a `MappingProfile`
 * from a Zod object schema, mapping each schema key from the matching
 * source property, and optionally validating the mapped output.
 *
 * **Peer dependency**: `zod` (v4) must be installed by the consuming app.
 *
 * @example
 * const UserDtoSchema = z.object({ name: z.string(), age: z.number() });
 *
 * mapper.addProfile(
 *   User,
 *   'UserDto',
 *   profileFromZod<User, typeof UserDtoSchema>(UserDtoSchema, { strict: true })
 * );
 */

import { z } from 'zod';
import type { MappingProfile } from '../core';
import type { MappingBuilder } from '../builder';

/**
 * Options passed to `profileFromZod`.
 */
export interface ZodProfileOptions<S, D> {
  /**
   * When `true`: an `afterMap` hook is added that calls `schema.parse(result)`.
   * If the mapped output does not satisfy the schema a `ZodError` is thrown.
   * Default: `false`.
   */
  strict?: boolean;

  /**
   * Optional callback to add additional `forMember` rules on top of the
   * auto-generated ones, or to override a specific auto-generated rule.
   */
  overrides?: (builder: MappingBuilder<S, D>) => void;
}

/**
 * Structural constraint for any Zod object schema that exposes `.shape`.
 */
type AnyZodObject = z.ZodObject<Record<string, z.ZodType>>;

/**
 * Auto-generate a `MappingProfile` from a Zod object schema.
 *
 * For each key in the schema shape a `mapFrom(src => src[key])` rule is
 * created, mapping the identically-named source property to the destination.
 * Keys present in the schema but absent on the source will map as `undefined`.
 *
 * @param schema   Any `z.object({...})` schema describing the destination.
 * @param options  Optional: enable strict validation, or add overrides.
 *
 * @example
 * const schema = z.object({ id: z.string(), score: z.number() });
 *
 * mapper.addProfile(Src, 'Dest', profileFromZod(schema, { strict: true }));
 * mapper.map(src, 'Dest'); // throws ZodError if mapped result is invalid
 */
export function profileFromZod<S extends object, T extends AnyZodObject>(
  schema: T,
  options?: ZodProfileOptions<S, z.infer<T>>
): MappingProfile<S, z.infer<T>> {
  type D = z.infer<T>;
  return (builder: MappingBuilder<S, D>) => {
    const keys = Object.keys(schema.shape) as Array<keyof D & string>;

    for (const key of keys) {
      // Use `as any` only at the forMember boundary to avoid fighting the
      // complex conditional generic inference — the public profile type is
      // still fully typed.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builder as unknown as MappingBuilder<S, Record<string, unknown>>).forMember(
        key,
        (o) => {
          o.mapFrom((src: S) => (src as Record<string, unknown>)[key]);
        }
      );
    }

    if (options?.strict) {
      builder.afterMap((dst: D) => {
        // Throws ZodError when the mapped result does not satisfy the schema.
        schema.parse(dst);
      });
    }

    options?.overrides?.(builder);
  };
}

/**
 * Validate arbitrary data against a Zod schema, returning the typed result.
 * Throws a `ZodError` on failure.
 *
 * @example
 * const dto = validateWithZod(UserDtoSchema, mapper.map(user, 'UserDto'));
 */
export function validateWithZod<D>(schema: z.ZodType<D>, data: unknown): D {
  return schema.parse(data);
}

/**
 * Safe variant of `validateWithZod` — returns a `{ success, data, error }`
 * object instead of throwing.
 *
 * @example
 * const result = safeValidateWithZod(UserDtoSchema, mapped);
 * if (!result.success) console.error(result.error);
 */
export function safeValidateWithZod<D>(
  schema: z.ZodType<D>,
  data: unknown
): ReturnType<z.ZodType<D>['safeParse']> {
  return schema.safeParse(data);
}
