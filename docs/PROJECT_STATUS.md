# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Frontend rewrite foundation is implemented on the current work branch and is ready for owner verification.

The legacy Centralized Climate Control UI has been removed from the active application. The app now uses the accepted vanilla-first frontend foundation.

## Current accepted baseline

The current rewrite baseline includes:

- Vue + Pinia on Vite;
- Tailwind CSS v4 through the Vite plugin;
- shadcn-vue project configuration and local UI primitives;
- `@lucide/vue` as the icon library;
- Vitest + Vue Test Utils + jsdom as the frontend/unit test foundation;
- no Vue Router yet because the application still has one navigation surface;
- no active Bulma or Remix Icon dependency;
- no active legacy CCC calculator components, stores, constants or calculation composables.

Calculation rules remain intentionally absent from this stage. The next implementation stage is the framework-independent vanilla calculation core.

ADR 0001 remains the authority for the vanilla-first rewrite boundary.

## Immediate next work

1. Define the first calculation-domain inputs/results independently from Vue and Pinia.
2. Add source-backed vanilla RimWorld constants and provenance.
3. Implement/test the room thermal model needed for heating.
4. Implement Heater and Campfire behavior.
5. Build the first end-to-end heating calculator slice on top of the calculation core.

## Known blockers

None currently.
