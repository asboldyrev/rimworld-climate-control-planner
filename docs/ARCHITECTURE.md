# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current shape

The legacy Centralized Climate Control application surface has been removed from the rewrite branch.

The current frontend foundation is:

```text
Vue UI / shadcn-vue-compatible local components
              |
              v
      application state
          (Pinia)
              |
              v
     future calculator use-cases
              |
              v
    future vanilla calculation core
```

The calculation core is the next roadmap stage and does not exist yet.

## Frontend

Current frontend technologies:

- Vue;
- Vite;
- Pinia;
- Tailwind CSS v4 through `@tailwindcss/vite`;
- shadcn-vue project configuration and local component structure;
- `@lucide/vue`;
- Vitest/Vue Test Utils/jsdom for automated frontend/unit tests.

Bulma and Remix Icon are no longer part of the active dependency set.

Vue Router is not installed because the application currently has one navigation surface. It should be introduced only when distinct URL-addressable surfaces justify it.

## UI component boundary

shadcn-vue is used as a source/configuration model rather than a runtime component package. UI primitives live in `src/components/ui` and may be generated/updated through the shadcn-vue CLI.

Shared class composition is provided through `src/lib/utils.js`.

Application/domain components should compose these UI primitives instead of building a competing generic component system.

## State ownership

Pinia is installed as application infrastructure but shared stores should only be introduced for state that crosses meaningful component/application boundaries.

Local UI state belongs in components.

The future thermal simulation/calculation engine must not live inside Pinia. Stores may hold calculator configuration/results and call calculation use-cases, but domain rules must remain framework-independent and directly testable.

## Calculation domain

The calculation domain is the next implementation stage.

Expected conceptual inputs include:

- room geometry/area;
- outdoor temperature;
- target indoor temperature;
- wall/roof characteristics required by the supported model;
- selected climate-control device/ruleset;
- adjacent thermal zones when ventilation/multi-room calculations are supported.

Expected conceptual outputs include:

- required device count;
- whether the target is reachable under the modeled conditions;
- equilibrium/stable temperature where useful;
- warnings/limitations;
- calculation details needed to explain the recommendation.

Exact types and naming will be determined during calculation-engine implementation.

## Vanilla ruleset

Vanilla RimWorld mechanics are the primary calculation ruleset.

Constants and formulas must have clear provenance. Avoid unexplained magic numbers scattered through UI/state code.

## Future mod rulesets

Centralized Climate Control support remains a future extension.

Prefer a separate ruleset boundary such as:

```text
calculator core
├── vanilla rules
└── mod rules
    └── centralized-climate-control
```

This is a conceptual boundary, not a mandatory folder layout.

Do not create abstraction layers before they solve a real shared problem.

## Persistence

Browser persistence is not part of the calculation authority.

Legacy autosave/export/import code was removed with the old UI. These capabilities may be reconsidered after the rewrite data model is stable.

## Routing

Vue Router is intentionally not part of the current foundation.

Introduce routing only when distinct application surfaces such as calculator/help/saved configurations/settings benefit from URLs and browser history.

## No backend requirement

The current product direction does not require a backend. Keep the application client-side unless a concrete product requirement justifies server-side infrastructure.

A backend, account system, telemetry service or cloud storage must not be introduced speculatively.

## Architecture change policy

Current structure belongs in this document. Long-term decisions with meaningful alternatives/trade-offs also require an ADR.

Future architecture must remain clearly labeled until implemented.
