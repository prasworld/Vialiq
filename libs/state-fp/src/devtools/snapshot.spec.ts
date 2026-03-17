import { describe, it, expect } from 'vitest';
import { SnapshotManager } from './snapshot.js';

describe('SnapshotManager', () => {
  it('captures immutable snapshots and prunes old entries', () => {
    const m = new SnapshotManager(2);
    const state = { a: { n: 1 } };
    const s1 = m.capture(state, 'e1', 1, 'first');

    state.a.n = 99;
    expect((s1.state.a as { n: number }).n).toBe(1);

    m.capture({ a: { n: 2 } }, 'e2', 2);
    m.capture({ a: { n: 3 } }, 'e3', 3);

    expect(m.list().length).toBe(2);
    expect(m.list().map(s => s.eventCount)).toEqual([2, 3]);
  });

  it('returns get and nearestBefore results correctly', () => {
    const m = new SnapshotManager(5);
    const s1 = m.capture({ c: 1 }, 'e1', 1);
    m.capture({ c: 2 }, 'e2', 5);
    const s3 = m.capture({ c: 3 }, 'e3', 8);

    const found = m.get(s1.id);
    expect(found._tag).toBe('Just');

    const nearest = m.nearestBefore(7);
    expect(nearest._tag).toBe('Just');
    if (nearest._tag === 'Just') expect(nearest.value.eventCount).toBe(5);

    const nearest2 = m.nearestBefore(999);
    expect(nearest2._tag).toBe('Just');
    if (nearest2._tag === 'Just') expect(nearest2.value.id).toBe(s3.id);
  });

  it('supports export/import', () => {
    const m = new SnapshotManager();
    m.capture({ c: 1 }, 'e1', 1, 'snap1');
    const json = m.export();

    const restored = new SnapshotManager();
    restored.import(json);

    expect(restored.list().length).toBe(1);
    expect(restored.list()[0].label).toBe('snap1');
  });
});
