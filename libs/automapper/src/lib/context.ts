export interface MappingContext<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly items: T;
  readonly operationId: string;
  readonly startedAt: number;
  /**
   * Map a nested source object using a registered profile.
   * Enables nested profile resolution inside `mapFrom` callbacks:
   *
   * @example
   * b.forMember('address', o => o.mapFrom((s, ctx) => ctx.map(s.address, AddressDto)));
   */
  map<S, D>(src: S, destType: import('./types').Constructor<D> | string): D | null | Promise<D | null>;
}

export function createContext<T extends Record<string, unknown>>(
  items: T,
  mapFn?: (src: unknown, destType: import('./types').Constructor<unknown> | string) => unknown
): MappingContext<T> {
  const hasRandom = typeof crypto !== 'undefined' && typeof (crypto as { randomUUID?: unknown }).randomUUID === 'function';
  const operationId = hasRandom
    ? (crypto as { randomUUID: () => string }).randomUUID()
    : String(Date.now());
  return {
    items,
    operationId,
    startedAt: Date.now(),
    map: mapFn
      ? (src, destType) => mapFn(src, destType) as never
      : () => { throw new Error('No mapper available in this context. Ensure the context was created by a mapper.'); },
  };
}
