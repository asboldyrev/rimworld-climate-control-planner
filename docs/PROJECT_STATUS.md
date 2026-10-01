# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Documentation and rewrite foundation.

The repository currently contains the old Vue calculator designed around the Centralized Climate Control mod. It is not the architecture to preserve.

The new implementation has not yet replaced the legacy application.

## Current accepted baseline

The following direction is accepted for the rewrite:

- vanilla RimWorld is implemented first;
- Centralized Climate Control support is deferred until the vanilla calculator is stable;
- the frontend target stack is Vue + Pinia + Tailwind CSS + shadcn-vue + `@lucide/vue`;
- Vue Router is optional and should be introduced only if the application benefits from multiple routes;
- calculation rules should be isolated from presentation/state-management code;
- verified RimWorld mechanics, not legacy mod formulas or rough area-only heuristics, are the authority for calculations;
- the existing project is a rewrite source/reference, not a compatibility constraint.

ADR 0001 records the vanilla-first rewrite boundary.

## Current repository state

The legacy application currently uses Vue/Pinia with Bulma and Remix Icon and has no documentation foundation equivalent to the newer project workflow.

Those dependencies and structures may be removed or replaced during the rewrite. Their presence does not make them accepted target architecture.

## Immediate next work

1. Establish `dev` as the integration branch and use short-lived `agent/*` / `feature/*` branches.
2. Replace the legacy frontend foundation with the accepted target stack.
3. Introduce an initial automated test baseline for the calculation core before implementing substantial climate formulas.
4. Define the first vanilla calculation model and its verified constants/rules.
5. Build the first end-to-end calculator slice around that model.

## Known blockers

None currently.
