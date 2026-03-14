/**
 * @vi/state-fp/adapter
 *
 * Framework integration adapters for @vi/state-fp.
 *
 * | Adapter   | Status       | Import                              |
 * |-----------|--------------|-------------------------------------|
 * | Vanilla   | ✅ Available | `from '@vi/state-fp/adapter'`       |
 * | Angular   | ✅ Available | `from '@vi/state-fp/adapter'`       |
 * | React     | 🚧 Phase 5   | `from '@vi/state-fp/adapter'`       |
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

// ─── React (stubs — Phase 5) ──────────────────────────────────────────────────

export type {
  StateFpProviderProps,
  UseAtomResult,
  UseCommandResult,
  UseQueryResult,
} from './react.js';

export {
  StateFpProvider,
  useAtom,
  useCommand,
  useQuery,
} from './react.js';
