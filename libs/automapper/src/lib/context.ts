export interface MappingContext<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly items: T;
  readonly operationId: string;
  readonly startedAt: number;
}

export function createContext<T extends Record<string, unknown>>(items: T): MappingContext<T> {
  const hasRandom = typeof crypto !== 'undefined' && typeof (crypto as { randomUUID?: unknown }).randomUUID === 'function';
  const operationId = hasRandom
    ? (crypto as { randomUUID: () => string }).randomUUID()
    : String(Date.now());
  return {
    items,
    operationId,
    startedAt: Date.now(),
  };
}
