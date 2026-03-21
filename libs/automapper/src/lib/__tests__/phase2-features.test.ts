/**
 * Phase 2 feature tests: condition, nullSubstitution, defaultValue, fromValue,
 * assertConfigurationIsValid.
 */
import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';

// ── helpers ──────────────────────────────────────────────────────────────────

type Src = { id: number; role: string; badge: string | null; extra?: string };
type Dest = {
  id: number;
  role: string;
  badge: string;
  extra: string;
  version: number;
};

// ── fromValue ────────────────────────────────────────────────────────────────

describe('fromValue()', () => {
  it('emits a constant regardless of source', () => {
    const m = createMapper();
    class S { v = 99 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('version', (o: any) => o.fromValue(42));
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.version).toBe(42);
  });

  it('allows fromValue(false) and fromValue(0) — falsy constants', () => {
    const m = createMapper();
    class S { x = 1 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('flag', (o: any) => o.fromValue(false));
      b.forMember('count', (o: any) => o.fromValue(0));
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.flag).toBe(false);
    expect(res.count).toBe(0);
  });

  it('fromValue(undefined) leaves the property absent (value skipped)', () => {
    const m = createMapper();
    class S { x = 1 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('optional', (o: any) => o.fromValue(undefined));
    });
    const res = m.map(new S(), 'D') as any;
    // fromValue(undefined) → value is undefined → rule is skipped → property absent
    expect(res.optional).toBeUndefined();
    expect('optional' in res).toBe(false);
  });

  it('fromValue works in async strategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { name = 'x' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('version', (o: any) => o.fromValue(7));
      b.forMember('upper', (o: any) => o.mapFromAsync(async (s: any) => s.name.toUpperCase()));
    });
    const res = await m.map(new S(), 'D') as any;
    expect(res.version).toBe(7);
    expect(res.upper).toBe('X');
  });
});

// ── condition ─────────────────────────────────────────────────────────────────

describe('condition()', () => {
  it('applies the rule when condition returns true', () => {
    const m = createMapper();
    class S { role = 'admin' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.condition((s: any) => s.role === 'admin');
        o.fromValue('ADMIN');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.badge).toBe('ADMIN');
  });

  it('skips the rule (property absent) when condition returns false', () => {
    const m = createMapper();
    class S { role = 'user' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.condition((s: any) => s.role === 'admin');
        o.fromValue('ADMIN');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.badge).toBeUndefined();
  });

  it('condition works with mapFrom resolver', () => {
    const m = createMapper();
    class S { score = 50 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('grade', (o: any) => {
        o.condition((s: any) => s.score >= 90);
        o.mapFrom((s: any) => 'A');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.grade).toBeUndefined();
  });

  it('condition works in async strategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { active = true }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('label', (o: any) => {
        o.condition((s: any) => s.active);
        o.mapFromAsync(async (_s: any) => 'ACTIVE');
      });
    });
    const r1 = await m.map(new S(), 'D') as any;
    expect(r1.label).toBe('ACTIVE');

    class S2 { active = false }
    m.addProfile(S2, 'D', (b: any) => {
      b.forMember('label', (o: any) => {
        o.condition((s: any) => (s as any).active);
        o.mapFromAsync(async (_s: any) => 'ACTIVE');
      });
    });
    const r2 = await m.map(new S2(), 'D') as any;
    expect(r2.label).toBeUndefined();
  });
});

// ── nullSubstitution ──────────────────────────────────────────────────────────

describe('nullSubstitution()', () => {
  it('substitutes when mapFrom returns null', () => {
    const m = createMapper();
    class S { badge: string | null = null }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.mapFrom((s: any) => s.badge);
        o.nullSubstitution('N/A');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.badge).toBe('N/A');
  });

  it('substitutes when mapFrom returns undefined', () => {
    const m = createMapper();
    class S { badge?: string }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.mapFrom((s: any) => s.badge);
        o.nullSubstitution('default');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.badge).toBe('default');
  });

  it('does NOT substitute when value is present', () => {
    const m = createMapper();
    class S { badge = 'gold' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.mapFrom((s: any) => s.badge);
        o.nullSubstitution('N/A');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.badge).toBe('gold');
  });

  it('nullSubstitution works in async strategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { badge: string | null = null }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.mapFromAsync(async (s: any) => s.badge);
        o.nullSubstitution('async-default');
      });
    });
    const res = await m.map(new S(), 'D') as any;
    expect(res.badge).toBe('async-default');
  });
});

// ── defaultValue ──────────────────────────────────────────────────────────────

describe('defaultValue()', () => {
  it('uses defaultValue when resolved value is undefined', () => {
    const m = createMapper();
    class S { extra?: string }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('extra', (o: any) => {
        o.mapFrom((s: any) => s.extra);
        o.defaultValue('default-extra');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.extra).toBe('default-extra');
  });

  it('does NOT override a null value (use nullSubstitution for that)', () => {
    const m = createMapper();
    class S { badge: string | null = null }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('badge', (o: any) => {
        o.mapFrom((s: any) => s.badge);
        o.defaultValue('should-not-appear');
      });
    });
    // null is not undefined — defaultValue doesn't kick in, but nullSubstitution would (if configured)
    // After applying nullSubstitution check only, null passes through as-is
    const res = m.map(new S(), 'D') as any;
    // null !== undefined, so defaultValue is NOT applied. Since nullSubstitution is not configured,
    // null is not transformed and passes through to dest.badge unmodified.
    expect(res.badge).toBeNull();
  });

  it('defaultValue works in async strategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { extra?: string }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('extra', (o: any) => {
        o.mapFromAsync(async (s: any) => s.extra);
        o.defaultValue('async-fallback');
      });
    });
    const res = await m.map(new S(), 'D') as any;
    expect(res.extra).toBe('async-fallback');
  });
});

// ── nullSubstitution + defaultValue interaction ───────────────────────────────

describe('nullSubstitution + defaultValue interaction', () => {
  it('nullSubstitution takes precedence when both are set and value is null', () => {
    const m = createMapper();
    class S { val: string | null = null }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('result', (o: any) => {
        o.mapFrom((s: any) => s.val);
        o.nullSubstitution('null-fallback');
        o.defaultValue('default-fallback');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.result).toBe('null-fallback');
  });

  it('nullSubstitution takes precedence when both are set and value is undefined', () => {
    const m = createMapper();
    class S { val?: string }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('result', (o: any) => {
        o.mapFrom((s: any) => s.val);
        o.nullSubstitution('null-fallback');
        o.defaultValue('default-fallback');
      });
    });
    const res = m.map(new S(), 'D') as any;
    expect(res.result).toBe('null-fallback');
  });

  it('interaction works in async strategy with null', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { val: string | null = null }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('result', (o: any) => {
        o.mapFromAsync(async (s: any) => s.val);
        o.nullSubstitution('async-null-fallback');
        o.defaultValue('async-default-fallback');
      });
    });
    const res = await m.map(new S(), 'D') as any;
    expect(res.result).toBe('async-null-fallback');
  });

  it('interaction works in async strategy with undefined', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class S { val?: string }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('result', (o: any) => {
        o.mapFromAsync(async (s: any) => s.val);
        o.nullSubstitution('async-null-fallback');
        o.defaultValue('async-default-fallback');
      });
    });
    const res = await m.map(new S(), 'D') as any;
    expect(res.result).toBe('async-null-fallback');
  });
});

// ── assertConfigurationIsValid (continued) ────────────────────────────────────

describe('assertConfigurationIsValid() — resolver coverage', () => {
  it('passes when rule uses mapFromAsync', () => {
    const m = createMapper();
    class S { id = 1 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('id', (o: any) => o.mapFromAsync(async (s: any) => s.id));
    });
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });
});

// ── end of Phase 2 feature tests ──────────────────────────────────

describe('assertConfigurationIsValid()', () => {
  it('passes when all rules have resolvers', () => {
    const m = createMapper();
    class S { id = 1; name = 'x' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('id', (o: any) => o.mapFrom((s: any) => s.id));
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
    });
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });

  it('passes when rule uses fromValue', () => {
    const m = createMapper();
    class S { x = 1 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('version', (o: any) => o.fromValue(1));
    });
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });

  it('passes when rule uses ignore()', () => {
    const m = createMapper();
    class S { secret = 'x' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('secret', (o: any) => o.ignore());
    });
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });

  it('passes when rule uses mapWith', () => {
    const m = createMapper();
    class S { n = 5 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('n', (o: any) => o.mapWith((s: any) => s.n * 2));
    });
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });

  it('throws when a rule has no resolver', () => {
    const m = createMapper();
    class S { id = 1 }
    // Build a profile with an empty forMember — nothing called inside opts
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('broken', (_o: any) => { /* no resolver set */ });
    });
    expect(() => m.assertConfigurationIsValid()).toThrow(/broken/);
    expect(() => m.assertConfigurationIsValid()).toThrow(/no resolver/);
  });

  it('throws listing ALL invalid rules', () => {
    const m = createMapper();
    class S { id = 1 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('a', (_o: any) => { /* no op */ });
      b.forMember('b', (_o: any) => { /* no op */ });
    });
    expect(() => m.assertConfigurationIsValid()).toThrow(/member 'a'/);
    expect(() => m.assertConfigurationIsValid()).toThrow(/member 'b'/);
  });

  it('passes for mapper with no profiles', () => {
    const m = createMapper();
    expect(() => m.assertConfigurationIsValid()).not.toThrow();
  });
});
