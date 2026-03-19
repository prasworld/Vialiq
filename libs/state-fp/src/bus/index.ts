/**
 * @vi/state-fp/bus
 *
 * Cross-MFE Domain Event Bus — routes domain events between Micro-Frontend
 * remotes over a BroadcastChannel. No kernel coupling.
 *
 * @example
 * import { createSharedBus } from '@vi/state-fp/bus';
 *
 * // shell MFE
 * const bus = createSharedBus({ channel: 'vi-events' });
 * kernel.onEvent(e => bus.publish({ source: 'shell', event: e }));
 *
 * // notification MFE
 * const bus = createSharedBus({ channel: 'vi-events' });
 * bus.subscribe({ type: 'order/placed' }, e => showToast(e.event));
 *
 * @module
 */

export type {
  CrossMFEEvent,
  EventFilter,
  SharedEventBus,
  SharedBusOptions,
} from './types.js';

export { createSharedBus } from './shared-bus.js';
