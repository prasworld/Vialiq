# Copilot instructions for Vialiq

## Engineering values
- Assume the user has deep front-end experience (20+ years). Don't avoid basics and focus on architectural/behavioral correctness.
- Prefer **composition over inheritance**; prefer **functional programming** and reusable abstractions over duplicating code.
- When appropriate, model behavior using FP concepts (functors/monads, algebraic patterns, lawful combinators). Keep abstractions understandable and justified.

## Research and decision-making
- **Do not assume.** If requirements are unclear or behavior depends on product decisions, ask targeted questions before implementing.
- For non-trivial/unknown topics (Lit behavior, browser quirks, accessibility, performance), **research thoroughly online first** and cite/reflect what matters.
- Propose options/tradeoffs and recommend one.

## Web components (Lit 3)
- Use **Lit 3** best practices and design patterns for highly usable, extensible components.
- Treat components as reusable products: accessibility, keyboard support, events, slots, theming, and clear public APIs matter.
- Favor small composable primitives, predictable reactivity, and clear state boundaries.

## Quality gates
- Any behavior change requires **corresponding unit tests** (and/or integration tests when appropriate).
- Prefer clean code: small pure functions, explicit types, predictable side effects, and strong naming.

## Repo etiquette / GitHub operations
- **Do not commit, push, or open PRs** unless the user explicitly asks.
- If changes are needed, provide a patch/snippets and explain where they go.

## Nx workspace conventions
- Use Nx commands for tasks (build/test/lint). Prefer affected targets when appropriate.
- Respect module boundaries between `apps/` and `libs/`.