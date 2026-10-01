# RimWorld Climate Control Planner

A browser-based planner for calculating heating and cooling requirements in RimWorld.

The repository currently contains a legacy calculator built for the Centralized Climate Control mod. The project is being rewritten with a **vanilla-first** calculation model. Mod support is planned later as a separate extension.

## Target stack

- Vue
- Pinia
- Tailwind CSS
- shadcn-vue
- `@lucide/vue`
- Vue Router when application routing is actually needed
- Vite

## Project documentation

Start here:

- `AGENTS.md` — mandatory rules for AI-assisted repository work;
- `docs/PROJECT_CONTEXT.md` — stable product and technical context;
- `docs/PROJECT_STATUS.md` — current phase, checkpoint and immediate next task;
- `docs/ROADMAP.md` — high-level rewrite stages;
- `docs/ARCHITECTURE.md` — current repository shape and accepted rewrite boundaries;
- `docs/DEVELOPMENT.md` — practical development workflow;
- `docs/TESTING.md` — calculation/frontend regression strategy;
- `docs/GITFLOW.md` — branch, integration and future CI/release policy;
- `docs/DOCUMENTATION.md` — authoritative documentation maintenance rules;
- `docs/decisions/` — architecture decision records (ADRs);
- `BACKLOG.md` — deferred work that must not be lost.

For a new AI-assisted conversation, inspect the latest `dev`, start with `AGENTS.md`, read the linked project documentation and determine the current checkpoint from `docs/PROJECT_STATUS.md` before proposing changes.

## Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Additional test/lint/type-check commands will be documented as the rewrite foundation introduces them.

## Branching

The intended workflow is:

- `main` — stable/release-ready code;
- `dev` — integration branch;
- `feature/*` and `agent/*` — short-lived branches created from and merged into `dev`.

See `docs/GITFLOW.md` and `AGENTS.md` before making changes.
