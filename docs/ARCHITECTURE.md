# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current shape

The current application has two intentionally separate layers:

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
   src/domain/climate/vanilla
    rules / constants / primitives
```

The vanilla calculation core now exists and has no Vue, Pinia, DOM or browser-storage dependency.

Calculator use-cases that select device counts and connect the domain core to UI state are the next layer to build.

## Frontend

Current frontend technologies:

- Vue;
- Vite;
- Pinia;
- Tailwind CSS v4 through `@tailwindcss/vite`;
- shadcn-vue project configuration and local component structure;
- `@lucide/vue`;
- Vitest/Vue Test Utils/jsdom for automated tests.

Vue Router is not installed because the application currently has one navigation surface.

## UI component boundary

UI primitives live in `src/components/ui`.

Application/domain components should compose these primitives instead of building a competing generic component system.

## State ownership

Pinia is application infrastructure for shared UI/application state.

Local UI state belongs in components.

Thermal mechanics must not live inside Pinia. Stores may hold calculator configuration/results and invoke use-cases, but domain rules remain framework-independent and directly testable.

## Calculation domain

The vanilla domain core lives under:

```text
src/domain/climate/vanilla/
├── constants.js
├── devices.js
├── room.js
└── index.js
```

Responsibilities:

- `constants.js` — supported game version and source-backed numeric constants;
- `room.js` — room geometry and low-level room temperature primitives;
- `devices.js` — device-specific source-backed behavior;
- `index.js` — public exports.

The domain layer validates its own primitive inputs and throws on structurally invalid values rather than relying on Vue form validation.

The current room geometry helper supports simple unobstructed rectangular rooms. Source-faithful thermal formulas are intentionally separated from this simplified geometry helper.

## Source/provenance boundary

`docs/RIMWORLD_TEMPERATURE_MODEL.md` records source files, formulas, constants and known approximation boundaries.

ADR 0002 pins the initial supported RimWorld version/source baseline.

Version upgrades must update code, documentation and affected tests together.

## Future calculator use-cases

The next application-independent layer will combine the primitives to answer user questions such as:

- whether a target temperature is reachable;
- equilibrium/stable temperature;
- minimum number of heaters/coolers;
- explanatory loss/output breakdown.

These use-cases must remain outside Vue components and Pinia stores.

## Future mod rulesets

Centralized Climate Control support remains a future extension.

Prefer a separate ruleset boundary such as:

```text
calculator core
├── vanilla rules
└── mod rules
    └── centralized-climate-control
```

Do not create abstraction layers before they solve a real shared problem.

## Persistence

Browser persistence is not part of the calculation authority.

Legacy autosave/export/import code was removed with the old UI. These capabilities may be reconsidered after the rewrite data model is stable.

## Routing

Vue Router is intentionally not part of the current foundation.

Introduce routing only when distinct application surfaces benefit from URLs and browser history.

## No backend requirement

The current product direction does not require a backend. Keep the application client-side unless a concrete product requirement justifies server-side infrastructure.

## Architecture change policy

Current structure belongs in this document. Long-term decisions with meaningful alternatives/trade-offs also require an ADR.

Future architecture must remain clearly labeled until implemented.
