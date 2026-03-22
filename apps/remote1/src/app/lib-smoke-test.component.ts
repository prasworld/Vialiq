/**
 * Library smoke-test component for remote1.
 *
 * Exercises every subpath import to prove they all resolve and type-check
 * correctly inside a `@nx/angular:webpack-browser` build:
 *
 *   @vi/automapper            – createMapper
 *   @vi/automapper/angular    – provideAutomapper, AUTOMAPPER_TOKEN
 *   @vi/automapper/orm        – profileFromColumns
 *   @vi/automapper/deep-clone – deepClone
 *   @vi/state-fp/core         – just, nothing, isJust, isNothing, right, left
 *   @vi/state-fp/kernel       – defineAtom, createKernel, command, domainEvent,
 *                               createCommandHandler, createEventApplier
 *
 * This component is NEVER shipped to users — it exists purely so that
 * `npx nx build remote1` verifies the end-to-end import chain.
 */
import { Component, OnInit } from '@angular/core';

// ── @vi/automapper (core) ─────────────────────────────────────────────────────
import { createMapper } from '@vi/automapper';

// ── @vi/automapper/angular ────────────────────────────────────────────────────
import { provideAutomapper, AUTOMAPPER_TOKEN } from '@vi/automapper/angular';

// ── @vi/automapper/orm ────────────────────────────────────────────────────────
import { profileFromColumns } from '@vi/automapper/orm';

// ── @vi/automapper/deep-clone ─────────────────────────────────────────────────
import { deepClone } from '@vi/automapper/deep-clone';

// ── @vi/state-fp/core ─────────────────────────────────────────────────────────
import { just, nothing, isJust, isNothing, right, left } from '@vi/state-fp/core';

// ── @vi/state-fp/kernel ───────────────────────────────────────────────────────
import {
  defineAtom,
  createKernel,
  command,
  domainEvent,
  createCommandHandler,
  createEventApplier,
} from '@vi/state-fp/kernel';
import type { Command } from '@vi/state-fp/kernel';

// ─── Exported provider token (referenced in app.config.ts if needed) ──────────
export { AUTOMAPPER_TOKEN };
export const REMOTE1_AUTOMAPPER_PROVIDER = provideAutomapper({ autoMap: false });

// ─── Domain types ─────────────────────────────────────────────────────────────

// Must be a class (not interface) so it can serve as an automapper registry key.
class UserEntity {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  passwordHash!: string; // intentionally absent from DTO
}

interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface CounterState { count: number }

// ─── state-fp wiring ──────────────────────────────────────────────────────────

const counterAtom = defineAtom<CounterState>({
  key: 'remote1/counter',
  initialState: { count: 0 },
});

// Use base Command type; narrow inside handle() with a cast.
const incrementHandler = createCommandHandler<CounterState, Command>({
  commandType: 'remote1/counter/increment',
  validate: (payload) => {
    const p = payload as { by?: number };
    return typeof p?.by === 'number' && p.by > 0
      ? right(undefined as void)
      : left({ code: 'VALIDATION_ERROR' as const, message: 'by must be > 0' });
  },
  handle: (_state, cmd) => {
    const by = (cmd as unknown as { payload: { by: number } }).payload.by;
    return right([domainEvent('remote1/counter/incremented', { by })]);
  },
});

const counterApplier = createEventApplier<CounterState>({
  'remote1/counter/incremented': (s, e) => ({
    count: s.count + (e as unknown as { payload: { by: number } }).payload.by,
  }),
});

// ─── Smoke-test component ─────────────────────────────────────────────────────

@Component({
  selector: 'app-lib-smoke-test',
  template: `<section><h3>Library smoke-test</h3><pre>{{ output }}</pre></section>`,
})
export class LibSmokeTestComponent implements OnInit {
  output = '';

  ngOnInit(): void {
    const lines: string[] = [];

    // ── @vi/automapper core + orm ────────────────────────────────────────────
    const mapper = createMapper({ autoMap: false });
    // UserEntity is a class, so it can be used as the registry key directly.
    mapper.addProfile(UserEntity, 'UserDto',
      profileFromColumns<UserEntity, UserDto>(['id', 'firstName', 'lastName', 'email']),
    );
    const entity = Object.assign(new UserEntity(), {
      id: 1, firstName: 'Ada', lastName: 'Lovelace',
      email: 'ada@example.com', passwordHash: 'secret',
    });
    const dto = mapper.map(entity, 'UserDto') as UserDto;
    lines.push('automapper/orm   ok: ' + dto.firstName + ' ' + dto.lastName);
    lines.push('automapper/orm   passwordHash excluded: ' + !('passwordHash' in (dto as object)));

    // ── @vi/automapper/deep-clone ─────────────────────────────────────────────
    const original = { nested: { value: 42 } };
    const clone = deepClone(original);
    clone.nested.value = 99;
    lines.push(`deep-clone       → original unmodified: ${original.nested.value === 42}`);

    // ── @vi/state-fp/core ─────────────────────────────────────────────────────
    const maybeVal  = just(42);
    const maybeNone = nothing<number>();
    lines.push(`state-fp/core    → isJust(just(42)):     ${isJust(maybeVal)}`);
    lines.push(`state-fp/core    → isNothing(nothing()): ${isNothing(maybeNone)}`);

    // ── @vi/state-fp/kernel (synchronous execute) ─────────────────────────────
    const kernel = createKernel();
    kernel.register(counterAtom, incrementHandler, counterApplier);
    const result = kernel.execute(counterAtom, command('remote1/counter/increment', { by: 5 }));
    if (result._tag === 'Right') {
      lines.push(`state-fp/kernel  → new count: ${(result.right as CounterState).count}`);
    }

    this.output = lines.join('\n');
  }
}
