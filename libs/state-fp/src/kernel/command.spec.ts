import { describe, it, expect } from 'vitest';
import { command, createCommandHandler, CommandBus } from './command.js';
import { domainEvent } from './event.js';
import { right, left } from '../core/either.js';
import type { Command } from './types.js';

// ─── command() factory ────────────────────────────────────────────────────────

describe('command', () => {
  it('creates a Command with the given type', () => {
    const cmd = command('counter/increment');
    expect(cmd._kind).toBe('Command');
    expect(cmd.type).toBe('counter/increment');
  });

  it('attaches payload when provided', () => {
    const cmd = command('counter/incrementBy', { n: 5 });
    expect(cmd.payload).toEqual({ n: 5 });
  });

  it('auto-generates a correlationId', () => {
    const cmd = command('x');
    expect(typeof cmd.meta?.correlationId).toBe('string');
    expect(cmd.meta!.correlationId.length).toBeGreaterThan(0);
  });

  it('auto-generates a unique correlationId for each command', () => {
    const cmd = command('x');
    // correlationId is auto-assigned in factory — each call produces a UUID
    const cmd2 = command('x');
    expect(cmd.meta!.correlationId).not.toBe(cmd2.meta!.correlationId);
  });

  it('sets a positive timestamp', () => {
    const cmd = command('x');
    expect(cmd.meta!.timestamp).toBeGreaterThan(0);
  });

  it('includes causationId when provided in meta', () => {
    const cmd = command('x', undefined, { causationId: 'parent-001' });
    expect((cmd.meta as { causationId?: string }).causationId).toBe('parent-001');
  });

  it('includes issuedBy when provided in meta', () => {
    const cmd = command('x', undefined, { issuedBy: 'user-42' });
    expect((cmd.meta as { issuedBy?: string }).issuedBy).toBe('user-42');
  });
});

// ─── createCommandHandler() ──────────────────────────────────────────────────

describe('createCommandHandler', () => {
  it('is an identity wrapper — returns the config object', () => {
    type S = { count: number };
    type C = Command<'inc'>;
    const handler = createCommandHandler<S, C>({
      commandType: 'inc',
      handle: (state) => right([domainEvent('incremented')]),
    });
    expect(handler.commandType).toBe('inc');
    expect(typeof handler.handle).toBe('function');
  });
});

// ─── CommandBus ───────────────────────────────────────────────────────────────

describe('CommandBus', () => {
  type CounterState = { count: number };

  const makeHandler = () =>
    createCommandHandler<CounterState, Command>({
      commandType: 'inc',
      handle: (state) => right([domainEvent('counter/incremented')]),
    });

  it('execute returns Left(NO_HANDLER) when no handler is registered', () => {
    const bus = new CommandBus();
    const cmd = command('unknown');
    const result = bus.execute('vi/counter', { count: 0 }, cmd);
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') {
      expect(result.left.code).toBe('NO_HANDLER');
    }
  });

  it('execute routes to the registered handler', () => {
    const bus = new CommandBus();
    bus.register('vi/counter', makeHandler());

    const cmd = command('inc');
    const result = bus.execute('vi/counter', { count: 0 }, cmd);
    expect(result._tag).toBe('Right');
  });

  it('handler returning Left propagates the error', () => {
    const bus = new CommandBus();
    bus.register('vi/counter', createCommandHandler<CounterState, Command>({
      commandType: 'badCmd',
      handle: () => left({ code: 'INVALID', message: 'nope' }),
    }));

    const result = bus.execute('vi/counter', { count: 0 }, command('badCmd'));
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') {
      expect(result.left.code).toBe('INVALID');
    }
  });

  it('supports different handlers on different atoms for the same command type', () => {
    const bus = new CommandBus();
    let atomAHit = false;
    let atomBHit = false;

    bus.register('atomA', createCommandHandler<CounterState, Command>({
      commandType: 'inc',
      handle: () => { atomAHit = true; return right([]); },
    }));
    bus.register('atomB', createCommandHandler<CounterState, Command>({
      commandType: 'inc',
      handle: () => { atomBHit = true; return right([]); },
    }));

    bus.execute('atomA', { count: 0 }, command('inc'));
    expect(atomAHit).toBe(true);
    expect(atomBHit).toBe(false);
  });

  it('clear() removes all handlers', () => {
    const bus = new CommandBus();
    bus.register('vi/counter', makeHandler());
    bus.clear();
    const result = bus.execute('vi/counter', { count: 0 }, command('inc'));
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') {
      expect(result.left.code).toBe('NO_HANDLER');
    }
  });
});
