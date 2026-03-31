/**
 * @vialiq/state-fp/kernel — Command types, factory, and CommandBus.
 *
 * Commands express intent. They carry business semantics and are
 * validated by a CommandHandler before any state changes occur.
 *
 * Invariant (I1): CommandHandler.handle is always a pure function — no I/O, no async.
 */

import { uuid, now } from '../core/utils.js';
import type { Command, CommandMeta, CommandHandler, CommandError } from './types.js';
import type { Either } from '../core/types.js';
import type { DomainEvent } from './types.js';

// ─── Command factory ──────────────────────────────────────────────────────────

/**
 * Construct a Command value.
 * The kernel stamps `meta.correlationId` and `meta.timestamp` if not provided.
 *
 * @example
 * const IncrementBy = (n: number) => command('counter/incrementBy', { n });
 */
export function command<T extends string>(type: T): Command<T>;
export function command<T extends string, P>(type: T, payload: P): Command<T, P>;
export function command<T extends string, P>(
  type:     T,
  payload?: P,
  meta?:    Partial<CommandMeta>,
): Command<T, P> | Command<T> {
  const fullMeta: CommandMeta = {
    correlationId: meta?.correlationId ?? uuid(),
    ...(meta?.causationId !== undefined && { causationId: meta.causationId }),
    ...(meta?.issuedBy      !== undefined && { issuedBy:      meta.issuedBy }),
    timestamp:     meta?.timestamp ?? now(),
  };

  if (payload === undefined) {
    return { _kind: 'Command', type, meta: fullMeta } as Command<T>;
  }
  return { _kind: 'Command', type, payload, meta: fullMeta } as Command<T, P>;
}

// ─── CommandHandler factory ───────────────────────────────────────────────────

/**
 * Declare a CommandHandler — maps a command type string to a pure validation
 * + event-production function.
 *
 * @example
 * const incrementHandler = createCommandHandler({
 *   commandType: 'counter/incrementBy',
 *   handle: (state, cmd) =>
 *     cmd.payload.n > 0
 *       ? right([domainEvent('counter/incremented', { by: cmd.payload.n })])
 *       : left({ code: 'INVALID', message: 'n must be positive' }),
 * });
 */
export function createCommandHandler<S, C extends Command>(
  config: CommandHandler<S, C>,
): CommandHandler<S, C> {
  return config;
}

// ─── CommandBus ───────────────────────────────────────────────────────────────

/** @internal — used by the Kernel to route commands to handlers. */
export class CommandBus {
  // Map: commandType → Map<atomKey, handler>
  #handlers = new Map<string, Map<string, CommandHandler<unknown, Command>>>();

  /**
   * Register a handler for a specific command type on a specific atom.
   * Multiple atoms can share the same command type (rare but valid).
   */
  register<S>(
    atomKey: string,
    handler: CommandHandler<S, Command>,
  ): void {
    let atomHandlers = this.#handlers.get(handler.commandType);
    if (!atomHandlers) {
      atomHandlers = new Map();
      this.#handlers.set(handler.commandType, atomHandlers);
    }
    atomHandlers.set(atomKey, handler as CommandHandler<unknown, Command>);
  }

  /**
   * Find the handler + state for a given command + atom combo.
   * Returns `undefined` if no handler is registered.
   */
  resolve(
    atomKey: string,
    cmd: Command,
  ): CommandHandler<unknown, Command> | undefined {
    return this.#handlers.get(cmd.type)?.get(atomKey);
  }

  /**
   * Execute a command against a state, returning Either<CommandError, DomainEvent[]>.
   * Returns a standard NO_HANDLER error if no handler is registered.
   */
  execute(
    atomKey: string,
    state:   unknown,
    cmd:     Command,
  ): Either<CommandError, DomainEvent[]> {
    const handler = this.resolve(atomKey, cmd);
    if (!handler) {
      return {
        _tag:  'Left',
        left:  {
          code:    'NO_HANDLER',
          message: `No CommandHandler registered for '${cmd.type}' on atom '${atomKey}'.`,
        },
      };
    }
    return handler.handle(state, cmd);
  }

  clear(): void {
    this.#handlers.clear();
  }
}
