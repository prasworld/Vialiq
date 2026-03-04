import { expectType } from 'tsd';
import { MappingBuilder } from '../src/lib/builder';

type Src = { id: number; name: string };
type Dest = { id: number; displayName: string };

const builder = new MappingBuilder<Src, Dest>();
builder.forMember('id', (o) => o.mapFrom((s) => s.id));
builder.forMember('displayName', (o) => o.mapFrom((s) => s.name));

const cfg = builder.build();
// ensure mapFrom return types are inferred
expectType<number>((cfg.memberRules[0] as any).mapFrom!({ id: 1, name: 'x' }));
