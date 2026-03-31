/**
 * Library smoke-test component for remote1.
 *
 * Exercises every subpath import to prove they all resolve and type-check
 * correctly inside a `@nx/angular:webpack-browser` build:
 *
 *   @vialiq/automapper            – createMapper
 *   @vialiq/automapper/angular    – provideAutomapper, AUTOMAPPER_TOKEN
 *   @vialiq/automapper/orm        – profileFromColumns
 *   @vialiq/automapper/deep-clone – deepClone
 *   @vialiq/state-fp/core         – just, nothing, isJust, isNothing
 *   @vialiq/state-fp/kernel       – defineAtom, createKernel, command, domainEvent,
 *                               createCommandHandler, createEventApplier,
 *                               ok, err, match
 *
 * This component is NEVER shipped to users — it exists purely so that
 * `npx nx build remote1` verifies the end-to-end import chain.
 */
import { Component, OnInit } from '@angular/core';

// ── @vialiq/automapper (core) ─────────────────────────────────────────────────
import { createMapper } from '@vialiq/automapper';

// ── @vialiq/automapper/angular ────────────────────────────────────────────────
import { provideAutomapper, AUTOMAPPER_TOKEN } from '@vialiq/automapper/angular';

// ── @vialiq/automapper/orm ────────────────────────────────────────────────────
import { profileFromColumns } from '@vialiq/automapper/orm';

// ── @vialiq/automapper/deep-clone ─────────────────────────────────────────────
import { deepClone } from '@vialiq/automapper/deep-clone';

// ── @vialiq/state-fp/core ─────────────────────────────────────────────────────
import { just, nothing, isJust, isNothing } from '@vialiq/state-fp/core';

// ── @vialiq/state-fp/kernel ───────────────────────────────────────────────────
import {
  defineAtom,
  createKernel,
  command,
  domainEvent,
  createCommandHandler,
  createEventApplier,
  ok,
  err,
  match,
} from '@vialiq/state-fp/kernel';
import type { Command } from '@vialiq/state-fp/kernel';

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
      ? ok(undefined as void)
      : err({ code: 'VALIDATION_ERROR' as const, message: 'by must be > 0' });
  },
  handle: (_state, cmd) => {
    const by = (cmd as unknown as { payload: { by: number } }).payload.by;
    return ok([domainEvent('remote1/counter/incremented', { by })]);
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

    // ── @vialiq/automapper core + orm ────────────────────────────────────────────
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

    // ── @vialiq/automapper/deep-clone ─────────────────────────────────────────────
    const original = { nested: { value: 42 } };
    const clone = deepClone(original);
    clone.nested.value = 99;
    lines.push(`deep-clone       → original unmodified: ${original.nested.value === 42}`);

    // ── @vialiq/state-fp/core ─────────────────────────────────────────────────────
    const maybeVal  = just(42);
    const maybeNone = nothing<number>();
    lines.push(`state-fp/core    → isJust(just(42)):     ${isJust(maybeVal)}`);
    lines.push(`state-fp/core    → isNothing(nothing()): ${isNothing(maybeNone)}`);

    // ── @vialiq/state-fp/kernel (synchronous execute) ─────────────────────────────
    const kernel = createKernel();
    kernel.register(counterAtom, incrementHandler, counterApplier);
    const result = kernel.execute(counterAtom, command('remote1/counter/increment', { by: 5 }));
    const newCount = match(result, {
      ok:  (state) => (state as CounterState).count,
      err: (e) => { lines.push(`state-fp/kernel  → error: ${e.message}`); return -1; },
    });
    lines.push(`state-fp/kernel  → new count: ${newCount}`);

    this.output = lines.join('\n');
  }
}
