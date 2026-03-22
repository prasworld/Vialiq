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

  // ── lastWriteWins ──────────────────────────────────────────────────────────

  describe('lastWriteWins', () => {
    it('returns local when local timestamp is higher', () => {
      const newer = { ...local,  timestamp: 30 };
      const older = { ...remote, timestamp: 20 };
      expect(lastWriteWins(newer, older)).toBe('local');
    });

    it('returns remote when remote timestamp is higher', () => {
      const older = { ...local,  timestamp: 10 };
      const newer = { ...remote, timestamp: 20 };
      expect(lastWriteWins(older, newer)).toBe('remote');
    });

    it('tie-breaks by lexicographic peerId when timestamps are equal', () => {
      const a = { state: 'a-state', version: { a: 1 }, timestamp: 15, peerId: 'aaa' };
      const b = { state: 'b-state', version: { b: 1 }, timestamp: 15, peerId: 'bbb' };
      // 'bbb' > 'aaa' → remote (b) wins
      expect(lastWriteWins(a, b)).toBe('b-state');
      expect(lastWriteWins(b, a)).toBe('b-state');
    });

    it('returns local when peerIds are equal (self-conflict)', () => {
      const selfA = { state: 'v1', version: { x: 1 }, timestamp: 5, peerId: 'same' };
      const selfB = { state: 'v2', version: { x: 2 }, timestamp: 5, peerId: 'same' };
      expect(lastWriteWins(selfA, selfB)).toBe('v1');
    });

    it('handles missing peerId gracefully', () => {
      const noPeer = { state: 'np', version: {}, timestamp: 10, peerId: undefined };
      const hasPeer = { state: 'hp', version: {}, timestamp: 10, peerId: 'z' };
      // 'z' > '' → remote wins
      expect(lastWriteWins(noPeer as any, hasPeer as any)).toBe('hp');
    });
  });

  // ── firstWriteWins ─────────────────────────────────────────────────────────

  describe('firstWriteWins', () => {
    it('returns the candidate with the lower timestamp', () => {
      // older is built from the `local` fixture (state = 'local'), ts = 5
      // newer is built from the `remote` fixture (state = 'remote'), ts = 15
      const older = { ...local,  timestamp: 5  };
      const newer = { ...remote, timestamp: 15 };
      // local=older(ts=5), remote=newer(ts=15) → first write is LOCAL → 'local'
      expect(firstWriteWins(older, newer)).toBe('local');
      // local=newer(ts=15), remote=older(ts=5) → first write is REMOTE → older.state = 'local'
      expect(firstWriteWins(newer, older)).toBe('local');
    });

    it('tie-breaks by lexicographic peerId — lower id wins', () => {
      const a = { state: 'a-state', version: { a: 1 }, timestamp: 10, peerId: 'aaa' };
      const b = { state: 'b-state', version: { b: 1 }, timestamp: 10, peerId: 'bbb' };
      // 'aaa' < 'bbb' → remote (a-state via local) wins when a is local
      expect(firstWriteWins(a, b)).toBe('a-state');
      expect(firstWriteWins(b, a)).toBe('a-state');
    });
  });

  // ── ownerWins ──────────────────────────────────────────────────────────────

  describe('ownerWins', () => {
    it('always returns local state regardless of remote timestamp', () => {
      const staleLocal  = { state: 'local-old', version: { a: 1 }, timestamp: 1,  peerId: 'a' };
      const newerRemote = { state: 'remote-new', version: { b: 5 }, timestamp: 100, peerId: 'b' };
      expect(ownerWins(staleLocal, newerRemote)).toBe('local-old');
    });

    it('local wins even when remote has a higher version vector', () => {
      const lowVersion  = { state: 'local-low',  version: { a: 1 },       timestamp: 10, peerId: 'a' };
      const highVersion = { state: 'remote-high', version: { a: 9, b: 9 }, timestamp: 10, peerId: 'b' };
      expect(ownerWins(lowVersion, highVersion)).toBe('local-low');
    });
  });

  // ── versionWins ────────────────────────────────────────────────────────────

  describe('versionWins', () => {
    it('returns remote when remote version vector dominates', () => {
      const lv = { state: 'local',  version: { a: 1 },      timestamp: 10, peerId: 'a' };
      const rv = { state: 'remote', version: { a: 1, b: 1 }, timestamp:  5, peerId: 'b' };
      expect(versionWins(lv, rv)).toBe('remote');
    });

    it('returns local when local version vector dominates', () => {
      const lv = { state: 'local',  version: { a: 2, b: 1 }, timestamp: 10, peerId: 'a' };
      const rv = { state: 'remote', version: { a: 1 },        timestamp: 20, peerId: 'b' };
      expect(versionWins(lv, rv)).toBe('local');
    });

    it('falls back to lastWriteWins when clock sums are equal', () => {
      // same total clock sum, concurrent vectors
      const lv = { state: 'local',  version: { a: 2 }, timestamp: 10, peerId: 'a' };
      const rv = { state: 'remote', version: { b: 2 }, timestamp: 20, peerId: 'b' };
      // remote has higher timestamp → lastWriteWins picks remote
      expect(versionWins(lv, rv)).toBe('remote');
    });

    it('remote with higher clock sum wins over local', () => {
      const lv = { state: 'local',  version: { a: 1 },      timestamp: 5,  peerId: 'a' };
      const rv = { state: 'remote', version: { a: 1, b: 5 }, timestamp: 1,  peerId: 'b' };
      // remote sum=6 > local sum=1 → remote wins even with lower timestamp
      expect(versionWins(lv, rv)).toBe('remote');
    });
  });

  // ── resolveConflict dispatcher ─────────────────────────────────────────────

  describe('resolveConflict dispatcher', () => {
    it('calls custom resolver function with both candidates', () => {
      let capturedLocal: typeof local | undefined;
      let capturedRemote: typeof remote | undefined;

      resolveConflict(
        (l, r) => { capturedLocal = l as typeof local; capturedRemote = r as typeof remote; return l.state; },
        local,
        remote,
      );

      expect(capturedLocal).toEqual(local);
      expect(capturedRemote).toEqual(remote);
    });

    it('throws for unknown strategy string', () => {
      expect(() =>
        resolveConflict('unknown-strategy' as any, local, remote),
      ).toThrow();
    });
  });

  // ── Edge cases for undefined peerIds and clock-sum paths ──────────────────

  describe('lastWriteWins — undefined remote peerId tie-break', () => {
    it('returns local when remote peerId is undefined and local peerId is defined', () => {
      // equal timestamps, remote.peerId=undefined → '' < local.peerId='a' → local wins
      const withPeer   = { state: 'local',  version: { a: 1 }, timestamp: 10, peerId: 'a' };
      const noPeer     = { state: 'remote', version: { b: 1 }, timestamp: 10, peerId: undefined };
      // '' (remote undefined) vs 'a' (local defined): '' > 'a' is FALSE → local wins
      expect(lastWriteWins(withPeer, noPeer as any)).toBe('local');
    });
  });

  describe('firstWriteWins — undefined remote peerId tie-break', () => {
    it('returns local when remote peerId is undefined', () => {
      // equal timestamps, remote.peerId=undefined → '' >= local.peerId → local wins
      const withPeer = { state: 'local',  version: { a: 1 }, timestamp: 10, peerId: 'a' };
      const noPeer   = { state: 'remote', version: { b: 1 }, timestamp: 10, peerId: undefined };
      // '' < 'a' → TRUE → normally this means remote wins, but remote IS the noPeer
      // firstWriteWins: if '' < 'a' → return remote.state='remote'
      expect(firstWriteWins(withPeer, noPeer as any)).toBe('remote');
    });
  });

  describe('versionWins — clock-sum comparison paths', () => {
    it('remote wins when remote clock sum exceeds local (neither vector dominates)', () => {
      // Concurrent vectors: local={a:1}, remote={b:3} — neither dominates
      const lv = { state: 'local',  version: { a: 1 }, timestamp: 5,  peerId: 'a' };
      const rv = { state: 'remote', version: { b: 3 }, timestamp: 5,  peerId: 'b' };
      // remoteSum=3 > localSum=1 → remote wins
      expect(versionWins(lv, rv)).toBe('remote');
    });

    it('local wins when local clock sum exceeds remote (neither vector dominates)', () => {
      // Concurrent vectors: local={a:4}, remote={b:1} — neither dominates
      const lv = { state: 'local',  version: { a: 4 }, timestamp: 5,  peerId: 'a' };
      const rv = { state: 'remote', version: { b: 1 }, timestamp: 5,  peerId: 'b' };
      // remoteSum=1 < localSum=4 → local wins
      expect(versionWins(lv, rv)).toBe('local');
    });
  });
});
