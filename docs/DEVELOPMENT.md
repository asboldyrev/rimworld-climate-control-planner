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

Build the production bundle with:

```bash
npm run build
```

Additional test/lint/type-check commands must be documented here when introduced.

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

Target frontend stack:

- Vue;
- Pinia;
- Tailwind CSS;
- shadcn-vue;
- `@lucide/vue`;
- Vue Router when needed.

Prefer shadcn-vue primitives/components for supported UI controls before creating parallel bespoke component systems.

Use Lucide icons through `@lucide/vue`; avoid introducing a second general-purpose icon set without a concrete need.

Keep domain calculations out of Vue SFC templates and component event handlers.

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

During the rewrite:

- remove Bulma once Tailwind/shadcn-vue replaces all remaining usage;
- remove Remix Icon once Lucide replaces all remaining usage;
- add Vue Router only if needed;
- avoid large utility libraries for logic that is small, stable and easier to own directly.

## Documentation check

Before handing off a branch, use the checklist in `docs/DOCUMENTATION.md` and update only the documents whose owned truth changed.
