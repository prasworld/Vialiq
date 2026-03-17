import { describe, it, expect } from 'vitest';
import {
  lastWriteWins,
  firstWriteWins,
  ownerWins,
  versionWins,
  resolveConflict,
} from './conflict.js';

describe('sync/conflict', () => {
  const local = {
    state: 'local',
    version: { a: 1 },
    timestamp: 10,
    peerId: 'a',
  };

  const remote = {
    state: 'remote',
    version: { a: 1, b: 1 },
    timestamp: 20,
    peerId: 'b',
  };

  it('applies built-in strategies', () => {
    expect(lastWriteWins(local, remote)).toBe('remote');
    expect(firstWriteWins(local, remote)).toBe('local');
    expect(ownerWins(local, remote)).toBe('local');
    expect(versionWins(local, remote)).toBe('remote');
  });

  it('dispatches strategy names and custom resolvers', () => {
    expect(resolveConflict('last-write-wins', local, remote)).toBe('remote');
    expect(resolveConflict('first-write-wins', local, remote)).toBe('local');
    expect(resolveConflict('owner-wins', local, remote)).toBe('local');
    expect(resolveConflict('version-wins', local, remote)).toBe('remote');

    const custom = resolveConflict(
      () => 'custom',
      local,
      remote,
    );
    expect(custom).toBe('custom');
  });
});
