/**
 * @vi/state-fp/kernel — createKernel.
 *
 * The Kernel is the runtime coordinator:
 *   - Routes commands through CommandBus → CommandHandler → EventApplier → Atom
 *   - Routes queries through QueryBus → QueryHandler
 *   - Emits DomainEvents on the DomainEventBus
 *   - Manages atom persistence (if storage configured)
 *   - Calls plugins and debug layer
 *
 * Invariant I9: execute() is synchronous for the reduce step.
 *               Storage write is async but non-blocking (fire-and-forget with error capture).
 */

import { uuid, now } from '../core/utils.js';
import type { Either } from '../core/types.js';
import type {
  Atom,
  ComputedAtom,
  Command,
  CommandMeta,
  Query,
  DomainEvent,
  EventApplier,
  CommandHandler,
  AsyncCommandHandler,
  AsyncHandlerContext,
  QueryHandler,
  CommandError,
  KernelOptions,
  KernelPlugin,
  DebugInterface,
  Unsubscribe,
  Kernel,
  ExecuteOptimisticOptions,
} from './types.js';
import { CommandBus } from './command.js';
import { QueryBus } from './query.js';
import { DomainEventBus, stampEvent } from './event.js';
import { assertApplicationStoragePolicy } from './storage-guard.js';

// ─── No-op debug layer ────────────────────────────────────────────────────────

const noopDebug: DebugInterface = {
  isEnabled: false,
  record:    () => void 0,
};

// ─── Kernel implementation ────────────────────────────────────────────────────
// The Kernel interface is defined in ./types.ts — imported above.

// ─── Internal state ───────────────────────────────────────────────────────────

interface AtomRegistration<S = unknown> {
  atom:     Atom<S>;
  appliers: EventApplier<S>[];
}

// ─── createKernel ─────────────────────────────────────────────────────────────

/**
 * Create a new Kernel instance.
 *
 * @example
 * // Minimal — no devtools
 * const kernel = createKernel();
 *
 * // With devtools
 * import { createDevTools } from '@vi/state-fp/devtools';
 * const kernel = createKernel({ debug: true });
 * // — or —
 * const kernel = createKernel({ devtools: createDevTools({ maxEvents: 500 }) });
 */
export function createKernel(options: KernelOptions = {}): Kernel {
  const commandBus      = new CommandBus();
  const queryBus        = new QueryBus();
  const eventBus        = new DomainEventBus();
  const plugins:        KernelPlugin[]                          = [];
  const atoms           = new Map<string, AtomRegistration>();
  const applierMap      = new Map<string, EventApplier<unknown>>();
  /** Phase 1.4 — maps `"atomKey::commandType"` → AsyncCommandHandler */
  const asyncHandlerMap = new Map<string, AsyncCommandHandler<unknown>>();
  /** Phase 2.5 — maps atomKey → set of computed atoms that depend on it */
  const computedDependencies = new Map<string, Set<ComputedAtom<any>>>();
  /** Phase 2.5 — cache last dependency references for each computed atom */
  const computedDepRefs = new Map<ComputedAtom<any>, readonly any[]>();
  /** Phase 2.5 — all registered computed atoms */
  const computedAtoms = new Set<ComputedAtom<any>>();

  // ── Debug layer ─────────────────────────────────────────────────────────────

  let debugLayer: DebugInterface = noopDebug;
  if (options.debug === true) {
    // Lazy default: just enable flag — no full devtools in kernel dependency
    debugLayer = { isEnabled: true, record: () => void 0 };
  } else if (options.debug && typeof options.debug === 'object') {
    debugLayer = options.debug;
  }

  // ── State sanitizer (Redux/NgRx pattern) ─────────────────────────────────
  // Redacts sensitive atom state before it reaches the debug/DevTools layer.
  // The real in-memory state is NEVER touched — only the debug snapshot is replaced.
  function sanitize(atomKey: string, state: unknown): unknown {
    return options.stateSanitizer ? options.stateSanitizer(atomKey, state) : state;
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  function getAtomRegistration<S>(atom: Atom<S>): AtomRegistration<S> {
    const key  = atom.definition.key;
    let   reg  = atoms.get(key) as AtomRegistration<S> | undefined;
    if (!reg) {
      reg = { atom: atom as Atom<S>, appliers: [] };
      atoms.set(key, reg as AtomRegistration);
    }
    return reg;
  }

  function applyEvents<S>(
    atom:    Atom<S>,
    events:  DomainEvent[],
    correlationId: string,
    causationId:   string,
  ): S {
    let state = atom.get();

    for (const rawEvent of events) {
      // Stamp event metadata
      const stamped = stampEvent(rawEvent as DomainEvent, {
        correlationId,
        causationId,
        atomKey: atom.definition.key,
        version: atom.version + 1,
      });

      // Find the registered applier for this atom + event type combo
      const applierKey = `${atom.definition.key}::*`;
      const applier    = applierMap.get(applierKey) as EventApplier<S> | undefined;
      if (applier) {
        state = applier(state, stamped);
      }
    }

    return state;
  }

  function writeToStorage<S>(atom: Atom<S>, state: S): void {
    const storageConfig = atom.definition.storage;
    if (!storageConfig) return;
    assertApplicationStoragePolicy(atom.definition.key, storageConfig);
    // memory-only policy: never write to browser storage
    if (storageConfig.security === 'memory-only') return;
    const key = storageConfig.key ?? atom.definition.key;
    storageConfig.adapter
      .set(key, state, storageConfig.ttl)
      .then((result) => {
        // StorageResult<void> = Either<StorageError, void> — surface Left as error to plugins
        if (result._tag === 'Left') {
          plugins.forEach(p => p.onError?.({
            command: { _kind: 'Command', type: '__storage_error__', meta: { correlationId: '', timestamp: now() } },
            error:   { code: 'STORAGE_WRITE_ERROR', message: result.left.message },
            atomKey: atom.definition.key,
          }));
        }
      })
      .catch((err: unknown) => {
        // Unexpected Promise rejection — surface to plugins
        plugins.forEach(p => p.onError?.({
          command: { _kind: 'Command', type: '__storage_error__', meta: { correlationId: '', timestamp: now() } },
          error:   { code: 'STORAGE_WRITE_ERROR', message: String(err) },
          atomKey: atom.definition.key,
        }));
      });
  }

  /** Phase 2.5 — Recompute computed atoms that depend on a changed source atom. */
  function recomputeDependents(changedAtomKey: string): void {
    const dependents = computedDependencies.get(changedAtomKey);
    if (!dependents) return;

    for (const computed of dependents) {
      // Get fresh dep states
      const depStates = computed.definition.deps.map(dep => dep.get());

      // Memoise: only recompute when one of the dependency references changes.
      const prevDeps = computedDepRefs.get(computed);
      const depsUnchanged =
        prevDeps !== undefined &&
        prevDeps.length === depStates.length &&
        prevDeps.every((prev, i) => Object.is(prev, depStates[i]));

      if (depsUnchanged) continue;

      // Store latest dep references (for subsequent calls)
      computedDepRefs.set(computed, depStates);

      // Get current computed value to check for changes
      const prevValue = computed.get();
      const nextValue = computed.definition.compute(depStates as readonly any[]);

      // Notify subscribers if compute function returned a different value
      if (!Object.is(prevValue, nextValue)) {
        computed._setComputed(nextValue);
      }
    }
  }

  // ── Kernel object ────────────────────────────────────────────────────────────

  const kernel: Kernel = {
    execute<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S> {
      const atomKey      = atom.definition.key;
      const startTime    = now();
      const currentState = atom.get();

      // Guard: computed atoms are read-only; reject execute() calls at runtime
      if (!('_setState' in atom)) {
        return {
          _tag: 'Left' as const,
          left: { code: 'COMPUTED_ATOM', message: `Atom "${atomKey}" is a computed atom and cannot accept commands.` },
        };
      }

      // 1. Stamp command meta if needed
      const fullCmd: Command = {
        ...cmd,
        meta: {
          correlationId: cmd.meta?.correlationId ?? uuid(),
          timestamp:     cmd.meta?.timestamp     ?? startTime,
          ...(cmd.meta?.causationId !== undefined && { causationId: cmd.meta.causationId }),
          ...(cmd.meta?.issuedBy    !== undefined ? { issuedBy: cmd.meta.issuedBy } : options.instanceId !== undefined ? { issuedBy: options.instanceId } : {}),
        },
      };

      // 2. Execute via CommandBus → Either<CommandError, DomainEvent[]>
      const result = commandBus.execute(atomKey, currentState, fullCmd);

      if (result._tag === 'Left') {
        // Command validation failed
        const err = result.left;
        plugins.forEach(p => p.onError?.({ command: fullCmd, error: err, atomKey }));
        if (debugLayer.isEnabled) {
          debugLayer.record({
            commandType:   fullCmd.type,
            correlationId: (fullCmd.meta as CommandMeta).correlationId,
            atomKey,
            events:        [],
            prevState:     sanitize(atomKey, currentState),
            nextState:     sanitize(atomKey, currentState),
            durationMs:    now() - startTime,
            error:         err,
            timestamp:     startTime,
          });
        }
        return result as Either<CommandError, S>;
      }

      // 3. Apply events
      const rawEvents    = result.right;
      const cmdMeta      = fullCmd.meta as CommandMeta;
      const newState     = applyEvents(
        atom,
        rawEvents,
        cmdMeta.correlationId,
        cmdMeta.correlationId, // causationId = the command's correlationId for first-level
      );

      // 4. Update atom state
      atom._setState(newState);

      // 4.5 Phase 2.5 — Recompute dependent computed atoms
      recomputeDependents(atomKey);

      // 5. Stamp events with proper causationId (command id acts as causation)
      const stampedEvents = rawEvents.map(e =>
        stampEvent(e as DomainEvent, {
          correlationId: cmdMeta.correlationId,
          causationId:   cmdMeta.correlationId,
          atomKey,
          version:       atom.version,
        }),
      );

      // 6. Persist to storage (fire-and-forget)
      writeToStorage(atom, newState);

      // 7. Emit on domain event bus
      eventBus.emit(stampedEvents);

      // 8. Notify plugins
      const durationMs = now() - startTime;
      plugins.forEach(p =>
        p.onExecute?.({
          command:   fullCmd,
          events:    stampedEvents,
          prevState: currentState,
          nextState: newState,
          atomKey,
          durationMs,
        }),
      );

      // 9. Record to debug layer
      if (debugLayer.isEnabled) {
        debugLayer.record({
          commandType:   fullCmd.type,
          correlationId: cmdMeta.correlationId,
          atomKey,
          events:        stampedEvents,
          prevState:     sanitize(atomKey, currentState),
          nextState:     sanitize(atomKey, newState),
          durationMs,
          timestamp:     startTime,
        });
      }

      return { _tag: 'Right', right: newState };
    },

    executeAsync<S>(
      atom:       Atom<S>,
      cmd:        Command,
      execOptions?: { signal?: AbortSignal },
    ): Promise<Either<CommandError, S>> {
      const atomKey      = atom.definition.key;
      const asyncHandler = asyncHandlerMap.get(`${atomKey}::${cmd.type}`) as
        | AsyncCommandHandler<S>
        | undefined;

      if (!asyncHandler) {
        // No async handler registered — fall back to synchronous execute
        return Promise.resolve(this.execute(atom, cmd));
      }

      const signal = execOptions?.signal ?? new AbortController().signal;
      if (signal.aborted) {
        return Promise.resolve({
          _tag: 'Left' as const,
          left: { code: 'CANCELLED', message: 'Command was cancelled before execution' },
        });
      }

      const startTime    = now();
      const currentState = atom.get();

      const fullCmd: Command = {
        ...cmd,
        meta: {
          correlationId: cmd.meta?.correlationId ?? uuid(),
          timestamp:     cmd.meta?.timestamp     ?? startTime,
          ...(cmd.meta?.causationId !== undefined && { causationId: cmd.meta.causationId }),
          ...(cmd.meta?.issuedBy !== undefined
            ? { issuedBy: cmd.meta.issuedBy }
            : options.instanceId !== undefined
              ? { issuedBy: options.instanceId }
              : {}),
        },
      };

      const ctx: AsyncHandlerContext = {
        signal,
        correlationId: (fullCmd.meta as CommandMeta).correlationId,
      };

      return asyncHandler.handleAsync(currentState, fullCmd as any, ctx).then(
        (result) => {
          if (signal.aborted) {
            return {
              _tag: 'Left' as const,
              left: { code: 'CANCELLED', message: 'Command was cancelled' },
            };
          }

          if (result._tag === 'Left') {
            const err = result.left;
            plugins.forEach(p => p.onError?.({ command: fullCmd, error: err, atomKey }));
            if (debugLayer.isEnabled) {
              debugLayer.record({
                commandType:   fullCmd.type,
                correlationId: (fullCmd.meta as CommandMeta).correlationId,
                atomKey,
                events:        [],
                prevState:     sanitize(atomKey, currentState),
                nextState:     sanitize(atomKey, currentState),
                durationMs:    now() - startTime,
                error:         err,
                timestamp:     startTime,
              });
            }
            return result as Either<CommandError, S>;
          }

          const rawEvents = result.right;
          const cmdMeta   = fullCmd.meta as CommandMeta;
          const newState  = applyEvents(
            atom, rawEvents, cmdMeta.correlationId, cmdMeta.correlationId,
          );
          atom._setState(newState);

          // Phase 2.5 — Recompute dependent computed atoms
          recomputeDependents(atom.definition.key);

          const stampedEvents = rawEvents.map(e =>
            stampEvent(e as DomainEvent, {
              correlationId: cmdMeta.correlationId,
              causationId:   cmdMeta.correlationId,
              atomKey,
              version:       atom.version,
            }),
          );

          writeToStorage(atom, newState);
          eventBus.emit(stampedEvents);

          const durationMs = now() - startTime;
          plugins.forEach(p =>
            p.onExecute?.({
              command:   fullCmd,
              events:    stampedEvents,
              prevState: currentState,
              nextState: newState,
              atomKey,
              durationMs,
            }),
          );

          if (debugLayer.isEnabled) {
            debugLayer.record({
              commandType:   fullCmd.type,
              correlationId: cmdMeta.correlationId,
              atomKey,
              events:        stampedEvents,
              prevState:     sanitize(atomKey, currentState),
              nextState:     sanitize(atomKey, newState),
              durationMs,
              timestamp:     startTime,
            });
          }

          return { _tag: 'Right' as const, right: newState };
        },
        (err: unknown) => {
          if (signal.aborted) {
            return {
              _tag: 'Left' as const,
              left: { code: 'CANCELLED', message: 'Command was cancelled' },
            };
          }
          return {
            _tag: 'Left' as const,
            left: { code: 'HANDLER_ERROR', message: String(err) },
          };
        },
      );
    },

    query<R = unknown>(atom: Atom<unknown>, q: Query): R {
      return queryBus.execute(atom.definition.key, atom.get(), q) as R;
    },

    async executeOptimistic<S>(
      atom: Atom<S>,
      cmd: Command,
      opts: ExecuteOptimisticOptions<S>,
    ): Promise<Either<CommandError, S>> {
      const atomKey = atom.definition.key;
      const startTime = now();
      const preOptimisticState = atom.get();

      // Ensure command has metadata
      const fullCmd: Command = {
        ...cmd,
        meta: {
          correlationId: cmd.meta?.correlationId ?? uuid(),
          timestamp: cmd.meta?.timestamp ?? startTime,
          ...(cmd.meta?.causationId !== undefined && { causationId: cmd.meta.causationId }),
          ...(cmd.meta?.issuedBy !== undefined
            ? { issuedBy: cmd.meta.issuedBy }
            : options.instanceId !== undefined
              ? { issuedBy: options.instanceId }
              : {}),
        },
      };

      const cmdMeta = fullCmd.meta as CommandMeta;

      try {
        // 1. Apply optimistic state immediately
        const optimisticState = opts.optimisticApplier(preOptimisticState, fullCmd);
        atom._setState(optimisticState);

        // Recompute dependent computed atoms with optimistic state
        recomputeDependents(atomKey);

        // Record optimistic entry in debug
        if (debugLayer.isEnabled) {
          debugLayer.record({
            commandType: fullCmd.type,
            correlationId: cmdMeta.correlationId,
            atomKey,
            events: [],
            prevState: sanitize(atomKey, preOptimisticState),
            nextState: sanitize(atomKey, optimisticState),
            durationMs: 0, // Optimistic is synchronous
            timestamp: startTime,
          });
        }

        // 2. Call confirm asynchronously
        const confirmResult = await opts.confirm(optimisticState);

        // 3a. If confirmation succeeded, we're done (state stays optimistic)
        if (confirmResult._tag === 'Right') {
          const durationMs = now() - startTime;
          plugins.forEach(p =>
            p.onExecute?.({
              command: fullCmd,
              events: [],
              prevState: preOptimisticState,
              nextState: optimisticState,
              atomKey,
              durationMs,
            }),
          );

          return { _tag: 'Right' as const, right: optimisticState };
        }

        // 3b. Confirmation failed — Roll back atomically
        const error = confirmResult.left;
        atom._setState(preOptimisticState);
        recomputeDependents(atomKey);

        // Call onRollback if provided
        if (opts.onRollback) {
          try {
            await opts.onRollback(error);
          } catch (callbackErr) {
            // Log but don't throw — onRollback errors shouldn't prevent the main failure
            console.error('Error in onRollback callback:', callbackErr);
          }
        }

        // Notify plugins and debug about the rollback
        plugins.forEach(p => p.onError?.({ command: fullCmd, error, atomKey }));

        if (debugLayer.isEnabled) {
          debugLayer.record({
            commandType: fullCmd.type,
            correlationId: cmdMeta.correlationId,
            atomKey,
            events: [],
            prevState: sanitize(atomKey, preOptimisticState),
            nextState: sanitize(atomKey, preOptimisticState),
            durationMs: now() - startTime,
            error,
            timestamp: startTime,
          });
        }

        return { _tag: 'Left' as const, left: error };
      } catch (err: unknown) {
        // Unexpected error during confirm — roll back
        atom._setState(preOptimisticState);
        recomputeDependents(atomKey);

        const error: CommandError = {
          code: 'HANDLER_ERROR',
          message: `Optimistic update failed: ${String(err)}`,
        };

        if (opts.onRollback) {
          try {
            await opts.onRollback(error);
          } catch (callbackErr) {
            console.error('Error in onRollback callback:', callbackErr);
          }
        }

        plugins.forEach(p => p.onError?.({ command: fullCmd, error, atomKey }));

        if (debugLayer.isEnabled) {
          debugLayer.record({
            commandType: fullCmd.type,
            correlationId: cmdMeta.correlationId,
            atomKey,
            events: [],
            prevState: sanitize(atomKey, preOptimisticState),
            nextState: sanitize(atomKey, preOptimisticState),
            durationMs: now() - startTime,
            error,
            timestamp: startTime,
          });
        }

        return { _tag: 'Left' as const, left: error };
      }
    },

    register<S>(
      atom:     Atom<S>,
      handler?: CommandHandler<S, Command>,
      applier?: EventApplier<S>,
    ): void {
      assertApplicationStoragePolicy(atom.definition.key, atom.definition.storage);

      // Phase 1.3 — co-located registration: single-arg form reads from atom.definition
      if (!handler || !applier) {
        const def = atom.definition;
        if (def.commands && def.applier) {
          for (const cmd of def.commands) {
            this.register(atom, cmd as CommandHandler<S, Command>, def.applier as EventApplier<S>);
          }
        }
        if (def.queries) {
          for (const q of def.queries) {
            this.registerQuery(atom, q as QueryHandler<S, Query, unknown>);
          }
        }
        return;
      }

      const atomKey = atom.definition.key;
      getAtomRegistration(atom);
      commandBus.register(atomKey, handler);
      // Compose appliers if register() is called multiple times for the same atom
      const existing = applierMap.get(`${atomKey}::*`) as EventApplier<S> | undefined;
      if (existing) {
        const composed: EventApplier<S> = (state, event) =>
          applier(existing(state, event), event);
        applierMap.set(`${atomKey}::*`, composed as EventApplier<unknown>);
      } else {
        applierMap.set(`${atomKey}::*`, applier as EventApplier<unknown>);
      }
      plugins.forEach(p => p.onRegister?.(atom as Atom<unknown>));
    },

    registerAsync<S>(
      atom:    Atom<S>,
      handler: AsyncCommandHandler<S, Command>,
      applier: EventApplier<S>,
    ): void {
      assertApplicationStoragePolicy(atom.definition.key, atom.definition.storage);

      const atomKey = atom.definition.key;
      getAtomRegistration(atom);
      // Store typed async handler keyed by "atomKey::commandType"
      asyncHandlerMap.set(`${atomKey}::${handler.commandType}`, handler as AsyncCommandHandler<unknown>);
      // Register the applier for event application (shared with sync path)
      const existing = applierMap.get(`${atomKey}::*`) as EventApplier<S> | undefined;
      if (existing) {
        const composed: EventApplier<S> = (state, event) =>
          applier(existing(state, event), event);
        applierMap.set(`${atomKey}::*`, composed as EventApplier<unknown>);
      } else {
        applierMap.set(`${atomKey}::*`, applier as EventApplier<unknown>);
      }
      plugins.forEach(p => p.onRegister?.(atom as Atom<unknown>));
    },

    registerQuery<S, Q extends Query, R>(
      atom:    Atom<S>,
      handler: QueryHandler<S, Q, R>,
    ): void {
      assertApplicationStoragePolicy(atom.definition.key, atom.definition.storage);
      queryBus.register(atom.definition.key, handler);
    },

    /**
     * Phase 2.5 — Register a computed atom.
     *
     * The kernel tracks dependency links so that when a source atom is updated via
     * `kernel.execute()`, `recomputeDependents()` can re-evaluate and update the computed
     * atom. This is not a “subscription” in the reactive sense (it does not call `dep.subscribe`).
     */
    registerComputed<R>(computed: ComputedAtom<R>): void {
      computedAtoms.add(computed);

      // Track dependency relationships for recomputation.
      for (const dep of computed.definition.deps) {
        const depKey = dep.definition.key;
        let dependents = computedDependencies.get(depKey);
        if (!dependents) {
          dependents = new Set();
          computedDependencies.set(depKey, dependents);
        }
        dependents.add(computed);
      }

      // Initial compute & cache dependency references.
      const depStates = computed.definition.deps.map(dep => dep.get());
      computedDepRefs.set(computed, depStates);

      const initialValue = computed.definition.compute(depStates as readonly any[]);
      computed._setComputed(initialValue);
    },

    subscribeComputed<R>(computed: ComputedAtom<R>, listener: (v: R) => void): Unsubscribe {
      // Immediately notify with current value, then subscribe to future updates
      listener(computed.get());
      return computed.subscribe(listener);
    },

    subscribe<S>(atom: Atom<S>, listener: (s: S) => void): Unsubscribe {
      return atom.subscribe(listener);
    },

    onEvent(listener: (e: DomainEvent) => void): Unsubscribe {
      return eventBus.subscribe(listener);
    },

    async hydrate(): Promise<void> {
      const hydratePromises: Promise<void>[] = [];

      for (const [, reg] of atoms) {
        const { atom } = reg;
        const storageConfig = atom.definition.storage;
        if (!storageConfig) continue;
        assertApplicationStoragePolicy(atom.definition.key, storageConfig);
        // memory-only policy: never read from browser storage
        if (storageConfig.security === 'memory-only') continue;

        const key = storageConfig.key ?? atom.definition.key;
        hydratePromises.push(
          storageConfig.adapter.get(key).then((result) => {
            // StorageResult<Maybe<S>> = Either<StorageError, Maybe<S>> — unwrap Either first
            if (result._tag === 'Left') return; // storage error — fall back to initialState
            const maybe = result.right;
            if (maybe._tag === 'Just' && maybe.value !== undefined) {
              atom._setState(maybe.value as typeof atom extends Atom<infer S> ? S : unknown);
            }
          }).catch(() => {
            // Unexpected rejection — silently fall back to initialState
          }),
        );
      }

      await Promise.allSettled(hydratePromises);
    },

    async destroy(): Promise<void> {
      eventBus.clear();
      commandBus.clear();
      queryBus.clear();
      atoms.clear();
      applierMap.clear();
      asyncHandlerMap.clear();
      computedAtoms.clear();
      computedDependencies.clear();
      plugins.forEach(p => p.onDestroy?.());
      plugins.length = 0;
      debugLayer = noopDebug;
    },

    use(plugin: KernelPlugin): void {
      plugins.push(plugin);
    },

    get debug(): DebugInterface {
      return debugLayer;
    },
  };

  return kernel;
}


