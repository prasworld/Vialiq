import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Atom } from '../kernel/types.js';
import type { DebugEntry } from './types.js';
import { EventLog } from './event-log.js';
import { SnapshotManager } from './snapshot.js';
import { installBridge, BRIDGE_GLOBAL_KEY, BRIDGE_VERSION } from './bridge.js';

function makeAtom<S>(key: string, value: S): Atom<S> {
  return {
    definition: { key, initialState: value },
    key,
    get: () => value,
    subscribe: () => () => void 0,
    get version() {
      return 0;
    },
    _setState: () => void 0,
  };
}

function makeEntry(id: string): DebugEntry {
  return {
    id,
    atomKey: 'a',
    correlationId: 'c',
    causationId: 'cc',
    commandType: 'x',
    event: {
      _kind: 'DomainEvent',
      type: 'x',
      meta: { id: 'e1', correlationId: 'c', causationId: 'cc', atomKey: 'a', timestamp: 1, version: 1 },
    },
    stateBefore: 0,
    stateAfter: 1,
    timestamp: 1,
    version: 1,
  };
}

describe('installBridge', () => {
  beforeEach(() => {
    (globalThis as unknown as { window?: Record<string, unknown> }).window = {};
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: Record<string, unknown> }).window;
    vi.restoreAllMocks();
  });

  it('installs bridge API and uninstalls cleanly', async () => {
    const log = new EventLog();
    const snapshots = new SnapshotManager();
    log.append(makeEntry('1'));

    const timeTravel = {
      replayMode: false,
      replayPosition: 0,
      to: vi.fn(async () => ({ _tag: 'Right' as const, right: undefined })),
      toSnapshot: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepForward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepBackward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      exit: vi.fn(),
    };

    const uninstall = installBridge(log, snapshots, timeTravel, () => [makeAtom('a', 123)]);
    const bridge = ((globalThis as unknown as { window: Record<string, any> }).window[BRIDGE_GLOBAL_KEY]);

    expect(bridge.version).toBe(BRIDGE_VERSION);
    expect(bridge.getLog().length).toBe(1);
    expect(bridge.getAtoms()).toEqual({ a: 123 });

    await bridge.timeTravelTo('1');
    expect(timeTravel.to).toHaveBeenCalledWith('1');

    uninstall();
    expect((globalThis as unknown as { window: Record<string, any> }).window[BRIDGE_GLOBAL_KEY]).toBeUndefined();
  });

  it('warns when time travel fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => void 0);
    const log = new EventLog();
    const snapshots = new SnapshotManager();
    const timeTravel = {
      replayMode: false,
      replayPosition: 0,
      to: vi.fn(async () => ({ _tag: 'Left' as const, left: { code: 'EVENT_NOT_FOUND', message: 'missing' } })),
      toSnapshot: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepForward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepBackward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      exit: vi.fn(),
    };

    installBridge(log, snapshots, timeTravel, () => []);
    const bridge = ((globalThis as unknown as { window: Record<string, any> }).window[BRIDGE_GLOBAL_KEY]);

    await bridge.timeTravelTo('does-not-exist');
    expect(warn).toHaveBeenCalled();
  });

  it('exportLog and importLog round-trip correctly', () => {
    const log = new EventLog();
    const snapshots = new SnapshotManager();
    log.append(makeEntry('ex1'));
    log.append(makeEntry('ex2'));

    const timeTravel = {
      replayMode:    false,
      replayPosition: 0,
      to:           vi.fn(async () => ({ _tag: 'Right' as const, right: undefined })),
      toSnapshot:   vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepForward:  vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepBackward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      exit:         vi.fn(),
    };

    installBridge(log, snapshots, timeTravel, () => []);
    const bridge = (globalThis as unknown as { window: Record<string, any> }).window[BRIDGE_GLOBAL_KEY];

    const exported = bridge.exportLog();
    expect(typeof exported).toBe('string');

    const parsed = JSON.parse(exported);
    expect(parsed.length).toBe(2);
    expect(parsed[0].id).toBe('ex1');

    // importLog replaces the log
    bridge.importLog(JSON.stringify([makeEntry('imp1')]));
    expect(log.getAll().length).toBe(1);
    expect(log.getAll()[0].id).toBe('imp1');
  });

  it('returns no-op uninstall when window is not defined', () => {
    // Delete the mocked window to simulate non-browser
    delete (globalThis as unknown as { window?: unknown }).window;

    const log      = new EventLog();
    const snapshots = new SnapshotManager();
    const timeTravel = {
      replayMode:    false,
      replayPosition: 0,
      to:           vi.fn(async () => ({ _tag: 'Right' as const, right: undefined })),
      toSnapshot:   vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepForward:  vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepBackward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      exit:         vi.fn(),
    };

    const uninstall = installBridge(log, snapshots, timeTravel, () => []);
    // Should not throw
    expect(() => uninstall()).not.toThrow();
  });

  it('uninstall is safe even if window disappears after install', () => {
    // window IS set in beforeEach, so install succeeds
    const log       = new EventLog();
    const snapshots = new SnapshotManager();
    const timeTravel = {
      replayMode:    false,
      replayPosition: 0,
      to:           vi.fn(async () => ({ _tag: 'Right' as const, right: undefined })),
      toSnapshot:   vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepForward:  vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      stepBackward: vi.fn(() => ({ _tag: 'Right' as const, right: undefined })),
      exit:         vi.fn(),
    };

    const uninstall = installBridge(log, snapshots, timeTravel, () => []);

    // Remove window after install — simulates environment teardown
    delete (globalThis as unknown as { window?: unknown }).window;

    // Calling uninstall now should not throw despite window being gone
    expect(() => uninstall()).not.toThrow();
  });
});
