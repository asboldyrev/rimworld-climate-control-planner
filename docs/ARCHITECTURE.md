# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current shape

The application now has a framework-independent climate domain with a first composed heating use-case layer:

```text
Vue UI / shadcn-vue-compatible local components
              |
              v
      application state
          (Pinia)
              |
              v
  heating capacity use-cases
              |
              v
   source-backed vanilla core
```

Vue/Pinia do not participate in thermal calculations.

## Frontend

Current frontend technologies:

- Vue;
- Vite;
- Pinia;
- Tailwind CSS v4;
- shadcn-vue-compatible local UI components;
- `@lucide/vue`;
- Vitest/Vue Test Utils/jsdom.

Vue Router remains intentionally absent while there is one navigation surface.

## Calculation domain

The vanilla domain lives under:

```text
src/domain/climate/vanilla/
├── constants.js
├── devices.js
├── heating.js
├── room.js
└── index.js
```

Responsibilities:

- `constants.js` — supported game version and source-backed constants;
- `room.js` — source-backed room thermal primitives plus simple rectangular geometry helper;
- `devices.js` — source-backed device behavior primitives;
- `heating.js` — composed rectangular-room heating demand, capacity recommendations and Heater equilibrium;
- `index.js` — public domain exports.

The domain validates structural inputs itself and remains independent from form validation.

## Heating capacity model

Exact in-game device pulse phase cannot be inferred from ordinary planner inputs because rare ticks are hash-offset by individual Thing identity.

ADR 0003 therefore defines capacity planning in average energy over the same 120-tick interval used by natural room equalization.

This layer preserves temperature-dependent device efficiency/cutoffs but intentionally does not claim tick-for-tick temperature ripple.

Current heating result contracts expose:

- natural wall/roof temperature and energy change;
- required heating energy and heat/s;
- unit device effective capacity;
- device count;
- power margin;
- whether a target is sustainable;
- whether the device is thermostat-controlled;
- unreachable reason where applicable.

## Geometry accuracy boundary

The current composed heating model supports a simple isolated unobstructed rectangular room with one- or two-layer exterior walls and roof coverage fractions.

Source-faithful low-level formulas remain separate from the rectangular geometry helper so future room shapes, neighboring zones, doors and vents can extend the model without rewriting the thermal primitives.

## State ownership

Pinia is application infrastructure for shared UI/application state.

Thermal mechanics and capacity recommendations must not move into Pinia. Stores may hold user input and derived result snapshots only.

## Source/provenance boundary

`docs/RIMWORLD_TEMPERATURE_MODEL.md` records source files, formulas, timing assumptions and approximation boundaries.

ADRs 0002 and 0003 define the supported game baseline and planner time model.

## Future cooling and multi-room rules

Cooler/Passive Cooler behavior is the next domain expansion after the first heating UI slice.

Ventilation and adjacent rooms remain later features and must build on explicit thermal-zone boundaries rather than hidden assumptions in UI state.

## Future mod rulesets

Centralized Climate Control remains a future separate ruleset. Vanilla results must not change merely to simplify mod integration.

## Persistence, routing and backend

Persistence is deferred until the data model stabilizes.

Vue Router should be introduced only for genuinely distinct URL-addressable surfaces.

No backend is required by the current product direction.

## Architecture change policy

Current structure belongs in this document. Durable modeling decisions with meaningful alternatives/trade-offs require ADRs.
