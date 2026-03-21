# State-FP Architecture Diagrams

This directory contains comprehensive architecture diagrams for the `@vi/state-fp` library using PlantUML. Each diagram illustrates a different aspect of the system.

## Diagram Overview

### 1. **HLD (High-Level Design)** — `01-hld-architecture.puml`
The top-level system architecture showing:
- **Layers**: Application → State Management → Persistence → Sync → DevTools
- **Key components**: Kernel, Atoms, Storage, SyncEngine, Transport, DevTools
- **Data flow**: How data flows from framework adapters through the kernel to persistence and sync

**Use case**: Understanding the overall system structure and component relationships.

---

### 2. **LLD (Low-Level Design)** — `02-lld-components.puml`
Detailed class diagrams showing internal structure:
- **Kernel internals**: CommandHandler, QueryMemoCache, DomainEvent system
- **Atom structure**: State container, version tracking, subscriber management
- **SyncEngine**: Version vectors, conflict resolution, transport abstraction
- **Storage adapters**: MemoryAdapter (only — browser-persistent adapters removed by security policy)
- **EphemeralStream**: High-frequency RAF batching with AnimatedEntry tracking

**Use case**: Understanding internal implementation details and class hierarchies.

---

### 3. **Call Flow (Mutation)** — `03-callflow-mutation.puml`
Sequence diagram showing the complete flow when a state mutation occurs:
1. User interaction → React component
2. Command execution in Kernel
3. State mutation in Atom
4. Subscriber notifications (synchronous)
5. Storage persistence
6. SyncEngine broadcast (async)
7. Remote peer state application (in other tabs/workers)

**Use case**: Understanding how a command flows through the system and affects all layers.

---

### 4. **Data Flow (Multi-Path)** — `04-dataflow-paths.puml`
Shows how data moves through different paths:
- **Write path**: Event → Validation → Command → State Update → Persist + Broadcast
- **Sync reception path**: Remote message → Deserialize → Version check → Conflict resolution → Apply
- **Query path**: Query → Memo cache → Execute → Cache store → Return
- **Subscription path**: Subscribe → Emit → Buffer → RAF flush → Notify listeners
- **DevTools path**: Mutation → Event capture → EventLog → Time-travel index

**Use case**: Understanding all the data transformation paths in the system.

---

### 5. **Swimlane (Cross-MFE)** — `05-swimlane-crossmfe.puml`
Actor-based sequence showing interactions in a multi-MFE scenario:
- **Tab A (Order MFE)**: Updates order state
- **Tab B (Notification MFE)**: Observes changes via SharedEventBus
- **Shared channel**: BroadcastChannel for inter-tab messaging
- **Protocol**: Version vector verification → Conflict resolution → Local application

**Use case**: Understanding how the library enables micro-frontend state synchronization.

---

### 6. **Use Cases** — `06-usecases.puml`
UML use case diagram showing:
- **Developer workflows**: Create atoms, subscribe, define commands, enable persistence, share cross-tab, debug
- **End-user experiences**: See live updates, trigger mutations, smooth interactions, transparent conflict resolution
- **Advanced features**: SSR hydration, framework integration, time travel

**Use case**: Understanding what the library enables for developers and end-users.

---

### 7. **Component Dependencies** — `07-dependencies.puml`
Complete dependency graph showing:
- **Public API exports**: `./core`, `./kernel`, `./storage`, `./sync`, `./bus`, `./adapter`, `./devtools`
- **Import relationships**: Which modules depend on which
- **External APIs**: Browser APIs used (BroadcastChannel, postMessage, RAF) — IndexedDB/LocalStorage are not used

**Use case**: Understanding module organization and dependency management.

---

### 8. **Sequence: Initialization** — `08-sequence-init.puml`
Detailed sequence diagram showing application startup:
1. **Phase 1**: Kernel creation and handler registration
2. **Phase 2**: Atom creation and subscriber setup
3. **Phase 3**: Command execution (user event)
4. **Phase 4**: Side effects (storage, sync)
5. **Phase 5**: Subscriber notification
6. **Phase 6**: React re-render

Includes latency estimates for each phase.

**Use case**: Understanding the initialization process and performance characteristics.

---

### 9. **EphemeralStream RAF Batching** — `09-ephemeralstream-raf.puml`
In-depth sequence showing high-frequency stream handling:
- **Demand-driven RAF**: Single RAF per stream, not per-subscriber
- **Value buffering**: Multiple emits overwrite pending value
- **Frame flushing**: `flushAnimated()` called once per frame
- **Cleanup**: RAF cancelled when last subscriber unsubscribes (zero CPU idle cost)

**Use case**: Understanding the zero-overhead design for high-frequency state.

---

### 10. **Conflict Resolution** — `10-conflict-resolution.puml`
Detailed flow for handling concurrent writes across tabs:
1. **Setup**: Both tabs write to same atom simultaneously
2. **Detection**: Version vectors identify concurrent writes
3. **Resolution**: Apply configured strategy (last-write-wins, etc.)
4. **Merging**: Vector clocks merged to reflect both changes
5. **Convergence**: Both tabs reach identical state

Shows the causality-preserving algorithm at the core of state-fp sync.

**Use case**: Understanding how the library guarantees eventual consistency.

---

### 11. **Framework Integration** — `11-framework-integration.puml`
Shows how different UI frameworks integrate with state-fp:
- **React**: `useAtom`, `useCommand`, `useQuery` hooks
- **Angular**: Services with Observables
- **Vanilla JS**: Direct API
- **Lit**: Custom element decorators

Highlights the framework-agnostic design of the core.

**Use case**: Understanding adaptation patterns and framework flexibility.

---

### 13. **Sequence: React Adapter Hooks** — `13-sequence-react-adapter.puml`
End-to-end lifecycle sequence for a React component using `createReactAdapter()`:
- **Bootstrap**: `createReactAdapter({ useState, useEffect, ... })` factory call
- **Mount**: `<Provider kernel={k}>` injects kernel via `KernelContext`
- **useAtom**: `useState` seeded from `atom.get()` (no flicker) + `useEffect` subscription
- **useCommand**: stable dispatch via `useRef` — never recreated between re-renders
- **useQuery**: `useMemo` keyed on atom state reference — query only reruns when state changes
- **useEphemeral**: `subscribeAnimated` (RAF-batched) or sync `subscribe`
- **Unmount**: all subscriptions cleaned up automatically via `useEffect` cleanup

**Use case**: Implementing React components with the Phase 5 adapter factory hooks.

---

### 14. **Sequence: Lit Adapter Controllers** — `14-sequence-lit-adapter.puml`
End-to-end lifecycle sequence for a LitElement using `createLitController()` and `createLitStreamController()`:
- **Constructor**: controllers created in field initialisers, registered via `host.addController()`
- **hostConnected**: atom subscription created; `stream.subscribeAnimated()` registered
- **render()**: controller properties read (`this.counter.state`, `this.mouse.value`)
- **dispatch()**: command executed via `kernel.execute()`; `host.requestUpdate()` called on change
- **EphemeralStream**: RAF-batched listener calls `host.requestUpdate()` on each frame
- **hostDisconnected**: all subscriptions cleanly removed

**Use case**: Implementing LitElements with Reactive Controllers for atom and stream state.

---

### 15. **Sequence: Angular Adapter Signals** — `15-sequence-angular-adapter.puml`
End-to-end lifecycle sequence for an Angular 17+ component using `createAngularAdapter()`:
- **Bootstrap**: `createAngularAdapter({ signal, inject, DestroyRef })` factory call
- **toSignal**: creates `WritableSignal<S>` seeded from `atom.get()`, subscribes via kernel, registers `destroyRef.onDestroy(unsubscribeFn)` — zero boilerplate
- **toQuerySignal**: creates a derived signal; query function re-runs on every state change
- **commandDispatcher**: returns stable dispatch function — no injection context required
- **Template**: Angular tracks signal reads automatically; no Zone.js overhead
- **Destroy**: `DestroyRef` cleanup fires automatically; no `ngOnDestroy` needed

**Use case**: Implementing Angular components with Signal-based state using the Phase 5 adapter factory.

---

### 12. **DevTools & Debugging** — `12-devtools-debugging.puml`
Complete debugging and instrumentation architecture:
- **EventLog**: Record all mutations with before/after state
- **TimeTravel**: Rewind to any point in history
- **StateInspector**: Inspect atom state in console
- **PerformanceMonitor**: Track command latency, cache hit rates, sync conflicts
- **Integration**: Redux DevTools extension, browser console, Vitest

Includes example debugging sessions and testing patterns.

**Use case**: Understanding developer experience and observability features.

---

## How to Use These Diagrams

### Viewing Diagrams
All diagrams are in PlantUML format (`.puml` extension). To view:

1. **Online**: Paste content into [PlantUML Editor](http://www.plantuml.com/plantuml/uml)
2. **VS Code**: Install PlantUML extension, open `.puml` file, press `Alt+D`
3. **Command line**: `plantuml diagram.puml` (generates PNG/SVG)

### Embedding in Documentation
Convert to PNG/SVG for markdown:
```bash
plantuml -tpng libs/state-fp/docs/fig/*.puml
```

Then reference in markdown:
```markdown
![Architecture](./fig/01-hld-architecture.png)
```

### Extending Diagrams
Edit `.puml` files directly. Common customizations:
- Adjust colors (find `!define` at top)
- Add/remove components
- Modify relationships
- Update notes and annotations

## Color Scheme

- **Blue** (`#E3F2FD`): Core Kernel/State components
- **Green** (`#E8F5E9`): Sync/Communication components
- **Orange** (`#FFF3E0`): Utilities/Configuration
- **Purple** (`#F3E5F5`): DevTools/Debugging
- **Red** (`#FFE8D0`): Conflict/Special cases

## Best Practices

1. **HLD First**: Start with diagram 1 (HLD) to understand the system
2. **Drill Down**: Use LLD (diagram 2) to understand specific component
3. **Scenario-Based**: Use Call Flow / Swimlane / Sequence diagrams for specific scenarios
4. **Reference**: Keep Dependencies diagram handy for module structure

## Contributing

When adding new features:
1. Update relevant diagram(s)
2. Keep colors consistent
3. Add notes explaining design decisions
4. Update this README with new diagrams

---

**Last Updated**: March 2026  
**Version**: 1.0 (Phase 4 Complete)
