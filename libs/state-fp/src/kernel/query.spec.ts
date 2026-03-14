import { describe, it, expect } from 'vitest';
import { query, createQueryHandler, QueryBus } from './query.js';

// ─── query() factory ─────────────────────────────────────────────────────────

describe('query', () => {
  it('creates a Query with _kind = Query', () => {
    const q = query('counter/getCount');
    expect(q._kind).toBe('Query');
    expect(q.type).toBe('counter/getCount');
  });

  it('attaches a payload when provided', () => {
    const q = query('cart/getItem', { id: '123' });
    expect((q as { payload: { id: string } }).payload).toEqual({ id: '123' });
  });

  it('omits payload when not provided', () => {
    const q = query('no/payload') as Record<string, unknown>;
    expect('payload' in q).toBe(false);
  });
});

// ─── createQueryHandler() ────────────────────────────────────────────────────

describe('createQueryHandler', () => {
  it('is an identity wrapper that returns the config', () => {
    type S = { count: number };
    const handler = createQueryHandler<S, ReturnType<typeof query>, number>({
      queryType: 'counter/getCount',
      handle:   (state) => state.count,
    });
    expect(handler.queryType).toBe('counter/getCount');
    expect(handler.handle({ count: 5 }, query('counter/getCount'))).toBe(5);
  });
});

// ─── QueryBus ─────────────────────────────────────────────────────────────────

describe('QueryBus', () => {
  type CounterState = { count: number };

  const makeHandler = () =>
    createQueryHandler<CounterState, ReturnType<typeof query>, number>({
      queryType: 'counter/getCount',
      handle:   (state) => state.count,
    });

  it('throws when no handler is registered (invariant I3)', () => {
    const bus = new QueryBus();
    expect(() =>
      bus.execute('vi/counter', { count: 0 }, query('counter/getCount')),
    ).toThrow(/counter\/getCount/);
  });

  it('executes the registered handler and returns the result', () => {
    const bus = new QueryBus();
    bus.register('vi/counter', makeHandler());

    const result = bus.execute('vi/counter', { count: 7 }, query('counter/getCount'));
    expect(result).toBe(7);
  });

  it('supports different handlers on different atoms for the same query type', () => {
    const bus = new QueryBus();

    bus.register('atomA', createQueryHandler<CounterState, ReturnType<typeof query>, string>({
      queryType: 'counter/getCount',
      handle:   (state) => `A:${state.count}`,
    }));
    bus.register('atomB', createQueryHandler<CounterState, ReturnType<typeof query>, string>({
      queryType: 'counter/getCount',
      handle:   (state) => `B:${state.count}`,
    }));

    expect(bus.execute('atomA', { count: 1 }, query('counter/getCount'))).toBe('A:1');
    expect(bus.execute('atomB', { count: 2 }, query('counter/getCount'))).toBe('B:2');
  });

  it('clear() removes all handlers — throw after clear', () => {
    const bus = new QueryBus();
    bus.register('vi/counter', makeHandler());
    bus.clear();

    expect(() =>
      bus.execute('vi/counter', { count: 0 }, query('counter/getCount')),
    ).toThrow();
  });
});
