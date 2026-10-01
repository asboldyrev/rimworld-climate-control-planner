# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current shape

The application now has a complete first vertical slice:

```text
App.vue
  |
  v
HeatingCalculator.vue
  |
  v
framework-independent heating use-cases
  |
  v
source-backed vanilla thermal core
```

The Vue layer owns form state and presentation only. Thermal formulas and device recommendations remain in the domain layer.

## Frontend

Current frontend technologies:

- Vue;
- Vite;
- Pinia;
- Tailwind CSS v4;
- shadcn-vue-compatible local UI components;
- `@lucide/vue`;
- Vitest/Vue Test Utils/jsdom.

Vue Router remains intentionally absent while there is one calculator surface.

## Heating UI state

The first heating calculator keeps its state local to `HeatingCalculator.vue`.

This is intentional: there is currently no meaningful cross-route or cross-component shared calculator state that would justify a Pinia store.

Pinia remains available for future state that genuinely crosses application boundaries.

## Calculation boundary

`HeatingCalculator.vue` may:

- normalize UI values;
- construct a supported heating scenario;
- invoke domain use-cases;
- format results for display.

It must not duplicate or reimplement:

- wall/roof thermal formulas;
- device efficiency/cutoff logic;
- minimum-count calculations;
- equilibrium logic.

Those remain under `src/domain/climate/vanilla`.

## Current user-facing model

The UI currently exposes only combinations that the domain model explicitly supports:

- isolated rectangular rooms;
- width/height geometry;
- one- or two-layer exterior walls;
- full thin roof;
- full thick roof;
- fully open roof;
- fixed outdoor temperature;
- heating target temperature.

The UI does not simulate partial/mixed roofs, doors, neighboring rooms or vents yet.

## Result contract

The heating UI presents:

- room area;
- required heat/s at target temperature;
- wall and roof temperature change per 120 ticks;
- minimum Heater count;
- Heater power margin;
- minimum Campfire count;
- Campfire non-thermostatic warning;
- unreachable device state where relevant.

## Testing boundary

Frontend tests verify that changing UI inputs changes visible results according to the domain use-cases.

They do not reproduce domain arithmetic inside the test suite; detailed numerical mechanics remain covered by `tests/domain/`.

## Future cooling and multi-room rules

Cooling is the next domain expansion. It must be source-backed and tested before being exposed in the UI.

Ventilation and adjacent rooms remain later thermal-zone features.

## Persistence, routing and backend

Persistence is deferred until the input model stabilizes.

Vue Router is only added when genuinely separate URL-addressable surfaces exist.

No backend is required by the current product direction.
