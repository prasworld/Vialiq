/**
 * Angular integration for @vi/automapper.
 *
 * Provides `AUTOMAPPER_TOKEN` (an `InjectionToken`) and `provideAutomapper()`
 * for use with Angular's standalone API (`bootstrapApplication` / `provideX`).
 *
 * **Peer dependency**: `@angular/core` must be installed by the consuming app.
 *
 * @example
 * // main.ts
 * import { provideAutomapper, AUTOMAPPER_TOKEN } from '@vi/automapper/angular';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAutomapper(
 *       { autoMap: true },
 *       mapper => mapper.addProfile(User, UserDto, b => { ... })
 *     ),
 *   ],
 * });
 *
 * // In a service:
 * constructor(@Inject(AUTOMAPPER_TOKEN) private mapper: MapperRegistry) {}
 */

import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { createMapper, MapperRegistry } from '../core';
import type { MapperOptions } from '../options';

/**
 * Angular injection token for the `MapperRegistry` singleton.
 * Inject it as `@Inject(AUTOMAPPER_TOKEN)` in services / components.
 */
export const AUTOMAPPER_TOKEN = new InjectionToken<MapperRegistry>(
  'AUTOMAPPER',
  { factory: () => createMapper() }
);

/**
 * Profile setup callback passed to `provideAutomapper`.
 * Receives the freshly-created `MapperRegistry` instance and should
 * call `addProfile()` (and optionally `addStrategy()` / `use()`) on it.
 */
export type AutomapperProfileSetup = (mapper: MapperRegistry) => void;

/**
 * Create Angular `EnvironmentProviders` that register a `MapperRegistry`
 * singleton under `AUTOMAPPER_TOKEN`.
 *
 * @param options  Mapper-level options (strict, autoMap, naming, etc.)
 * @param profiles One or more profile-setup callbacks.
 *
 * @example
 * provideAutomapper(
 *   { autoMap: true },
 *   mapper => mapper.addProfile(User, UserDto, b => b.forMember('name', o => o.mapFrom(s => s.name)))
 * )
 */
export function provideAutomapper(
  options?: MapperOptions,
  ...profiles: AutomapperProfileSetup[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: AUTOMAPPER_TOKEN,
      useFactory: () => {
        const mapper = createMapper(options ?? {});
        for (const setup of profiles) {
          setup(mapper);
        }
        return mapper;
      },
    },
  ]);
}
