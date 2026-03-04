import { describe, it, expect } from 'vitest';
import { checkCircular, CIRCULAR_IGNORE, NOT_CIRCULAR, setPath, getPath } from '../utils';

describe('utils targeted coverage', () => {
  it('checkCircular returns NOT_CIRCULAR when not visited and marks visited', () => {
    const visited = new WeakSet<Record<string, unknown>>();
    const obj: Record<string, unknown> = { a: 1 };
    const res = checkCircular(obj, visited, undefined);
    expect(res).toBe(NOT_CIRCULAR);
    // second call should now show default behavior (undefined) because visited has obj
    const res2 = checkCircular(obj, visited, undefined);
    expect(res2).toBeUndefined();
  });

  it('checkCircular obeys throw/ignore/null behaviors', () => {
    const visited = new WeakSet<Record<string, unknown>>();
    const obj: Record<string, unknown> = { a: 1 };
    checkCircular(obj, visited, 'ignore');
    // calling again should return sentinel for ignore
    const res = checkCircular(obj, visited, 'ignore');
    expect(res).toBe(CIRCULAR_IGNORE);

    const v2 = new WeakSet<Record<string, unknown>>();
    const obj2: Record<string, unknown> = { b: 2 };
    checkCircular(obj2, v2, 'null');
    const r2 = checkCircular(obj2, v2, 'null');
    expect(r2).toBeNull();
  });

  it('setPath builds nested objects and overwrites non-object intermediates', () => {
    const target: Record<string, unknown> = {};
    setPath(target, 'x.y.z', 5);
    expect((target.x as any).y.z).toBe(5);

    const t2: Record<string, unknown> = { a: 1 } as any;
    // when intermediate is primitive, it will be replaced by object
    setPath(t2, 'a.b', 2);
    expect((t2 as any).a.b).toBe(2);
  });

  it('getPath returns nested value or undefined when missing', () => {
    const src = { p: { q: { r: 9 } } } as Record<string, unknown>;
    expect(getPath(src, 'p.q.r')).toBe(9);
    expect(getPath(src, 'p.x.y')).toBeUndefined();
  });
});
