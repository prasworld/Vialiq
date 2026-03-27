# ADR-001: UI Component Library Strategy

**Date:** March 2026  
**Status:** Decided — Two-Layer Architecture (Lit shell chrome + Angular domain UI)  
**Context:** Angular 21 + Nx Module Federation MFE stack  
**Constraint update:** Multi-framework (React/Vue) MFEs are planned for the future

---

## The Two Decisions

### Decision 1: Build an entire component library?
### Decision 2: Angular components vs Web Components (Lit)?

---

## Section 1: Web Components vs Angular — Honest Reality

### Why Web Components Were Recommended Yesterday

Web Components (Lit) make sense when:

- You have **multiple frameworks** consuming the same components (React team + Vue team + Angular team)
- You're publishing a public npm package used by **external orgs**
- You're building **embeddable widgets** (e.g., a chat widget for any website)

**None of these apply to your stack.** Your entire consuming surface is Angular.

---

### The Real Pain of Web Components in an Angular-only stack

These are not theoretical. They are blockers you WILL hit:

```
PAIN 1: Template type checking is disabled
────────────────────────────────────────
// To use any Web Component in Angular, you must add:
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // ← disables ALL type checking
})

// This means:
<vi-button varinat="primary">   // typo — no TS error
<vi-button (click)="wrong()">   // wrong event — no TS error
// You lose one of Angular's biggest advantages.
```

```
PAIN 2: Angular Forms integration is broken
───────────────────────────────────────────
// Web Components DO NOT implement ControlValueAccessor
// So this just doesn't work:
<vi-input [(ngModel)]="email" formControlName="email">

// You'd need to wrap EVERY form component yourself
// That's the same effort as writing the component from scratch.
```

```
PAIN 3: Event naming conventions clash
───────────────────────────────────────
// Web Component emits:
new CustomEvent('vi-click', { composed: true, bubbles: true });

// Angular expects:
(viClick)="handler()"   // Angular kebab-to-camel converts differently
// You'd need bridge adapters or Angular wrappers — again = rewriting.
```

```
PAIN 4: Two-way binding breaks
───────────────────────────────
// Angular signals + two-way binding:
<vi-select [(value)]="selectedItem">

// Not supported natively in Web Components.
// Angular's @two-way binding is property + event convention.
// Web Components have no such convention.
```

```
PAIN 5: Change detection doesn't know about Web Component internals
───────────────────────────────────────────────────────────────────
// With OnPush change detection (recommended for performance),
// changes inside a Web Component's Shadow DOM never trigger Angular's CD.
// Angular literally can't see inside the Shadow DOM.
```

```
PAIN 6: Angular DevTools can't inspect Web Components
──────────────────────────────────────────────────────
// Want to debug state, inputs, outputs?
// Web Components are opaque to Angular DevTools.
// You'll debug blind.
```

```
PAIN 7: Shadow DOM breaks global theming
─────────────────────────────────────────
// All the Flux-UI token work (:root CSS vars) is in the Light DOM.
// Shadow DOM creates a separate DOM context.
// CSS vars CAN penetrate Shadow DOM (this is fine),
// but :ng-deep, ViewEncapsulation.None, global styles — all break.
```

```
PAIN 8: SSR / Angular Universal
────────────────────────────────
// Shadow DOM is not supported in Node.js.
// SSR + Web Components = polyfills + complex workarounds.
// If you ever add server rendering, this becomes a major blocker.
```

```
PAIN 9: Testing doubles the work
──────────────────────────────────
// Angular has TestBed — the gold standard for Angular component testing.
// Web Components need @open-wc/testing — a completely separate ecosystem.
// Your team needs to learn two testing frameworks.
// Angular devs will resent this.
```

### The Verdict on Web Components for Your Stack

> **Building WITH Lit/WC as your primary authoring format is still wrong.** The Angular-in-Angular pain described above is real and daily.
>
> **But the multi-framework future means you must not close the door on WC entirely.**
>
> The correct resolution is **Angular Elements** — Angular's own built-in bridge that
> compiles Angular components *to* Web Custom Elements on demand. You write Angular.
> React/Vue teams consume Web Components. Same source. No compromise.

**Strategy: Build Angular components now. Use Angular Elements as the cross-framework bridge when the time comes.**

---

## Section 1b: Angular Elements — The Multi-Framework Bridge

`@angular/elements` is Angular's official package that wraps any Angular component as a
standard DOM Custom Element (Web Component). It exists precisely for this scenario:

```
  You write Angular component         React/Vue team consumes it
  ───────────────────────────         ─────────────────────────
  @Component({ selector: 'vi-btn' })  // JSX:
  export class ButtonComponent { }    <vi-btn variant="primary">Label</vi-btn>

             Angular Elements
             compileToCustomElement()
                    │
               Custom Element
               registered in
               browser registry
```

### What Angular Elements Gives You

| Concern | Angular side | React/Vue side |
|---------|-------------|----------------|
| **Authoring** | Full Angular DX (signals, CD, forms) | Just a plain HTML element |
| **Type checking** | Full template type checking | TypeScript types via `.d.ts` |
| **Styling** | Flux-UI tokens, no Shadow DOM needed | Inherits all CSS vars |
| **Forms** | `ControlValueAccessor` works natively | `onChange`/`onInput` events |
| **Testing** | TestBed works normally | Any DOM testing framework |
| **Bundle** | Angular runtime shared via Module Fed | No extra cost |

### What Angular Elements Does NOT Fix

```
NOT FIXED: If React/Vue MFEs do NOT share Angular runtime via Module Federation,
           they pull in the full Angular core (~60 KB gzipped).

FIX:       Shared Angular deps in module-federation.config.ts.
           If a React remote shares angular/core, this is zero extra cost.
           If React team does NOT use Angular at all → they pay the cost once.
           For purely independent remotes that are not Angular, Angular Elements
           is expensive. Use the token-only path instead (Section 1c below).

NOT FIXED: Shadow DOM quirks (but you can use ViewEncapsulation.None — no Shadow DOM).
```

### When Angular Elements is the right choice

```
Use Angular Elements when:
  ├─ A React/Vue team joins and needs to use your Angular components
  ├─ You want one source of truth (Angular component = WC exposed to others)
  ├─ Module Federation already shares Angular runtime between remotes
  └─ The consuming remote is also Angular-based or hybrid

Do NOT use Angular Elements when:
  ├─ A React team is entirely independent (no shared Angular runtime)
  ├─ They need deep form integration in their React form system
  └─ The other framework team prefers native components (React/Vue components
     wrapping shared CSS tokens is simpler — see Section 1c)
```

### Section 1c: Token-Only Cross-Framework Sharing (Alternative)

If a React or Vue team arrives that is completely independent of Angular, the lightest
cross-framework strategy is:

```
  @vi/flux-ui (tokens + CSS)     ← already framework-agnostic
       │
  ┌────┴────────────────────┐
  │                         │
  ↓                         ↓
Angular team:           React team:
ui-components lib       @vi/flux-ui tokens
(Angular components)    +
                        Their own React components
                        styled via Flux-UI CSS variables

Example:
  // React button — no Angular, no WC
  <button className="btn btn--primary">   ← Flux-UI utility class
    Label
  </button>

  // Or a thin React wrapper library: @vi/ui-react
  // Built independently, shares only tokens and CSS
```

**The token layer is already framework-agnostic.** A React/Vue team gets a consistent
brand visual out-of-the-box just by consuming `@vi/flux-ui` styles and tokens — without
needing Angular Elements or Web Components at all.

---

## Section 1e: Lit at the MFE Boundary — Is it Right?

**Updated:** March 25, 2026  
**Trigger:** Proposal to use Lit specifically at MFE boundaries to avoid Angular Elements version coupling.

---

### The instinct is correct — but the scope defines everything

"Lit at the MFE boundary" is architecturally valid or invalid depending entirely on
**what you mean by the boundary**. There are two completely different interpretations,
and they have opposite outcomes.

---

### Interpretation A: Lit for Shell-Level App Chrome

**"The shell owns the header, navigation, footer, app-layout — authored in Lit."**

```
Shell (Angular host)
├── <vi-app-header>   ← Lit Web Component   ← Shell RENDERS this, owns it
├── <vi-nav-rail>     ← Lit Web Component   ← Shell RENDERS this, owns it
├── <router-outlet>                         ← Angular router outlet
│    ├── remote1 loads here (Angular)       ← Angular MFE, uses Angular UI components
│    └── remote-react loads here (React)    ← React MFE (future)
└── <vi-app-footer>   ← Lit Web Component   ← Shell RENDERS this, owns it
```

**What the Shell template looks like (your current `app.html`):**
```html
<!-- Current -->
<ul class="remote-menu">
  <li><a routerLink="/">Home</a></li>
  <li><a routerLink="remote1">Remote1</a></li>
</ul>
<router-outlet></router-outlet>

<!-- With Lit app chrome -->
<vi-app-header></vi-app-header>       <!-- Lit — Shell owns & renders this -->
<vi-nav-rail></vi-nav-rail>           <!-- Lit — Shell owns & renders this -->
<router-outlet></router-outlet>       <!-- Angular routes load here -->
<vi-app-footer></vi-app-footer>       <!-- Lit — Shell owns & renders this -->
```

**Why this works WITHOUT the PAIN points:**

The critical insight is that remotes do **not import or use** these Lit components
in their Angular templates. The Shell renders them. Angular remotes live inside
`<router-outlet>` and never touch `vi-app-header` in their own template code.

```
Angular remote1 template:
  ✅ No CUSTOM_ELEMENTS_SCHEMA needed
  ✅ Template type checking fully intact
  ✅ React remote: sees <vi-app-header> as regular DOM (the shell drew it)
  ✅ Your shell (Angular): uses them with CUSTOM_ELEMENTS_SCHEMA in shell module ONLY
     (one contained schema declaration, not spread across every remote)
```

**Pain points that still apply — contained to the Shell only:**

| Pain point | Impact in Interpretation A |
|------------|---------------------------|
| `CUSTOM_ELEMENTS_SCHEMA` | Shell module only — one place |
| Forms integration broken | ❌ Not relevant — nav/header don't have forms |
| Two-way binding | ❌ Not relevant — these are display/layout elements |
| OnPush / CD | ❌ Not relevant — shell chrome is rarely dynamic |
| Angular DevTools | ⚠️ Shell chrome is opaque — acceptable for layout |
| Testing | ⚠️ Shell-level E2E testing, not unit TestBed |

**Verdict: ✅ VALID. Lit for shell app chrome is a legitimate and clean architecture.**

This is exactly the pattern used by large MFE practitioners (Salesforce Lightning,
Zalando's app shell). The shell owns and serves layout/chrome as framework-agnostic WC.
Every remote (Angular, React, Vue) sits inside the router outlet and is completely
isolated from the Lit components.

---

### Interpretation B: Lit for the Shared UI Component Library

**"All Button, Input, Modal, Form components are Lit — consumed by all Angular MFEs."**

```
@vi/ui-components (Lit)
├── ButtonComponent (Lit)
├── InputComponent (Lit)
├── ModalComponent (Lit)
└── ...

Angular remote1:
  import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';  ← required everywhere
  // uses: <vi-button>, <vi-input>, <vi-modal> in every template
```

**This is the scenario where all 9 pain points hit you daily:**

- `CUSTOM_ELEMENTS_SCHEMA` on every component module → no template type-checking anywhere
- `[(ngModel)]` / `formControlName` broken on every form input
- OnPush change detection blind inside every component
- Two Angular testing patterns needed
- Angular DevTools blind for all components

**Verdict: ❌ INVALID for your stack today. The pain is daily across every developer on the team.**

---

### The Correct Scope Definition

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       COMPONENT OWNERSHIP MAP                           │
├────────────────────┬────────────────────────────────────────────────────┤
│    LIT ZONE        │  ANGULAR ZONE                                      │
│  (MFE boundary)    │  (domain UI)                                       │
├────────────────────┼────────────────────────────────────────────────────┤
│ vi-app-header      │ ButtonComponent                                     │
│ vi-nav-rail        │ InputComponent                                      │
│ vi-nav-breadcrumb  │ SelectComponent                                     │
│ vi-app-footer      │ ModalComponent                                      │
│ vi-app-sidebar     │ TableComponent                                      │
│ vi-page-layout     │ FormFieldComponent                                  │
│                    │ ToastComponent                                      │
│ WHY LIT:           │ BadgeComponent                                      │
│ Shell owns these   │                                                     │
│ They cross MFE     │ WHY ANGULAR:                                        │
│ framework boundary │ Angular MFEs consume these                         │
│ No Angular form    │ Full forms/signals/TestBed needed                   │
│ integration needed │ Type-checked templates required                    │
│                    │ React team gets @vi/flux-ui tokens + own components │
├────────────────────┼────────────────────────────────────────────────────┤
│ ~5-8 components    │ ~30-50 components                                   │
└────────────────────┴────────────────────────────────────────────────────┘
```

---

### What this architecture looks like in practice

```
libs/
├── flux-ui/             ← CSS tokens (framework-agnostic, already done ✅)
│
├── ui-shell-wc/         ← NEW: Lit Web Components — shell chrome only
│   ├── src/
│   │   ├── app-header/
│   │   ├── nav-rail/
│   │   ├── page-layout/
│   │   └── app-footer/
│   └── package.json     → @vi/ui-shell-wc
│
└── ui-components/       ← NEW: Angular components — domain UI
    ├── src/lib/
    │   ├── button/
    │   ├── input/
    │   ├── modal/
    │   └── ...
    └── package.json     → @vi/ui-components

apps/shell/
  bootstrap.ts: import '@vi/ui-shell-wc';  ← register Lit WC once in shell
  app.html:
    <vi-app-header></vi-app-header>
    <router-outlet></router-outlet>         ← Angular remotes load here
    <vi-app-footer></vi-app-footer>

apps/remote1/ (Angular):
  imports ButtonComponent from @vi/ui-components  ← full Angular DX ✅
  does NOT import vi-app-header (shell owns it)   ← no CUSTOM_ELEMENTS_SCHEMA

apps/remote-react/ (future React):
  import '@vi/flux-ui/styles';             ← brand tokens
  // <vi-app-header> already on page (shell renders it)
  // builds own React Button with Flux-UI CSS vars
```

---

### Why Lit specifically (vs just vanilla JS WC) for the shell chrome layer

| Aspect | Vanilla JS WC | Lit |
|--------|--------------|-----|
| Authoring DX | Low | Good (templating, reactive) |
| Bundle size | 0 KB | ~5 KB (acceptable) |
| Reactivity (nav active states, theme) | Manual DOM | `@property()` reactive |
| TypeScript support | Manual | First-class |
| Browser support | Native | Same (Lit = thin layer) |
| Version coupling | None | None (Lit ≠ Angular, no runtime conflict) |
| Test tooling | Manual | `@open-wc/testing` |

For **5-8 layout/chrome components** with minimal interactivity, Lit is the right choice.
Its reactive properties handle things like active nav state, theme toggling, mobile
hamburger — without the overhead of Angular.

---

### Version coupling: Why Lit is cleaner than Angular Elements for this scope

This is where your instinct is exactly right:

```
Angular Elements (vi-button as WC):
  bundle = ButtonComponent + @angular/elements + @angular/core + rxjs + zone.js
  version: must match host Angular version
  upgrade: requires org-wide Angular migration

Lit (vi-app-header as WC):
  bundle = AppHeaderComponent + lit@3.x (5 KB)
  version: Lit has NO framework coupling
  upgrade: independent — Lit 3 → 4 is a standalone update
  Angular 21 → 22: completely irrelevant to Lit components
```

**For shell chrome (Interpretation A), Lit avoids ALL version coupling concerns.
This is a concrete, genuine advantage over Angular Elements in this scope.**

---

### Revised recommendation

| Layer | Technology | Why |
|-------|-----------|-----|
| **Shell app chrome** (header, nav, layout, footer) | **Lit** | Framework-agnostic, no version coupling, shell owns and renders |
| **Domain UI components** (button, input, modal, table...) | **Angular + CDK** | Full Angular DX, forms, signals, TestBed — consumed by Angular MFEs |
| **Design tokens + CSS** | **flux-ui** (existing) | Already framework-agnostic ✅ |
| **React/Vue MFEs (future)** | `@vi/flux-ui` tokens + own components | Token sharing, no Angular dependency |

---

## Section 1d: Angular Elements Version Coupling vs Lerna — Deep Analysis

**Updated:** March 25, 2026  
**Trigger:** Apprehension about Angular Elements version coupling; consideration of Lerna as the alternative.

---

### Claim 1: "Angular Elements is strongly coupled to Angular version"

**Verdict: TRUE — but the coupling is manageable, and it already exists in your stack regardless of Angular Elements.**

#### Why the concern is valid

Angular Elements wraps an Angular component as a Custom Element, but the resulting
bundle still **contains and requires the Angular runtime**:

```
vi-button (Angular Element)
  │
  ├── ButtonComponent code         ← your code
  ├── @angular/elements runtime    ← wrapper/registrar
  ├── @angular/core runtime        ← Angular itself
  ├── @angular/common runtime
  └── rxjs / zone.js               ← Angular ecosystem deps
```

If your shell runs Angular 21 and a remote tries to load an Angular Element compiled
against Angular 22, you get a **runtime conflict**:

```
ERROR: NullInjectorError: No provider for ApplicationRef
       (Angular 21 injector cannot satisfy Angular 22 DI tokens)

OR

SILENT BUG: Two Angular instances running — zones fire twice, CD is unpredictable,
             dependency injection is split into two separate trees.
```

This is a real problem. Angular's DI system, its Zone.js patching, and its change
detection all assume **exactly one Angular runtime instance per page**.

#### Reality check: this coupling already exists without Angular Elements

Here is the thing — if you are using `@nx/module-federation/angular`, **this coupling
exists right now**, Angular Elements or not:

```typescript
// Your current module-federation.config.ts (shell)
// Nx auto-generates shared Angular deps as singletons:
shared: {
  '@angular/core': { singleton: true, strictVersion: true },
  '@angular/common': { singleton: true, strictVersion: true },
  '@angular/router': { singleton: true, strictVersion: true },
  // ... all Angular packages
}
```

`singleton: true` + `strictVersion: true` means: **if shell loads Angular 21 and a
remote tries to bring Angular 22, Module Federation throws a version conflict error at
runtime and refuses to load the remote.** This is already your constraint — all MFEs
in your workspace must run identical Angular versions today, with or without Angular Elements.

Angular Elements does not add a new coupling; it operates within a coupling that already
exists across your entire MFE fleet.

#### How Angular version upgrades actually work in MFE

The Angular team releases all packages (`@angular/core`, `@angular/common`,
`@angular/elements`, etc.) together with **matching major versions**, always. An upgrade
is an org-wide migration: `nx migrate @angular/core@22` updates all apps in lockstep.
This is by design — it is not a weakness of Angular Elements specifically.

```
Angular 21 → 22 migration:
  npx nx migrate latest            ← updates all workspace Angular deps in one step
  npx nx migrate --run-migrations  ← applies codemods
  ng update @angular/core          ← alternative

Result: shell, remote1, remote2 all move to 22 simultaneously.
This is standard Angular MFE practice, not an Angular Elements problem.
```

#### The one scenario where version coupling IS a hard blocker

If you have **externally deployed remotes pinned to different Angular versions**
(e.g., a vendor team ships their remote compiled against Angular 19, your shell is
Angular 21), you genuinely cannot share the Angular runtime. Module Federation will
reject it or silently duplicate it. In that specific scenario:

- Angular Elements does not help
- The token-only sharing path (Section 1c) is the answer
- Or each remote uses its own Angular runtime with `singleton: false` (50-60 KB overhead per remote)

---

### Claim 2: "Lerna intrinsically supports multiple framework versions per MFE"

**Verdict: INCORRECT. This is a category error. Lerna has no relevance to this problem.**

#### What Lerna actually is

Lerna is a **monorepo package management and publishing tool**. Its job is:

```
Lerna's actual responsibilities:
  ├─ npm publish automation for multiple packages
  ├─ Versioning strategy (independent or fixed/locked)
  ├─ Changelog generation across packages
  ├─ Run scripts across all packages (lerna run build)
  └─ Dependency hoisting in node_modules

Lerna operates entirely at BUILD TIME and PUBLISH TIME.
It produces static JavaScript artifacts — bundles, packages.
It has zero presence at runtime in the browser.
```

Lerna has no concept of:
- Browser runtime isolation
- Framework version negotiation
- Module loading strategies
- MFE orchestration
- Web Component lifecycles
- Shared dependency deduplication at runtime

**Before Nx gained popularity, Lerna was the dominant monorepo tool. Your current
workspace already uses Nx, which supersedes what Lerna does — and your `nx.json` +
`package.json` confirm this.** Adding Lerna to this workspace would be redundant
overlap with Nx.

#### Why the confusion likely arose

The word "package versioning" appears in both conversations — but they are different
layers entirely:

```
Layer 1: Monorepo package versions (Lerna's domain)
─────────────────────────────────────────────────────
  package-a@1.0.0   ← Lerna manages this
  package-b@2.3.1   ← Lerna manages this
  package-c@0.9.0   ← Lerna manages this

  → This is about what you PUBLISH to npm.
  → Has no effect on what runs in the browser.

Layer 2: Runtime module version negotiation (Module Federation's domain)
──────────────────────────────────────────────────────────────────────────
  shell loads @angular/core@21.1.0
  remote1 requests @angular/core@21.1.0  ← negotiated, shared ✅
  remote2 requests @angular/core@22.0.0  ← conflict! ❌

  → This is about what RUNS IN THE BROWSER simultaneously.
  → Lerna cannot influence this in any way.
```

#### What actually solves multi-framework / multi-version MFE at runtime

These are the real tools in this layer. Compare them honestly against your stack:

| Tool | What it solves | Applicable here? |
|------|---------------|-----------------|
| **Module Federation `singleton: false`** | Allows two different version of same lib to coexist (each remote gets its own copy) | ✅ Already in your stack. Config change only. |
| **Module Federation `requiredVersion: 'auto'`** | Negotiates compatible versions, fails loudly on incompatibility | ✅ Already in your stack. Config change only. |
| **Single-spa** | Orchestrates React + Vue + Angular + Svelte on same page, each framework fully independent | ⚠️ Major architectural shift from your current Nx MF setup |
| **qiankun** | Single-spa-based, popular for multi-framework MFE, especially React + isolated apps | ⚠️ Alternative framework, needs migration |
| **iframes** | Perfect runtime isolation, separate browsing context per remote | ⚠️ Communication pain, no shared DOM/state |
| **Lerna** | Package versioning and npm publishing | ❌ Irrelevant to this problem layer entirely |
| **Angular Elements** | Angular → Web Component bridge for cross-framework consumption | ⚠️ Works well if Angular runtime is shared via MF |

#### The actual solution already sitting in your `webpack.config.ts`

You already have Module Federation. The multi-version problem is solved by **configuring
`shared` dependencies** — no new tooling needed:

```typescript
// Shell: module-federation.config.ts
// Scenario: React remote arrives running React 19.
// Angular is still singleton. React is NOT shared (each team owns their runtime).

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: ['remote1', 'remote-react'],   // remote-react uses React 19
  shared: {
    // Angular: singleton, strict — all Angular remotes must match
    '@angular/core':    { singleton: true, strictVersion: true },
    '@angular/common':  { singleton: true, strictVersion: true },

    // React: NOT shared as singleton — React remote brings its own
    // (This is fine because shell and Angular remotes don't use React at all)
    // Simply omit React from shared — it won't conflict.
  },
};

// Result:
//   Angular shell   → uses shared Angular 21 runtime   (one copy)
//   Angular remote1 → uses shared Angular 21 runtime   (same copy)
//   React remote    → bundles its own React 19          (independent)
//   No conflicts. No new tooling. Works today.
```

This is zero-effort multi-framework support — a React team can join, run their remote
independently, and consume `@vi/flux-ui` CSS tokens for brand consistency. No Lerna.
No Single-spa. No Angular Elements required.

#### When you DO need Single-spa (and it is worth knowing about)

Single-spa is the right choice when:

```
Single-spa makes sense when:
  ├─ You want React, Vue, AND Angular components rendered in the SAME route
  │  (not just different routes — literally the same page section)
  ├─ Teams own separate micro-frontends deployed to different CDNs
  │  with no shared dependency negotiation (fully independent builds)
  └─ You want framework-agnostic routing/mounting lifecycle contracts

Single-spa does NOT make sense when:
  ├─ Your teams are all Angular (current state)
  ├─ Your remotes share routes (Module Federation handles this natively)
  ├─ You want shared dependencies (MF is better at this)
  └─ You want strong TypeScript contract between host and remote (MF is better)
```

Your current Nx + Module Federation setup is architecturally superior to Single-spa for
**route-based MFE** (each remote owns a route). Single-spa adds value for **component-level
micro-frontend composition** (multiple frameworks on one page at once), which is a much
harder problem you are not trying to solve.

---

### Summary: The Correct Framing

| Concern | Correct? | Reality |
|---------|----------|---------|
| Angular Elements is strongly coupled to Angular version | Partially ✅ | Real coupling, but already exists in your MF stack regardless |
| This coupling is a new problem Angular Elements introduces | ❌ | You already have this coupling across all your MFEs today |
| Lerna solves multiple framework versions at runtime | ❌ | Category error — Lerna is a BUILD tool, not a runtime tool |
| Lerna is relevant to this workspace | ❌ | Nx already does everything Lerna does and more |
| Module Federation solves multi-framework coexistence | ✅ | Already in your stack — config change only |
| Single-spa is an alternative MFE strategy | ✅ | Valid, but a major shift from your current Nx MF setup; only worth it for component-level (not route-level) multi-framework composition |

---

## Section 2: Should You Build an Entire Component Library?

This is the more nuanced question. The honest answer is: **No, not from scratch.**

### The Real Cost of Building from Scratch

A production-grade component library (25+ components) means:

| Component | What "Production Quality" Actually Means |
|-----------|-------------------------------------------|
| Button | Focus management, loading state, disabled state, icon support, ARIA, keyboard nav |
| Input | Error states, form validation, label association, placeholder, character count |
| Modal/Dialog | Trap focus, scroll lock, escape key, backdrop click, ARIA role, stacking |
| Select/Dropdown | Virtual scrolling, keyboard nav (↑↓ Enter Esc), search, multi-select, ARIA listbox |
| Date Picker | Locale handling, keyboard nav, range selection, min/max, formatting |
| Tooltip | Positioning engine, overflow handling, delay, ARIA describedby |
| Toast/Alert | Queue management, dismiss, stacking, WCAG contrast |
| Table | Sorting, filtering, pagination, virtual scroll, row selection, ARIA grid |

**Realistic effort estimates:**

```
Button:         3-5 days  (seemingly simple, lots of edge cases)
Input:          5-7 days  (validation, masks, prefix/suffix, types)
Select:         10-15 days (one of the hardest components)
Modal:          7-10 days  (focus trap is non-trivial)
Date Picker:    20-30 days (most complex component in any library)
Table:          15-20 days (especially with virtual scroll)
────────────────────────────
Total (10 core): ~80-120 days for production quality
                (~15-20 weeks, 1 engineer)
```

Building from scratch means you're also responsible for:
- Keyboard navigation patterns (ARIA Authoring Practices Guide)
- WCAG 2.1 AA compliance testing with screen readers
- Browser compatibility matrix
- RTL (right-to-left) language support
- High contrast mode
- Animation/motion reduced preference
- Every regression you didn't expect

That's a full product. **Multiple teams have attempted this and abandoned it mid-way.**

---

## Section 3: The Right Architecture — Hybrid Strategy

### What Major Orgs Actually Do

IBM (Carbon), Atlassian (Atlaskit), GitHub (Primer), Shopify (Polaris), Microsoft (Fluent UI) all use the same pattern:

```
  FOUNDATION LAYER     +    BRAND LAYER      +    CUSTOM LAYER
  ─────────────────         ────────────────      ─────────────
  Open-source base   →    Your design tokens  →  Your extensions
  (accessibility,        (colors, spacing,      (unique patterns
   keyboard nav,          typography,             your org needs)
   ARIA, testing          animations)
   already done)
```

**For your Angular MFE stack, this maps to:**

```
  Angular Material CDK  +  Flux-UI Tokens  +  Custom Angular Lib
  ────────────────────     ────────────────    ──────────────────
  @angular/cdk            @vi/flux-ui          libs/ui-components
  - Overlay               - CSS variables      - BrandedButton
  - Focus trap            - Color palette      - AppHeader
  - A11y utilities        - Theme maps         - DataGrid
  - Portal                - Typography         - ChartContainer
  - Virtual scroll        - Spacing scale      (whatever is unique
  - Drag & drop                                 to your product)
  Free and maintained by
  the Angular team
```

---

## Section 4: Three Realistic Options

### Option A: Angular Material + Flux-UI theming (Recommended for speed)

**What you get:**
- 40+ production-grade components on day 1
- Fully accessible, keyboard navigable, screen reader tested
- Angular Material's Theming API accepts your Flux-UI design tokens
- CDK handles all hard problems (focus trap, overlay, portal)

**What you customize:**
- Apply your brand colors/spacing via theming
- Override component styles via CSS layers (Flux-UI already has layer support)
- Build custom extensions (AppHeader, DataTable, etc) as Angular library

**Cost:** 2-3 weeks to theme + integrate + document

**Downside:** Material design language is visible if not properly customized

**In Practice:**
```typescript
// Angular Material v3 — MDC-based theming with CSS variables
// libs/flux-ui/src/styles/material-theme.scss

@use '@angular/material' as mat;
@use './variables' as vi;

// Map Flux-UI tokens → Material theme
$vi-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$blue-palette,   // ← swap with your brand
    tertiary: mat.$yellow-palette
  ),
  typography: (
    brand-family: var(--vi-font-family-base),
    plain-family: var(--vi-font-family-base),
  ),
  density: (scale: 0),
));

:root {
  @include mat.all-component-themes($vi-theme);
}
```

---

### Option B: Angular CDK only + Build on top (Recommended for full control)

**What you get:**
- All the primitives without Material's visual opinions
- Full control over every pixel
- Overlay, focus trap, portal, accessibility — free from CDK
- No design language lock-in

**What you build:**
- Every component visually from scratch, on top of CDK primitives
- Buttons, cards, inputs styled from Flux-UI tokens
- Complex components (Modal, Select) built on CDK primitives

**Cost:** 6-10 weeks for initial 15-20 component set

**This is the right choice if your brand must be distinct from Material.**

**In Practice:**
```typescript
// libs/ui-components/src/lib/modal/modal.component.ts
import { Component, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';  // FREE from CDK
import { A11yModule } from '@angular/cdk/a11y';      // FREE focus trap

@Component({
  selector: 'vi-modal',
  imports: [A11yModule],
  template: `
    <div cdkTrapFocus                          <!-- Free from CDK -->
         role="dialog"
         aria-modal="true"
         class="modal-container">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './modal.component.scss'           <!-- Uses Flux-UI tokens -->
})
export class ViModal {
  // Full Angular:
  // - ControlValueAccessor works
  // - EventEmitter works
  // - Signals work
  // - OnPush works
  // - TestBed works
  // - Angular DevTools works
}
```

---

### Option C: PrimeNG (Alternative to Material, richer components)

**What you get:**
- 80+ components (more than Material)
- Less opinionated styling (easier to rebrand)
- DataTable with filtering/sorting/virtual scroll out-of-box
- Charts, Tree, Gantt (things CDK/Material don't provide)

**What you customize:**
- CSS-variable based theming maps well to Flux-UI tokens
- PrimeNG v17+ has rewritten theming via CSS variables

**Cost:** 1-2 weeks to theme + integrate + document

**Best for:** Dashboard-heavy applications with data tables, charts, complex inputs.

---

## Section 5: Decision Matrix

### Option Comparison

| Criteria | Material + Flux-UI | CDK + Build | PrimeNG + Flux-UI | Build from Scratch |
|----------|-------------------|-------------|-------------------|-------------------|
| **Time to 20+ components** | 2-3 weeks | 8-10 weeks | 2-3 weeks | 20-30 weeks |
| **Angular integration** | Native | Native | Native | Native |
| **Design customization** | Medium | Full | High | Full |
| **Accessibility quality** | Excellent | Excellent | Good | Depends |
| **Long-term maintenance** | Community | Your team | Community | Your team |
| **Unique brand** | Requires work | Fully custom | Moderate | Fully custom |
| **Component coverage** | 40+ | You build | 80+ | You build |
| **CDK access** | Full | Full | Partial | None |
| **Team Angular ramp-up** | Fast | Fast | Fast | Fast |

### When to choose each

```
Choose Material + Flux-UI theming when:
  ├─ You need components within weeks
  ├─ Brand expressiveness is optional
  └─ Team is small / bandwidth limited

Choose CDK + Build when:
  ├─ Brand must be completely distinct
  ├─ You have 2+ engineers for 3+ months
  └─ You want full ownership long-term

Choose PrimeNG + Flux-UI theming when:
  ├─ You have data-heavy dashboards
  ├─ Need charts, tree views, complex tables
  └─ Brand is flexible but components must be rich

Choose Build from Scratch when:
  ├─ Never
  └─ (Only justified for Airbnb/Google-scale design systems
      with 5+ dedicated engineers and multi-year commitment)
```

---

## Section 6: Recommended Architecture

### For Your Stack: CDK + Custom Angular Library

Given that you've already built a high-quality foundation layer (Flux-UI tokens, theming system, CSS architecture), the recommended path is:

```
libs/
├── flux-ui/           ← existing (tokens + utilities + theming)
│   └── @vi/flux-ui    ← CSS vars, SCSS partials, TS tokens
│
└── ui-components/     ← NEW (Angular components using flux-ui tokens)
    ├── src/lib/
    │   ├── button/
    │   │   ├── button.component.ts
    │   │   ├── button.component.html
    │   │   ├── button.component.scss   ← uses var(--vi-*) tokens
    │   │   └── button.component.spec.ts ← TestBed works normally
    │   ├── input/
    │   ├── modal/                      ← uses @angular/cdk/a11y
    │   ├── select/                     ← uses @angular/cdk/listbox
    │   ├── toast/
    │   └── index.ts
    └── package.json
```

**The Component Layer Philosophy:**

```
Rule 1: Use Angular CDK primitives wherever they exist
  ├─ cdkTrapFocus for modals
  ├─ CdkListbox for selects/dropdowns
  ├─ Overlay for tooltips/popovers
  └─ A11yModule for focus management

Rule 2: Style 100% via Flux-UI tokens
  ├─ Never hardcode a color value
  ├─ Never hardcode a spacing value
  └─ Use var(--vi-*) CSS custom properties

Rule 3: Angular-first API (no Web Component compromises)
  ├─ @Input() / @Output() / model()
  ├─ Implements ControlValueAccessor for form fields
  ├─ OnPush change detection everywhere
  └─ Signals for internal state

Rule 4: Ship via Nx library (shareable across shell + remotes)
  ├─ One build, consumed by all MFEs
  └─ Module Federation shares @angular/core already
```

**Example — Button Component (Angular-style):**

```typescript
// libs/ui-components/src/lib/button/button.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'vi-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="computedClass"
      [attr.aria-busy]="loading"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="btn__spinner" aria-hidden="true"></span>
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss',  // ← Flux-UI tokens only
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() viClick = new EventEmitter<MouseEvent>();

  get computedClass(): string {
    return `btn btn--${this.variant} btn--${this.size}`;
  }

  handleClick(e: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.viClick.emit(e);
    }
  }
}
```

```scss
// button.component.scss — 100% Flux-UI token-driven, zero hardcoded values
:host {
  display: inline-flex;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--vi-spacing-xs);

  border: none;
  cursor: pointer;
  font-family: var(--vi-font-family-base);
  border-radius: var(--vi-border-radius-md);
  transition: background-color 150ms ease, transform 100ms ease;

  // Size variants
  &--sm  { padding: var(--vi-spacing-xs)  var(--vi-spacing-sm);  font-size: var(--vi-font-size-sm); }
  &--md  { padding: var(--vi-spacing-sm)  var(--vi-spacing-md);  font-size: var(--vi-font-size-base); }
  &--lg  { padding: var(--vi-spacing-md)  var(--vi-spacing-lg);  font-size: var(--vi-font-size-lg); }

  // Colour variants — from _theme.scss token map
  &--primary   { background: var(--vi-button-primary-bg);   color: var(--vi-button-primary-text); }
  &--secondary { background: var(--vi-button-secondary-bg); color: var(--vi-button-secondary-text); }
  &--danger    { background: var(--vi-button-danger-bg);    color: var(--vi-button-danger-text); }

  &:focus-visible {
    outline: 2px solid var(--vi-focus-ring);
    outline-offset: 2px;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
```

**Consumed in any MFE — full Angular experience:**

```typescript
// apps/remote1/src/app/remote-entry/entry.component.ts
import { ButtonComponent } from '@vi/ui-components';

@Component({
  imports: [ButtonComponent],
  template: `
    <vi-button 
      variant="primary"
      (viClick)="submit()"     ← TypeScript knows this event exists
      [disabled]="formInvalid" ← TypeScript checks the type
    >
      Submit
    </vi-button>
  `
})
export class EntryComponent {
  formInvalid = signal(false);
  submit() { /* ... */ }
}
```

---

## Section 7: Phased Build Plan

### What to Build (Ordered by ROI)

```
Phase 1 — Core (4-5 weeks): Most-used, most value
├─ Button (primary, secondary, danger, ghost, icon-button)
├─ Input (text, email, password, search, number)
├─ Select (single + multi, searchable via CDK listbox)
├─ Checkbox / Radio
└─ Card / Container

Phase 2 — Feedback (3-4 weeks): Forms + notifications
├─ Modal / Dialog  (CdkDialog or CdkTrapFocus)
├─ Toast / Snackbar
├─ Form field wrapper (label + error + hint)
├─ Badge
└─ Alert / Banner

Phase 3 — Navigation (2-3 weeks):
├─ Tabs
├─ Breadcrumb
├─ Pagination
└─ Sidebar nav / menu

Phase 4 — Data (4-5 weeks): Dashboard-heavy
├─ Table (sortable + filterable headers)
├─ Avatar / AvatarGroup
├─ Progress / Spinner
└─ Empty state / Skeleton loader

Phase 5 — Advanced (as needed):
├─ Tree view (CDK tree)
├─ Date Picker (use CDK, hardest component)
├─ File upload
└─ Rich text
```

**Total estimate: 15-18 weeks (1 dedicated engineer)**

**Note:** If you adopt PrimeNG, Phase 4 is essentially free. Decide before Phase 4.

---

## Final Decision Matrix

| Question | Answer | Rationale |
|----------|--------|-----------|
| Build a component library? | **Yes, two layers** | Shell chrome (Lit) + domain UI (Angular) |
| Lit for shell app chrome (header, nav, footer)? | **✅ Yes** | Framework-agnostic, no version coupling, shell owns it — remotes never import it |
| Lit for shared domain UI library (Button, Input...)? | **❌ No** | All 9 Angular+WC pain points hit daily; Angular MFEs consume these |
| Angular components for domain UI? | **✅ Yes** | Full forms, signals, TestBed, OnPush, template type-checking |
| Angular Elements? | **❌ Skip it** | Version coupling + runtime overhead; Lit is cleaner for this purpose |
| Angular CDK? | **✅ Yes** | For hard components: modal (CdkTrapFocus), select (CdkListbox), overlay |
| Multi-framework coexistence (future React)? | **Module Federation `shared` config** | React remote brings own runtime; no conflict; consumes flux-ui tokens directly |
| React/Vue needs Angular domain components? | **Thin wrapper on Lit** | Extract shell WC; offer token-only for their own domain components |
| Use Lerna? | **❌ No** | Nx already supersedes Lerna; wrong layer for runtime problems |

---

## Summary: Architecture Evolution

### Now (Angular-only MFEs)
```
flux-ui (tokens + CSS)
    └──► ui-components (Angular + CDK) → consumed by all Angular remotes
```

### Phase Next: Add Shell Chrome in Lit
```
flux-ui (tokens + CSS)
    ├──► ui-shell-wc (Lit)        → Shell renders: vi-app-header, vi-nav-rail, vi-app-footer
    └──► ui-components (Angular)  → Remotes import: ButtonComponent, InputComponent, etc.
```

### Phase Future A: React/Vue joins (independent, no shared Angular runtime)
```
flux-ui (tokens + CSS)
    ├──► ui-shell-wc (Lit)        → Shell chrome — all frameworks see it as plain DOM
    ├──► ui-components (Angular)  → Angular MFEs
    └──► React/Vue teams:
           - @vi/flux-ui styles   → brand tokens ✅
           - own React components → no Angular, no Lit needed inside their MFE
```

### Phase Future B: React/Vue wants Angular component behaviour (rare)
```
ui-components (Angular)
    └──► Angular Elements         → only if React team explicitly needs Angular component logic
                                    (justified only if they share Angular runtime via MF)
```

**Rule:** The Lit boundary is the **shell chrome** — what the shell renders that sits
outside `<router-outlet>`. Everything inside a remote's route stays in that remote's
native framework with its full DX intact.

The `flux-ui` library stays as-is (tokens + utilities).  
Add `ui-shell-wc` (Lit) for shell app chrome — ~5–8 layout components.  
Add `ui-components` (Angular + CDK) for domain UI — ~30–50 components.  
Three deliberately separate packages with clean separation of concerns.
