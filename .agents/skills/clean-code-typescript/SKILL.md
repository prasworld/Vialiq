---
name: clean-code-typescript
description: >-
  A comprehensive guide for writing clean, maintainable, and modern TypeScript code.
  Use this skill to refactor existing code, perform code reviews, or when the user explicitly requests clean code principles.
---
# Clean Code TypeScript (Comprehensive)

This skill adapts the principles of Clean Code (inspired by Robert C. Martin and `labs42io/clean-code-typescript`) for the latest versions of TypeScript. It is an exhaustive checklist to follow during any refactoring or code generation.

## 1. Variables & Typing
- **NEVER use `any`:** Strict typing is the foundation of clean TypeScript. If you don't know the type, use `unknown` and perform type narrowing, or define a precise interface/type.
- **Use meaningful and pronounceable variable names:** `value, left, right` instead of `a1, a2, a3`.
- **Use the same vocabulary for the same type of variable:** Be consistent (e.g., choose `getUser` over mixing `getUserInfo` and `getUserData`).
- **Use searchable names:** Extract magic strings and numbers into properly named, capitalized `const` variables.
- **Use explanatory variables:** Destructure maps or complex arrays into named variables.
- **Avoid Mental Mapping:** Explicit is better than implicit (e.g. `user` instead of `u`).
- **Don't add unneeded context:** If the class is `Car`, the property should be `make`, not `carMake`.
- **Use default arguments:** Prefer `function load(count = 10)` over `count = count || 10`.
- **Use `enum` to document intent:** (Modern TS: `const enum` or Union Types like `"A" | "B"` are often preferred for bundle size and type-safety, use `satisfies` where appropriate).

## 2. Functions
- **Function arguments (2 or fewer ideally):** If >2, use an options object with destructuring.
- **Functions should do one thing:** Split functions doing multiple actions (SRP).
- **Function names should say what they do:** E.g., `addMonthToDate(date)` rather than `addToDate(date)`.
- **Functions should only be one level of abstraction:** E.g., a function shouldn't parse string characters and simultaneously make database queries.
- **Remove duplicate code:** Abstract into reusable utilities, classes, or types.
- **Set default objects:** Use destructuring or spread operator `...` over `Object.assign`.
- **Don't use flags as function parameters:** A boolean flag implies the function does more than one thing. Split it.
- **Avoid Side Effects:** 
  - Centralize file writing or network calls. 
  - Never mutate input arguments (e.g., `addItem(cart, item)` should return a cloned array `[...cart, item]`).
- **Don't write to global functions:** Don't pollute native prototypes (like `Array.prototype.diff`).
- **Favor functional programming:** Use `.map`, `.filter`, `.reduce` over imperative `for` loops.
- **Encapsulate conditionals:** Extract complex conditionals into well-named variables or functions.
- **Avoid negative conditionals:** `if (isNodeValid())` is better than `if (!isNodeInvalid())`.
- **Avoid conditionals (Polymorphism):** Use polymorphism/strategy patterns over giant `switch/case` statements.
- **Avoid type checking:** Rely on TypeScript's compiler (`typeof`, `instanceof` are okay for narrowing `unknown`, but avoid building architecture around manual type checking).
- **Remove dead code:** Delete unused code immediately.

## 3. Objects and Data Structures
- **Use iterators and generators:** For stream-like data.
- **Use getters and setters:** Encapsulate internal state mutations and side effects (but don't use them to do heavy async work silently).
- **Make objects have private/protected members:** Hide implementation details. 
  - *Modern TS:* Use native `#private` syntax for true runtime encapsulation over the `private` keyword.
- **Prefer immutability:** Use `readonly` properties, `Readonly<T>`, and `ReadonlyArray<T>` heavily.
- **`type` vs `interface`:** Use `interface` for public APIs and declaration merging; use `type` for complex unions, intersections, and utility mapped types.

## 4. Classes & SOLID
- **Classes should be small:** Limit responsibilities.
- **High cohesion and low coupling:** Classes should have few dependencies, and methods should utilize class fields efficiently.
- **Prefer Composition & Functional Programming over Classical Inheritance:**
  - **Pure Functions:** Functions should always return the same output given the same input, with zero side effects.
    ```typescript
    // Good: Pure function
    const calculateTax = (amount: number, rate: number) => amount * rate;
    ```
  - **Higher-Order Functions:** Functions that accept functions as arguments or return them.
    ```typescript
    const withLogging = <T>(fn: () => T) => () => {
      console.log('Executing...');
      return fn();
    };
    ```
  - **Currying & Composition:** Break complex functions into simpler, single-argument functions that can be composed.
    ```typescript
    const multiply = (a: number) => (b: number) => a * b;
    const double = multiply(2);
    ```
  - **Factory Functions & Object Composition:** Instead of deep `class` hierarchies with `extends` and brittle `super()` calls, use factory functions to compose behaviors dynamically.
    ```typescript
    const CanDrive = (state: { speed: number }) => ({
      drive: () => console.log(`Driving at ${state.speed}`)
    });
    const CanHonk = () => ({
      honk: () => console.log('Beep!')
    });
    
    // Composing objects via mixins rather than extending classes
    const createCar = (speed: number) => {
      const state = { speed };
      return { ...CanDrive(state), ...CanHonk() };
    };
    ```
  - **Functors & Monadic Patterns:** Encapsulate operations (like null-checks or async code) inside data types that expose `.map` or `.flatMap` (e.g., standard `Promise` or `Array`), allowing you to chain operations safely.
- **Use method chaining (Builder pattern):** Where it makes sense (e.g., `class Car { setMake() { return this; } }`).
- **SRP (Single Responsibility):** A class should only have one reason to change.
- **OCP (Open/Closed):** Open for extension, closed for modification.
- **LSP (Liskov Substitution):** Derived classes must be substitutable for their base classes.
- **ISP (Interface Segregation):** Don't force clients to depend on interfaces they don't use.
- **DIP (Dependency Inversion):** Depend on abstractions (interfaces), not concretions (implementations). Use DI/IoC containers where applicable.

## 5. Testing
- **The three laws of TDD:** Write failing test -> write code to pass -> refactor.
- **F.I.R.S.T. rules:** Fast, Independent, Repeatable, Self-Validating, Timely.
- **Single concept per test:** Don't test 5 unrelated things in one `it()` block.
- **Name reveals intention:** `it('should return null when user is not found')` rather than `it('handles missing user')`.

## 6. Concurrency & Error Handling
- **Prefer promises vs callbacks:** Say no to callback hell.
- **Async/Await:** Prefer `async/await` over raw Promise chaining for readability.
- **Always use `Error` for throwing/rejecting:** Never throw a string `throw "User not found"`. Always `throw new Error(...)`.
- **Don't ignore caught errors:** Log them or pass them up. `catch (e) { console.error(e) }` at a minimum.
- **Don't ignore rejected promises:** Always handle `.catch()` or use `try/catch` in async functions.
- *Modern TS:* Handle `e` in catch blocks as `unknown` (e.g., `if (e instanceof Error) { ... }`).
- *Modern TS:* Use `using` keyword for deterministic resource cleanup (`Symbol.dispose`).

## 7. Formatting & Comments
- **Consistent capitalization:** `camelCase` for variables/functions, `PascalCase` for classes/types, `UPPER_SNAKE_CASE` for global constants.
- **Callers and callees should be close:** Place functions near where they are called.
- **Organize imports:** Group external dependencies first, then internal modules.
- **Use typescript aliases:** Use `@/components` instead of `../../../../components`.
- **Self-explanatory code:** Code should read well without comments. Refactor poorly named functions rather than commenting them.
- **No commented out code:** Version control remembers.
- **No journal comments:** Don't write `/* Changed by John on 05/12 */`. Use Git.
- **Avoid positional markers:** Don't use `// === REGION ===`. Use smaller files instead.
- **TODO comments:** Useful for technical debt, but ensure they are tracked.
