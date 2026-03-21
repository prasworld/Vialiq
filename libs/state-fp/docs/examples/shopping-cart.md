# End-to-End Example: Shopping Cart

This walkthrough builds a fully-featured shopping-cart feature using every module in `@vi/state-fp`.  
You will see how the domain model, kernel, storage, sync, devtools, and React adapter all fit together
into a cohesive, testable application slice.

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React Component Layer  (adapter/react)                         │
│   useAtom · useCommand · useQuery · useEphemeral                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Provider (Kernel)
┌─────────────────────────▼───────────────────────────────────────┐
│  Kernel   (kernel)                                              │
│   execute · executeAsync · executeOptimistic · query · subscribe│
│           ↕ plugins ↕                                           │
│   DevTools (devtools) ← event log, snapshots, time-travel       │
└──────┬───────────────────────────────────────────────────────────┘
       │ writeToStorage              │ subscribe
       ▼                             ▼
┌──────────────────┐    ┌────────────────────────────────────────┐
│  MemoryAdapter   │    │  SyncEngine  (sync)                    │
│  (storage)       │    │  BroadcastChannel  (cross-tab)         │
└──────────────────┘    └────────────────────────────────────────┘
```

---

## 1. Domain model

### State type

```ts
// src/cart/types.ts
export type CartItem = {
  id:       string;
  name:     string;
  price:    number;
  qty:      number;
};

export type CartState = {
  items:    CartItem[];
  coupon:   string | null;
  checkoutError: string | null;
};
```

### Atom definition

```ts
// src/cart/atom.ts
import { defineAtom }        from '@vi/state-fp/kernel';
import { createMemoryAdapter } from '@vi/state-fp/storage';
import type { CartState }    from './types.js';

export const cartAtom = defineAtom<CartState>({
  key: 'vi/cart',
  initialState: { items: [], coupon: null, checkoutError: null },

  // Persists the cart to in-memory Storage (MemoryAdapter).
  // In environments that permit persistent storage, you can replace with
  // a secure adapter implementation subject to policy review.
  storage: { adapter: createMemoryAdapter({ ttl: 60 * 60 * 1000 }) },
});
```

### Commands

```ts
// src/cart/commands.ts
import { command } from '@vi/state-fp/kernel';
import type { CartItem } from './types.js';

export const addItem    = (item: CartItem)  => command('cart/addItem',    item);
export const removeItem = (id: string)      => command('cart/removeItem', { id });
export const setQty     = (id: string, qty: number) =>
  command('cart/setQty', { id, qty });
export const applyCoupon = (code: string)   => command('cart/applyCoupon', { code });
export const checkout    = ()               => command('cart/checkout');
```

### Events

```ts
// src/cart/events.ts
import { domainEvent } from '@vi/state-fp/kernel';
import type { CartItem } from './types.js';

export const itemAdded     = (item: CartItem)            => domainEvent('cart/itemAdded',     item);
export const itemRemoved   = (id: string)                => domainEvent('cart/itemRemoved',   { id });
export const qtyUpdated    = (id: string, qty: number)   => domainEvent('cart/qtyUpdated',    { id, qty });
export const couponApplied = (code: string)              => domainEvent('cart/couponApplied', { code });
export const checkoutOk    = ()                          => domainEvent('cart/checkoutOk');
export const checkoutFailed = (reason: string)           => domainEvent('cart/checkoutFailed', { reason });
```

### Command handler

```ts
// src/cart/handler.ts
import { createCommandHandler, right, left } from '@vi/state-fp/kernel';
import type { CartState } from './types.js';
import { itemAdded, itemRemoved, qtyUpdated, couponApplied } from './events.js';

export const cartHandler = createCommandHandler<CartState, Command>({
  commandType: '*',    // catch-all — real code would use individual handlers
  handle(state, cmd) {
    switch (cmd.type) {
      case 'cart/addItem': {
        const item = cmd.payload as CartItem;
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return right([qtyUpdated(item.id, existing.qty + item.qty)]);
        }
        return right([itemAdded(item)]);
      }
      case 'cart/removeItem': {
        const { id } = cmd.payload as { id: string };
        if (!state.items.find(i => i.id === id)) {
          return left({ code: 'NOT_FOUND', message: `Item ${id} not in cart` });
        }
        return right([itemRemoved(id)]);
      }
      case 'cart/setQty': {
        const { id, qty } = cmd.payload as { id: string; qty: number };
        if (qty < 1) return left({ code: 'INVALID_QTY', message: 'Qty must be ≥ 1' });
        return right([qtyUpdated(id, qty)]);
      }
      case 'cart/applyCoupon': {
        const { code } = cmd.payload as { code: string };
        if (code.length < 4) return left({ code: 'INVALID_COUPON', message: 'Coupon too short' });
        return right([couponApplied(code)]);
      }
      default:
        return left({ code: 'NO_HANDLER', message: `Unknown command: ${cmd.type}` });
    }
  },
});
```

### Event applier

```ts
// src/cart/applier.ts
import { createEventApplier } from '@vi/state-fp/kernel';
import type { CartState, CartItem } from './types.js';
import type { DomainEvent } from '@vi/state-fp/kernel';

export const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (state, event) => ({
    ...state,
    items: [...state.items, (event as DomainEvent<string, CartItem>).payload!],
  }),
  'cart/itemRemoved': (state, event) => ({
    ...state,
    items: state.items.filter(i => i.id !== (event as DomainEvent<string, { id: string }>).payload!.id),
  }),
  'cart/qtyUpdated': (state, event) => {
    const { id, qty } = (event as DomainEvent<string, { id: string; qty: number }>).payload!;
    return {
      ...state,
      items: state.items.map(i => i.id === id ? { ...i, qty } : i),
    };
  },
  'cart/couponApplied': (state, event) => ({
    ...state,
    coupon: (event as DomainEvent<string, { code: string }>).payload!.code,
  }),
  'cart/checkoutOk': (state) => ({ ...state, items: [], coupon: null, checkoutError: null }),
  'cart/checkoutFailed': (state, event) => ({
    ...state,
    checkoutError: (event as DomainEvent<string, { reason: string }>).payload!.reason,
  }),
});
```

### Query

```ts
// src/cart/queries.ts
import { query, createQueryHandler } from '@vi/state-fp/kernel';
import type { CartState } from './types.js';

export type TotalQuery = ReturnType<typeof query<'cart/total'>>;

export const totalQuery = query<'cart/total'>('cart/total');

export const totalQueryHandler = createQueryHandler<CartState, TotalQuery, number>({
  queryType: 'cart/total',
  handle: (state) =>
    state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
});
```

---

## 2. Kernel setup

```ts
// src/cart/setup.ts
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';
import { createSyncEngine } from '@vi/state-fp/sync';
import { cartAtom }    from './atom.js';
import { cartHandler } from './handler.js';
import { cartApplier } from './applier.js';
import { totalQueryHandler } from './queries.js';

// 1. Create the kernel (enable debug in development)
export const kernel = createKernel({ debug: process.env.NODE_ENV !== 'production' });

// 2. Install devtools plugin (time-travel, event log, bridge to Chrome extension)
const devtools = createDevTools({
  snapshotEvery: 25,
  maxLogSize:    200,
});
kernel.use(devtools.plugin);

// 3. Register the cart domain. Query handlers are registered separately in this API.
kernel.register(cartAtom, cartHandler, cartApplier);
kernel.registerQuery(cartAtom, totalQueryHandler);

// 4. Hydrate persisted state from storage (async — await before first render)
await kernel.hydrate(cartAtom);

// 5. Share cart state across browser tabs
export const syncEngine = createSyncEngine({ kernel });
syncEngine.share(cartAtom, {
  channel:  'vi/cart',
  conflict: 'last-write-wins',
});
```

---

## 3. Checkout — optimistic update

The checkout command uses `executeOptimistic` to clear the cart instantly in the UI
while the network request is in flight, then rolls back on failure:

```ts
// src/cart/checkout.ts
import { kernel }   from './setup.js';
import { cartAtom } from './atom.js';
import { cartApplier } from './applier.js';
import { domainEvent, right, left } from '@vi/state-fp/kernel';

export async function submitCheckout(paymentToken: string) {
  return kernel.executeOptimistic(
    cartAtom,
    { _kind: 'Command', type: 'cart/checkout', meta: { correlationId: crypto.randomUUID(), timestamp: Date.now() } },
    {
      // Instantly clear the cart in the UI
      optimisticApplier: (state) => ({ ...state, items: [], coupon: null, checkoutError: null }),

      // Confirm with the server
      confirm: async (optimisticState) => {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          body:   JSON.stringify({ items: optimisticState.items, token: paymentToken }),
        });
        if (!res.ok) {
          const { message } = await res.json();
          return left({ code: 'CHECKOUT_FAILED', message });
        }
        return right(optimisticState);
      },

      // Called if confirm() returns Left — state is automatically rolled back
      onRollback: async (err) => {
        console.error('Checkout failed, cart restored:', err.message);
      },
    },
  );
}
```

---

## 4. React integration

```tsx
// src/cart/CartProvider.tsx
import React        from 'react';
import { Provider } from '@vi/state-fp/adapter';
import { kernel }   from './setup.js';

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <Provider kernel={kernel}>{children}</Provider>;
}
```

```tsx
// src/cart/CartSummary.tsx
import React               from 'react';
import { createReactAdapter } from '@vi/state-fp/adapter';
import { cartAtom }        from './atom.js';
import { addItem, removeItem } from './commands.js';
import { totalQuery }      from './queries.js';

const { useAtom, useCommand, useQuery } = createReactAdapter();

export function CartSummary() {
  const [cart]    = useAtom(cartAtom);
  const dispatch  = useCommand(cartAtom);
  const total     = useQuery(cartAtom, totalQuery);

  return (
    <div>
      <h2>Cart ({cart.items.length} items)</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          <span>{item.name} × {item.qty} = ${(item.price * item.qty).toFixed(2)}</span>
          <button onClick={() => dispatch(removeItem(item.id))}>Remove</button>
        </div>
      ))}
      <strong>Total: ${total.toFixed(2)}</strong>
      {cart.coupon && <em>Coupon: {cart.coupon}</em>}
      {cart.checkoutError && <p role="alert">{cart.checkoutError}</p>}
    </div>
  );
}
```

---

## 5. Vanilla JS integration (non-React MFE)

The same kernel works in a plain TypeScript micro-frontend:

```ts
// src/cart/cart-widget.ts
import { createAdapter } from '@vi/state-fp/adapter';
import { kernel }        from './setup.js';
import { cartAtom }      from './atom.js';
import { addItem }       from './commands.js';

const app = createAdapter(kernel);

// Subscribe to cart state
const off = app.watch(cartAtom, (cart) => {
  document.getElementById('item-count')!.textContent = String(cart.items.length);
});

// Add item on button click
document.getElementById('add-btn')!.addEventListener('click', () => {
  const result = app.run(cartAtom, addItem({ id: 'shoe-1', name: 'Shoes', price: 49.99, qty: 1 }));
  if (result._tag === 'Left') console.error(result.left.message);
});

// Clean up on unmount
function unmount() {
  off();
  app.destroy();
}
```

---

## 6. DevTools introspection

```ts
// src/cart/dev.ts  (browser console helpers)
import { devtools } from './setup.js';   // export devtools from setup.ts

// See all recent command executions
console.table(devtools.eventLog.getAll().map(e => ({
  cmd:      e.commandType,
  event:    e.event.type,
  atom:     e.atomKey,
  time:     new Date(e.timestamp).toISOString(),
})));

// Filter by atom
const cartHistory = devtools.eventLog.getByAtom('vi/cart');
console.log('Cart history:', cartHistory.length, 'entries');

// Replay to a past state (replayMode)
const [firstEntry] = cartHistory;
if (firstEntry) {
  await devtools.timeTravel.to(firstEntry.id);
  console.log('Rewound! Cart is now:', cartAtom.get());
  devtools.timeTravel.exit();  // back to live
}

// List all snapshots
console.log('Snapshots:', devtools.snapshots.list());
```

---

## 7. Testing each layer

### Domain model (pure unit tests)

```ts
// src/cart/handler.spec.ts
import { describe, it, expect } from 'vitest';
import { right, left }          from '@vi/state-fp/core';
import { cartHandler }          from './handler.js';
import { addItem, removeItem }  from './commands.js';

const emptyCart = { items: [], coupon: null, checkoutError: null };

describe('cart handler', () => {
  it('addItem yields itemAdded event', () => {
    const result = cartHandler.handle(emptyCart, addItem({ id: '1', name: 'Hat', price: 10, qty: 1 }));
    expect(result._tag).toBe('Right');
    expect(result.right[0].type).toBe('cart/itemAdded');
  });

  it('addItem increments qty for existing item', () => {
    const state = { ...emptyCart, items: [{ id: '1', name: 'Hat', price: 10, qty: 1 }] };
    const result = cartHandler.handle(state, addItem({ id: '1', name: 'Hat', price: 10, qty: 2 }));
    expect(result.right[0].type).toBe('cart/qtyUpdated');
  });

  it('removeItem on missing item returns Left', () => {
    const result = cartHandler.handle(emptyCart, removeItem('missing'));
    expect(result._tag).toBe('Left');
    expect(result.left.code).toBe('NOT_FOUND');
  });
});
```

### Kernel integration test

```ts
// src/cart/cart.integration.spec.ts
import { describe, it, expect } from 'vitest';
import { createKernel }         from '@vi/state-fp/kernel';
import { cartAtom }    from './atom.js';
import { cartHandler } from './handler.js';
import { cartApplier } from './applier.js';
import { addItem }     from './commands.js';

describe('cart kernel integration', () => {
  it('addItem → itemAdded → state updated', () => {
    const kernel = createKernel();
    kernel.register(cartAtom, cartHandler, cartApplier);

    const result = kernel.execute(cartAtom, addItem({ id: '1', name: 'Hat', price: 10, qty: 1 }));

    expect(result._tag).toBe('Right');
    expect(cartAtom.get().items).toHaveLength(1);
    expect(cartAtom.get().items[0].name).toBe('Hat');
  });
});
```

### Adapter unit test (vanilla)

```ts
// src/cart/cart-widget.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { createAdapter }  from '@vi/state-fp/adapter';
import { cartAtom }  from './atom.js';
import { addItem }   from './commands.js';

describe('cart widget adapter', () => {
  it('watch delivers current state immediately', () => {
    const kernel = {
      subscribe: vi.fn().mockReturnValue(() => {}),
      execute: vi.fn().mockReturnValue({ _tag: 'Right', right: [] }),
      query: vi.fn(),
    };
    const adapter = createAdapter(kernel as any);
    const seen: typeof cartAtom extends { get(): infer S } ? S[] : never[] = [];
    adapter.watch(cartAtom, s => seen.push(s));
    expect(seen).toHaveLength(1);
  });
});
```

---

## 8. Full feature summary

| Concern             | API used                                         | File                   |
|---------------------|--------------------------------------------------|------------------------|
| State shape         | `defineAtom`                                     | `atom.ts`              |
| Commands            | `command()`                                      | `commands.ts`          |
| Events              | `domainEvent()`                                  | `events.ts`            |
| Command validation  | `createCommandHandler`                           | `handler.ts`           |
| State transitions   | `createEventApplier`                             | `applier.ts`           |
| Derived data        | `createQueryHandler`                             | `queries.ts`           |
| Persistence         | `createMemoryAdapter` + `storage` option         | `atom.ts`              |
| Cross-tab sync      | `createSyncEngine`                               | `setup.ts`             |
| Time-travel/logging | `createDevTools`                                 | `setup.ts`             |
| React binding       | `createReactAdapter`, `Provider`, `useAtom`      | `CartSummary.tsx`       |
| Vanilla JS binding  | `createAdapter`                                  | `cart-widget.ts`       |
| Optimistic UI       | `kernel.executeOptimistic`                       | `checkout.ts`          |

---

## 9. What makes this design safe

- **No `any` in domain code** — Command, Event, and State types flow through generics.
- **Pure handlers** — `cartHandler.handle` is side-effect-free; easily tested with plain `expect()`.
- **Storage is isolated** — The kernel holds state; the adapter only serialises. You can swap adapters without touching domain logic.
- **Sync is decoupled** — The sync engine communicates via the kernel's `subscribe` API; it never mutates atoms directly except via `_setState` (internal-only write channel).
- **DevTools are additive** — Removing `kernel.use(devtools.plugin)` changes nothing about the domain runtime.
