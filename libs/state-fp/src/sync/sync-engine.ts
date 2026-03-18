/**
 * SyncEngine — coordinates cross-tab / cross-worker atom synchronisation.
 *
 * ## Responsibilities
 * - Broadcast state changes to other peers when a shared atom is written.
 * - Apply state changes received from other peers (after conflict resolution).
 * - Maintain per-atom `SyncState` (version vector, peer map, conflict counters).
 *
 * ## Usage
 * ```ts
 * const engine = createSyncEngine({ kernel });
 * const unsync = engine.share(counterAtom, { conflict: 'last-write-wins' });
 * // …later…
 * unsync();
 * engine.destroy();
 * ```
 *
 * ## Wire protocol
 * See `src/sync/types.ts` for `SyncMessage` variants:
 * - `vi/sync/hello`   — peer announces presence
 * - `vi/sync/state`   — peer broadcasts full state after write
 * - `vi/sync/request` — peer requests current state from others
 * - `vi/sync/event`   — peer replicates a single domain event
 */

import type { Atom, Unsubscribe } from '../kernel/types.js';
import type {
  ShareOptions,
  SyncState,
  SyncMessage,
  SyncTransport,
  StateMessage,
  HelloMessage,
} from './types.js';
import { uuid, now } from '../core/utils.js';
import { createAutoTransport } from './transport.js';
import {
  createVersionVector,
  increment,
  merge,
  isStale,
  isConcurrent,
} from './version.js';
import { resolveConflict } from './conflict.js';

// ─── Kernel subset (duck-typed to avoid circular dep) ─────────────────────────

/** Minimal kernel surface the sync engine requires. */
export type KernelLike = {
  /** Subscribe to an atom's state changes. Returns unsubscribe. */
  subscribe<S>(atom: Atom<S>, listener: (state: S) => void): Unsubscribe;
};

// ─── SyncEngine interface ─────────────────────────────────────────────────────

export type SyncEngine = {
  /**
   * Begin synchronising `atom` across tabs/workers.
   * Returns an `unsync` function that stops synchronisation for this atom.
   */
  share<S>(atom: Atom<S>, options?: ShareOptions<S>): Unsubscribe;

  /** Current sync state for a given atom key (or `undefined` if not shared). */
  getState<S>(atomKey: string): SyncState<S> | undefined;

  /** Tear down all channels and subscriptions. */
  destroy(): void;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export type TransportFactory<S = unknown> = (channelName: string) => SyncTransport<S>;

export type SyncEngineOptions = {
  kernel: KernelLike;
  /**
   * Transport factory used to create the channel for each shared atom.
   * Defaults to `createAutoTransport` which selects the best available transport
   * at runtime (BroadcastChannel → no-op for SSR/Node.js).
   */
  transport?: TransportFactory;
};

export function createSyncEngine({ kernel, transport: transportFactory = createAutoTransport }: SyncEngineOptions): SyncEngine {
  // atomKey → { transport, syncState, unsub (kernel sub), unsubTransport }
  const shared = new Map<string, {
    transport:      SyncTransport<unknown>;
    syncState:      SyncState<unknown>;
    atom:           Atom<unknown>;
    options:        Required<ShareOptions<unknown>>;
    unsubKernel:    Unsubscribe;
    unsubTransport: Unsubscribe;
  }>();

  function share<S>(
    atom:    Atom<S>,
    options: ShareOptions<S> = {},
  ): Unsubscribe {
    const atomKey   = atom.key;
    const peerId    = options.peerId    ?? uuid();
    const channel   = options.channel   ?? atomKey;
    const conflict  = (options.conflict ?? 'last-write-wins') as Required<ShareOptions<S>>['conflict'];
    const propagate = options.propagate ?? true;

    if (shared.has(atomKey)) {
      console.warn(`[@vi/state-fp/sync] Atom "${atomKey}" is already shared. Call unsync before re-sharing.`);
      return shared.get(atomKey)!.unsubKernel;
    }

    const bridge = transportFactory(channel) as SyncTransport<S>;

    const syncState: SyncState<S> = {
      peerId,
      version:           createVersionVector(peerId, 0),
      // Reflect the actual transport connectivity — false for noop (SSR/Node.js)
      connected:         bridge.isOpen,
      peers:             new Map(),
      conflictsResolved: 0,
      _pending:          undefined,
    };

    // ── Handle incoming messages ──────────────────────────────────────────────
    const unsubTransport = bridge.subscribe((msg: SyncMessage<S>) => {
      if (msg.peerId === peerId) return; // ignore own messages

      switch (msg.type) {
        case 'vi/sync/hello': {
          const hello = msg as HelloMessage;
          syncState.peers.set(hello.peerId, hello.version);

          // reply with our current state so the new peer catches up
          if (propagate) {
            const currentState = atom.get();
            const reply: StateMessage<S> = {
              type:    'vi/sync/state',
              peerId,
              atomKey,
              state:   currentState,
              version: syncState.version,
              ts:      now(),
            };
            bridge.send(reply);
          }
          break;
        }

        case 'vi/sync/state': {
          const stateMsg = msg as StateMessage<S>;
          syncState.peers.set(stateMsg.peerId, stateMsg.version);

          // skip if we've already seen this update
          if (isStale(syncState.version, stateMsg.version)) break;

          const currentState = atom.get();
          const remoteVersion = stateMsg.version;

          let winning: S;

          if (isConcurrent(syncState.version, remoteVersion)) {
            // conflict — apply resolution strategy
            winning = resolveConflict(
              conflict as Required<ShareOptions<S>>['conflict'],
              { state: currentState, version: syncState.version, timestamp: now(), peerId },
              { state: stateMsg.state, version: remoteVersion,   timestamp: stateMsg.ts, peerId: stateMsg.peerId },
            );
            syncState.conflictsResolved++;
          } else {
            // remote is strictly ahead — accept it
            winning = stateMsg.state;
          }

          syncState.version = merge(syncState.version, remoteVersion);
          // Apply winning state directly (bypass CQRS for sync-originated updates)
          // Mark to skip re-broadcasting this state to prevent echo loop
          _ignoreNext = true;
          atom._setState(winning as S);
          break;
        }

        case 'vi/sync/request': {
          // Another peer is requesting our state
          const reply: StateMessage<S> = {
            type:    'vi/sync/state',
            peerId,
            atomKey,
            state:   atom.get(),
            version: syncState.version,
            ts:      now(),
          };
          bridge.send(reply);
          break;
        }

        case 'vi/sync/event':
          // Phase 4+ feature: event-sourced sync
          break;
      }
    });

    // ── Broadcast own writes ──────────────────────────────────────────────────
    let _ignoreNext = false; // prevent re-broadcasting our own applied remote state

    const unsubKernel = kernel.subscribe<S>(atom, (newState: S) => {
      if (_ignoreNext) { _ignoreNext = false; return; }
      if (!propagate) return;

      syncState.version = increment(syncState.version, peerId);

      const msg: StateMessage<S> = {
        type:    'vi/sync/state',
        peerId,
        atomKey,
        state:   newState,
        version: syncState.version,
        ts:      now(),
      };
      bridge.send(msg);
    });

    // ── Announce presence ─────────────────────────────────────────────────────
    const hello: HelloMessage = {
      type:    'vi/sync/hello',
      peerId,
      atomKey,
      version: syncState.version,
      ts:      now(),
    };
    bridge.send(hello);

    shared.set(atomKey, {
      transport:      bridge  as SyncTransport<unknown>,
      syncState:      syncState as SyncState<unknown>,
      atom:           atom    as Atom<unknown>,
      options:        { channel, conflict, peerId, propagate } as Required<ShareOptions<unknown>>,
      unsubKernel,
      unsubTransport,
    });

    return function unsync(): void {
      const entry = shared.get(atomKey);
      if (!entry) return;
      entry.unsubKernel();
      entry.unsubTransport();
      entry.transport.close();
      entry.syncState.connected = false;
      shared.delete(atomKey);
    };
  }

  function getState<S>(atomKey: string): SyncState<S> | undefined {
    const entry = shared.get(atomKey);
    return entry ? (entry.syncState as SyncState<S>) : undefined;
  }

  function destroy(): void {
    for (const entry of shared.values()) {
      entry.unsubKernel();
      entry.unsubTransport();
      entry.transport.close();
      entry.syncState.connected = false;
    }
    shared.clear();
  }

  return { share, getState, destroy };
}
