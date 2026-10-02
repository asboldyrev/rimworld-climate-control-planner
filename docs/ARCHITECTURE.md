# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current layers

```text
Vue calculator UI
      |
      v
single-room heating/cooling use-cases
      |
      +--------------------+
      |                    |
      v                    v
room/device primitives   thermal-zone coupling primitives
                              |
                              v
                    Vent / future doors / zone links
```

All thermal/domain code remains framework-independent.

## User-facing calculator

The current UI has two modes:

- heating;
- cooling.

Each mode owns local form state. Pinia remains unused for calculator state because there is still no cross-surface state requirement.

The user-facing calculator currently models one isolated rectangular room.

## Single-room domain

The existing room/scenario/heating/cooling modules remain responsible for:

- rectangular room geometry;
- natural wall/roof exchange;
- Heater/Campfire behavior;
- Cooler/Passive Cooler behavior;
- single-room device-count recommendations.

## Thermal-zone domain

`src/domain/climate/vanilla/thermalZones.js` introduces explicit temperature zones for room coupling.

A zone contains:

- current temperature;
- cell count;
- optional identifier;
- `usesOutdoorTemperature` flag.

The generic `equalizeThermalZonesThroughBuildingPulse()` mirrors RimWorld's building equalization algorithm at the domain level:

- arithmetic mean of unique neighboring room temperatures;
- rate-based energy movement;
- global scale preventing any mutable room from overshooting the mean;
- no mutation of rooms using outdoor temperature;
- RimWorld vacuum factor for rooms losing heat.

`equalizeTwoRoomsThroughVentPulse()` supplies vanilla Vent rate 14.

## Exact pulse vs planner model

The thermal-zone primitive represents one source-faithful building equalization call.

Vent itself invokes this from `TickRare`, so different Vent buildings can have different hash phases. The exact pulse primitive must remain separate from the future deterministic capacity-planning approximation for multiple vents.

ADR 0004 records this boundary.

## Cooler hot side

The existing scalar Cooler hot-side temperature remains valid for the single-room UI.

Future coupled-room use-cases should allow that hot side to reference an explicit thermal zone. The source-backed Cooler formula itself should not change.

## Future two-room use-case

The next domain layer will combine:

- each room's natural wall/roof exchange;
- Vent coupling;
- device energy in one or both rooms;
- an average/deterministic planning model consistent with ADR 0003.

Only after that layer is tested should the UI expose adjacent-room and Vent-count controls.

## Doors

Doors also call RimWorld's generic building equalization function, but with definition-specific rates and different one-/two-way discovery behavior. They remain a separate later feature rather than being approximated as Vent.

## Persistence, routing and backend

Persistence remains deferred until the calculator input model stabilizes.

Vue Router is unnecessary while the product remains one calculator surface.

No backend is required by the current product direction.
