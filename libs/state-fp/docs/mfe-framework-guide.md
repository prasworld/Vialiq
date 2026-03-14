# MFE State Management — Per-Framework Integration Guide

> **Purpose:** This guide answers the question: *"My team builds Angular (or React, or Lit) micro-frontend
> remotes. How do I integrate `@vi/state-fp` and make state management as easy as possible?"*
>
> **Audience:** Frontend developers joining a micro-frontend project who already know their
> framework (Angular / React / Lit) but are new to `@vi/state-fp`.

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
7. [NgRx Bridge — Migrating an Angular MFE to @vi/state-fp](#7-ngrx-bridge--migrating-an-angular-mfe-to-vistate-fp)
8. [Redux Bridge — Migrating a React MFE to @vi/state-fp](#8-redux-bridge--migrating-a-react-mfe-to-vistate-fp)
9. [DevTools in Each Framework](#9-devtools-in-each-framework)
10. [Common Patterns and Anti-Patterns](#10-common-patterns-and-anti-patterns)
11. [Quick Reference Cheatsheet](#11-quick-reference-cheatsheet)

---

## 1. The Core Principle: One Kernel, Many Frameworks

`@vi/state-fp` is **framework-agnostic at its core**. The kernel, atoms, and commands work
identically whether consumed from Angular, React, Lit, or plain JavaScript. Framework adapters
are thin, optional wrappers that translate the kernel's `subscribe()` API into framework-native
reactive primitives (Signals, Hooks, Reactive Controllers).

```
                     ┌─────────────────────────────────────────┐
                     │           @vi/state-fp/kernel             │
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
3. **Sync happens via BroadcastChannel** — the `@vi/state-fp/sync` module handles this automatically
4. **No shared JS runtime required** — borrowers don't import from the owner's bundle

---

## 3. Angular MFE Integration

### 3.1 Setup — Providing the Kernel via Angular DI

The kernel is a singleton service. Provide it at the application (or remote shell) level
via an `InjectionToken` and Angular's DI system.

```ts
// libs/state-tokens.ts — published by the shell remote as a shared module
import { InjectionToken } from '@angular/core';
import type { Kernel }    from '@vi/state-fp/kernel';

export const KERNEL_TOKEN = new InjectionToken<Kernel>('vi/kernel');
```

```ts
// apps/shell/src/app/app.config.ts
import { ApplicationConfig, signal, effect, DestroyRef, inject, isDevMode } from '@angular/core';
import { createKernel }                     from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools }     from '@vi/state-fp/devtools';
import { createAngularAdapter }             from '@vi/state-fp/adapter';
import { KERNEL_TOKEN }                     from '@/state-tokens';

// Create once at app init
const devtools = isDevMode() ? createDevTools({ maxEventLogSize: 500 }) : noopDevTools;
const kernel   = createKernel({ devtools });

// Angular adapter — wire Angular APIs at the point of creation
export const ngAdapter = createAngularAdapter({ signal, effect, DestroyRef, inject });

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: KERNEL_TOKEN, useValue: kernel },
    // If the shell owns atoms, register them here:
    {
      provide: APP_INITIALIZER,
      useFactory: () => async () => {
        kernel.register(authAtom, authHandler, authApplier);
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
// apps/header-remote/src/app/app.config.ts
// The remote receives the kernel via BroadcastChannel sync — no direct import from shell
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: KERNEL_TOKEN,
      useFactory: () => {
        const remoteKernel = createKernel();
        // Borrow shell atoms via sync protocol
        createSyncEngine({ channel: 'vi-state', kernel: remoteKernel })
          .borrow(authAtom)
          .borrow(themeAtom)
          .start();
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
  readonly auth = ngAdapter.toSignal(this.kernel, authAtom);
}
```

For derived computed values without a round-trip to the kernel query bus, use Angular's
`computed()` directly on top of the signal:

```ts
readonly displayName = computed(() => {
  const user = this.auth();
  return user.isAuthenticated ? user.profile.name : 'Guest';
});
```

For values that require a full `QueryHandler` (complex projections, cross-atom derivations):

```ts
readonly cartTotal = ngAdapter.toQuerySignal(this.kernel, cartAtom, BuildTotal());
```

### 3.3 Dispatching Commands

```ts
@Component({ ... })
export class CartComponent {
  private kernel   = inject(KERNEL_TOKEN);
  readonly cart    = ngAdapter.toSignal(this.kernel, cartAtom);
  readonly addItem = ngAdapter.commandDispatcher(this.kernel, cartAtom);

  onAddToCart(sku: string, qty: number) {
    const result = this.addItem(AddItem({ sku, qty }));

    // result is Either<CommandError, CartState>
    if (isLeft(result)) {
      this.notificationService.error(result.left.message);
    }
  }
}
```

For async command handlers:

```ts
async onCheckout() {
  const result = await this.kernel.executeAsync(cartAtom, StartCheckout());
  foldEither(
    (err) => this.notificationService.error(err.message),
    (state) => this.router.navigate(['/order-confirmation']),
  )(result);
}
```

### 3.4 Coexisting with NgRx

If your team already uses NgRx for Angular-internal state (component interaction, routing,
effects), `@vi/state-fp` slots in as the **cross-MFE layer** without replacing NgRx.

```
Angular Remote
  ├── NgRx Store           — component-local state (form state, pagination, UI flags)
  │     └── Effects        — async operations within this remote
  └── @vi/state-fp kernel  — shared state received from / sent to other MFEs
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

For **greenfield Angular MFEs**, prefer `@vi/state-fp` exclusively (no NgRx) — the CQRS
pattern with typed Events replaces NgRx Actions + Reducers + Effects with a simpler model.

### 3.5 Complete Angular Example

```ts
// atoms/cart.atom.ts — define atom, handlers, and applier together
import { defineAtom, createCommandHandler, createEventApplier,
         createQueryHandler, command, domainEvent } from '@vi/state-fp/kernel';
import { left, right } from '@vi/state-fp/core';
import { LocalAdapter } from '@vi/state-fp/storage';

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
      return left({ code: 'INVALID_QTY', message: 'Quantity must be ≥ 1' });
    return right([domainEvent('cart/itemAdded', { item: cmd.payload })]);
  },
});

const removeItemHandler = createCommandHandler<CartState, ReturnType<typeof RemoveItem>>({
  commandType: 'cart/removeItem',
  handle: (state, cmd) =>
    right([domainEvent('cart/itemRemoved', { sku: cmd.payload.sku })]),
});

const clearHandler = createCommandHandler<CartState, ReturnType<typeof ClearCart>>({
  commandType: 'cart/clear',
  handle: () => right([domainEvent('cart/cleared', {})]),
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

  readonly cart  = ngAdapter.toSignal(this.kernel, cartAtom);
  readonly total = ngAdapter.toQuerySignal(this.kernel, cartAtom, BuildTotal());
}
```

---

## 4. React MFE Integration

### 4.1 Setup — Providing the Kernel via React Context

```tsx
// state/kernel.ts — created once per React app
import { createKernel }                 from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';
import { createReactAdapter }           from '@vi/state-fp/adapter';
import {
  useState, useEffect, useRef, useMemo, useContext, createContext,
} from 'react';

const isProduction = process.env.NODE_ENV === 'production';

export const devtools = isProduction
  ? noopDevTools
  : createDevTools({ maxEventLogSize: 300 });

export const kernel = createKernel({ devtools });

// Create the adapter once — inject React hooks
export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext,
});
```

```tsx
// main.tsx — wrap the root
import { createRoot }    from 'react-dom/client';
import { reactAdapter }  from './state/kernel';

createRoot(document.getElementById('root')!).render(
  <reactAdapter.Provider kernel={kernel}>
    <App />
  </reactAdapter.Provider>
);
```

For a React remote in an MFE shell that needs to borrow atoms from the shell,
the setup is identical but the kernel is configured as a borrower:

```tsx
// apps/cart-remote/src/state/kernel.ts
const remoteKernel = createKernel({ devtools });

// Borrow auth from shell — no direct import from shell bundle
createSyncEngine({ channel: 'vi-state', kernel: remoteKernel })
  .borrow(authAtom)
  .start();

export { remoteKernel as kernel };
```

### 4.2 The Three Core Hooks

```tsx
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
    if (isLeft(result)) {
      toast.error(result.left.message);
    }
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

    foldEither(
      (err) => setError(err.message),
      (state) => router.push('/order-confirmation'),
    )(result);
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

For teams with an existing Redux Toolkit setup, `@vi/state-fp` can be introduced
as the **cross-MFE layer only** without replacing the Redux store:

```
React Remote
  ├── Redux store          — component-local state, forms, UI flags, RTK Query server cache
  └── @vi/state-fp kernel  — borrowed shared atoms from shell (auth, theme, cart totals)
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

For **greenfield React MFEs**, prefer using `@vi/state-fp` exclusively:
- Remove Redux Toolkit — the CQRS pattern covers the same use cases with better MFE isolation
- Use `@vi/state-fp` for all client state
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
import { createKernel }                 from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

const isProduction = !location.hostname.includes('localhost');

export const kernel = createKernel({
  devtools: isProduction ? noopDevTools : createDevTools(),
});
```

In Lit remotes, import the kernel directly (as a shared singleton via module federation
import map — `vi-state-kernel` is declared as a shared module in webpack/Vite config):

```ts
// apps/product-card-remote/src/elements/product-card.element.ts
import { createLitController } from '@vi/state-fp/adapter';
import { kernel }               from 'vi-state-kernel'; // shared singleton via import map
```

### 5.2 Reading State in Lit Templates

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createLitController } from '@vi/state-fp/adapter';
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
    if (isLeft(result)) {
      this.dispatchEvent(new CustomEvent('payment-error', { detail: result.left }));
    }
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
import { createLitController }    from '@vi/state-fp/adapter';
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

import { createKernel }    from '@vi/state-fp/kernel';
import { createSyncEngine} from '@vi/state-fp/sync';

export const kernel = createKernel({ devtools });

// Register shell atoms
kernel.register(authAtom, authCommandHandlers, authApplier);
kernel.register(themeAtom, themeCommandHandlers, themeApplier);

// Share with all remotes via BroadcastChannel
const sync = createSyncEngine({ channel: 'vi-state', kernel });
sync.share(authAtom,  { conflict: 'owner-wins' });
sync.share(themeAtom, { conflict: 'owner-wins' });
sync.start();

// Hydrate from storage on startup
await kernel.hydrate();
```

### 6.2 Remote Borrows Atoms

Every remote that needs shell atoms creates its **own kernel** (for isolation) and
borrows atoms from the shell's sync channel. The remote never creates its own version
of a shared atom — it only borrows the ownership.

```ts
// apps/cart-remote/src/state/kernel.ts

const remoteKernel = createKernel({ devtools });

// Register atoms OWNED by this remote
remoteKernel.register(cartAtom, cartCommandHandlers, cartApplier);

// Borrow atoms FROM the shell — read-only
const sync = createSyncEngine({ channel: 'vi-state', kernel: remoteKernel });
sync.borrow(authAtom);   // receives auth state updates from shell automatically
sync.borrow(themeAtom);

// Share this remote's owned atoms with the header remote that needs cart item count
sync.share(cartAtom, { conflict: 'owner-wins' });

sync.start();
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
snapshots), use the cross-MFE event bus (`@vi/state-fp/bus`):

```ts
// apps/notifications-remote/src/state/bus.ts
import { createSharedBus } from '@vi/state-fp/bus';

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

## 7. NgRx Bridge — Migrating an Angular MFE to @vi/state-fp

If your Angular MFE currently uses NgRx and you want to adopt `@vi/state-fp` for
cross-MFE state without rewriting everything at once, use the bridge pattern.

### Phase A: Introducing the kernel alongside NgRx

```ts
// app.config.ts — add the kernel without removing NgRx
providers: [
  provideStore(),
  provideEffects(),
  // New — @vi/state-fp kernel for cross-MFE state
  { provide: KERNEL_TOKEN, useValue: createKernel({ devtools }) },
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

### What NgRx does well that @vi/state-fp replaces directly

| NgRx concept | @vi/state-fp replacement |
|---|---|
| `Action` | `Command` |
| `Reducer` | `EventApplier` + `CommandHandler` |
| `Effect (async)` | `AsyncCommandHandler` |
| `Selector` | `QueryHandler` (+ memoisation option) |
| `createEffect` (side effects) | `KernelPlugin.afterExecute` |
| `@ngrx/signals SignalStore` | `ngAdapter.toSignal(kernel, atom)` |
| `Redux DevTools Extension` | `createReduxDevToolsBridge()` in devtools |

---

## 8. Redux Bridge — Migrating a React MFE to @vi/state-fp

For React MFEs with an existing Redux Toolkit store:

### Phase A: Side-by-side introduction

```tsx
// main.tsx — wrap with both providers
createRoot(document.getElementById('root')!).render(
  <Provider store={reduxStore}>          {/* existing Redux */}
    <reactAdapter.Provider kernel={kernel}> {/* new @vi/state-fp */}
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
5. Keep RTK Query for server-state — it is orthogonal to @vi/state-fp

### What Redux Toolkit does well that @vi/state-fp replaces

| RTK concept | @vi/state-fp replacement |
|---|---|
| `createSlice` | `defineAtom` + `createCommandHandler` + `createEventApplier` |
| `createAsyncThunk` | `AsyncCommandHandler` with `AbortSignal` |
| `createSelector` | `QueryHandler` with `memo: true` |
| `createEntityAdapter` | `defineAtom` + lensed `EventApplier` using `Lens<S, Record<id, Entity>>` |
| `Redux DevTools Extension` | `createReduxDevToolsBridge()` |
| `RTK Query` | Keep as-is — use it for server-state; use @vi/state-fp for client-state |

---

## 9. DevTools in Each Framework

### Angular — Dev-mode kernel setup

```ts
// environment.development.ts
import { createDevTools, attachBridge } from '@vi/state-fp/devtools';
import { createReduxDevToolsBridge }     from '@vi/state-fp/devtools';

export const devtools = createDevTools({ maxEventLogSize: 500 });

// Attach console bridge (accessible as window.__VI_STATE_FP__)
attachBridge(devtools);

// Optionally connect to Redux DevTools browser extension
if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
  devtools.addExtension(createReduxDevToolsBridge({ name: 'vi/state-fp (Angular)' }));
}
```

```ts
// environment.production.ts
import { noopDevTools } from '@vi/state-fp/devtools';

export const devtools = noopDevTools;
// window.__VI_STATE_FP__ is NEVER attached in production
```

### React — Dev-mode kernel setup

```ts
// state/kernel.ts
import { createDevTools, noopDevTools, attachBridge } from '@vi/state-fp/devtools';

const isDev = process.env.NODE_ENV !== 'production';
export const devtools = isDev ? createDevTools() : noopDevTools;

if (isDev && typeof window !== 'undefined') {
  attachBridge(devtools);
}
```

### Lit — Dev-mode kernel setup

```ts
// state/kernel.ts
import { createDevTools, noopDevTools, attachBridge } from '@vi/state-fp/devtools';

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
export const ngAdapter = createAngularAdapter({ signal, effect, DestroyRef, inject });
const kernel = createKernel({ devtools });

// In a component
readonly state = ngAdapter.toSignal(kernel, myAtom);
readonly derived = ngAdapter.toQuerySignal(kernel, myAtom, MyQuery());
readonly dispatch = ngAdapter.commandDispatcher(kernel, myAtom);
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
// Shell — owner
const sync = createSyncEngine({ channel: 'vi-state', kernel });
sync.share(myAtom, { conflict: 'owner-wins' });
sync.start();

// Remote — borrower
const sync = createSyncEngine({ channel: 'vi-state', kernel: remoteKernel });
sync.borrow(myAtom);
sync.start();
```
