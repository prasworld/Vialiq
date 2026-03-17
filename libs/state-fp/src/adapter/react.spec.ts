import { describe, it, expect } from 'vitest';
import { StateFpProvider, useAtom, useCommand, useQuery } from './react.js';

describe('react adapter stubs', () => {
  it('throws not implemented for provider and hooks', () => {
    expect(() => (StateFpProvider as () => unknown)()).toThrow(/not yet implemented/i);
    expect(() => (useAtom as unknown as () => unknown)()).toThrow(/not yet implemented/i);
    expect(() => (useCommand as unknown as () => unknown)()).toThrow(/not yet implemented/i);
    expect(() => (useQuery as unknown as () => unknown)()).toThrow(/not yet implemented/i);
  });
});
