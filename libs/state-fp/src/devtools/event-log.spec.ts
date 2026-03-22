import { describe, it, expect } from 'vitest';
import { EventLog } from './event-log.js';
import type { DebugEntry } from './types.js';

function makeEntry(id: string, atomKey: string, correlationId = 'corr-1', timestamp = 100): DebugEntry {
  return {
    id,
    atomKey,
    correlationId,
    causationId: 'cause-1',
    commandType: 'counter/inc',
    event: {
      _kind: 'DomainEvent',
      type: 'counter/incremented',
      meta: {
        id: `ev-${id}`,
        correlationId,
        causationId: 'cause-1',
        atomKey,
        timestamp,
        version: 1,
      },
    },
    stateBefore: { count: 0 },
    stateAfter: { count: 1 },
    timestamp,
    version: 1,
  };
}

describe('EventLog', () => {
  it('keeps insertion order and supports latest/last queries', () => {
    const log = new EventLog(10);
    log.append(makeEntry('1', 'a', 'c1', 10));
    log.append(makeEntry('2', 'a', 'c1', 20));
    log.append(makeEntry('3', 'b', 'c2', 30));

    expect(log.totalCount).toBe(3);
    expect(log.getAll().map(e => e.id)).toEqual(['1', '2', '3']);
    expect(log.last(2).map(e => e.id)).toEqual(['2', '3']);
    expect(log.latest()._tag).toBe('Just');
  });

  it('evicts oldest items in circular mode and keeps secondary indexes consistent', () => {
    const log = new EventLog(2);
    log.append(makeEntry('1', 'a', 'c1', 10));
    log.append(makeEntry('2', 'a', 'c2', 20));
    log.append(makeEntry('3', 'b', 'c2', 30));

    expect(log.totalCount).toBe(3);
    expect(log.getAll().map(e => e.id)).toEqual(['2', '3']);
    expect(log.getByAtom('a').map(e => e.id)).toEqual(['2']);
    expect(log.getByCorrelation('c2').map(e => e.id)).toEqual(['2', '3']);
    expect(log.getByCorrelation('c1')).toEqual([]);
  });

  it('filters by time range and supports serialize/deserialize', () => {
    const log = new EventLog(10);
    log.append(makeEntry('1', 'a', 'c1', 10));
    log.append(makeEntry('2', 'a', 'c1', 20));
    log.append(makeEntry('3', 'b', 'c2', 30));

    expect(log.getByTimeRange(11, 29).map(e => e.id)).toEqual(['2']);

    const serialized = log.serialize();
    const restored = new EventLog(10);
    restored.deserialize(serialized);
    expect(restored.getAll().map(e => e.id)).toEqual(['1', '2', '3']);
  });

  it('latest() returns Nothing on an empty log', () => {
    const log = new EventLog();
    expect(log.latest()._tag).toBe('Nothing');
  });

  it('getByAtom returns empty array for an atom not in the log', () => {
    const log = new EventLog();
    log.append(makeEntry('1', 'a', 'c1', 10));
    expect(log.getByAtom('no-such-atom')).toEqual([]);
  });
});
