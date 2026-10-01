# RimWorld Climate Control Planner

A browser-based planner for calculating heating and cooling requirements in RimWorld.

The project is being rewritten with a **vanilla-first** calculation model. The old Centralized Climate Control calculator has been removed from the active frontend; mod support is planned later as a separate extension.

## Current stack

- Vue
- Pinia
- Vite
- Tailwind CSS v4
- shadcn-vue project/component structure
- `@lucide/vue`
- Vitest + Vue Test Utils + jsdom

Vue Router is intentionally not installed yet because the application currently has one navigation surface.

## Project documentation

Start here:

- `AGENTS.md` — mandatory rules for AI-assisted repository work;
- `docs/PROJECT_CONTEXT.md` — stable product and technical context;
- `docs/PROJECT_STATUS.md` — current phase, checkpoint and immediate next task;
- `docs/ROADMAP.md` — high-level rewrite stages;
- `docs/ARCHITECTURE.md` — current architecture and boundaries;
- `docs/DEVELOPMENT.md` — practical development workflow;
- `docs/TESTING.md` — calculation/frontend regression strategy;
- `docs/GITFLOW.md` — branch, integration and future CI/release policy;
- `docs/DOCUMENTATION.md` — authoritative documentation maintenance rules;
- `docs/decisions/` — architecture decision records (ADRs);
- `BACKLOG.md` — deferred work that must not be lost.

For a new AI-assisted conversation, inspect the latest `dev`, start with `AGENTS.md`, read the linked project documentation and determine the current checkpoint from `docs/PROJECT_STATUS.md` before proposing changes.

## Local development

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run build
```

## Branching

- `main` — stable/release-ready code;
- `dev` — integration branch;
- `feature/*` and `agent/*` — short-lived branches created from and merged into `dev`.

See `docs/GITFLOW.md` and `AGENTS.md` before making changes.
