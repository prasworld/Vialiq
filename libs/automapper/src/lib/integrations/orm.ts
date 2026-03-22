/**
 * ORM Entity → DTO integration for @vi/automapper.
 *
 * Provides framework-agnostic helpers that auto-generate `MappingProfile`
 * instances from a list of column/field names.  These helpers work with any
 * ORM (TypeORM, MikroORM, Prisma, etc.) or plain class schemas — you supply
 * the column list; the mapper does the rest.
 *
 * For TypeORM specifically, pair this with `reflect-metadata` and
 * `getMetadataArgsStorage()` when you want fully automatic column discovery
 * without listing columns by hand (see `profileFromTypeOrmEntity`).
 *
 * @example — framework-agnostic
 * mapper.addProfile(UserEntity, UserDto, profileFromColumns(['id', 'email', 'name']));
 *
 * @example — with per-column transforms
 * mapper.addProfile(
 *   UserEntity,
 *   UserDto,
 *   profileFromColumns(['id', 'email', 'createdAt'], {
 *     transforms: {
 *       id:        v => String(v),
 *       createdAt: v => (v as Date).toISOString(),
 *     },
 *   })
 * );
 */

import type { MappingProfile } from '../core';
import type { MappingBuilder } from '../builder';

/**
 * Per-column options supplied to `profileFromColumns`.
 */
export interface ColumnTransformMap<S> {
  /** Optional transform applied to a column value before it is written to the destination. */
  [column: string]: (value: unknown, src: S) => unknown;
}

/**
 * Options for `profileFromColumns`.
 */
export interface OrmProfileOptions<S, D> {
  /**
   * Per-column transform functions.  The key is the destination column name.
   * Use this to convert raw DB values (e.g. Date → ISOString, bigint → number).
   */
  transforms?: ColumnTransformMap<S>;

  /**
   * Optional callback to add extra `forMember` rules on top of the
   * auto-generated ones, or to override a specific auto-generated rule.
   */
  overrides?: (builder: MappingBuilder<S, D>) => void;
}

/**
 * Auto-generate a `MappingProfile` from an explicit column/field name list.
 *
 * For each name in `columns` a `mapFrom(src => src[name])` rule is created.
 * An optional `transforms` map can apply per-column value conversions.
 *
 * This helper is intentionally ORM-agnostic: it works with TypeORM, MikroORM,
 * Sequelize, Prisma, or any schema where you know the column names.
 *
 * @param columns  Array of destination (DTO) property names to map.
 * @param options  Optional transforms and/or additional overrides.
 *
 * @example
 * const profile = profileFromColumns<UserEntity, UserDto>(
 *   ['id', 'email', 'name', 'createdAt'],
 *   { transforms: { id: v => String(v) } }
 * );
 * mapper.addProfile(UserEntity, UserDto, profile);
 */
export function profileFromColumns<S extends object, D extends object>(
  columns: ReadonlyArray<keyof D & string>,
  options?: OrmProfileOptions<S, D>
): MappingProfile<S, D> {
  return (builder: MappingBuilder<S, D>) => {
    for (const col of columns) {
      const transform = options?.transforms?.[col as string];
      // Downcast only at the forMember boundary to avoid fighting the
      // complex conditional generic inference on MappingBuilder.
      (builder as unknown as MappingBuilder<S, Record<string, unknown>>).forMember(
        col as string,
        (o) => {
          if (transform) {
            o.mapFrom((src: S) => transform((src as Record<string, unknown>)[col as string], src));
          } else {
            o.mapFrom((src: S) => (src as Record<string, unknown>)[col as string]);
          }
        }
      );
    }

    options?.overrides?.(builder);
  };
}

/**
 * Descriptor that describes an ORM entity's mappable fields.
 * Use when you want type-safe column listing alongside optional transforms.
 *
 * @example
 * const userDescriptor: EntityDescriptor<UserEntity, UserDto> = {
 *   columns: ['id', 'email', 'name'],
 *   transforms: { id: v => String(v) },
 * };
 * mapper.addProfile(UserEntity, UserDto, profileFromDescriptor(userDescriptor));
 */
export interface EntityDescriptor<S extends object, D extends object> {
  /** List of DTO property names to be auto-mapped from the entity. */
  columns: ReadonlyArray<keyof D & string>;
  /** Per-column transform functions keyed by destination property name. */
  transforms?: ColumnTransformMap<S>;
}

/**
 * Convenience wrapper around `profileFromColumns` that accepts an
 * `EntityDescriptor` object.  Useful when descriptors are shared or
 * generated from schema metadata.
 *
 * @example
 * export const USER_DESCRIPTOR: EntityDescriptor<UserEntity, UserDto> = {
 *   columns: ['id', 'email', 'name'],
 * };
 *
 * mapper.addProfile(UserEntity, UserDto, profileFromDescriptor(USER_DESCRIPTOR));
 */
export function profileFromDescriptor<S extends object, D extends object>(
  descriptor: EntityDescriptor<S, D>,
  overrides?: (builder: MappingBuilder<S, D>) => void
): MappingProfile<S, D> {
  return profileFromColumns<S, D>(descriptor.columns, {
    transforms: descriptor.transforms,
    overrides,
  });
}
