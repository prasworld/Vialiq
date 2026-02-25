import {
  createMapper,
  NamingConvention,
  TypeConverter,
  AsyncStrategy,
  ProfilingStrategy,
  LoggingStrategy,
  DefaultStrategy,
} from './libs';

type User = { id: number; name: string; age?: number };
type UserDto = { id: string; displayName: string; age?: number };

describe('automapper', () => {
  let mapper: ReturnType<typeof createMapper>;

  beforeEach(() => {
    mapper = createMapper();
  });

  it('copies same-named properties by default', () => {
    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {});
    const input: User = { id: 1, name: 'Alice', age: 30 };
    const result = mapper.map<User, UserDto>(input, 'UserDto') as UserDto;
    expect(result).toEqual({ id: 1, name: 'Alice', age: 30 });
  });

  it('allows custom mapping via forMember', () => {
    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {
      mb.forMember('id', (opts) => opts.mapFrom((s) => s.id.toString()));
      mb.forMember('displayName', (opts) =>
        opts.mapFrom((s) => s.name.toUpperCase())
      );
    });
    const dto = mapper.map<User, UserDto>({ id: 2, name: 'bob' }, 'UserDto') as UserDto;
    expect(dto.id).toBe('2');
    expect(dto.displayName).toBe('BOB');
  });

  it('supports ignoring members', () => {
    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {
      mb.forMember('age', (o) => o.ignore());
    });
    const dto = mapper.map<User, UserDto>({ id: 3, name: 'carol', age: 25 }, 'UserDto') as UserDto;
    expect(dto.age).toBeUndefined();
  });

  it('honors namingConvention option', () => {
    const snakeMapper = createMapper({ namingConvention: NamingConvention.SnakeCase });
    type S = { firstName: string };
    type D = { first_name: string };
    snakeMapper.addProfile<S, D>('Object', 'Dest', (mb) => {});
    const result = snakeMapper.map<S, D>({ firstName: 'x' }, 'Dest') as D;
    expect(result).toEqual({ first_name: 'x' });
  });

  it('strict mode does not crash on untyped plain objects', () => {
    // when dest is specified only by string there is no constructor to
    // compare against; the engine simply copies values and strict check
    // passes (auto-mapping is allowed).  This test documents that behaviour.
    const strictMapper = createMapper({ strict: true });
    strictMapper.addProfile('Object', 'Dest', (mb) => {});
    expect(() => strictMapper.map({ a: 1 }, 'Dest')).not.toThrow();
  });

  it('handles circular references according to option', () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj['self'] = obj;

    const mapperThrow = createMapper({ circularRefBehavior: 'throw' });
    mapperThrow.addProfile('Any', 'Any', (mb) => {});
    expect(() => mapperThrow.map(obj, 'Any')).toThrow('Circular reference');

    const mapperIgnore = createMapper({ circularRefBehavior: 'ignore' });
    mapperIgnore.addProfile('Any', 'Any', (mb) => {});
    const out1 = mapperIgnore.map(obj, 'Any') as Record<string, unknown>;
    expect(out1['self']).toBeUndefined();

    const mapperNull = createMapper({ circularRefBehavior: 'null' });
    mapperNull.addProfile('Any', 'Any', (mb) => {});
    const out2 = mapperNull.map(obj, 'Any') as Record<string, unknown>;
    expect(out2['self']).toBeNull();
  });

  it('applies converters via forMember using mapWith', () => {
    const strToNum: TypeConverter<any, any> = (v) => Number((v as any).id ?? v);
    
    type S = { id: string };
    type D = { id: number };
    mapper.addProfile<S, D>('Object', 'Number', (mb) => {
        mb.forMember('id', (o) => o.mapWith(strToNum));
    });

    const result = mapper.map<S, D>({ id: '7' }, 'Number') as D;
    expect(result.id).toBe(7);
  });

  it('supports async mapping', async () => {
    mapper.addStrategy(new AsyncStrategy());
    mapper.addProfile<User, UserDto>('Object', 'UserDtoAsync', (mb) => {
      mb.forMember('displayName', (o) =>
        o.mapFromAsync(async (s) => {
          await new Promise((r) => setTimeout(r, 10));
          return s.name.toUpperCase();
        })
      );
    });
    const result = await mapper.map<User, UserDto>({ id: 1, name: 'async' }, 'UserDtoAsync');
    expect(result.displayName).toBe('ASYNC');
  });

  it('supports expanding (dot notation destination)', () => {
    type Flat = { street: string; city: string };
    type Nested = { address: { street: string; city: string } };

    mapper.addProfile<Flat, Nested>('Object', 'Nested', (mb) => {
      mb.forMember('address.street', (o) => o.mapFrom((s) => s.street));
      mb.forMember('address.city', (o) => o.mapFrom((s) => s.city));
    });

    const result = mapper.map<Flat, Nested>({ street: 'Main', city: 'NY' }, 'Nested') as Nested;
    expect(result.address).toBeDefined();
    expect(result.address.street).toBe('Main');
    expect(result.address.city).toBe('NY');
  });

  it('supports flattening via mapFrom', () => {
    type Nested = { address: { city: string } };
    type Flat = { city: string };
    mapper.addProfile<Nested, Flat>('Object', 'Flat', (mb) => {
      mb.forMember('city', (o) => o.mapFrom((s) => s.address.city));
    });
    const result = mapper.map<Nested, Flat>({ address: { city: 'Paris' } }, 'Flat') as Flat;
    expect(result.city).toBe('Paris');
  });

  it('maps arrays correctly', () => {
    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {});
    const users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const results = mapper.mapArray<User, UserDto>(users, 'UserDto') as UserDto[];
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('A');
    expect(results[1].name).toBe('B');
  });

  it('maps arrays asynchronously', async () => {
    mapper.addStrategy(new AsyncStrategy());
    mapper.addProfile<User, UserDto>('Object', 'UserDtoAsyncArr', (mb) => {
      mb.forMember('displayName', (o) => o.mapFromAsync(async (s) => s.name.toUpperCase()));
    });
    
    const users = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
    const results = await mapper.mapArray<User, UserDto>(users, 'UserDtoAsyncArr');
    
    expect(results).toHaveLength(2);
    expect(results[0].displayName).toBe('A');
    expect(results[1].displayName).toBe('B');
  });

  it('executes beforeMap and afterMap callbacks', () => {
    let beforeCalled = false;
    let afterCalled = false;

    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {
      mb.beforeMap(() => { beforeCalled = true; });
      mb.afterMap(() => { afterCalled = true; });
    });

    mapper.map<User, UserDto>({ id: 1, name: 'A' }, 'UserDto');
    expect(beforeCalled).toBe(true);
    expect(afterCalled).toBe(true);
  });

  it('profiling strategy logs duration', async () => {
    let logMsg = '';
    // wrap DefaultStrategy so that profiling always executes for normal maps
    const ps = new ProfilingStrategy(new DefaultStrategy(), (msg) => { logMsg = msg; });
    mapper.addStrategy(ps);
    
    mapper.addProfile<User, UserDto>('Object', 'UserDto', (mb) => {});
    await mapper.map<User, UserDto>({ id: 1, name: 'A' }, 'UserDto');
    
    expect(logMsg).toMatch(/\[AutoMapper\] Object -> UserDto took \d+ms/);
  });

  it('returns null/undefined when mapping null/undefined', () => {
    mapper.addProfile('Object', 'UserDto', (mb) => {});
    expect(mapper.map(null as unknown as User, 'UserDto') as any).toBeNull();
    expect(mapper.map(undefined as unknown as User, 'UserDto') as any).toBeUndefined();
  });

  it('example logging strategy records calls', () => {
    let messages: string[] = [];
    const logStrat = new LoggingStrategy((m: string) => messages.push(m));
    mapper.addStrategy(logStrat);
    mapper.addProfile<User, UserDto>('Object', 'LintDto', (mb) => {});
    mapper.map<User, UserDto>({ id: 5, name: 'z' }, 'LintDto');
    expect(messages.some(m => m.includes('mapping'))).toBe(true);
  });

  it('strict mode throws with enhanced error message', () => {
    const strictMapper = createMapper({ strict: true });
    class Source { a = 1; }
    class Dest { b = 2; }
    strictMapper.addProfile(Source, Dest, (mb) => {});
    
    expect(() => strictMapper.map(new Source(), Dest)).toThrow(
      "Strict mapping failed: property 'a' was not mapped to destination Dest from source Source"
    );
  });

  it('async strict mode throws with enhanced error message', async () => {
    const strictMapper = createMapper({ strict: true });
    strictMapper.addStrategy(new AsyncStrategy());
    class Source { a = 1; }
    class Dest { b = 2; }
    
    strictMapper.addProfile(Source, Dest, (mb) => {
       mb.forMember('b', o => o.mapFromAsync(async () => 2));
    });
    
    await expect(strictMapper.map(new Source(), Dest)).rejects.toThrow(
      "Strict mapping failed: property 'a' was not mapped to destination Dest from source Source"
    );
  });
});
