# @vi/state-fp — Debugging Guide

> **Purpose:** Step-by-step recipes for diagnosing and fixing state problems.  
> **Audience:** Developers with working knowledge of `@vi/state-fp` who have hit a bug.  
> **See also:** [debug-model.md](./debug-model.md) for full DevTools API reference;
> [modules/devtools.md](./modules/devtools.md) for the module quick-reference.

---

## 0. Installation — Get DevTools

Before you can use any debugging recipes, DevTools must be installed and imported.

### Step 1: Install the devtools package

`@vi/state-fp/devtools` is a **separate module** from the core kernel. Install it via your package manager:

```bash
# Using pnpm (recommended for Nx workspaces)
pnpm add @vi/state-fp

# Using npm
npm install @vi/state-fp

# Using yarn
yarn add @vi/state-fp
```

> The package is already published to npm. If you're working in the Nx monorepo locally,
> use the local build. See [onboarding.md](./onboarding.md) for workspace setup.

### Step 2: Import in your app

DevTools must be created **once at app initialization**, before registering any atoms:

```ts
// 📍 FRAMEWORK: Framework-agnostic
// 📚 IMPORTS:
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

// Determine dev mode based on your framework/build setup
const isDevMode = !process.env.NODE_ENV?.includes('production');

// Create devtools instance (noopDevTools in production — zero-cost stand-in)
export const devtools = isDevMode
  ? createDevTools({
      maxLogSize:    500,      // keep last N events
      snapshotEvery: 50,       // auto-snapshot every N events
      installBridge: true,     // sets window.__VI_STATE_FP__
    })
  : noopDevTools;
```

### Step 3: Connect to kernel

Pass devtools to your kernel via the plugin system:

```ts
// 📍 FRAMEWORK: Framework-agnostic
// 📚 IMPORTS:
import { createKernel } from '@vi/state-fp/kernel';

const kernel = createKernel({ debug: isDevMode });

// Register devtools plugin BEFORE registering atoms
kernel.use(devtools.plugin);
```

### Step 4: Verify it's working

Open your browser's developer console and check:

```js
// Verify the devtools bridge is installed
window.__VI_STATE_FP__

// Should print:
// {
//   getLog: [Function],
//   getAtoms: [Function],
//   timeTravelTo: [Function],
//   exportLog: [Function],
//   importLog: [Function],
//   version: '0.1.0'
// }

// If undefined: devtools were not installed — go back to Step 3
```

### Framework-Specific Notes

**Angular:**
```ts
// Use isDevMode from @angular/core
import { isDevMode } from '@angular/core';
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

export const devtools = isDevMode() ? createDevTools({ maxLogSize: 500 }) : noopDevTools;
kernel.use(devtools.plugin);
```

**React / Vanilla JS:**
```ts
// Use process.env.NODE_ENV
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

const isDevMode = process.env.NODE_ENV === 'development';
export const devtools = isDevMode ? createDevTools({ maxLogSize: 500 }) : noopDevTools;
kernel.use(devtools.plugin);
```

---

## Table of Contents

1. [Setup — Activate DevTools](#1-setup--activate-devtools)
2. [Browser Console Quick Reference](#2-browser-console-quick-reference)
3. [Debugging Recipes](#3-debugging-recipes)
   - [3.1 Component Not Updating](#31-component-not-updating)
   - [3.2 State Is Wrong — What Command Caused It?](#32-state-is-wrong--what-command-caused-it)
   - [3.3 Command Returns an Error](#33-command-returns-an-error)
   - [3.4 Remote MFE Has Stale State](#34-remote-mfe-has-stale-state)
   - [3.5 Sync Not Working Between Tabs](#35-sync-not-working-between-tabs)
   - [3.6 Time-Travel Produces Wrong State](#36-time-travel-produces-wrong-state)
   - [3.7 Memory Leak — Subscriptions Not Cleaned Up](#37-memory-leak--subscriptions-not-cleaned-up)
   - [3.8 Storage Not Persisting Across Page Reloads](#38-storage-not-persisting-across-page-reloads)
4. [Time-Travel Walkthrough](#4-time-travel-walkthrough)
5. [Sharing a Bug Report with a Colleague](#5-sharing-a-bug-report-with-a-colleague)
6. [Debugging in Tests](#6-debugging-in-tests)
7. [Performance Debugging](#7-performance-debugging)
8. [Quick Diagnostic Checklist](#8-quick-diagnostic-checklist)

---

## 1. Setup — Activate DevTools

DevTools must be activated before you can use any of the recipes in this guide. Activation
is a two-step process: create the devtools instance, then register it with the kernel.

**Framework:** This example shows Angular setup. For React/Lit/Vanilla, adapt the dev mode check.

```ts
// 📍 FRAMEWORK: Angular 14+
// 📚 IMPORTS:
import { createKernel }                  from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools }  from '@vi/state-fp/devtools';
import { isDevMode }                     from '@angular/core';

// Step 1: Create devtools (noopDevTools is zero-cost in production)
const devtools = isDevMode()
  ? createDevTools({
      maxLogSize:    500,   // rolling circular buffer — how many events to keep
      snapshotEvery: 50,    // auto-snapshot every 50 events (for fast time-travel)
      installBridge: true,  // sets window.__VI_STATE_FP__ (the browser console API)
    })
  : noopDevTools;

// Step 2: Create kernel with debug mode
const kernel = createKernel({ debug: isDevMode() });

// Step 3: Connect devtools to kernel (always safe — noopDevTools plugin is a no-op)
kernel.use(devtools.plugin);
```

**Verify it's working — open your browser console and type:**
```js
window.__VI_STATE_FP__
// Should print: { getLog, getAtoms, timeTravelTo, exportLog, importLog, version }
// If undefined: devtools were not installed — check the setup above
```

**For React/Vanilla JS:**
```ts
// React/Vanilla: use process.env.NODE_ENV
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

const isDev = process.env.NODE_ENV === 'development';
const devtools = isDev ? createDevTools({ maxLogSize: 500 }) : noopDevTools;
const kernel = createKernel({ debug: isDev });
kernel.use(devtools.plugin);
```

---

## 2. Browser Console Quick Reference

Once devtools are activated, use these commands from the browser console at any time.

### Inspect current state

```js
// All atoms and their current state
window.__VI_STATE_FP__.getAtoms()

// Single atom state (by key)
window.__VI_STATE_FP__.getAtoms()['vi/cart']

// Check if an atom is registered
'vi/cart' in window.__VI_STATE_FP__.getAtoms()
```

### Inspect the event log

```js
// All recorded events (oldest first)
window.__VI_STATE_FP__.getLog()

// Last 10 events
window.__VI_STATE_FP__.getLog().slice(-10)

// Events for a specific atom
window.__VI_STATE_FP__.getLog().filter(e => e.atomKey === 'vi/cart')

// Events with a specific command type
window.__VI_STATE_FP__.getLog().filter(e => e.commandType === 'cart/addItem')

// Show what state looked like BEFORE and AFTER the most recent event
const last = window.__VI_STATE_FP__.getLog().slice(-1)[0];
console.log('before:', last.stateBefore);
console.log('after:', last.stateAfter);
```

### Trace a causal chain

```js
// Find all events that are part of the same user action (same correlationId)
const log = window.__VI_STATE_FP__.getLog();
const correlationId = log.slice(-1)[0].correlationId;  // pick one
log.filter(e => e.correlationId === correlationId)
```

### Time-travel

```js
// Jump to a past event (atom states will reflect that point in time)
const target = window.__VI_STATE_FP__.getLog().slice(-5)[0];   // go back 5 events
await window.__VI_STATE_FP__.timeTravelTo(target.id);

// Current state is now historical — components will re-render to show old state
window.__VI_STATE_FP__.getAtoms()   // verify you're in the right state

// Exit time-travel (restores live state)
// NOTE: bridge does not expose exit() — use devtools instance directly:
devtools.timeTravel.exit();
// Or reload the page to restore live state
```

### Export / Import for collaboration

```js
// Copy full event log to clipboard (paste to share with a teammate)
copy(window.__VI_STATE_FP__.exportLog());

// Import a colleague's log (paste their JSON)
window.__VI_STATE_FP__.importLog(/* paste JSON string here */);
// Now time-travel against their event history for bug reproduction
```

---

## 3. Debugging Recipes

---

### 3.1 Component Not Updating

**Symptom:** State changed (confirmed via `getAtoms()` in console), but the component still
shows old data.

**Diagnosis steps:**

**Step 1: Confirm the atom state actually changed:**
```js
window.__VI_STATE_FP__.getAtoms()['vi/cart']
// If this shows the expected value → the bug is in the component layer
// If this shows the old value → the bug is in the command/applier
```

**Step 2 (component bug): Check the subscription is registered:**
```ts
// 📍 FRAMEWORK: Angular
// 📚 SETUP: kernel injected via KERNEL_TOKEN, cartAtom imported from @/atoms
import { Component, inject, OnInit } from '@angular/core';
import { KERNEL_TOKEN } from '@/state-tokens';
import { cartAtom } from '@/atoms';

@Component({ ... })
export class YourComponent implements OnInit {
  private kernel = inject(KERNEL_TOKEN);
  
  ngOnInit() {
    this.kernel.subscribe(cartAtom, (state) => 
      console.log('[DEBUG] cartAtom update:', state)
    );
  }
}
// If this fires but the template doesn't update → Change Detection issue
```

**Step 3 (Angular ChangeDetection issue):**
```ts
// Check if your component uses ChangeDetectionStrategy.OnPush
// If yes, verify the signal is created with ngAdapter.toSignal() — NOT atom.get() directly

// ❌ This won't update in OnPush:
get cartItems() { return this.cartAtom.get().items; }

// ✅ This will update:
readonly cart = ngAdapter.toSignal(cartAtom, this.kernel);
// Template uses: cart().items
```

**Step 4 (React stale closure):**
```tsx
// ❌ Stale closure — state is captured in a closure that doesn't update
const handleClick = () => {
  console.log(cartState.items);  // This is the value from when the closure was created
};

// ✅ Always read from the current state via the hook
const [cart] = reactAdapter.useAtom(cartAtom);
const handleClick = () => {
  console.log(cart.items);   // cart is always from the latest render
};
```

**Step 5 (Missing subscription cleanup / double component mount):**
```ts
// In dev mode with React Strict Mode, effects run twice — check useEffect cleanup:
useEffect(() => {
  const off = kernel.subscribe(atom, setState);
  return off;   // ← THIS MUST EXIST
}, [atom, kernel]);
```

---

### 3.2 State Is Wrong — What Command Caused It?

**Symptom:** An atom's state contains unexpected data. You don't know what caused it.

**Step 1: Find when the state diverged:**
```js
const log = window.__VI_STATE_FP__.getLog().filter(e => e.atomKey === 'vi/cart');

// Find the first entry where stateAfter doesn't match expectations
const wrongEntry = log.find(e => e.stateAfter.items.length > 10);   // Example: unexpectedly many items
console.log('Wrong command was:', wrongEntry.commandType);
console.log('State before:', wrongEntry.stateBefore);
console.log('State after:', wrongEntry.stateAfter);
console.log('Event that caused it:', wrongEntry.event);
```

**Step 2: See all commands in the same user action:**
```js
const wrongEntry = /* from step 1 */;
const chain = window.__VI_STATE_FP__.getLog()
  .filter(e => e.correlationId === wrongEntry.correlationId);
// All events that are part of the same logical operation
```

**Step 3: Time-travel to reproduce:**
```js
// Go back to just before the problem
const prevEntry = log[log.indexOf(wrongEntry) - 1];
await window.__VI_STATE_FP__.timeTravelTo(prevEntry.id);

// Now state should be correct — identify what user action triggers the wrong command
// Then step forward carefully:
devtools.timeTravel.stepForward();   // applies next eventlog entry
window.__VI_STATE_FP__.getAtoms()['vi/cart'];   // check state after each step
```

**Step 4: Fix the applier or handler:**
```ts
// If the wrong event was produced → fix the CommandHandler
handle: (state, cmd) => {
  // Add more validation here to prevent the wrong event
}

// If the event was correct but state is wrong → fix the EventApplier
'cart/itemAdded': (state, e) => {
  // Inspect what's wrong with the state transformation
}
```

---

### 3.3 Command Returns an Error

**Symptom:** `kernel.execute()` returns `err(...)` but you don't know why.

**Step 1: Log the error explicitly:**
```ts
// 📍 IMPORTS:
import { match }    from '@vi/state-fp/core';
import { AddItem }  from '@/commands';  // your app's command

const result = kernel.execute(cartAtom, AddItem({ sku, qty }));

match(result, {
  ok:  (state) => console.log('success:', state),
  err: (error) => console.error(`Command failed. Code: ${error.code}. Message: ${error.message}`),
});
```

**Step 2: Check the command type matches the handler:**
```ts
// 📍 IMPORTS:
import { createCommandHandler } from '@vi/state-fp/kernel';
import { command }               from '@vi/state-fp/kernel';

// The handler's commandType must EXACTLY match the command's type
const handler = createCommandHandler({
  commandType: 'cart/addItem',    // ← must match exactly
  handle: (state, cmd) => { /* ... */ }
});

const cmd = command('cart/addItem', payload);    // ← must match exactly
// Typos ('cart/add-item', 'Cart/AddItem') silently produce NO_HANDLER errors
```

**Step 3: Check the atom is registered:**
```ts
// If you get err({ code: 'NO_HANDLER', ... }) — registration was missed
kernel.register(cartAtom, addItemHandler, cartApplier);   // ← must be called before execute()
```

**Step 4: Debug inside the handler:**
```ts
// 📍 IMPORTS:
import { createCommandHandler } from '@vi/state-fp/kernel';
import { ok, err }              from '@vi/state-fp/core';
import { domainEvent }          from '@vi/state-fp/kernel';

const addItemHandler = createCommandHandler({
  commandType: 'cart/addItem',
  handle: (state, cmd) => {
    console.log('[DEBUG addItemHandler] state:', state, 'cmd:', cmd);  // ← add temporarily

    if (cmd.payload.qty < 1) {
      console.log('[DEBUG] REJECTING: qty < 1');
      return err({ code: 'INVALID_QTY', message: 'Quantity must be ≥ 1' });
    }
    return ok([domainEvent('cart/itemAdded', { item: cmd.payload })]);
  },
});
```

**Step 5: Check if the handler is for the correct atom:**
```ts
// kernel.register(ATOM, HANDLER, APPLIER)
// If you registered the handler against the wrong atom, execute() on the right atom
// will return NO_HANDLER

// ❌ Handler registered against wrong atom
kernel.register(authAtom, addItemHandler, cartApplier);  // wrong!

// ✅ Correct
kernel.register(cartAtom, addItemHandler, cartApplier);
```

---

### 3.4 Remote MFE Has Stale State

**Symptom:** The shell has updated an atom, but the remote still shows old data.

**Step 1: Verify the sync channel names match:**
```ts
// Shell — must declare the atom as owner
const shellSync = createSyncEngine({ kernel: shellKernel });
shellSync.share(authAtom, { channel: 'vi-auth', conflict: 'owner-wins' });
//                                    ^^^^^^^^

// Remote — must use the IDENTICAL channel name
const remoteSync = createSyncEngine({ kernel: remoteKernel });
remoteSync.share(authAtom, { channel: 'vi-auth', conflict: 'owner-wins' });
//                                    ^^^^^^^^ — must match
```

**Step 2: Verify the atom keys match:**
```ts
// Shell
const authAtom = defineAtom({ key: 'vi/auth', initialState: { token: null } });
//                                  ^^^^^^^^

// Remote — must use the IDENTICAL key
const authAtom = defineAtom({ key: 'vi/auth', initialState: { token: null } });
//                                  ^^^^^^^^ — must match
```

**Step 3: Check BroadcastChannel availability:**
```js
// In the browser console of the REMOTE MFE
new BroadcastChannel('test');   // If this throws, BroadcastChannel is blocked (CSP?)
```

**Step 4: Listen to raw BroadcastChannel messages:**
```js
// Debug: listen for sync messages on the channel directly
const bc = new BroadcastChannel('vi-auth');
bc.addEventListener('message', (e) => console.log('sync msg:', e.data));

// Now trigger a state change in the shell tab — you should see the message here
// If no message arrives → shell's sync engine is not running
// If message arrives but state doesn't update → remote's sync engine has an issue
```

**Step 5: Verify `sync.share()` was called before shell broadcasts:**
```ts
// If the remote loads AFTER the shell has already broadcast initial state,
// the remote may miss the first sync message.
// Use the waitForAuth() pattern from mfe-framework-guide.md §12.3:

await waitForAtom(authAtom, remoteKernel, (s) => s.token !== null);
```

**Step 6: Check conflict resolution:**
```ts
// If the remote has also called kernel.execute() on a borrowed atom,
// the 'owner-wins' strategy will revert its state.
// Remotes MUST NOT call execute() on borrowed atoms.
```

---

### 3.5 Sync Not Working Between Tabs

**Symptom:** Opening two tabs of the same app — state changes in tab A don't appear in tab B.

**Step 1: Confirm both tabs are on the same origin:**
```
http://localhost:4200  ↔  http://localhost:4200  ← same origin ✅
http://localhost:4200  ↔  http://localhost:4201  ← different port, DIFFERENT origin ❌
https://app.example.com  ↔  https://api.example.com  ← different subdomain ❌
```
BroadcastChannel only works within the same origin.

**Step 2: Ensure both tabs call `sync.share()` for the same atom:**
```js
// Tab A console: view atoms in sync
window.__VI_STATE_FP__.getAtoms()   // check atom is registered

// Tab B console: trigger a state change manually
// (Use kernel.execute from the app, then watch tab A)
```

**Step 3: Check for CSP blocking:**
```
# In browser's Network panel → Console errors for BroadcastChannel?
# Some enterprise CSPs block APIs that use message channels.
```

**Step 4: Test BroadcastChannel directly:**
```js
// Tab A — listen
const bc = new BroadcastChannel('vi-auth');
bc.onmessage = (e) => console.log('received:', e.data);

// Tab B — send
const bc2 = new BroadcastChannel('vi-auth');
bc2.postMessage({ test: 'hello' });

// Tab A should see: received: { test: 'hello' }
// If not → browser/CSP issue
```

---

### 3.6 Time-Travel Produces Wrong State

**Symptom:** After `timeTravelTo(id)`, the atom states don't match what you expected.

**Likely causes:**

**Cause A: Async effects ran during the command that created the event**
- Time-travel replays state transitions, NOT async side effects
- If your handler wrote to an external API and the response mutated other state,
  that external state change is NOT replayed

**Cause B: The target event is older than the event log window**
```js
// Check if the entry is still in the log
const log = window.__VI_STATE_FP__.getLog();
const target = log.find(e => e.id === targetId);

if (!target) {
  console.error('Event has been evicted from the circular buffer!');
  // Increase maxLogSize: createDevTools({ maxLogSize: 2000 })
}
```

**Cause C: Computed atoms are not reflected**
```js
// After time-travel, source atoms are correctly set.
// Computed atoms may not reflect historical values if their derivation logic
// depends on external state outside the kernel.
// Check: getAtoms() shows source atoms; computed atoms are derived from them.
```

**Cause D: Called `kernel.execute()` while in replay mode**
```js
// Check if still in replay mode
devtools.timeTravel.replayMode   // should be true during replay
// If you called execute() while replayMode was true, live state was mixed with replayed state
// Solution: always exit() before allowing new commands
```

---

### 3.7 Memory Leak — Subscriptions Not Cleaned Up

**Symptom:** Memory increases over time; old callbacks are called after components unmount;
performance degrades.

**Diagnosis:**
```ts
// Add a counter to detect how many subscriptions are active
let activeSubscriptions = 0;

kernel.subscribe(cartAtom, (state) => {
  activeSubscriptions++;
  console.log('subscription fired:', activeSubscriptions, 'times for this session');
  // If this number keeps growing after route changes → leak
});
```

**Angular fix:**
```ts
// ✅ ngAdapter.toSignal() auto-cleans up via DestroyRef — no manual cleanup needed
readonly cart = ngAdapter.toSignal(cartAtom, this.kernel);

// ❌ Manual subscription without cleanup — LEAK
ngOnInit() {
  kernel.subscribe(cartAtom, (state) => this.cart = state);
}

// ✅ Manual subscription WITH cleanup
private unsub?: () => void;

ngOnInit() {
  this.unsub = this.kernel.subscribe(cartAtom, (state) => this.cart = state);
}

ngOnDestroy() {
  this.unsub?.();
}
```

**React fix:**
```tsx
// ✅ reactAdapter.useAtom() handles cleanup automatically
const [cart] = reactAdapter.useAtom(cartAtom);

// ❌ Manual subscription without cleanup — LEAK
useEffect(() => {
  kernel.subscribe(cartAtom, setState);   // no cleanup!
}, []);

// ✅ Manual subscription WITH cleanup
useEffect(() => {
  const off = kernel.subscribe(cartAtom, setState);
  return off;   // ← cleanup function returned from useEffect
}, [atom, kernel]);
```

**Lit fix:**
```ts
// ✅ createLitController() cleans up in hostDisconnected — no manual cleanup needed
private cart = createLitController(this, kernel, cartAtom);

// ❌ Manual in connectedCallback — LEAK without disconnectedCallback cleanup
connectedCallback() {
  super.connectedCallback();
  kernel.subscribe(cartAtom, (s) => { this.cartState = s; this.requestUpdate(); });
}
```

---

### 3.8 Storage Not Persisting Across Page Reloads

**Symptom:** Atom state is correct during a session but resets to `initialState` on reload.

**Step 1: Confirm `storage` is declared on the atom:**
```ts
// ❌ No storage — state is lost on reload (in-memory only)
const cartAtom = defineAtom({ key: 'vi/cart', initialState: { items: [] } });

// ✅ Storage declared
const cartAtom = defineAtom({
  key: 'vi/cart',
  initialState: { items: [] },
  storage: {
    adapter: new MemoryAdapter(),   // or your custom adapter
    key:     'vi:cart',
    ttl:     24 * 60 * 60 * 1000,  // 24 hours
  },
});
```

**Step 2: Confirm `kernel.hydrate()` is called on startup:**
```ts
// ❌ hydrate() never called — storage exists but state is never loaded
const kernel = createKernel();
kernel.register(cartAtom, handlers, applier);
// Missing: await kernel.hydrate();

// ✅ Correct
const kernel = createKernel();
kernel.register(cartAtom, handlers, applier);
await kernel.hydrate();   // ← reads storage and populates atoms
```

**Step 3: Check storage policy:**
```ts
// If security policy is 'memory-only', the atom will NOT be written to storage
// (memory-only is intentional for sensitive data — auth tokens, etc.)
storage: {
  adapter:  new MemoryAdapter(),
  security: 'memory-only',   // ← this means: DO NOT persist; in-memory only
}
```

**Step 4: Check TTL:**
```ts
// If the TTL has expired, the entry is treated as not-found on hydration
// The atom falls back to initialState
storage: {
  ttl: 5 * 60 * 1000,   // 5 minutes — did this expire before reload?
}
```

**Step 5: Check adapter write errors:**
```ts
// Instrument the adapter to surface write failures
class InstrumentedAdapter extends MemoryAdapter {
  async set<T>(key: string, value: T, ttl?: number) {
    const result = await super.set(key, value, ttl);
    if (isErr(result)) {
      console.error('[storage error]', result.left);
    }
    return result;
  }
}
```

---

## 4. Time-Travel Walkthrough

Time-travel lets you rewind atom state to any historical point to reproduce bugs.

### Setup

```ts
// DevTools must be active — see Section 1
const devtools = createDevTools({ maxLogSize: 500, snapshotEvery: 50 });
kernel.use(devtools.plugin);
```

### Walkthrough: Reproducing a Bug with Time-Travel

**Scenario:** User reports: "After adding 3 items to the cart and removing one, the
total shows the wrong value."

```js
// Step 1: Reproduce the steps to trigger the bug in the browser
// (add 3 items, remove 1)

// Step 2: Inspect the event log for cart events
const cartLog = window.__VI_STATE_FP__.getLog().filter(e => e.atomKey === 'vi/cart');
console.table(cartLog.map(e => ({
  n:            cartLog.indexOf(e),
  cmd:          e.commandType,
  itemsBefore:  e.stateBefore.items?.length,
  itemsAfter:   e.stateAfter.items?.length,
  total:        e.stateAfter.items?.reduce((s, i) => s + i.price * i.qty, 0),
})));

// Step 3: Find the event where the total diverges
// Example output shows total == 299 but expected 199 after event #3 (itemRemoved)

// Step 4: Time-travel to the event immediately before the bug
const bugEntry = cartLog[3];  // event that produced wrong state
const prevEntry = cartLog[2];  // event immediately before

await window.__VI_STATE_FP__.timeTravelTo(prevEntry.id);
// Components update to show state at that point — verify total looks right

// Step 5: Step forward one event
devtools.timeTravel.stepForward();
// Components show the wrong state — bug reproduced!

// Step 6: Inspect what happened
console.log('Event:', bugEntry.event);
console.log('State after:', bugEntry.stateAfter);
// Now examine the applier for 'cart/itemRemoved' and find the bug

// Step 7: Exit time-travel when done
devtools.timeTravel.exit();
// Live state restored
```

### Programmatic Time-Travel in Tests

```ts
it('total is correct after removing an item', async () => {
  kernel.execute(cartAtom, AddItem({ sku: 'X1', qty: 1, price: 100 }));
  kernel.execute(cartAtom, AddItem({ sku: 'X2', qty: 1, price: 200 }));
  kernel.execute(cartAtom, RemoveItem('X1'));

  const log = devtools.eventLog.getByAtom('vi/cart');

  // Time-travel to after the first item was added
  const afterFirstAdd = log[0].id;
  const result = await devtools.timeTravel.to(afterFirstAdd);
  expect(isOk(result)).toBe(true);

  // Verify state at that point
  expect(cartAtom.get().items).toHaveLength(1);
  expect(cartAtom.get().items[0].sku).toBe('X1');

  // Restore live state
  devtools.timeTravel.exit();
  expect(cartAtom.get().items).toHaveLength(1);  // X2 remains
});
```

---

## 5. Sharing a Bug Report with a Colleague

When a bug is reproducible in a browser session, export the event log so a colleague can
explore it from their machine without having to reproduce the steps manually.

```js
// 1. In the browser console (your machine, bug visible)
const exportedLog = window.__VI_STATE_FP__.exportLog();
copy(exportedLog);   // copies to clipboard
// Send the JSON to your colleague (Slack, Jira comment, email)
```

```js
// 2. In the browser console (colleague's machine)
window.__VI_STATE_FP__.importLog(/* paste the JSON string */);
// The full event history is now loaded

// 3. Time-travel to the problematic event
const log = window.__VI_STATE_FP__.getLog();
const badEvent = log.find(e => e.atomKey === 'vi/cart' && e.stateAfter.items.length > 10);
await window.__VI_STATE_FP__.timeTravelTo(badEvent.id);

// Atom states now reflect exactly what the original reporter saw
```

---

## 6. Debugging in Tests

In Vitest tests, add debug output by attaching a devtools instance before each test.

```ts
// 📍 TEST FRAMEWORK: Vitest
// 📚 IMPORTS:
import { beforeEach, afterEach, it, describe, expect } from 'vitest';
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';
import { isOk }           from '@vi/state-fp/core';
import { cartAtom }       from '@/atoms';  // import your atom
import { addItemHandler, cartApplier } from '@/configs';  // import your handlers

let kernel: ReturnType<typeof createKernel>;
let devtools: ReturnType<typeof createDevTools>;

beforeEach(() => {
  devtools = createDevTools({ installBridge: false, maxLogSize: 100 });
  kernel   = createKernel({ debug: true });
  kernel.use(devtools.plugin);
  kernel.register(cartAtom, addItemHandler, cartApplier);
});

afterEach(() => {
  // If a test fails, dump the event log to help diagnose
  const { assertionCalls } = expect.getState();
  if (assertionCalls === 0) {
    console.log('Event log on failure:', devtools.eventLog.getAll());
  }
});
```

### Printing state transitions on failure

```ts
// Vitest custom matcher for clear state transition output
expect.extend({
  toHaveState(atom, expected) {
    const actual = atom.get();
    const pass   = JSON.stringify(actual) === JSON.stringify(expected);
    return {
      pass,
      message: () =>
        pass
          ? `Atom '${atom.key}' has expected state`
          : `Atom '${atom.key}' state mismatch\n` +
            `  Expected: ${JSON.stringify(expected, null, 2)}\n` +
            `  Actual:   ${JSON.stringify(actual, null, 2)}\n` +
            `  Last 3 events:\n${
              devtools.eventLog.getByAtom(atom.key).slice(-3)
                .map(e => `    [${e.commandType}] ${JSON.stringify(e.stateAfter)}`)
                .join('\n')
            }`,
    };
  },
});
```

---

## 7. Performance Debugging

### Identify slow command handlers

```ts
// 📍 IMPORTS:
import type { KernelPlugin } from '@vi/state-fp/kernel';

// KernelPlugin that logs commands taking > 10ms
const performancePlugin: KernelPlugin = {
  name: '@app/perf-monitor',
  onExecute({ command, atomKey, durationMs }) {
    if (durationMs > 10) {
      console.warn(`Slow command [${atomKey}/${command.type}]: ${durationMs.toFixed(1)}ms`);
    }
  },
};

kernel.use(performancePlugin);
```

### Identify excessive re-renders (React)

```tsx
// 📍 FRAMEWORK: React
// 📚 SETUP: reactAdapter created in app context (see mfe-framework-guide.md §4.1)

// Wrap a component with render counting
let renderCount = 0;

function CartSummary() {
  renderCount++;
  console.log('CartSummary rendered', renderCount, 'times');
  const [cart] = reactAdapter.useAtom(cartAtom);  // see §4.1 for setup
  return <span>{cart.items.length} items</span>;
}
// If renderCount grows on unrelated state changes → atom is too coarse-grained
// Fix: split into finer-grained atoms or use useQuery for derived values
```

### Check atom subscriber count

```js
// Excessive subscribers can indicate missing cleanup
// Inspect via devtools — custom plugin example:
const subscriberCountPlugin: KernelPlugin = {
  name: '@app/sub-count',
  onRegister(atom) {
    const orig = atom.subscribe.bind(atom);
    let count = 0;
    atom.subscribe = (listener) => {
      count++;
      const off = orig(listener);
      return () => { count--; off(); };
    };
    // Every subscribe/unsubscribe logs the count
    setInterval(() => console.log(`${atom.key} subscribers: ${count}`), 5000);
  },
};
```

### RAF-batched high-frequency updates

```ts
// 📍 IMPORTS:
import { createEphemeralStream } from '@vi/state-fp/core';

const mousePos = createEphemeralStream<{x: number; y: number}>();

// ❌ Do NOT put high-frequency values in atoms
window.addEventListener('mousemove', (e) => {
  kernel.execute(uiAtom, UpdateMousePos({ x: e.clientX, y: e.clientY })); // 100+ commands/sec!
});

// ✅ Use EphemeralStream with RAF batching
window.addEventListener('mousemove', (e) => {
  mousePos.emit({ x: e.clientX, y: e.clientY });  // no kernel, no events, no log
});

mousePos.subscribeAnimated((pos) => {
  // fired at most once per frame with the last position
  updateCanvasCursor(pos);
});

// In React (from adapter):
const pos = reactAdapter.useEphemeral(mousePos);  // animated by default
```

---

## 8. Quick Diagnostic Checklist

Use this checklist when you first encounter a state problem.

```
□ Are devtools active? → window.__VI_STATE_FP__ in console
□ What does getAtoms() show? → is the atom value correct?
□ What does getLog() show for that atom? → which command last changed it?
□ Did execute() return ok or err? → log the result with match()
□ Is the atom registered? → kernel.register() called before execute()?
□ Is the handler's commandType string exactly right? → check for typos
□ Is the subscription cleaned up? → look for missing off() / return off in useEffect
□ Is the atom key the same in shell and remote? → defineAtom({ key }) must match
□ Is the sync channel name the same in shell and remote? → sync.share({ channel }) must match
□ Is BroadcastChannel available? → new BroadcastChannel('test') in console
□ Was kernel.hydrate() called on startup? → needed to restore persisted state
□ Is the atom being mutated directly? → appliers must return NEW objects, never mutate state
□ Is the correct atom being passed to register/execute/subscribe? → check variable names
```
