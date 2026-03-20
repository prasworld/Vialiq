/**
 * @vi/state-fp/adapter
 *
 * Framework integration adapters for @vi/state-fp.
 *
 * | Adapter   | Status       | Import                              |
 * |-----------|--------------|-------------------------------------|
 * | Vanilla   | Available    | `from '@vi/state-fp/adapter'`       |
 * | Angular   | Available    | `from '@vi/state-fp/adapter'`       |
 * | React     | Available    | `from '@vi/state-fp/adapter'`       |
 * | Lit       | Available    | `from '@vi/state-fp/adapter'`       |
 *
 * @module
 */

// ─── Vanilla ──────────────────────────────────────────────────────────────────

export type { VanillaAdapter } from './vanilla.js';
export { createAdapter }       from './vanilla.js';

// ─── Angular ─────────────────────────────────────────────────────────────────

export type {
  WriteableSignalLike,
  DestroyRefLike,
  AngularAPIs,
  AngularKernelAdapter,
} from './angular.js';

export { createAngularAdapter } from './angular.js';

// ─── React ────────────────────────────────────────────────────────────────────

export type {
  ReactAPIs,
  ReactContextLike,
  ReactKernelAdapter,
  StateFpProviderProps,
  UseAtomResult,
  UseCommandResult,
  UseQueryResult,
} from './react.js';

export {
  createReactAdapter,
  // Legacy stubs — kept for backward compat
  StateFpProvider,
  useAtom,
  useCommand,
  useQuery,
} from './react.js';

// ─── Lit ──────────────────────────────────────────────────────────────────────

export type {
  ReactiveHost,
  ReactiveControllerLike,
  AtomController,
  StreamController,
} from './lit.js';

export { createLitController, createLitStreamController } from './lit.js';
