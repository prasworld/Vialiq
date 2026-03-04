import { CircularRefBehavior } from './options';

export const CIRCULAR_IGNORE = Symbol('CIRCULAR_IGNORE');
export const NOT_CIRCULAR = Symbol('NOT_CIRCULAR');

export function checkCircular(
  val: Record<string, unknown>,
  visited: WeakSet<Record<string, unknown>>,
  behavior?: CircularRefBehavior
): unknown {
  if (visited.has(val)) {
    switch (behavior) {
      case 'throw':
        throw new Error('Circular reference detected');
      case 'ignore':
        return CIRCULAR_IGNORE;
      case 'null':
        return null;
      default:
        return undefined;
    }
  }
  visited.add(val);
  return NOT_CIRCULAR;
}

export function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

export function getPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((obj, key) => (obj && typeof obj === 'object' && obj !== null ? (obj as Record<string, unknown>)[key] : undefined), source as unknown);
}