---
description: Mandatory architecture and engineering standard for the backend base framework (Vialiq.Core, Vialiq.Infrastructure, Vialiq.Caching, Vialiq.Validation). Enforces Functional Programming (FP) paradigms and Generic Programming (GP) exclusively for high-reliability GxP clinical systems.
---

# Backend Architecture Standards: Functional & Generic Programming Paradigm

This rule establishes the mandatory architectural pattern for the Vialiq backend base framework (`backend/libs/` including `Vialiq.Core`, `Vialiq.Infrastructure`, `Vialiq.Caching`, and `Vialiq.Validation`).

---

## 1. Core Paradigm Mandates

All base framework abstractions, utilities, domain logic, and infrastructural components MUST adhere strictly to:
1. **Functional Programming (FP) Paradigm**:
   - **Immutability First**: Public state must be immutable. Use C# `record`, `readonly struct`, `init`-only properties, and immutable or read-only collections (`IReadOnlyList<T>`, `IReadOnlyDictionary<TKey, TValue>`). Never expose mutable properties or public setters on domain models, DTOs, or options.
   - **Pure Functions & Determinism**: Operations must be side-effect-free wherever practical. Given identical inputs, functions must produce identical outputs without mutating ambient global state.
   - **Railway-Oriented Programming (ROP)**: Operations that can fail (validation, network dispatch, database resolution) must return explicit monadic result containers (`Result<TValue, TError>` or `Option<TValue>`) rather than relying on unhandled exception throwing for standard business control flow.
   - **Higher-Order Functions**: Use function delegates (`Func<...>`, `Action<...>`) for composability, transformation pipelines, interceptors, and life-cycle hooks.
   - **Pattern Matching & Expressions**: Prefer C# expression-bodied members and pattern matching (`switch` expressions, tuple patterns, positional patterns) over imperative `if-else` cascades or mutable accumulator loops.

2. **Generic Programming (GP) Paradigm**:
   - **Strongly-Typed Abstractions**: Parameterize interfaces, repositories, evaluators, and pipeline stages over generic type parameters (`TEntity`, `TKey`, `TContext`, `TResult`).
   - **Explicit Type Constraints**: Constrain all generic parameters strictly (`where T : class`, `where T : notnull`, `where TContext : ITenantStudyContext`, `where TId : IEquatable<TId>`).
   - **Zero Dynamic / Reflection Downcasting**: Runtime `dynamic`, raw `object` casting, and unconstrained reflection are strictly forbidden in performance-critical execution paths. All transformations must be resolved at compile time through generic type signatures.
   - **Generic Higher-Order Builders**: Configuration and pipeline registration must use generic fluent builders (`IServiceCollection.AddMongoMultiCluster(...)`, `WithClient<TResult>(...)`, `WithDatabase<TResult>(...)`).

3. **Asynchronous-First (Async/Await & Task as Primary Return Pattern)**:
   - **Zero Synchronous I/O**: All database, network, cache, filesystem, and external service operations MUST be fully asynchronous.
   - **Primary Return Pattern**: Return `Task<T>`, `Task`, or `ValueTask<T>`. Never write blocking `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` in operational code.
   - **Context Free Library Execution**: In base class libraries (`backend/libs/`), always append `.ConfigureAwait(false)` to async calls to avoid synchronization context deadlocks.
   - **Cancellation Token Propagation**: Every async API and repository method must accept an optional `CancellationToken cancellationToken = default` and propagate it to underlying drivers.

4. **Thread-Safety & Explicit Concurrency Primitives**:
   - **Where FP Meets Shared Mutable State**: While domain models and options are strictly immutable, shared runtime infrastructure (connection pools, socket handles, multiplexers) requires coordination.
   - **Non-Blocking Synchronization**: Use `SemaphoreSlim` (with `await semaphore.WaitAsync(ct)`) for async-friendly locking. Never use synchronous `lock(object)` blocks around I/O or async calls.
   - **Lock-Free Read Fast-Paths**: Combine `ConcurrentDictionary<TKey, TValue>` with atomic double-checked locking patterns to ensure zero-overhead reads once resources are initialized.
   - **Atomic State Transitions**: Use `Interlocked` (`CompareExchange`, `Increment`, `Exchange`) or `Volatile` reads for atomic lifecycle flags and counters.

5. **Zero Bare String Literals In C# Source Files**:
   - **No Magic Strings**: Bare string literals, configuration paths, section names, connection string keys, database names, replica set identifiers, command names, error messages, and logging templates MUST NEVER be hardcoded directly inside C# operational classes or services.
   - **Mandatory Sources for Strings**:
     1. **Strongly-typed Constant Classes**: Grouped under `Constants/` (e.g. `MongoClusterConstants`, `ConfigurationConstants`, `InfrastructureErrorMessages`).
     2. **Enums & Extension Methods**: Typed domain discriminators with deterministic pure mappings.
     3. **Options & Configuration**: 12-factor configuration bound via `IOptions<T>`.
     4. **Resource Files (`.resx`) / Catalogs**: For localized and user-facing messages.
     5. **Structured Logging Templates**: Named constants for high-performance zero-allocation logging parameters.

---

## 2. Practical Framework Conventions

### A. Configuration Options & Immutable Records
```csharp
// Immutable, sealed records with init-only properties
public sealed record MongoClusterEndpointOptions(
    string ConnectionString,
    string ReplicaSetName,
    string DefaultDatabaseName,
    int MaxConnectionPoolSize = 200,
    int MinConnectionPoolSize = 10,
    TimeSpan ConnectTimeout = default,
    TimeSpan SocketTimeout = default,
    TimeSpan ServerSelectionTimeout = default,
    bool RetryWrites = true,
    bool RetryReads = true);
```

### B. Functional Monadic Results (`Result<T, TError>`)
```csharp
// Explicit outcome modeling without hidden exceptions
public readonly record struct Result<TValue, TError>
{
    public bool IsSuccess { get; }
    public TValue Value { get; }
    public TError Error { get; }
    
    public TResult Match<TResult>(
        Func<TValue, TResult> onSuccess, 
        Func<TError, TResult> onFailure);
}
```

### C. Generic Pipeline & Resource Execution
```csharp
// Generic higher-order execution preserving compile-time type safety
public interface IConnectionPoolManager
{
    IMongoClient GetClient(MongoClusterTier tier);
    TResult WithClient<TResult>(MongoClusterTier tier, Func<IMongoClient, TResult> func);
    Task<TResult> WithClientAsync<TResult>(MongoClusterTier tier, Func<IMongoClient, Task<TResult>> func);
}
```

---

## 3. Regulatory Alignment (FDA 21 CFR Part 11 & GAMP 5)
- Functional immutability eliminates race conditions, cache contamination, and accidental mutation of audit trail records.
- Deterministic, generic data pipelines guarantee bit-for-bit repeatability across validation environments (GAMP 5 Category 4/5 qualification).
