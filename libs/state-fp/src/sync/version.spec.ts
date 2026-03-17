import { describe, it, expect } from 'vitest';
import {
  createVersionVector,
  emptyVersionVector,
  increment,
  merge,
  isStale,
  isGap,
  dominates,
  isConcurrent,
  vectorsEqual,
  clockSum,
} from './version.js';

describe('sync/version', () => {
  it('creates and increments vectors immutably', () => {
    const v1 = createVersionVector('p1');
    const v2 = increment(v1, 'p1');
    expect(v1).toEqual({ p1: 0 });
    expect(v2).toEqual({ p1: 1 });
    expect(emptyVersionVector()).toEqual({});
  });

  it('merges, checks ordering and detects gaps', () => {
    const a = { p1: 2, p2: 1 };
    const b = { p1: 1, p3: 4 };
    expect(merge(a, b)).toEqual({ p1: 2, p2: 1, p3: 4 });

    expect(isStale({ p1: 2 }, { p1: 2 })).toBe(true);
    expect(isStale({ p1: 1 }, { p1: 2 })).toBe(false);
    expect(isGap({ p1: 1 }, { p1: 3 })).toBe(true);
    expect(isGap({ p1: 1 }, { p1: 2 })).toBe(false);

    expect(dominates({ p1: 2 }, { p1: 1 })).toBe(true);
    expect(isConcurrent({ p1: 1 }, { p2: 1 })).toBe(true);
    expect(vectorsEqual({ p1: 1 }, { p1: 1 })).toBe(true);
    expect(clockSum({ p1: 1, p2: 2, p3: 3 })).toBe(6);
  });
});
