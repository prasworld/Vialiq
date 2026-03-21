/**
 * Phase 3 feature tests:
 *   3-1 reverseMap()
 *   3-2 Nested profile resolution via ctx.map()
 *   3-3 preCondition()
 *   3-4 Value transformers (addValueTransformer)
 *   3-5 Custom naming convention (createNamingConvention)
 *   3-6 Per-profile naming convention (setNamingConvention)
 *   3-7 ITypeConverter class support
 *   3-9 mapAsync shorthand
 */
import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';
import { ITypeConverter } from '../converters';
import { NamingConvention } from '../options';
import { createNamingConvention } from '../naming';

// ── preCondition (3-3) ────────────────────────────────────────────────────────

describe('preCondition()', () => {
  it('returns null when predicate returns false', () => {
    const m = createMapper();
    class Src { active = false; name = 'alice' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.preCondition((s: any) => s.active);
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
    });
    const res = m.map(new Src(), 'Dest');
    expect(res).toBeNull();
  });

  it('maps normally when predicate returns true', () => {
    const m = createMapper();
    class Src { active = true; name = 'bob' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.preCondition((s: any) => s.active);
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.name).toBe('bob');
  });

  it('works with async strategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class Src { active = false; value = 'x' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.preCondition((s: any) => s.active);
      b.forMember('value', (o: any) => o.mapFromAsync(async (s: any) => s.value));
    });
    const res = await m.map(new Src(), 'Dest');
    expect(res).toBeNull();
  });
});

// ── Custom naming convention (3-5) ────────────────────────────────────────────

describe('createNamingConvention()', () => {
  it('applies a custom transformation function', () => {
    const upperSnake = createNamingConvention(k =>
      k.replace(/[A-Z]/g, m => '_' + m).toUpperCase().replace(/^_/, '')
    );
    const m = createMapper({ namingConvention: upperSnake });
    const res = m.map({ firstName: 'Alice', lastName: 'Smith' }, 'Dest') as any;
    expect(res['FIRST_NAME']).toBe('Alice');
    expect(res['LAST_NAME']).toBe('Smith');
  });

  it('returned function is composable', () => {
    const trim = createNamingConvention(k => k.trim());
    expect(trim('  hello  ')).toBe('hello');
  });
});

// ── Per-profile naming convention (3-6) ───────────────────────────────────────

describe('setNamingConvention()', () => {
  it('overrides global naming convention for this profile only', () => {
    const m = createMapper({ namingConvention: NamingConvention.CamelCase });
    class Src { first_name = 'Alice'; last_name = 'Smith' }
    // Override per-profile to snake_case so properties already in snake_case map unchanged
    m.addProfile(Src, 'Dest', (b: any) => {
      b.setNamingConvention(NamingConvention.SnakeCase);
    });
    // Source keys: first_name → snake_case stays first_name
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.first_name).toBe('Alice');
    expect(res.last_name).toBe('Smith');
  });

  it('profile convention does not affect other profiles', () => {
    const m = createMapper();
    class SrcA { myProp = 1 }
    class SrcB { myProp = 2 }
    // Profile A: snake_case
    m.addProfile(SrcA, 'DestA', (b: any) => {
      b.setNamingConvention(NamingConvention.SnakeCase);
    });
    // Profile B: no convention
    m.addProfile(SrcB, 'DestB', (_b: any) => { /* no convention */ });

    const resA = m.map(new SrcA(), 'DestA') as any;
    const resB = m.map(new SrcB(), 'DestB') as any;
    // A: myProp → my_prop (snake_case)
    expect(resA.my_prop).toBe(1);
    // B: myProp stays myProp (no change)
    expect(resB.myProp).toBe(2);
  });

  it('accepts a custom NamingConventionFn', () => {
    const shout = createNamingConvention(k => k.toUpperCase());
    const m = createMapper();
    class Src { foo = 'bar' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.setNamingConvention(shout);
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.FOO).toBe('bar');
  });
});

describe('reverseMap() profile metadata', () => {
  it('inherits namingConvention from forward profile in reversed profile', () => {
    const m = createMapper({ namingConvention: NamingConvention.CamelCase });
    class Src { firstName = 'Alice'; lastName = 'Smith' }

    m.addProfile(Src, 'Dest', (b: any) => {
      b.setNamingConvention(NamingConvention.SnakeCase);
      b.forMember('first_name', (o: any) => o.mapFrom((s: any) => s.firstName));
    });

    m.reverseMap(Src, 'Dest');

    const result = m.map({ first_name: 'Alice', last_name: 'Smith' }, Src) as any;
    expect(result.firstName).toBe('Alice');
    expect(result.lastName).toBe('Smith');
  });
});

// ── ITypeConverter class support (3-7) ────────────────────────────────────────

describe('ITypeConverter class (3-7)', () => {
  it('accepts an ITypeConverter instance in mapWith (source → field)', () => {
    // mapWith converters receive the full source object and return the member value
    class FullNameConverter implements ITypeConverter<{ first: string; last: string }, string> {
      convert(src: { first: string; last: string }) {
        return `${src.first} ${src.last}`;
      }
    }
    const m = createMapper();
    class Src { first = 'Alice'; last = 'Smith' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('fullName', (o: any) => o.mapWith(new FullNameConverter()));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.fullName).toBe('Alice Smith');
  });

  it('works the same as a plain function TypeConverter', () => {
    class DoubleScore implements ITypeConverter<{ score: number }, number> {
      convert(src: { score: number }) { return src.score * 2; }
    }
    const m = createMapper();
    class Src { score = 21 }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('doubled', (o: any) => o.mapWith(new DoubleScore()));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.doubled).toBe(42);
  });
});

// ── Nested profile resolution via ctx.map() (3-2) ────────────────────────────

describe('Nested profile resolution (3-2)', () => {
  it('ctx.map() resolves a nested object with its registered profile', () => {
    class Address { street = '123 Main St'; city = 'Metropolis' }
    class User { name = 'Alice'; address = new Address() }

    const m = createMapper();

    m.addProfile(Address, 'AddressDto', (b: any) => {
      b.forMember('street', (o: any) => o.mapFrom((s: any) => s.street));
      b.forMember('city', (o: any) => o.mapFrom((s: any) => s.city));
    });

    m.addProfile(User, 'UserDto', (b: any) => {
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
      b.forMember('address', (o: any) =>
        o.mapFrom((s: any, ctx: any) => ctx.map(s.address, 'AddressDto'))
      );
    });

    const res = m.map(new User(), 'UserDto') as any;
    expect(res.name).toBe('Alice');
    expect(res.address.street).toBe('123 Main St');
    expect(res.address.city).toBe('Metropolis');
  });

  it('ctx.map() works inside mapFromAsync', async () => {
    class Tag { label = 'urgent' }
    class Task { title = 'Fix bug'; tag = new Tag() }

    const m = createMapper();
    m.addStrategy(new AsyncStrategy());

    m.addProfile(Tag, 'TagDto', (b: any) => {
      b.forMember('label', (o: any) => o.mapFrom((s: any) => s.label));
    });

    m.addProfile(Task, 'TaskDto', (b: any) => {
      b.forMember('title', (o: any) => o.mapFrom((s: any) => s.title));
      b.forMember('tag', (o: any) =>
        o.mapFromAsync(async (s: any, ctx: any) => ctx.map(s.tag, 'TagDto'))
      );
    });

    const res = await m.map(new Task(), 'TaskDto') as any;
    expect(res.title).toBe('Fix bug');
    expect(res.tag.label).toBe('urgent');
  });
});

// ── Value transformers (3-4) ──────────────────────────────────────────────────

describe('addValueTransformer()', () => {
  it('applies transformer to all string scalar values', () => {
    const m = createMapper();
    m.addValueTransformer(v => typeof v === 'string' ? (v as string).toUpperCase() : v);
    class Src { first = 'alice'; last = 'smith' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('first', (o: any) => o.mapFrom((s: any) => s.first));
      b.forMember('last', (o: any) => o.mapFrom((s: any) => s.last));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.first).toBe('ALICE');
    expect(res.last).toBe('SMITH');
  });

  it('applies multiple transformers in registration order', () => {
    const m = createMapper();
    m.addValueTransformer(v => typeof v === 'string' ? (v as string).trim() : v);
    m.addValueTransformer(v => typeof v === 'string' ? (v as string).toUpperCase() : v);
    class Src { name = '  hello  ' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.name).toBe('HELLO');
  });

  it('does not affect numeric values when transformer guards by type', () => {
    const m = createMapper();
    m.addValueTransformer(v => typeof v === 'string' ? (v as string).trim() : v);
    class Src { age = 30; label = '  hi  ' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('age', (o: any) => o.mapFrom((s: any) => s.age));
      b.forMember('label', (o: any) => o.mapFrom((s: any) => s.label));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.age).toBe(30);
    expect(res.label).toBe('hi');
  });

  it('does not infinite-loop when mapped result has a self-cycle', () => {
    const m = createMapper();
    m.addValueTransformer(v => typeof v === 'string' ? (v as string).toUpperCase() : v);
    class Src { value = 'alice' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('value', (o: any) => o.mapFrom((s: any) => s.value));
      b.afterMap((d: any) => { d.self = d; });
    });

    const res = m.map(new Src(), 'Dest') as any;
    expect(res.value).toBe('ALICE');
    expect(res.self).toBe(res);
  });

  it('works with async mapping', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    m.addValueTransformer(v => typeof v === 'string' ? (v as string) + '!' : v);
    class Src { msg = 'hello' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('msg', (o: any) => o.mapFromAsync(async (s: any) => s.msg));
    });
    const res = await m.map(new Src(), 'Dest') as any;
    expect(res.msg).toBe('hello!');
  });
});

// ── reverseMap() (3-1) ────────────────────────────────────────────────────────

describe('reverseMap()', () => {
  it('auto-creates inverse profile for simple mapFrom rules', () => {
    class UserDto { name = ''; email = '' }
    class User { name = ''; email = '' }

    const m = createMapper();
    m.addProfile(User, UserDto, (b: any) => {
      b.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
      b.forMember('email', (o: any) => o.mapFrom((s: any) => s.email));
    });
    m.reverseMap(User, UserDto);

    const dto = new UserDto();
    dto.name = 'Alice';
    dto.email = 'alice@example.com';
    const user = m.map(dto, User) as any;
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
  });

  it('skips non-reversible rules (fromValue, ignore)', () => {
    class A { x = 0 }
    class B { x = 0; version = 0; secret = 'hidden' }

    const m = createMapper();
    m.addProfile(A, B, (b: any) => {
      b.forMember('x', (o: any) => o.mapFrom((s: any) => s.x));
      b.forMember('version', (o: any) => o.fromValue(1)); // cannot reverse
      b.forMember('secret', (o: any) => o.ignore());       // cannot reverse
    });
    m.reverseMap(A, B);

    // Reverse: B → A; only 'x' should be mapped
    const bInst = new B();
    bInst.x = 42;
    const aInst = m.map(bInst, A) as any;
    expect(aInst.x).toBe(42);
  });

  it('throws when forward profile does not exist', () => {
    const m = createMapper();
    class X {}
    class Y {}
    expect(() => m.reverseMap(X, Y)).toThrow(/reverseMap.*no profile/i);
  });

  it('reverse profile can be used in getMapper()', () => {
    class Dto { title = '' }
    class Entity { title = '' }

    const m = createMapper();
    m.addProfile(Entity, Dto, (b: any) => {
      b.forMember('title', (o: any) => o.mapFrom((s: any) => s.title));
    });
    m.reverseMap(Entity, Dto);

    const mapper = m.getMapper(Dto, Entity);
    const dto = new Dto();
    dto.title = 'Hello';
    const entity = mapper(dto) as any;
    expect(entity.title).toBe('Hello');
  });
});

// ── mapAsync shorthand (3-9) ──────────────────────────────────────────────────

describe('mapAsync() shorthand (3-9)', () => {
  it('always returns a Promise even for sync profiles', async () => {
    const m = createMapper();
    class Src { val = 42 }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('val', (o: any) => o.mapFrom((s: any) => s.val));
    });
    const result = m.mapAsync(new Src(), 'Dest');
    expect(result).toBeInstanceOf(Promise);
    const res = await result as any;
    expect(res.val).toBe(42);
  });

  it('auto-activates AsyncStrategy for mapFromAsync profiles', async () => {
    const m = createMapper(); // no AsyncStrategy added manually
    class Src { label = 'async-val' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('label', (o: any) => o.mapFromAsync(async (s: any) => s.label));
    });
    // mapAsync should auto-activate AsyncStrategy
    const res = await m.mapAsync(new Src(), 'Dest') as any;
    expect(res.label).toBe('async-val');
  });
});
