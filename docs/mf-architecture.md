# Module‑Federation (MF) architecture — workspace reference

This document describes the Module‑Federation (MF) architecture used in this repo, how `shell` (host) and `remote` apps are organized, and step‑by‑step commands for creating / running / testing MF apps with Nx.

## Architecture overview
- Pattern: Host (a.k.a. shell) + one or more Remotes (producer apps).
- Host responsibilities:
  - Compose UI and route to remote modules.
  - Provide shared dependency configuration.
  - Serve as single entry point for the product shell.
- Remote responsibilities:
  - Expose federated modules (Angular components/modules/routes) via `remoteEntry`.
  - Be independently developed and built.

## Current workspace (standard Nx MF layout)
- apps/shell — Module‑Federation host (runs at http://localhost:4200)
- apps/remote1 — example remote (runs at http://localhost:4201)
- apps/* projects use `@nx/angular` webpack executors + `@nx/module-federation` config files

## Key files to inspect
- `apps/shell/module-federation.config.ts` — host remotes list
- `apps/remote1/module-federation.config.ts` — remote `exposes` map
- `apps/shell/webpack.config.ts` and `apps/remote1/webpack.config.ts` — custom webpack hooks
- `tsconfig.base.json` — path mapping for remote exposes (e.g. `remote1/Routes`)

## How MF wiring works (high level)
- Remote exposes a symbol (example: `./Routes`) in `module-federation.config.ts`.
- Host's route lazy-load uses the remote import, e.g.:
  - loadChildren: () => import('remote1/Routes').then(m => m.remoteRoutes)
- At runtime the host loads the remote's `remoteEntry` and resolves the exposed symbols.

## Commands — generate / run / test
- Create host under `apps/`:
  - nx g @nx/angular:host shell --directory=apps --remotes=remote1
  - or: nx g @nx/angular:host apps/shell --remotes=apps/remote1

- Create a remote and attach to a host:
  - nx g @nx/angular:remote remote2 --directory=apps --host=shell

- Run locally (dev):
  - Start remote(s): `npx nx serve apps/remote1 --port=4201`
  - Start host: `npx nx serve apps/shell --port=4200`
  - Open host and verify it lazy‑loads remotes (http://localhost:4200)

- Production build:
  - nx build apps/remote1 --configuration=production
  - nx build apps/shell --configuration=production
  - Serve production artifacts with `nx run <project>:serve-static`

- Unit tests (remote/host):
  - nx test apps/remote1
  - nx test apps/shell

- E2E (Playwright):
  - Add an `e2e` project for the host (if needed) and run `nx e2e <host>-e2e`

## TypeScript path mapping (recommended)
- Use `tsconfig.base.json` to map remote expose entrypoints for IDE/TS support:
  - Example: "remote1/Routes": ["apps/remote1/src/app/remote-entry/entry.routes.ts"]

## Adding more remotes (quick)
1. nx g @nx/angular:remote remoteX --directory=apps --host=shell
2. Add route in `apps/shell/src/app/app.routes.ts` to lazy‑load `remoteX` via the mapped import.
3. Start remote & host and verify.

## CI / Production notes
- CI should build remotes first, then host. Example workflow step order:
  1. nx affected:build --base=origin/main --target=build --projects=remote*
  2. nx build shell --configuration=production
  3. Run tests and e2e against built artifacts (or run e2e in CI using served dev servers)
- Share deps carefully (peer versions, singletons like Angular core).

## Troubleshooting tips
- "Cannot find module 'remote1/Routes'": check `tsconfig.base.json` path entry and `module-federation.config.ts` `exposes` path.
- If host doesn't load remote at runtime: verify remote dev server is running and remote's `remoteEntry` is accessible (http://localhost:4201/remoteEntry.mjs).
- Clear Nx cache if strange build artifacts persist: `npx nx reset`.

## Where to record architecture decisions
- Use `docs/` for all architecture and technical artifacts (this file is `docs/mf-architecture.md`).
- Add RFCs or design docs as new markdown files under `docs/` and reference them from the README.

---
If you'd like, I can:
- add an `apps/shell-e2e` Playwright project and an example test, or
- add a second example remote and a demo route to the shell.
Tell me which next step you want.