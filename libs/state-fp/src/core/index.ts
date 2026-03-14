/**
 * @vi/state-fp/core
 *
 * Pure functional programming primitives — no runtime dependencies,
 * no kernel dependencies, safe in all JS environments.
 *
 * @example
 * import { just, nothing, mapMaybe } from '@vi/state-fp/core';
 * import { left, right, chainEither } from '@vi/state-fp/core';
 * import { pipe, lens, prop } from '@vi/state-fp/core';
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  Maybe,
  Nothing,
  Just,
  Either,
  Left,
  Right,
  IO,
  IORef,
  Lens,
  OptionalLens,
  Patch,
} from './types.js';

// ─── Maybe ────────────────────────────────────────────────────────────────────

export {
  nothing,
  just,
  fromNullable,
  tryCatch as tryCatchMaybe,
  isNothing,
  isJust,
  mapMaybe,
  apMaybe,
  chainMaybe,
  flatMapMaybe,
  foldMaybe,
  getOrElse as getOrElseMaybe,
  getOrElseL as getOrElseLMaybe,
  toNullable,
  maybeToEither,
  maybeToArray,
  lift2Maybe,
  filterMaybe,
} from './maybe.js';

// ─── Either ───────────────────────────────────────────────────────────────────

export {
  left,
  right,
  fromNullableEither,
  fromTry,
  fromTryAsync,
  isLeft,
  isRight,
  mapEither,
  bimapEither,
  mapLeft,
  chainEither,
  flatMapEither,
  foldEither,
  apEither,
  getOrElse as getOrElseEither,
  getOrElseL as getOrElseLEither,
  eitherToMaybe,
  sequenceEither,
  swapEither,
} from './either.js';

// ─── IO ───────────────────────────────────────────────────────────────────────

export {
  io,
  liftIO,
  mapIO,
  chainIO,
  flatMapIO,
  apIO,
  sequenceIO,
  sequenceIO_,
  replicateIO,
  newIORef,
  voidIO,
  tapIO,
} from './io.js';

// ─── Lens ─────────────────────────────────────────────────────────────────────

export {
  lens,
  prop,
  index,
  composeLens,
  view,
  over,
  set,
  optional,
} from './lens.js';

// ─── Utils ────────────────────────────────────────────────────────────────────

export {
  pipe,
  compose,
  identity,
  constant,
  memoize,
  uuid,
  now,
  deepClone,
  defaultSerialize,
  defaultDeserialize,
  shallowDiff,
} from './utils.js';
