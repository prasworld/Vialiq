/**
 * @vi/state-fp/kernel — Type definitions.
 *
 * All types used by the CQRS kernel. Separated from implementations
 * so that application code only imports types without side effects.
 */

import type { Either, Maybe } from '../core/types.js';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** A function that cancels a subscription when called. */
export type Unsubscribe = () => void;

// ─── Command ──────────────────────────────────────────────────────────────────

/** Metadata stamped on every command by the kernel. */
export type CommandMeta = {
  /** Stamped by kernel if not provided by caller. */
  readonly correlationId: string;
  /** ID of the DomainEvent that triggered this command (for sagas). */
  readonly causationId?: string;
  /** Identifier of the MFE that issued this command. */
  readonly issuedBy?: string;
  readonly timestamp: number;
};

/**
 * A Command expresses intent to change state.
 * Commands carry business semantics ("RegisterUser", "AddItemToCart").
 * They are validated by a CommandHandler before producing DomainEvents.
 */
export type Command<T extends string = string, P = void> = P extends void
  ? { readonly _kind: 'Command'; readonly type: T; readonly meta: CommandMeta }
  : { readonly _kind: 'Command'; readonly type: T; readonly payload: P; readonly meta: CommandMeta };

// ─── DomainEvent ──────────────────────────────────────────────────────────────

/** Metadata stamped on every DomainEvent by the kernel. */
export type DomainEventMeta = {
  /** Unique ID of this event instance. */
  readonly id: string;
  /** Correlation chain — carried from the originating command. */
  readonly correlationId: string;
  /** ID of the command that produced this event. */
  readonly causationId: string;
  /** Key of the atom this event belongs to. */
  readonly atomKey: string;
  readonly timestamp: number;
  /** Atom state version at the time this event was emitted. */
  readonly version: number;
};

/**
 * A DomainEvent is an immutable fact — it describes what happened.
 * Events are produced by CommandHandlers and cannot fail.
 * Events are the canonical truth for time-travel replay.
 */
export type DomainEvent<T extends string = string, P = void> = P extends void
  ? { readonly _kind: 'DomainEvent'; readonly type: T; readonly meta: DomainEventMeta }
  : { readonly _kind: 'DomainEvent'; readonly type: T; readonly payload: P; readonly meta: DomainEventMeta };

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * A Query requests derived data without mutating state.
 * Queries are synchronous and never fail at the business-rule level.
 */
export type Query<T extends string = string, P = void> = P extends void
  ? { readonly _kind: 'Query'; readonly type: T }
  : { readonly _kind: 'Query'; readonly type: T; readonly payload: P };

// ─── Error types ──────────────────────────────────────────────────────────────

/** Error produced by a failed command execution. */
export type CommandError = {
  readonly code:    string;
  readonly message: string;
  readonly details?: unknown;
};

// ─── Atom ─────────────────────────────────────────────────────────────────────

/** How the atom should persist its state between sessions. */
export type AtomStorageConfig<S = unknown> = {
  /** Adapter instance. `MemoryAdapter` is the default. */
  adapter: StorageAdapterLike<S>;
  /** Storage key — defaults to atom.key if omitted. */
  key?: string;
  /** TTL in milliseconds. Undefined = immortal. */
  ttl?: number;
};

/**
 * A minimal duck-type for storage adapters.
 * Prevents a hard dependency on `@vi/state-fp/storage`.
 */
export type StorageAdapterLike<S = unknown> = {
  get(key: string): Promise<Maybe<S>>;
  set(key: string, value: S, ttl?: number): Promise<void>;
};

/** Configuration passed to `defineAtom`. */
export type AtomDefinition<S> = {
  /** Globally unique key (namespaced recommended, e.g. `vi/counter`). */
  readonly key:          string;
  /** Starting value. Used when storage returns nothing. */
  readonly initialState: S;
  /** Optional persistence. No storage = in-memory only. */
  readonly storage?:     AtomStorageConfig<S>;
  /** Optional debug label for DevTools display. */
  readonly debugLabel?:  string;
  /**
   * Phase 1.3 — co-located handlers.
   * When provided, `kernel.register(atom)` reads these instead of requiring
   * separate `register(atom, handler, applier)` calls.
   */
  readonly commands?: ReadonlyArray<CommandHandler<S, Command>>;
  readonly applier?:  EventApplier<S>;
  readonly queries?:  ReadonlyArray<QueryHandler<S, Query, unknown>>;
};

/**
 * The public handle to an atom.
 * State is never mutated directly — always via `kernel.execute()`.
 */
export type Atom<S> = {
  readonly definition: AtomDefinition<S>;
  /** Convenience shortcut for `definition.key`. */
  readonly key: string;
  /** Get the current state. Returns `initialState` before hydration. */
  get(): S;
  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: (s: S) => void): Unsubscribe;
  /** Atom state version — incremented on every successful execute. */
  readonly version: number;
  /** @internal — used only by the kernel. Never call directly. */
  _setState(s: S, version?: number): void;
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * A CommandHandler validates a command and produces DomainEvents.
 * It is a pure function — no I/O, no async.
 *
 * Invariant: handle() MUST NOT mutate state; returns Either<Error, Events>.
 */
export type CommandHandler<S, C extends Command = Command> = {
  commandType: C['type'];
  handle: (state: S, command: C) => Either<CommandError, DomainEvent[]>;
};

// ─── Phase 1.4 — Async Command Handler ───────────────────────────────────────

/**
 * Context passed to every `AsyncCommandHandler.handleAsync` call.
 */
export type AsyncHandlerContext = {
  /** AbortSignal — resolved when the caller cancels the in-flight command. */
  readonly signal:        AbortSignal;
  /** Correlation ID of the originating command, for chained sub-commands. */
  readonly correlationId: string;
};

/**
 * An async variant of CommandHandler.
 * Use for commands that require I/O before deciding which events to emit
 * (e.g. server-side uniqueness checks, file uploads, API calls).
 *
 * Invariant (I17): MUST honour `ctx.signal` — resolve Left({ code: 'CANCELLED' })
 * when the signal is aborted rather than hanging indefinitely.
 *
 * @example
 * const checkoutHandler: AsyncCommandHandler<CartState, StartCheckout> = {
 *   commandType: 'cart/startCheckout',
 *   handleAsync: async (state, cmd, ctx) => {
 *     if (ctx.signal.aborted) return left({ code: 'CANCELLED', message: 'Aborted' });
 *     const result = await api.checkout(state.items, { signal: ctx.signal });
 *     if (result.error) return left({ code: 'API_ERROR', message: result.error });
 *     return right([domainEvent('cart/checkoutStarted', { orderId: result.orderId })]);
 *   },
 * };
 */
export type AsyncCommandHandler<S, C extends Command = Command> = {
  commandType: C['type'];
  handleAsync: (
    state:   S,
    command: C,
    ctx:     AsyncHandlerContext,
  ) => Promise<Either<CommandError, DomainEvent[]>>;
};

/**
 * An EventApplier reduces a DomainEvent into the next state.
 * It is a pure function — no validation, no I/O.
 * Used for both normal execution and time-travel replay.
 *
 * Invariant: apply() MUST NOT throw; unknown events return state unchanged.
 */
export type EventApplier<S> = (state: S, event: DomainEvent) => S;

/**
 * A QueryHandler computes a derived value from the current state.
 * It is a pure function — never mutates, never fails at protocol level.
 */
export type QueryHandler<S, Q extends Query = Query, R = unknown> = {
  queryType: Q['type'];
  handle: (state: S, query: Q) => R;
};

// ─── Plugin ───────────────────────────────────────────────────────────────────

/** Extension point for devtools, sync, analytics, etc. */
export type KernelPlugin = {
  readonly name: string;
  /** Called when an atom is registered via `kernel.register()`. */
  onRegister?: (atom: Atom<unknown>) => void;
  /** Called after every successful execute() cycle. */
  onExecute?: (params: {
    command:   Command;
    events:    DomainEvent[];
    prevState: unknown;
    nextState: unknown;
    atomKey:   string;
    durationMs: number;
  }) => void;
  /** Called when a command results in an error. */
  onError?: (params: {
    command: Command;
    error:   CommandError;
    atomKey: string;
  }) => void;
  /** Called once when the kernel is destroyed. */
  onDestroy?: () => void;
};

// ─── Debug interface ──────────────────────────────────────────────────────────

/** Minimal interface the kernel uses internally for debug recording. */
export type DebugInterface = {
  readonly isEnabled: boolean;
  record(entry: KernelDebugEntry): void;
};

/** What the kernel sends to the debug layer after each execute. */
export type KernelDebugEntry = {
  readonly commandType:  string;
  readonly correlationId: string;
  readonly atomKey:      string;
  readonly events:       DomainEvent[];
  readonly prevState:    unknown;
  readonly nextState:    unknown;
  readonly durationMs:   number;
  readonly error?:       CommandError;
  readonly timestamp:    number;
};

// ─── Kernel ───────────────────────────────────────────────────────────────────

/** Options for `createKernel`. */
export type KernelOptions = {
  /** Enable debug recording. Default: false. */
  debug?: boolean | DebugInterface;
  /** MFE identifier — stamped on command.meta.issuedBy. */
  instanceId?: string;
};

/**
 * The public Kernel interface.
 * All state transitions flow through `execute()` and all reads through `query()`.
 */
export interface Kernel {
  // ── Write side ──────────────────────────────────────────────────────────────

  /** Execute a command against an atom. Synchronous reduce; storage write is async fire-and-forget. */
  execute<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;

  /**
   * Async variant — dispatches to `AsyncCommandHandler.handleAsync` if registered,
   * otherwise falls back to synchronous `execute()` wrapped in a resolved Promise.
   * Supports cancellation via an optional AbortController.
   */
  executeAsync<S>(
    atom:    Atom<S>,
    cmd:     Command,
    options?: { signal?: AbortSignal },
  ): Promise<Either<CommandError, S>>;

  // ── Read side ───────────────────────────────────────────────────────────────

  /** Run a query against an atom's current state. Pure, synchronous. Throws if no handler. */
  query<R = unknown>(atom: Atom<unknown>, q: Query): R;

  // ── Registration ────────────────────────────────────────────────────────────

  /**
   * Register a CommandHandler and EventApplier pair for an atom.
   *
   * Phase 1.3 overload: when called with only the atom, reads `atom.definition.commands`,
   * `atom.definition.applier`, and `atom.definition.queries` for co-located registration.
   */
  register<S>(atom: Atom<S>, handler: CommandHandler<S, Command>, applier: EventApplier<S>): void;
  register<S>(atom: Atom<S>): void;

  /** Register an AsyncCommandHandler — used by `executeAsync`. */
  registerAsync<S>(
    atom:    Atom<S>,
    handler: AsyncCommandHandler<S, Command>,
    applier: EventApplier<S>,
  ): void;

  /** Register a QueryHandler for an atom. */
  registerQuery<S, Q extends Query, R>(atom: Atom<S>, handler: QueryHandler<S, Q, R>): void;

  // ── Subscriptions ───────────────────────────────────────────────────────────

  /** Subscribe to all state changes on an atom. */
  subscribe<S>(atom: Atom<S>, listener: (s: S) => void): Unsubscribe;

  /** Subscribe to all DomainEvents emitted by the kernel. */
  onEvent(listener: (e: DomainEvent) => void): Unsubscribe;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  /** Hydrate all atoms from their declared storage adapters. */
  hydrate(): Promise<void>;

  /** Flush pending writes, remove all listeners, clear buses. */
  destroy(): Promise<void>;

  // ── Extension ───────────────────────────────────────────────────────────────

  /** Install a plugin (devtools, sync, analytics, etc.). */
  use(plugin: KernelPlugin): void;

  /** The debug interface (noopDebug unless debug:true in options). */
  readonly debug: DebugInterface;
}
