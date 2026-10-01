# Development workflow

## Prerequisites

Use a current Node.js/npm version supported by the project's Vite/Vue toolchain.

Install dependencies with:

```bash
npm install
```

Start local development with:

```bash
npm run dev
```

Run automated tests with:

```bash
npm test
```

Use watch mode during implementation with:

```bash
npm run test:watch
```

Build the production bundle with:

```bash
npm run build
```

## Working branch

Development follows the branch policy in `docs/GITFLOW.md`.

Normal work:

1. update local `dev`;
2. create a focused `feature/*` or `agent/*` branch from `dev`;
3. implement one coherent change;
4. run relevant verification;
5. update project documentation when its owned truth changed;
6. hand the branch/PR to the repository owner for review and merge.

Do not implement ordinary work directly on `main`.

## Rewrite rule

The old calculator is not a migration target that must remain backward-compatible.

Before reusing legacy code, determine whether it still fits:

- the vanilla-first product model;
- the accepted target stack;
- the separated calculation-engine architecture.

Prefer deleting/replacing stale mod-specific assumptions over wrapping them in new UI.

## Frontend conventions

Current frontend stack:

- Vue;
- Pinia;
- Tailwind CSS v4;
- shadcn-vue-compatible local UI components;
- `@lucide/vue`;
- Vitest + Vue Test Utils for tests.

Vue Router should only be added when route-level separation is useful.

Prefer shadcn-vue primitives/components for supported UI controls before creating parallel bespoke component systems.

Use Lucide icons through `@lucide/vue`; do not introduce another general-purpose icon set without a concrete need.

Keep domain calculations out of Vue SFC templates and component event handlers.

## Adding shadcn-vue components

The repository contains `components.json` and the standard aliases required by shadcn-vue.

When the CLI is available locally, components can be added with:

```bash
npx shadcn-vue@latest add <component>
```

Review generated files before commit and keep only components that are actually used.

## Calculation implementation

Calculation work should be implemented from verified RimWorld mechanics.

For every non-obvious formula or constant:

- identify its source;
- encode it in a testable domain module;
- add representative automated tests;
- document a durable modeling assumption when it is not directly dictated by game code.

When approximation is necessary, make the approximation explicit in code/docs/results rather than presenting it as exact game behavior.

## Dependency policy

Do not retain a legacy dependency merely because the old application used it.

Bulma and Remix Icon were removed with the frontend rewrite foundation.

Avoid large utility libraries for logic that is small, stable and easier to own directly.

## Documentation check

Before handing off a branch, use the checklist in `docs/DOCUMENTATION.md` and update only the documents whose owned truth changed.
