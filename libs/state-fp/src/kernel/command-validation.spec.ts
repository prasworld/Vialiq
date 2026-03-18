/**
 * Phase 3.5 — Command Payload Validation.
 *
 * The optional `validate` hook on CommandHandler runs before `handle`.
 * Returning Left short-circuits execution — `handle` is never called and the
 * error is surfaced to plugins and the debug layer.
 */

import { describe, it, expect, vi } from 'vitest';
import { createKernel }              from './kernel.js';
import { defineAtom }                from './atom.js';
import { command, createCommandHandler } from './command.js';
import { domainEvent, createEventApplier } from './event.js';
import { right, left }               from '../core/either.js';
import type { Command }              from './types.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

type CounterState = { count: number };
type IncrCmd = Command<'counter/increment', { by: number }>;

const makeCounter = () =>
  defineAtom<CounterState>({ key: 'vi/counter', initialState: { count: 0 } });

const counterApplier = createEventApplier<CounterState>({
  'counter/incremented': (state, event) => ({
    count: state.count + (event as { payload?: { by: number } }).payload!.by,
  }),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 3.5 — Command Payload Validation', () => {
  it('valid payload: validate passes → handle is called, execute returns Right', () => {
    const handleSpy = vi.fn().mockReturnValue(
      right([domainEvent('counter/incremented', { by: 5 })]),
    );
    const validateSpy = vi.fn().mockReturnValue(right(undefined));

    const handler = createCommandHandler<CounterState, IncrCmd>({
      commandType: 'counter/increment',
      validate:    validateSpy,
      handle:      handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, handler, counterApplier);

    const result = kernel.execute(counter, command('counter/increment', { by: 5 }));

    expect(validateSpy).toHaveBeenCalledOnce();
    expect(validateSpy).toHaveBeenCalledWith({ by: 5 });
    expect(handleSpy).toHaveBeenCalledOnce();
    expect(result._tag).toBe('Right');
    expect(counter.get().count).toBe(5);
  });

  it('invalid payload: validate fails → handle is NOT called, returns Left', () => {
    const handleSpy = vi.fn();

    const handler = createCommandHandler<CounterState, IncrCmd>({
      commandType: 'counter/increment',
      validate:    () => left({ code: 'VALIDATION_ERROR', message: 'by must be positive' }),
      handle:      handleSpy as any,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, handler, counterApplier);

    const result = kernel.execute(counter, command('counter/increment', { by: -1 }));

    expect(result._tag).toBe('Left');
    expect((result as { _tag: 'Left'; left: { code: string } }).left.code).toBe('VALIDATION_ERROR');
    expect(handleSpy).not.toHaveBeenCalled();
    // State must NOT have changed
    expect(counter.get().count).toBe(0);
  });

  it('validate failure surfaces to onError plugin', () => {
    const onErrorSpy = vi.fn();

    const handler = createCommandHandler<CounterState, IncrCmd>({
      commandType: 'counter/increment',
      validate:    () => left({ code: 'VALIDATION_ERROR', message: 'negative disallowed' }),
      handle:      vi.fn() as any,
    });

    const kernel  = createKernel();
    kernel.use({ name: 'spy', onError: onErrorSpy });
    const counter = makeCounter();
    kernel.register(counter, handler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: -1 }));

    expect(onErrorSpy).toHaveBeenCalledOnce();
    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('validate failure is recorded by the debug layer with error field', () => {
    const recordSpy = vi.fn();

    const handler = createCommandHandler<CounterState, IncrCmd>({
      commandType: 'counter/increment',
      validate:    () => left({ code: 'VALIDATION_ERROR', message: 'invalid' }),
      handle:      vi.fn() as any,
    });

    const kernel  = createKernel({ debug: { isEnabled: true, record: recordSpy } });
    const counter = makeCounter();
    kernel.register(counter, handler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: -1 }));

    expect(recordSpy).toHaveBeenCalledOnce();
    const entry = recordSpy.mock.calls[0][0] as {
      commandType: string;
      events: unknown[];
      error: { code: string };
    };
    expect(entry.commandType).toBe('counter/increment');
    expect(entry.events).toEqual([]);
    expect(entry.error.code).toBe('VALIDATION_ERROR');
  });

  it('handlers without validate are unaffected — backward compatible', () => {
    const incrementHandler = createCommandHandler<CounterState, IncrCmd>({
      commandType: 'counter/increment',
      handle: (state, cmd) =>
        (cmd as IncrCmd).payload.by > 0
          ? right([domainEvent('counter/incremented', { by: (cmd as IncrCmd).payload.by })])
          : left({ code: 'INVALID', message: 'by must be positive' }),
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const result = kernel.execute(counter, command('counter/increment', { by: 10 }));
    expect(result._tag).toBe('Right');
    expect(counter.get().count).toBe(10);
  });

  it('validate receives undefined payload for void commands', () => {
    type PingCmd = Command<'ping'>;
    const validateSpy = vi.fn().mockReturnValue(right(undefined));

    const handler = createCommandHandler<CounterState, PingCmd>({
      commandType: 'ping',
      validate:    validateSpy,
      handle:      () => right([]),
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, handler, counterApplier);
    kernel.execute(counter, command('ping'));

    expect(validateSpy).toHaveBeenCalledWith(undefined);
  });
});
