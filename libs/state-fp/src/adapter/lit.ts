/**
 * Lit adapter for @vi/state-fp — Reactive Controller pattern.
 *
 * Integrates with Lit's component update lifecycle via the
 * `ReactiveController` interface shape. No compile-time dependency on `lit`
 * is required — the host is accepted structurally, making the controller
 * fully testable with a plain mock object.
 *
 * ## Usage
 *
 * ```ts
 * import { LitElement, html } from 'lit';
 * import { customElement }    from 'lit/decorators.js';
 * import { createLitController } from '@vi/state-fp/adapter';
 *
 * @customElement('my-counter')
 * class CounterElement extends LitElement {
 *   private counter = createLitController(this, kernel, counterAtom);
 *
 *   render() {
 *     return html`
 *       <p>Count: ${this.counter.state.count}</p>
 *       <button @click=${() => this.counter.dispatch(IncrementBy(1))}>+</button>
 *     `;
 *   }
 * }
 * ```
 *
 * ## With query
 *
 * ```ts
 * get total() {
 *   return this.cartCtrl.query(BuildTotal());
 * }
 * ```
 *
 * ## With EphemeralStream
 *
 * ```ts
 * private mouse = createLitStreamController(this, mousePosStream);
 *
 * render() {
 *   const pos = this.mouse.value;
 *   return html`<div style="left:${pos?.x}px; top:${pos?.y}px"></div>`;
 * }
 * ```
 *
 * @module
 */

import type { Kernel, Atom, Command, Query, Unsubscribe } from '../kernel/types.js';
import type { EphemeralStream }                            from '../core/stream.js';

// ─── ReactiveHost shape ───────────────────────────────────────────────────────

/**
 * Minimal structural interface matching a Lit `ReactiveControllerHost`.
 * Any `LitElement` satisfies this type — no `lit` import required.
 */
export type ReactiveHost = {
  addController(controller: ReactiveControllerLike): void;
  removeController?(controller: ReactiveControllerLike): void;
  requestUpdate(): void;
};

/** Minimal Lit ReactiveController interface — structural match only. */
export type ReactiveControllerLike = {
  hostConnected?():    void;
  hostDisconnected?(): void;
  hostUpdate?():       void;
  hostUpdated?():      void;
};

// ─── AtomController interface ─────────────────────────────────────────────────

/**
 * Returned by `createLitController`.
 *
 * Implements Lit's `ReactiveController` interface structurally:
 * - `hostConnected`    — re-syncs state, subscribes to atom, calls `host.requestUpdate()`
 * - `hostDisconnected` — unsubscribes; no memory leaks
 *
 * State updates call `host.requestUpdate()` to schedule a Lit re-render.
 */
export type AtomController<S> = ReactiveControllerLike & {
  /** Current atom state — updated reactively on every state change. */
  readonly state: S;
  /**
   * Dispatch a command against the atom via the kernel.
   * Returns whatever `kernel.execute` returns — typically `Either<CommandError, DomainEvent[]>`.
   */
  dispatch(cmd: Command): ReturnType<Kernel['execute']>;
  /** Run a query against the atom's current state. */
  query<R>(q: Query): R;
};

// ─── StreamController interface ───────────────────────────────────────────────

/**
 * Returned by `createLitStreamController`.
 *
 * Manages an `EphemeralStream` subscription within the Lit component lifecycle.
 * Uses `subscribeAnimated` by default for RAF-batched 60 fps rendering.
 */
export type StreamController<T> = ReactiveControllerLike & {
  /** Last emitted value, or `undefined` before first emit. */
  readonly value: T | undefined;
};

// ─── createLitController ─────────────────────────────────────────────────────

/**
 * Create a Lit Reactive Controller that tracks an atom's state.
 *
 * The controller:
 * - Subscribes to the atom on `hostConnected`
 * - Calls `host.requestUpdate()` on every state change
 * - Unsubscribes on `hostDisconnected`
 *
 * Does NOT import from `lit` — accepts any host that satisfies `ReactiveHost`.
 *
 * @param host   The `LitElement` (or mock) hosting this controller.
 * @param kernel The kernel managing the atom.
 * @param atom   The atom to subscribe to.
 */
export function createLitController<S>(
  host:   ReactiveHost,
  kernel: Kernel,
  atom:   Atom<S>,
): AtomController<S> {
  let _state: S    = atom.get();
  let _off: Unsubscribe | undefined;

  const controller: AtomController<S> = {
    get state(): S { return _state; },

    dispatch(cmd: Command): ReturnType<Kernel['execute']> {
      return kernel.execute(atom, cmd);
    },

    query<R>(q: Query): R {
      return kernel.query<R>(atom as Atom<unknown>, q);
    },

    hostConnected() {
      // Sync state in case it changed between construction and connection.
      _state = atom.get();
      _off = kernel.subscribe(atom, (s: S) => {
        _state = s;
        host.requestUpdate();
      });
      // Trigger an initial render so the component reflects the current atom
      // state immediately on connection, even if the atom doesn't emit.
      host.requestUpdate();
    },

    hostDisconnected() {
      _off?.();
      _off = undefined;
    },
  };

  host.addController(controller);
  return controller;
}

// ─── createLitStreamController ────────────────────────────────────────────────

/**
 * Create a Lit Reactive Controller that tracks an `EphemeralStream`.
 *
 * By default uses `subscribeAnimated` — the host is updated at most once per
 * animation frame with the latest emitted value. Pass `animated: false` for
 * synchronous delivery on every `emit()`.
 *
 * @param host      The `LitElement` (or mock) hosting this controller.
 * @param stream    The `EphemeralStream` to subscribe to.
 * @param animated  When `true` (default), uses RAF-batched delivery.
 */
export function createLitStreamController<T>(
  host:     ReactiveHost,
  stream:   EphemeralStream<T>,
  animated = true,
): StreamController<T> {
  let _value: T | undefined = stream.last;
  let _off: Unsubscribe | undefined;

  const controller: StreamController<T> = {
    get value(): T | undefined { return _value; },

    hostConnected() {
      // Sync with any value emitted between construction and connection.
      _value = stream.last;
      const listener = (v: T) => {
        _value = v;
        host.requestUpdate();
      };
      _off = animated
        ? stream.subscribeAnimated(listener)
        : stream.subscribe(listener);
    },

    hostDisconnected() {
      _off?.();
      _off = undefined;
    },
  };

  host.addController(controller);
  return controller;
}
