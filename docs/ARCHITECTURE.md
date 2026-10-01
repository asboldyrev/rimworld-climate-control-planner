# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now and the accepted rewrite direction. Planned changes are explicitly marked as target/future and must not be presented as already implemented.

## Current repository shape

The repository currently contains a legacy Vite + Vue application created for the Centralized Climate Control mod.

Current code includes Vue components, Pinia stores, composables and constants. The current package manifest still includes Bulma and Remix Icon.

This legacy structure is reference material during the rewrite, not an architectural compatibility requirement.

## Accepted target shape

The rewrite should separate UI/state concerns from RimWorld calculation rules.

```text
Vue UI / shadcn-vue components
              |
              v
      application state
          (Pinia)
              |
              v
     calculator use-cases
              |
              v
    vanilla calculation core
       / rules / constants
              |
              v
     deterministic results
```

The calculation core must not depend on Vue, Pinia, browser storage or component state.

## Frontend

Target frontend technologies:

- Vue;
- Vite;
- Tailwind CSS;
- shadcn-vue;
- `@lucide/vue`;
- Pinia for shared state;
- Vue Router only if route-level application structure becomes useful.

Component code should primarily handle presentation and user interaction. Non-trivial calculation logic belongs outside components.

## State ownership

Use local component state for local UI details.

Use Pinia for state that must be shared across meaningful application boundaries, such as the active calculator configuration or persisted user configuration.

Do not put the thermal simulation/calculation engine inside a Pinia store. Stores may invoke calculation use-cases and keep their results, but domain rules must remain separately testable.

## Calculation domain

The calculation domain should expose explicit input and output models rather than relying on UI-shaped objects.

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

Exact types and naming should be determined during implementation.

## Vanilla ruleset

Vanilla RimWorld mechanics are the primary calculation ruleset.

Constants and formulas should have clear provenance. Avoid unexplained magic numbers scattered through UI code.

A future version may centralize source metadata near constants or in dedicated research documentation so changes between RimWorld versions can be audited.

## Future mod rulesets

Centralized Climate Control support is a future extension.

Prefer a separate module/ruleset boundary such as:

```text
calculator core
├── vanilla rules
└── mod rules
    └── centralized-climate-control
```

This is a conceptual boundary, not a mandatory folder layout.

Do not create abstraction layers before they solve a real shared problem. The vanilla implementation should remain straightforward even if future mod support requires adapters.

## Persistence

Browser persistence is not part of the calculation authority.

If configuration persistence/export/import is retained from the old calculator, persistence should serialize stable application-domain configuration rather than internal component/store implementation details.

Version persisted/exported formats if compatibility becomes important.

## Routing

Vue Router is optional.

Do not add routing solely because it is in the preferred stack. Introduce it when there are distinct navigation surfaces such as calculator, documentation/help, saved configurations or settings that benefit from URLs/history.

## No backend requirement

The current product direction does not require a backend. Keep the application client-side unless a concrete product requirement justifies server-side infrastructure.

A backend, account system, telemetry service or cloud storage must not be introduced speculatively.

## Architecture change policy

Current structure belongs in this document. Long-term decisions with meaningful alternatives/trade-offs also require an ADR.

Future architecture must remain clearly labeled until implemented.
