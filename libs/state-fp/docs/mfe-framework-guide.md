# MFE State Management — Per-Framework Integration Guide

> **Purpose:** This guide answers the question: *"My team builds Angular (or React, or Lit) micro-frontend
> remotes. How do I integrate `@vialiq/state-fp` and make state management as easy as possible?"*
>
> **Audience:** Frontend developers joining a micro-frontend project who already know their
> framework (Angular / React / Lit) but are new to `@vialiq/state-fp`.

---

## Table of Contents

1. [The Core Principle: One Kernel, Many Frameworks](#1-the-core-principle-one-kernel-many-frameworks)
2. [Shared State Topology in an MFE Shell](#2-shared-state-topology-in-an-mfe-shell)
3. [Angular MFE Integration](#3-angular-mfe-integration)
   - [3.1 Setup — Providing the Kernel via Angular DI](#31-setup--providing-the-kernel-via-angular-di)
   - [3.2 Reading State as Signals](#32-reading-state-as-signals)
   - [3.3 Dispatching Commands](#33-dispatching-commands)
   - [3.4 Coexisting with NgRx](#34-coexisting-with-ngrx)
   - [3.5 Complete Angular Example](#35-complete-angular-example)
4. [React MFE Integration](#4-react-mfe-integration)
   - [4.1 Setup — Providing the Kernel via React Context](#41-setup--providing-the-kernel-via-react-context)
   - [4.2 The Three Core Hooks](#42-the-three-core-hooks)
   - [4.3 Async Commands with Loading State](#43-async-commands-with-loading-state)
   - [4.4 Coexisting with Redux Toolkit](#44-coexisting-with-redux-toolkit)
   - [4.5 Complete React Example](#45-complete-react-example)
5. [Lit MFE Integration](#5-lit-mfe-integration)
   - [5.1 Setup — Reactive Controller Pattern](#51-setup--reactive-controller-pattern)
   - [5.2 Reading State in Lit Templates](#52-reading-state-in-lit-templates)
   - [5.3 Multi-Atom Lit Components](#53-multi-atom-lit-components)
   - [5.4 Complete Lit Example](#54-complete-lit-example)
6. [Cross-Framework State Sharing](#6-cross-framework-state-sharing)
   - [6.1 Shell Owns the Kernel](#61-shell-owns-the-kernel)
   - [6.2 Remote Borrows Atoms](#62-remote-borrows-atoms)
   - [6.3 Cross-MFE Domain Events](#63-cross-mfe-domain-events)
7. [NgRx Bridge — Migrating an Angular MFE to @vialiq/state-fp](#7-ngrx-bridge--migrating-an-angular-mfe-to-vistate-fp)
8. [Redux Bridge — Migrating a React MFE to @vialiq/state-fp](#8-redux-bridge--migrating-a-react-mfe-to-vistate-fp)
9. [DevTools in Each Framework](#9-devtools-in-each-framework)
10. [Common Patterns and Anti-Patterns](#10-common-patterns-and-anti-patterns)
11. [Quick Reference Cheatsheet](#11-quick-reference-cheatsheet)
12. [Tricky Implementations](#12-tricky-implementations)
    - [12.1 Testing — Stubbing the Kernel](#121-testing--stubbing-the-kernel)
    - [12.2 Async Command Loading State](#122-async-command-loading-state)
    - [12.3 MFE Loading Race — Remote Starts Before Shell Has Synced](#123-mfe-loading-race--remote-starts-before-shell-has-synced)
    - [12.4 Multi-Atom Derived State](#124-multi-atom-derived-state)
    - [12.5 SSR / Server-Side Rendering Edge Cases](#125-ssr--server-side-rendering-edge-cases)
    - [12.6 Typed Error Handling Across Frameworks](#126-typed-error-handling-across-frameworks)

---

## 1. The Core Principle: One Kernel, Many Frameworks

`@vialiq/state-fp` is **framework-agnostic at its core**. The kernel, atoms, and commands work
identically whether consumed from Angular, React, Lit, or plain JavaScript. Framework adapters
are thin, optional wrappers that translate the kernel's `subscribe()` API into framework-native
reactive primitives (Signals, Hooks, Reactive Controllers).

```
                     ┌─────────────────────────────────────────┐
                     │           @vialiq/state-fp/kernel             │
                     │    Atoms · Commands · Queries · Events    │
                     └──────┬────────────┬──────────┬───────────┘
                            │            │          │
              ┌─────────────▼─┐  ┌───────▼──┐  ┌───▼─────────────┐
              │ Angular Adapter│  │React Hooks│  │ Lit Controller  │
              │ (Signals + DI) │  │(Context)  │  │(ReactiveCtrl)   │
              └───────────────┘  └──────────┘  └────────────────┘
```

**What this means for you:**

| You build | You use |
|---|---|
| Angular remote (NgRx team) | `createAngularAdapter` → Signals that auto-update your components |
| React remote (Redux team) | `useAtom`, `useCommand`, `useQuery` hooks |
| Lit web component | `createLitController` → reactive controller that schedules re-renders |
| No framework (worker, Node.js) | `kernel.subscribe()` + `kernel.execute()` directly |

All of these talk to the **same atoms** published by the shell. State sharing requires zero
shared framework code between remotes.

---

## 2. Shared State Topology in an MFE Shell

Before writing any framework code, establish **ownership**:

```
Shell (angular / react / any)
  ├── authAtom          [OWNS]  — token, user profile, tenant
  ├── themeAtom         [OWNS]  — dark/light, brand colour
  └── localeAtom        [OWNS]  — language, date format

Cart Remote (react)
  ├── cartAtom          [OWNS]  — items owned by this remote
  ├── authAtom          [BORROWS from shell]  — read-only, never commands
  └── themeAtom         [BORROWS from shell]  — applies theme to cart UI

Header Remote (angular)
  ├── authAtom          [BORROWS from shell]
  └── cartAtom          [BORROWS from cart remote]  — item count display only

Payment Remote (lit)
  ├── paymentAtom       [OWNS]  — payment form state
  └── cartAtom          [BORROWS from cart remote]  — order total
```

**Rules:**
1. **One owner per atom** — only the owning MFE executes commands against it
2. **Borrowers are read-only** — they subscribe to receive state, never call `kernel.execute()`
3. **Sync happens via BroadcastChannel** — the `@vialiq/state-fp/sync` module handles this automatically
4. **No shared JS runtime required** — borrowers don't import from the owner's bundle

---

## 3. Angular MFE Integration

### 3.1 Setup — Providing the Kernel via Angular DI

The kernel is a singleton service. Provide it at the application (or remote shell) level
via an `InjectionToken` and Angular's DI system.

```ts
// 📍 FRAMEWORK: Angular
// libs/state-tokens.ts — published by the shell remote as a shared module
import { InjectionToken } from '@angular/core';
import type { Kernel }    from '@vialiq/state-fp/kernel';

export const KERNEL_TOKEN = new InjectionToken<Kernel>('vi/kernel');
```

```ts
// 📍 FRAMEWORK: Angular
// apps/shell/src/app/app.config.ts
import { ApplicationConfig, signal, effect, DestroyRef, inject, isDevMode } from '@angular/core';
import { createKernel }                     from '@vialiq/state-fp/kernel';
import { createDevTools, noopDevTools }     from '@vialiq/state-fp/devtools';
import { createAngularAdapter }             from '@vialiq/state-fp/adapter';
import { KERNEL_TOKEN }                     from '@/state-tokens';
import { authAtom, authHandler, authApplier } from '@/atoms';  // your app's atoms

// Create once at app init
const devtools = isDevMode() ? createDevTools({ maxLogSize: 500 }) : noopDevTools;
const kernel   = createKernel({ debug: isDevMode() });
if (isDevMode()) kernel.use(devtools.plugin);

// Angular adapter — wire Angular APIs at the point of creation
export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: KERNEL_TOKEN, useValue: kernel },
    // If the shell owns atoms, register them here:
    {
      provide: APP_INITIALIZER,
      useFactory: () => async () => {
        kernel.register(authAtom, authHandler, authApplier);
        // Register other shell atoms as needed...
        await kernel.hydrate();
      },
      multi: true,
    },
  ],
};
```

For a remote (lazy-loaded Angular app), do the same inside `provideRouter` or the
remote's `ApplicationConfig`. The important part is that the remote **borrows** the
kernel instance from the shell — never creates its own.

```ts
// 📍 FRAMEWORK: Angular (remote MFE)
// 📚 SETUP: authAtom and themeAtom from shell's public API (same key names)
import { createKernel }          from '@vialiq/state-fp/kernel';
import { createSyncEngine }      from '@vialiq/state-fp/sync';
import { authAtom, themeAtom }  from '@/atoms';  // from shell's public API

// apps/header-remote/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: KERNEL_TOKEN,
      useFactory: () => {
        const remoteKernel = createKernel();
        // Receive shell atoms by sharing on the same per-atom channels
        const sync = createSyncEngine({ kernel: remoteKernel });
        sync.share(authAtom,  { channel: 'vi-auth',  conflict: 'owner-wins' });
        sync.share(themeAtom, { channel: 'vi-theme', conflict: 'owner-wins' });
        return remoteKernel;
      },
    },
  ],
};
```

### 3.2 Reading State as Signals

Once the kernel is provided, `ngAdapter.toSignal()` creates Angular Signals that
automatically unsubscribe when the component is destroyed:

```ts
// 📍 FRAMEWORK: Angular
// 📚 SETUP: ngAdapter created in app.config.ts, KERNEL_TOKEN provided, authAtom imported
import { Component, inject } from '@angular/core';
import { KERNEL_TOKEN } from '@/state-tokens';
import { authAtom } from '@/atoms';
import { ngAdapter } from '@/app.config';  // exported from setup

@Component({
  selector: 'app-user-badge',
  standalone: true,
  template: `
    <div *ngIf="auth().isAuthenticated">
      Welcome, {{ auth().displayName }}
    </div>
  `,
})
export class UserBadgeComponent {
  private kernel = inject(KERNEL_TOKEN);

  // Reactive signal — updates whenever authAtom state changes
  // Auto-unsubscribes on component destroy via DestroyRef
  readonly auth = ngAdapter.toSignal(authAtom, this.kernel);
}
```

For derived computed values without a round-trip to the kernel query bus, use Angular's
`computed()` directly on top of the signal:

```ts
// 📍 IMPORTS:
import { computed } from '@angular/core';

readonly displayName = computed(() => {
  const user = this.auth();
  return user.isAuthenticated ? user.profile.name : 'Guest';
});
```

For values that require a full `QueryHandler` (complex projections, cross-atom derivations):

```ts
// 📍 IMPORTS:
import { BuildTotal } from '@/queries';  // your query handler

readonly cartTotal = ngAdapter.toQuerySignal(cartAtom, this.kernel, BuildTotal);
```

### 3.3 Dispatching Commands

```ts
// 📍 FRAMEWORK: Angular
// 📚 IMPORTS:
import { Component, inject } from '@angular/core';
import { match } from '@vialiq/state-fp/core';
import { KERNEL_TOKEN } from '@/state-tokens';
import { cartAtom } from '@/atoms';
import { AddItem } from '@/commands';
import { ngAdapter } from '@/app.config';

@Component({ ... })
export class CartComponent {
  private kernel   = inject(KERNEL_TOKEN);
  readonly cart    = ngAdapter.toSignal(cartAtom, this.kernel);
  readonly addItem = ngAdapter.commandDispatcher(cartAtom, this.kernel);

  onAddToCart(sku: string, qty: number) {
    const result = this.addItem(AddItem({ sku, qty }));

    // result is Result<CommandError, CartState>
    match(result, {
      ok:  (_state) => { /* success — state already updated via subscription */ },
      err: (e)      => this.notificationService.error(e.message),
    });
  }
}
```

For async command handlers:

```ts
async onCheckout() {
  const result = await this.kernel.executeAsync(cartAtom, StartCheckout());
  match(result, {
    ok:  (_state) => this.router.navigate(['/order-confirmation']),
    err: (e)      => this.notificationService.error(e.message),
  });
}
```

### 3.4 Coexisting with NgRx

If your team already uses NgRx for Angular-internal state (component interaction, routing,
effects), `@vialiq/state-fp` slots in as the **cross-MFE layer** without replacing NgRx.

```
Angular Remote
  ├── NgRx Store           — component-local state (form state, pagination, UI flags)
  │     └── Effects        — async operations within this remote
  └── @vialiq/state-fp kernel  — shared state received from / sent to other MFEs
        └── authAtom       — borrowed from shell
        └── cartAtom       — owned here; synced to header + cart remotes
```

**Bridging pattern** — sync NgRx store slice with an atom:

```ts
@Injectable({ providedIn: 'root' })
export class StateBridgeService {
  private readonly cartAtomState$ = new Observable<CartState>(subscriber =>
    // Subscribe to atom → emit to RxJS observable for NgRx effects
    kernel.subscribe(cartAtom, state => subscriber.next(state))
  );

  // NgRx effect that reacts to atom changes
  readonly syncCartToNgrx$ = createEffect(() =>
    this.cartAtomState$.pipe(
      map(state => CartActions.atomSynced({ state }))
    )
  );

  // Sync NgRx actions to atom commands
  readonly syncNgrxToAtom$ = createEffect(() =>
    inject(Actions).pipe(
      ofType(CartActions.addItem),
      tap(({ sku, qty }) => kernel.execute(cartAtom, AddItem({ sku, qty }))),
    ), { dispatch: false }
  );
}
```

For **greenfield Angular MFEs**, prefer `@vialiq/state-fp` exclusively (no NgRx) — the CQRS
pattern with typed Events replaces NgRx Actions + Reducers + Effects with a simpler model.

### 3.5 Complete Angular Example

```ts
// atoms/cart.atom.ts — define atom, handlers, and applier together
import { defineAtom, createCommandHandler, createEventApplier,
         createQueryHandler, command, domainEvent,
         ok, err } from '@vialiq/state-fp/kernel';
import { LocalAdapter } from '@vialiq/state-fp/storage';

// --- State shape ---
export type CartItem = { sku: string; qty: number; price: number };
export type CartState = { items: CartItem[]; lastModified: number };

// --- Atom ---
export const cartAtom = defineAtom<CartState>({
  key: 'vi/cart',
  initialState: { items: [], lastModified: 0 },
  storage: {
    adapter: new LocalAdapter(),
    key:     'vi:cart',
    ttl:     24 * 60 * 60 * 1000,  // 24 hours
    security: 'obfuscated',         // hide structure in browser storage
  },
});

// --- Commands ---
export const AddItem    = (p: CartItem) => command('cart/addItem', p);
export const RemoveItem = (sku: string) => command('cart/removeItem', { sku });
export const ClearCart  = ()            => command('cart/clear', {});

// --- Command Handlers ---
const addItemHandler = createCommandHandler<CartState, ReturnType<typeof AddItem>>({
  commandType: 'cart/addItem',
  handle: (state, cmd) => {
    if (cmd.payload.qty < 1)
      return err({ code: 'INVALID_QTY', message: 'Quantity must be ≥ 1' });
    return ok([domainEvent('cart/itemAdded', { item: cmd.payload })]);
  },
});

const removeItemHandler = createCommandHandler<CartState, ReturnType<typeof RemoveItem>>({
  commandType: 'cart/removeItem',
  handle: (state, cmd) =>
    ok([domainEvent('cart/itemRemoved', { sku: cmd.payload.sku })]),
});

const clearHandler = createCommandHandler<CartState, ReturnType<typeof ClearCart>>({
  commandType: 'cart/clear',
  handle: () => ok([domainEvent('cart/cleared', {})]),
});

// --- Event Applier ---
export const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (state, e) => ({
    items: [...state.items, e.payload.item],
    lastModified: e.meta.timestamp,
  }),
  'cart/itemRemoved': (state, e) => ({
    items: state.items.filter(i => i.sku !== e.payload.sku),
    lastModified: e.meta.timestamp,
  }),
  'cart/cleared': (state, e) => ({
    items: [],
    lastModified: e.meta.timestamp,
  }),
});

// --- Query Handlers ---
export const BuildTotal = () => ({ _kind: 'Query' as const, type: 'cart/buildTotal' });
const buildTotalHandler = createQueryHandler<CartState, ReturnType<typeof BuildTotal>, number>({
  queryType: 'cart/buildTotal',
  memo: true,
  handle: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0),
});

// --- Registration helper (call once at app init) ---
export function registerCartAtom(kernel: Kernel) {
  kernel.register(cartAtom, addItemHandler, cartApplier);
  kernel.register(cartAtom, removeItemHandler, cartApplier);
  kernel.register(cartAtom, clearHandler, cartApplier);
  kernel.registerQuery(cartAtom, buildTotalHandler);
}
```

```ts
// components/cart-summary.component.ts
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  template: `
    <div class="cart-summary">
      <span>{{ cart().items.length }} items — ${{ total() | number:'1.2-2' }}</span>
    </div>
  `,
  imports: [DecimalPipe],
})
export class CartSummaryComponent {
  private kernel = inject(KERNEL_TOKEN);

  readonly cart  = ngAdapter.toSignal(cartAtom, this.kernel);
  readonly total = ngAdapter.toQuerySignal(cartAtom, this.kernel, BuildTotal);
}
```

---

## 4. React MFE Integration

### 4.1 Setup — Providing the Kernel via React Context

```tsx
// state/kernel.ts — created once per React app
import { createKernel }                 from '@vialiq/state-fp/kernel';
import { createDevTools, noopDevTools } from '@vialiq/state-fp/devtools';
import { createReactAdapter }           from '@vialiq/state-fp/adapter';
import {
  useState, useEffect, useRef, useMemo, useContext, createContext,
} from 'react';

const isProduction = process.env.NODE_ENV === 'production';

export const devtools = isProduction
  ? noopDevTools
  : createDevTools({ maxLogSize: 300 });

export const kernel = createKernel({ debug: !isProduction });
if (!isProduction) kernel.use(devtools.plugin);

// Create the adapter once — inject React hooks
export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext,
});
```

```tsx
// 📍 FRAMEWORK: React
// main.tsx — wrap the root
import { createRoot }    from 'react-dom/client';
import { kernel, reactAdapter }  from './state/kernel';

createRoot(document.getElementById('root')!).render(
  <reactAdapter.Provider kernel={kernel}>
    <App />
  </reactAdapter.Provider>
);
```

For a React remote in an MFE shell that needs to borrow atoms from the shell,
the setup is identical but the kernel is configured as a borrower:

```tsx
// 📍 FRAMEWORK: React (remote MFE)
// 📚 SETUP: authAtom imported from shell's public API or defined identically with same key
import { createKernel }   from '@vialiq/state-fp/kernel';
import { createSyncEngine } from '@vialiq/state-fp/sync';
import { authAtom }       from '@/atoms';  // from shell's public API

// apps/cart-remote/src/state/kernel.ts
const remoteKernel = createKernel({ debug: !isProduction });
if (!isProduction) remoteKernel.use(devtools.plugin);

// Receive auth from shell via BroadcastChannel — no direct import from shell bundle
const remoteSync = createSyncEngine({ kernel: remoteKernel });
remoteSync.share(authAtom, { channel: 'vi-auth', conflict: 'owner-wins' });

export { remoteKernel as kernel };
```

### 4.2 The Three Core Hooks

```tsx
// 📍 FRAMEWORK: React
// 📚 SETUP: reactAdapter created in state/kernel.ts (see §4.1)
import { match }       from '@vialiq/state-fp/core';
import { cartAtom }    from '@/atoms';
import { AddItem, RemoveItem, ClearCart } from '@/commands';
import { BuildTotal }  from '@/queries';
import { reactAdapter } from './state/kernel';  // from setup

function CartPage() {
  // 1. useAtom — subscribe to full atom state
  //    Component re-renders whenever cartAtom state changes
  const [cart] = reactAdapter.useAtom(cartAtom);

  // 2. useCommand — get a stable dispatch function
  //    Reference is stable across re-renders (backed by useRef internally)
  const dispatch = reactAdapter.useCommand(cartAtom);

  // 3. useQuery — memoised derived value
  //    Re-evaluates buildTotal handler only when cart state changes (not on every render)
  const total = reactAdapter.useQuery(cartAtom, BuildTotal());

  const handleAdd = (item: CartItem) => {
    const result = dispatch(AddItem(item));
    match(result, {
      ok:  (_state) => { /* success — cart signal auto-updates */ },
      err: (e)      => toast.error(e.message),
    });
  };

  return (
    <div>
      <p>{cart.items.length} items — Total: ${total.toFixed(2)}</p>
      <ItemList items={cart.items} onRemove={sku => dispatch(RemoveItem(sku))} />
      <button onClick={() => dispatch(ClearCart())}>Clear</button>
    </div>
  );
}
```

### 4.3 Async Commands with Loading State

For commands that use `AsyncCommandHandler` (network calls, async validation):

```tsx
function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    const result = await kernel.executeAsync(cartAtom, StartCheckout({ userId }));
    setLoading(false);

    match(result, {
      ok:  (_state) => router.push('/order-confirmation'),
      err: (e)      => setError(e.message),
    });
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? <Spinner /> : 'Checkout'}
      {error && <p className="error">{error}</p>}
    </button>
  );
}
```

The `useAtomAsync` hook convenience wrapper encapsulates this pattern:

```tsx
function CheckoutButton() {
  const [state, dispatch, loading, error] = reactAdapter.useAtomAsync(cartAtom);

  return (
    <button
      onClick={() => dispatch(StartCheckout({ userId }))}
      disabled={loading}
    >
      {loading ? 'Processing…' : `Checkout (${state.items.length} items)`}
    </button>
  );
}
```

### 4.4 Coexisting with Redux Toolkit

For teams with an existing Redux Toolkit setup, `@vialiq/state-fp` can be introduced
as the **cross-MFE layer only** without replacing the Redux store:

```
React Remote
  ├── Redux store          — component-local state, forms, UI flags, RTK Query server cache
  └── @vialiq/state-fp kernel  — borrowed shared atoms from shell (auth, theme, cart totals)
```

**Bridge pattern** — sync a Redux slice with an atom:

```ts
// store/bridge.ts

// Atom → Redux: when atom changes, dispatch a Redux action to mirror it
kernel.subscribe(authAtom, (authState) => {
  store.dispatch(authSlice.actions.synced(authState));
});

// Redux → Atom: when a Redux action fires, execute the corresponding command
startAppListening({
  actionCreator: cartSlice.actions.addItem,
  effect: ({ action }) => {
    kernel.execute(cartAtom, AddItem(action.payload));
  },
});
```

For **greenfield React MFEs**, prefer using `@vialiq/state-fp` exclusively:
- Remove Redux Toolkit — the CQRS pattern covers the same use cases with better MFE isolation
- Use `@vialiq/state-fp` for all client state
- Use TanStack Query (or similar) for server-cache state (RTK Query's domain)

### 4.5 Complete React Example

```tsx
// atoms/auth.atom.ts
export const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: { isAuthenticated: false, token: null, userId: null, displayName: null },
  // Deliberately no storage — auth token must not appear in browser DevTools storage
  // State is held in memory only; restored by re-auth on page reload
});

export const LogIn  = (p: { token: string; profile: UserProfile }) =>
  command('auth/logIn', p);
export const LogOut = () => command('auth/logOut', {});

// auth.component.tsx
import { reactAdapter } from '../state/kernel';

export function UserMenu() {
  const [auth]       = reactAdapter.useAtom(authAtom);
  const dispatch     = reactAdapter.useCommand(authAtom);
  const displayName  = reactAdapter.useQuery(authAtom, GetDisplayName());

  if (!auth.isAuthenticated) {
    return <a href="/login">Log in</a>;
  }

  return (
    <div className="user-menu">
      <span>{displayName}</span>
      <button onClick={() => dispatch(LogOut())}>Log out</button>
    </div>
  );
}
```

---

## 5. Lit MFE Integration

### 5.1 Setup — Reactive Controller Pattern

Lit uses [Reactive Controllers](https://lit.dev/docs/composition/controllers/) as a
first-class pattern for reusable stateful behaviour. `createLitController` produces
an `AtomController<S>` that implements this interface.

```ts
// state/kernel.ts — the single module published by the shell as a shared dependency
import { createKernel }                 from '@vialiq/state-fp/kernel';
import { createDevTools, noopDevTools } from '@vialiq/state-fp/devtools';

const isProduction = !location.hostname.includes('localhost');

export const kernel = createKernel({
  devtools: isProduction ? noopDevTools : createDevTools(),
});
```

In Lit remotes, import the kernel directly (as a shared singleton via module federation
import map — `vi-state-kernel` is declared as a shared module in webpack/Vite config):

```ts
// apps/product-card-remote/src/elements/product-card.element.ts
import { createLitController } from '@vialiq/state-fp/adapter';
import { kernel }               from 'vi-state-kernel'; // shared singleton via import map
```

### 5.2 Reading State in Lit Templates

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createLitController } from '@vialiq/state-fp/adapter';
import { kernel, cartAtom, AddItem, RemoveItem, BuildTotal } from '../state/kernel';

@customElement('vi-cart-widget')
export class CartWidget extends LitElement {
  static styles = css`/* ... */`;

  // Controller subscribes on hostConnected, unsubscribes on hostDisconnected
  // Calls this.requestUpdate() on every atom state change
  private cart = createLitController(this, kernel, cartAtom);

  // Derived value — re-computed via query handler on every render cycle
  // (memoised internally: only re-runs if cart.state reference changed)
  get total() {
    return this.cart.query(BuildTotal());
  }

  render() {
    const { items } = this.cart.state;

    return html`
      <div class="cart">
        <h3>Cart (${items.length})</h3>
        <ul>
          ${items.map(item => html`
            <li>
              ${item.sku} × ${item.qty}
              <button @click=${() => this.cart.dispatch(RemoveItem(item.sku))}>
                Remove
              </button>
            </li>
          `)}
        </ul>
        <p>Total: $${this.total.toFixed(2)}</p>
        <button @click=${() => this.cart.dispatch(ClearCart())}>Clear</button>
      </div>
    `;
  }
}
```

### 5.3 Multi-Atom Lit Components

A component that needs multiple atoms creates one controller per atom:

```ts
@customElement('vi-checkout-page')
export class CheckoutPage extends LitElement {
  private cart    = createLitController(this, kernel, cartAtom);
  private auth    = createLitController(this, kernel, authAtom);   // borrowed from shell
  private payment = createLitController(this, kernel, paymentAtom);

  get canCheckout() {
    return this.auth.state.isAuthenticated
      && this.cart.state.items.length > 0
      && !this.payment.state.processing;
  }

  handleSubmit() {
    const result = this.payment.dispatch(
      SubmitPayment({ total: this.cart.query(BuildTotal()) })
    );
    match(result, {
      ok:  (_state) => { /* success — payment signal auto-updates */ },
      err: (e)      => this.dispatchEvent(new CustomEvent('payment-error', { detail: e })),
    });
  }

  render() {
    return html`
      <vi-cart-summary .items=${this.cart.state.items}></vi-cart-summary>
      <vi-payment-form
        .disabled=${!this.canCheckout}
        @submit=${this.handleSubmit}
      ></vi-payment-form>
    `;
  }
}
```

### 5.4 Complete Lit Example

```ts
// elements/auth-badge.element.ts
import { LitElement, html, css } from 'lit';
import { customElement }          from 'lit/decorators.js';
import { createLitController }    from '@vialiq/state-fp/adapter';
import { kernel, authAtom }       from 'vi-state-kernel';
import { LogOut }                 from '../atoms/auth.atom';

@customElement('vi-auth-badge')
export class AuthBadge extends LitElement {
  static styles = css`
    :host { display: flex; align-items: center; gap: 8px; }
    button { cursor: pointer; }
  `;

  // Auth atom is BORROWED from shell — this remote never executes auth commands
  // State updates arrive automatically via BroadcastChannel sync
  private auth = createLitController(this, kernel, authAtom);

  render() {
    const { isAuthenticated, displayName } = this.auth.state;

    if (!isAuthenticated) {
      return html`<a href="/login">Log in</a>`;
    }

    return html`
      <span>${displayName}</span>
      <button @click=${() => this.auth.dispatch(LogOut())}>
        Log out
      </button>
    `;
  }
}
```

---

## 6. Cross-Framework State Sharing

### 6.1 Shell Owns the Kernel

In a micro-frontend architecture, only ONE kernel instance should declare and own
shared atoms. That is the **shell**. The shell:

1. Creates the kernel
2. Registers all shell-owned atoms (auth, theme, locale)
3. Creates the sync engine and shares owned atoms
4. Exports the kernel as a module-federation shared singleton

```ts
// apps/shell/src/state/kernel.ts

import { createKernel }    from '@vialiq/state-fp/kernel';
import { createSyncEngine} from '@vialiq/state-fp/sync';

export const kernel = createKernel({ debug: isDevMode() });
if (isDevMode()) kernel.use(devtools.plugin);

// Register shell atoms
kernel.register(authAtom, authCommandHandlers, authApplier);
kernel.register(themeAtom, themeCommandHandlers, themeApplier);

// Share with all remotes via BroadcastChannel
const sync = createSyncEngine({ kernel });
sync.share(authAtom,  { channel: 'vi-auth',  conflict: 'owner-wins' });
sync.share(themeAtom, { channel: 'vi-theme', conflict: 'owner-wins' });

// Hydrate from storage on startup
await kernel.hydrate();
```

### 6.2 Remote Borrows Atoms

Every remote that needs shell atoms creates its **own kernel** (for isolation) and
borrows atoms from the shell's sync channel. The remote never creates its own version
of a shared atom — it only borrows the ownership.

```ts
// apps/cart-remote/src/state/kernel.ts

const remoteKernel = createKernel({ debug: isDevMode() });
if (isDevMode()) remoteKernel.use(devtools.plugin);

// Register atoms OWNED by this remote
remoteKernel.register(cartAtom, cartCommandHandlers, cartApplier);

// Receive shell atoms — share on the same per-atom channels the shell uses
const sync = createSyncEngine({ kernel: remoteKernel });
sync.share(authAtom,  { channel: 'vi-auth',  conflict: 'owner-wins' });
sync.share(themeAtom, { channel: 'vi-theme', conflict: 'owner-wins' });

// Share this remote's owned atoms with peers
sync.share(cartAtom, { channel: 'vi-cart', conflict: 'owner-wins' });

await remoteKernel.hydrate();
```

```
Shell              Cart Remote           Header Remote
  │                    │                     │
  │─ auth state ──────►│ (via BroadcastCh)   │
  │─ theme state ─────►│                ────►│
  │                    │─ cart state ───────►│
```

### 6.3 Cross-MFE Domain Events

When a remote needs to react to **domain events** from another remote (not just state
snapshots), use the cross-MFE event bus (`@vialiq/state-fp/bus`):

```ts
// apps/notifications-remote/src/state/bus.ts
import { createSharedBus } from '@vialiq/state-fp/bus';

const eventBus = createSharedBus({ channel: 'vi-events' });

// Subscribe to checkout completion events from the cart remote
// The notification remote has NO dependency on the cart remote's bundle
eventBus.subscribe({ type: 'cart/checkoutCompleted' }, (event) => {
  showToast(`Order #${event.payload.orderId} confirmed!`);
});
```

```ts
// apps/cart-remote/src/state/kernel.ts — publish events to the shared bus
const eventBus = createSharedBus({ channel: 'vi-events' });

remoteKernel.onEvent(event => {
  // All cart domain events are published to the shared bus
  eventBus.publish({ source: 'cart-remote', event });
});
```

---

## 7. NgRx Bridge — Migrating an Angular MFE to @vialiq/state-fp

If your Angular MFE currently uses NgRx and you want to adopt `@vialiq/state-fp` for
cross-MFE state without rewriting everything at once, use the bridge pattern.

### Phase A: Introducing the kernel alongside NgRx

```ts
// app.config.ts — add the kernel without removing NgRx
providers: [
  provideStore(),
  provideEffects(),
  // New — @vialiq/state-fp kernel for cross-MFE state
  { provide: KERNEL_TOKEN, useValue: kernel },
]
```

### Phase B: Bridge NgRx ↔ atom for shared atoms

```ts
@Injectable({ providedIn: 'root' })
export class NgRxAtomBridgeService {
  constructor(
    private store: Store,
    @Inject(KERNEL_TOKEN) private kernel: Kernel,
  ) {
    // When shell auth atom changes → sync to NgRx authSlice
    kernel.subscribe(authAtom, state =>
      this.store.dispatch(AuthActions.atomSynced({ auth: state }))
    );
  }
}
```

### Phase C: Replace NgRx slices one at a time

For each NgRx feature slice you want to migrate:
1. Create an atom + handlers for the same data
2. Remove the NgRx slice
3. Update components to use `ngAdapter.toSignal()` instead of NgRx selectors
4. Remove effects — replace with `AsyncCommandHandler` or `KernelPlugin.afterExecute`

### What NgRx does well that @vialiq/state-fp replaces directly

| NgRx concept | @vialiq/state-fp replacement |
|---|---|
| `Action` | `Command` |
| `Reducer` | `EventApplier` + `CommandHandler` |
| `Effect (async)` | `AsyncCommandHandler` |
| `Selector` | `QueryHandler` (+ memoisation option) |
| `createEffect` (side effects) | `KernelPlugin.afterExecute` |
| `@ngrx/signals SignalStore` | `ngAdapter.toSignal(atom, kernel)` |
| `Redux DevTools Extension` | `createReduxDevToolsBridge()` in devtools |

---

## 8. Redux Bridge — Migrating a React MFE to @vialiq/state-fp

For React MFEs with an existing Redux Toolkit store:

### Phase A: Side-by-side introduction

```tsx
// main.tsx — wrap with both providers
createRoot(document.getElementById('root')!).render(
  <Provider store={reduxStore}>          {/* existing Redux */}
    <reactAdapter.Provider kernel={kernel}> {/* new @vialiq/state-fp */}
      <App />
    </reactAdapter.Provider>
  </Provider>
);
```

### Phase B: Bridge Redux ↔ atom

```ts
// state/bridge.ts
// Atom → Redux
kernel.subscribe(authAtom, state =>
  reduxStore.dispatch(authSlice.actions.synced(state))
);

// Redux → Atom (when RTK actions fire, mirror to atom commands)
reduxStore.subscribe(() => {
  const action = getLastAction(reduxStore);  // requires middleware
  if (action?.type === 'cart/addItem') {
    kernel.execute(cartAtom, AddItem(action.payload));
  }
});
```

### Phase C: Migrate slice by slice

For each Redux slice you want to migrate:
1. Define an atom + handlers + applier (same state shape as the slice)
2. Replace `useSelector` with `reactAdapter.useAtom` or `reactAdapter.useQuery`
3. Replace `useDispatch` with `reactAdapter.useCommand`
4. Remove the Redux slice from the store
5. Keep RTK Query for server-state — it is orthogonal to @vialiq/state-fp

### What Redux Toolkit does well that @vialiq/state-fp replaces

| RTK concept | @vialiq/state-fp replacement |
|---|---|
| `createSlice` | `defineAtom` + `createCommandHandler` + `createEventApplier` |
| `createAsyncThunk` | `AsyncCommandHandler` with `AbortSignal` |
| `createSelector` | `QueryHandler` with `memo: true` |
| `createEntityAdapter` | `defineAtom` + lensed `EventApplier` using `Lens<S, Record<id, Entity>>` |
| `Redux DevTools Extension` | `createReduxDevToolsBridge()` |
| `RTK Query` | Keep as-is — use it for server-state; use @vialiq/state-fp for client-state |

---

## 9. DevTools in Each Framework

### Angular — Dev-mode kernel setup

```ts
// environment.development.ts
import { createDevTools, attachBridge } from '@vialiq/state-fp/devtools';
import { createReduxDevToolsBridge }     from '@vialiq/state-fp/devtools';

export const devtools = createDevTools({ maxLogSize: 500 });

// Attach console bridge (accessible as window.__VI_STATE_FP__)
attachBridge(devtools);

// Optionally connect to Redux DevTools browser extension
if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
  devtools.addExtension(createReduxDevToolsBridge({ name: 'vi/state-fp (Angular)' }));
}
```

```ts
// environment.production.ts
import { noopDevTools } from '@vialiq/state-fp/devtools';

export const devtools = noopDevTools;
// window.__VI_STATE_FP__ is NEVER attached in production
```

### React — Dev-mode kernel setup

```ts
// state/kernel.ts
import { createDevTools, noopDevTools, attachBridge } from '@vialiq/state-fp/devtools';

const isDev = process.env.NODE_ENV !== 'production';
export const devtools = isDev ? createDevTools() : noopDevTools;

if (isDev && typeof window !== 'undefined') {
  attachBridge(devtools);
}
```

### Lit — Dev-mode kernel setup

```ts
// state/kernel.ts
import { createDevTools, noopDevTools, attachBridge } from '@vialiq/state-fp/devtools';

// Lit is often used for web components deployed in multiple contexts.
// Use a URL parameter or meta tag to toggle devtools safely:
const isDevBuild = document
  .querySelector('meta[name="vi-devtools"]')?.getAttribute('content') === 'true';

export const devtools = isDevBuild ? createDevTools() : noopDevTools;

if (isDevBuild) {
  attachBridge(devtools);
}
```

### What you can do in the browser console (dev mode only)

```js
// Inspect current state of all atoms
window.__VI_STATE_FP__.getAtoms()

// See recent state changes
window.__VI_STATE_FP__.getLog().slice(-10)

// Find all events that were caused by a single user action
window.__VI_STATE_FP__.traceCorrelation('abc-123')

// Step backward through state changes to debug an issue
window.__VI_STATE_FP__.stepBackward()
window.__VI_STATE_FP__.stepBackward()
window.__VI_STATE_FP__.getAtoms()   // ← state is now 2 events earlier

// Export the full event log to share with a teammate for bug reproduction
copy(window.__VI_STATE_FP__.exportLog())
// Teammate: window.__VI_STATE_FP__.importLog(pastedJson)
```

---

## 10. Common Patterns and Anti-Patterns

### ✅ Patterns

| Pattern | Description |
|---|---|
| **One atom per domain concept** | `cartAtom`, `authAtom`, `checkoutAtom` — not one giant `appAtom` |
| **Co-locate handlers with atom** | Define commands, handlers, applier, and queries in the same file as the atom |
| **Use `StorageSecurityPolicy`** | Always declare security policy for atoms that use browser storage |
| **Borrow, don't duplicate** | Never create a second `authAtom` in a remote — borrow via the sync module |
| **`MemoryAdapter` for tokens** | Auth tokens and session IDs belong in memory, not localStorage |
| **`KernelPlugin` for cross-cutting concerns** | Logging, analytics, error tracking — plugins, not poluted handlers |
| **Tree-shake devtools** | Import `noopDevTools` in production — zero-cost debug layer |

### ❌ Anti-Patterns

| Anti-pattern | Problem | Solution |
|---|---|---|
| Calling `kernel.execute()` inside a `QueryHandler` | Breaks read-only query invariant | Move side effects to `KernelPlugin.afterExecute` |
| Sharing the kernel object across MFEs via the bundle | Creates version coupling | Use BroadcastChannel sync; each MFE has its own kernel |
| Storing auth tokens in `LocalAdapter` without `EncryptedAdapter` | Token visible in plaintext in browser DevTools | Use `MemoryAdapter` or `EncryptedAdapter` |
| Calling `attachBridge()` unconditionally | Exposes full state in production | Guard with `isDevMode()` / `process.env.NODE_ENV` check |
| Using `axios` or `fetch` inside a synchronous `CommandHandler` | Violates I1 — CommandHandler must be pure | Use `AsyncCommandHandler.handleAsync` instead |
| One giant atom for all app state | Atom subscriptions notify ALL subscribers on any change | Split into domain-specific atoms; only affected components re-render |
| Bypassing `kernel.execute()` to mutate atom state directly | No event log, no devtools trace, no plugin hooks fire | Always go through `kernel.execute()` |

---

## 11. Quick Reference Cheatsheet

### Angular

```ts
// Setup
export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
const kernel = createKernel({ debug: true });

// In a component
readonly state = ngAdapter.toSignal(myAtom, kernel);
readonly derived = ngAdapter.toQuerySignal(myAtom, kernel, MyQuery);
readonly dispatch = ngAdapter.commandDispatcher(myAtom, kernel);
```

### React

```tsx
// Setup (once per app)
export const reactAdapter = createReactAdapter({ useState, useEffect, useRef, useMemo, useContext, createContext });

// In a component
const [state]  = reactAdapter.useAtom(myAtom);
const dispatch = reactAdapter.useCommand(myAtom);
const derived  = reactAdapter.useQuery(myAtom, MyQuery());
```

### Lit

```ts
// In a LitElement class
private ctrl = createLitController(this, kernel, myAtom);

// In render()
this.ctrl.state            // current state
this.ctrl.dispatch(cmd)    // execute command
this.ctrl.query(q)         // run query
```

### Vanilla JS / any framework

```ts
const off = kernel.subscribe(myAtom, state => updateUI(state));
const result = kernel.execute(myAtom, MyCommand(payload));
const value  = kernel.query(myAtom, MyQuery());
off(); // unsubscribe
```

### Atom definition (all frameworks)

```ts
export const myAtom = defineAtom<MyState>({
  key: 'vi/my-atom',
  initialState: { ... },
  storage: {
    adapter: new LocalAdapter(),
    key: 'vi:my-atom',
    ttl: 60 * 60 * 1000,      // 1 hour
    security: 'obfuscated',    // or 'encrypted' for sensitive data
  },
});
```

### Cross-MFE sync

```ts
// Shell — owner: share on a per-atom named channel
const shellSync = createSyncEngine({ kernel });
shellSync.share(myAtom, { channel: 'vi-my-atom', conflict: 'owner-wins' });

// Remote — receiver: share on the same channel; shell's 'owner-wins' policy applies
const remoteSync = createSyncEngine({ kernel: remoteKernel });
remoteSync.share(myAtom, { channel: 'vi-my-atom', conflict: 'owner-wins' });
```

---

## 12. Tricky Implementations

This section covers patterns that developers frequently get wrong or find non-obvious when
using `@vialiq/state-fp` in real applications.

---

### 12.1 Testing — Stubbing the Kernel

**Problem:** Components that use `ngAdapter.toSignal()`, `reactAdapter.useAtom()`, or
`createLitController()` depend on a live kernel. Setting up a real kernel with atoms and
handlers in every unit test is verbose and slow.

**Solution:** Create a minimal test kernel with stub state.

#### Angular — Testing Signals without TestBed

```ts
// test/helpers/fake-kernel.ts
import { createKernel, defineAtom, createCommandHandler } from '@vialiq/state-fp/kernel';
import type { Atom } from '@vialiq/state-fp/kernel';
import { ok } from '@vialiq/state-fp/core';

export function fakeKernelWith<S>(atom: Atom<S>, state: S) {
  const k = createKernel();
  // Minimal no-op handler using the required commandType field
  const noopHandler = createCommandHandler({
    commandType: '__test/noop__',   // commandType is required (not handles())
    handle: (_s, _cmd) => ok([]),   // accept any command, emit no events
  });
  k.register(atom, noopHandler, (s) => s);  // no-op applier
  // Push initial state directly (test utility only)
  (atom as any)._setState(state, 0);
  return k;
}
```

```ts
// counter.component.spec.ts
import { signal, DestroyRef } from '@angular/core';
import { createAngularAdapter } from '@vialiq/state-fp/adapter';
import { fakeKernelWith }       from '../test/helpers/fake-kernel';

describe('CounterComponent', () => {
  it('displays the count from the atom', () => {
    // Arrange: create a fake DestroyRef (never fires onDestroy in tests)
    const destroyRef = { onDestroy: (_fn: () => void) => {} } as unknown as DestroyRef;
    const inject     = <T>(_token: unknown): T => destroyRef as unknown as T;
    const adapter    = createAngularAdapter({ signal, inject, DestroyRef });
    const kernel     = fakeKernelWith(counterAtom, { count: 42 });

    // Act
    const countSignal = adapter.toSignal(counterAtom, kernel);

    // Assert
    expect(countSignal()).toBe(42);   // signal is initialised with atom state
  });
});
```

#### React — Testing Hooks with `renderHook`

```tsx
// counter.hook.spec.tsx
import { renderHook, act }  from '@testing-library/react';
import { createReactAdapter } from '@vialiq/state-fp/adapter';
import { makeTestKernel }     from '../test/helpers/make-test-kernel';

const { useAtom } = createReactAdapter({ useState, useEffect, useRef, useMemo, useContext, createContext });

it('updates when kernel state changes', async () => {
  const { kernel } = makeTestKernel(counterAtom, { count: 0 });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <KernelProvider kernel={kernel}>{children}</KernelProvider>
  );

  const { result } = renderHook(() => useAtom(counterAtom), { wrapper });
  expect(result.current[0].count).toBe(0);

  // Simulate a state change by executing a command
  act(() => {
    kernel.execute(counterAtom, Increment({ by: 5 }));
  });

  expect(result.current[0].count).toBe(5);
});
```

#### Lit — Testing without a Browser

```ts
// auth-badge.spec.ts — using @web/test-runner or Vitest with happy-dom
import { fixture, html } from '@open-wc/testing';
import './auth-badge.element';   // registers the custom element

it('shows the username when authenticated', async () => {
  // Inject test state before mounting
  (authAtom as any)._setState({ isAuthenticated: true, displayName: 'Alice' }, 1);

  const el = await fixture<AuthBadge>(html`<vi-auth-badge></vi-auth-badge>`);
  const span = el.shadowRoot!.querySelector('span')!;
  expect(span.textContent).toBe('Alice');
});
```

**Key insight:** Use `(atom as any)._setState(state, version)` to inject test state into an
atom without going through the command/event pipeline. This is an intentional escape hatch
for testing — do NOT use it in production code.

---

### 12.2 Async Command Loading State

**Problem:** A command that makes a network call (e.g., `submitOrder`) takes several seconds.
How do you show a spinner during execution and re-enable the button on completion or error?

**Pattern:** Track loading state in a separate atom alongside command dispatch.

#### Angular

```ts
// atoms/checkout.atom.ts
export type CheckoutState = {
  items:      CartItem[];
  submitting: boolean;
  error:      string | null;
};

export const checkoutAtom = defineAtom<CheckoutState>({
  key: 'vi/checkout',
  initialState: { items: [], submitting: false, error: null },
});
```

```ts
// components/checkout.component.ts
@Component({
  template: `
    <button [disabled]="checkout().submitting" (click)="submit()">
      {{ checkout().submitting ? 'Submitting…' : 'Place Order' }}
    </button>
    @if (checkout().error) {
      <p class="error">{{ checkout().error }}</p>
    }
  `,
})
export class CheckoutComponent {
  private kernel = inject(KERNEL_TOKEN);
  readonly checkout = ngAdapter.toSignal(checkoutAtom, this.kernel);

  async submit() {
    // 1. Optimistically set submitting = true
    this.kernel.execute(checkoutAtom, SetSubmitting({ submitting: true }));

    // 2. Run the async command
    const result = await this.kernel.executeAsync(checkoutAtom, SubmitOrder());

    // 3. Clear submitting and set error if failed
    match(result, {
      ok:  (_s) => this.router.navigate(['/confirmation']),
      err: (e)  => this.kernel.execute(checkoutAtom, SetError({ error: e.message })),
    });
  }
}
// Handler for SetSubmitting clears the error and flips the flag:
// 'checkout/setSubmitting': (s, e) => ({ ...s, submitting: e.payload.submitting, error: null })
// Handler for SetError: (s, e) => ({ ...s, submitting: false, error: e.payload.error })
```

#### React

```tsx
function CheckoutButton() {
  const [checkout, , dispatch] = reactAdapter.useAtom(checkoutAtom);
  const { submitting, error } = checkout;

  const handleSubmit = async () => {
    dispatch(SetSubmitting({ submitting: true }));

    const result = await kernel.executeAsync(checkoutAtom, SubmitOrder());

    match(result, {
      ok:  (_s) => navigate('/confirmation'),
      err: (e)  => dispatch(SetError({ error: e.message })),
    });
  };

  return (
    <>
      <button disabled={submitting} onClick={handleSubmit}>
        {submitting ? 'Submitting…' : 'Place Order'}
      </button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

**Important:** `executeAsync` is the correct way to call an `AsyncCommandHandler`. Do NOT
call `kernel.execute()` with an async handler — it returns `Promise<Either>` wrapped in an
outer `Either`, which is a double-nested type that is difficult to work with.

---

### 12.3 MFE Loading Race — Remote Starts Before Shell Has Synced

**Problem:** The cart remote loads and renders before the shell has broadcast its initial
`authAtom` state. The remote shows "Guest" for a brief flash even though the user is
logged in.

**Pattern:** Subscribe once and wait for a meaningful first value.

```ts
// apps/cart-remote/src/state/kernel.ts

// The remote borrows authAtom from shell via BroadcastChannel
const sync = createSyncEngine({ kernel: remoteKernel });
sync.share(authAtom, { channel: 'vi-auth', conflict: 'owner-wins' });

// Problem: authAtom.get() immediately after share() returns the initialState ({ token: null })
// because the shell has not yet broadcast its current state.

// Solution: wait for the first non-null token with a timeout
export function waitForAuth(timeoutMs = 2000): Promise<AuthState> {
  return new Promise((resolve) => {
    // If already populated, resolve immediately
    const current = authAtom.get();
    if (current.token !== null) { resolve(current); return; }

    // Otherwise wait for the first sync message
    const off = remoteKernel.subscribe(authAtom, (state) => {
      if (state.token !== null) {
        off();
        resolve(state);
      }
    });

    // Timeout fallback — resolve with guest state if shell never responds
    setTimeout(() => { off(); resolve(authAtom.get()); }, timeoutMs);
  });
}
```

```ts
// apps/cart-remote/src/main.ts
await waitForAuth();   // block first render until auth is known
bootstrap(CartRemoteComponent, { ... });
```

**Alternative:** Use a `loading` signal that resolves on first kernel subscription:

```ts
// Angular
readonly authReady = signal(false);

ngOnInit() {
  const off = this.kernel.subscribe(authAtom, () => {
    this.authReady.set(true);
    off();
  });
}
// Template: @if (authReady()) { ... } @else { <spinner> }
```

---

### 12.4 Multi-Atom Derived State

**Problem:** A component needs derived data from two separate atoms (e.g., cart items +
user loyalty points to compute a discounted total).

**Pattern:** Combine atom signals at the framework layer — not inside the kernel.

#### Angular — `computed()` over two signals

```ts
@Component({
  template: `<p>Total after discount: {{ discountedTotal() | currency }}</p>`,
})
export class CheckoutSummaryComponent {
  private kernel = inject(KERNEL_TOKEN);

  readonly cart   = ngAdapter.toSignal(cartAtom, this.kernel);   // CartState
  readonly loyalty = ngAdapter.toSignal(loyaltyAtom, this.kernel); // LoyaltyState

  // Computed automatically re-evaluates when either signal changes
  readonly discountedTotal = computed(() => {
    const rawTotal  = this.cart().items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount  = this.loyalty().points > 100 ? 0.05 : 0;
    return rawTotal * (1 - discount);
  });
}
```

#### React — `useMemo` over two atom states

```tsx
function CheckoutSummary() {
  const [cart]    = reactAdapter.useAtom(cartAtom);
  const [loyalty] = reactAdapter.useAtom(loyaltyAtom);

  const discountedTotal = useMemo(() => {
    const rawTotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = loyalty.points > 100 ? 0.05 : 0;
    return rawTotal * (1 - discount);
  }, [cart, loyalty]);

  return <p>Total after discount: {discountedTotal.toFixed(2)}</p>;
}
```

#### Why not use a single Query across atoms?

`kernel.query(atom, query)` only receives the state of **one** atom. Cross-atom derivations
are intentionally outside the kernel scope (following DDD bounded context principles). The
framework's own computed primitive is the right tool for cross-atom derivation.

---

### 12.5 SSR / Server-Side Rendering Edge Cases

**Problem:** Your app is server-rendered (Angular Universal, Next.js) and BroadcastChannel
is not available in Node.js. The kernel, sync engine, and bus must not throw.

**Solution:** All modules handle missing `BroadcastChannel` gracefully via transport
auto-detection.

```ts
// src/sync/transport.ts (internal)
export const createAutoTransport = (channel: string): SyncTransport => {
  if (typeof BroadcastChannel !== 'undefined') {
    return createBroadcastBridge(channel);
  }
  return createNoopTransport();   // server: sends to /dev/null, never receives
};
```

```ts
// src/bus/index.ts (internal)
export const createSharedBus = (options): SharedEventBus => {
  if (typeof BroadcastChannel === 'undefined') {
    return createNoopBus();   // server: publish() and subscribe() are no-ops
  }
  return createBroadcastBus(options);
};
```

**What you must do:**
1. Provide initial state via `kernel.hydrate()` before rendering — do not rely on sync to
   populate borrowed atoms on the server.
2. Do not call `sync.share()` unconditionally in a server-only module — the noop transport
   is harmless but the `share()` call itself schedules a hydration request that has no effect.
3. For Angular Universal, wrap kernel creation in `isPlatformBrowser`:

```ts
// apps/shell/src/app/app.config.ts
import { isPlatformBrowser, PLATFORM_ID } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: KERNEL_TOKEN,
      useFactory: (platformId: object) => {
        const kernel = createKernel();
        if (isPlatformBrowser(platformId)) {
          // BroadcastChannel-dependent setup only in the browser
          const sync = createSyncEngine({ kernel });
          sync.share(authAtom, { channel: 'vi-auth', conflict: 'owner-wins' });
        }
        return kernel;
      },
      deps: [PLATFORM_ID],
    },
  ],
};
```

**Hydration on the client:** After client-side bootstrap, the sync engine receives the
first BroadcastChannel message from the shell (if the shell is also running in the same
browser context) and updates the atoms. The `waitForAuth()` pattern from section 12.3 also
applies here.

---

### 12.6 Typed Error Handling Across Frameworks

**Problem:** A command handler returns `err({ code: 'OUT_OF_STOCK', message: '...' })`.
How do you surface this in Angular templates, React JSX, and Lit templates in a consistent
way — without casting to `any` or using try/catch?

**Pattern:** Use `match()` at the dispatch site; store error in atom state when persistent
feedback is needed.

```ts
// atoms/cart.atom.ts — include error in state shape
export type CartState = {
  items: CartItem[];
  lastError: { code: string; message: string } | null;
};
```

#### Angular

```ts
// Option A: match() at command dispatch site (transient notification)
onAddToCart(sku: string) {
  const result = this.kernel.execute(cartAtom, AddItem({ sku, qty: 1 }));
  match(result, {
    ok:  (_s) => { /* success */ },
    err: (e)  => this.snackBar.open(e.message, 'Dismiss'),
  });
}

// Option B: store error in atom state (persistent, visible in template)
onAddToCart(sku: string) {
  const result = this.kernel.execute(cartAtom, AddItem({ sku, qty: 1 }));
  if (isErr(result)) {
    this.kernel.execute(cartAtom, SetCartError({ error: result.left }));
  }
}
// Template reads: cart().lastError?.message
```

#### React

```tsx
// Option A: local state for transient error
function CartPage() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = reactAdapter.useCommand(cartAtom);

  const handleAdd = (sku: string) => {
    const result = dispatch(AddItem({ sku, qty: 1 }));
    match(result, {
      ok:  ()  => setError(null),
      err: (e) => setError(e.message),
    });
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      <button onClick={() => handleAdd('SKU-001')}>Add to cart</button>
    </>
  );
}

// Option B: error in atom state (same pattern as Angular option B above)
```

**Key rule:** `match(result, { ok, err })` is always type-safe — TypeScript ensures both
branches are handled. Never use `result.right` or `result.left` directly in component code —
those fields are `Left`/`Right` implementation details.

**Custom error codes for UI branching:**

```ts
// handler
if (stock < cmd.payload.qty) {
  return err({ code: 'OUT_OF_STOCK' as const, message: `Only ${stock} left` });
}
if (!auth.isAuthenticated) {
  return err({ code: 'UNAUTHENTICATED' as const, message: 'Please log in first' });
}

// component
match(result, {
  ok: () => {},
  err: (e) => {
    if (e.code === 'OUT_OF_STOCK')    showOutOfStockBanner(e.message);
    if (e.code === 'UNAUTHENTICATED') router.navigate(['/login']);
  },
});
```
