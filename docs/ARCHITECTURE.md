# RimWorld Climate Control Planner architecture

This document describes the architecture that exists now. Planned changes must be explicitly marked as future/considered and should not be presented as implemented.

## Current layers

```text
Vue calculator UI
      |
      v
isolated-room heating/cooling use-cases
      |
      +---------------------------+
      |                           |
      v                           v
room/device primitives     coupled-room planner
                                  |
                                  v
                         thermal-zone/Vent primitives
```

All thermal/domain code remains framework-independent.

## User-facing calculator

The current UI still exposes isolated-room heating and cooling only.

Multi-room/Vent inputs remain intentionally absent until coupled heating and cooling domain behavior is complete.

## Thermal-zone and Vent primitives

`thermalZones.js` owns the exact source-faithful building equalization pulse and Vent rate 14 wrapper.

These primitives do not know about UI, Heater count or long-run planning cadence.

## Coupled-room planner

`coupledRooms.js` owns deterministic long-run planning across two explicit rooms.

Current responsibilities:

- average expected Vent cadence over the 120-tick planning interval;
- sequential application of exact Vent pulses for whole expected pulses;
- fractional application of one additional exact pulse;
- natural wall/roof exchange for each room;
- average Heater capacity and thermostat compensation;
- convergence to a steady planning state;
- minimum Heater-count search;
- detection that targets are unreachable even with unlimited Heater capacity at the chosen thermostat setpoint.

ADR 0005 documents why the planner uses expected Vent pulse count instead of exact hash phases.

## Heater thermostat and adjacent-room targets

The Heater room's thermostat setpoint is distinct from the adjacent room's minimum target.

This distinction is necessary because Vent requires a temperature gradient to transfer heat. Equal desired temperatures do not imply that one heated room can hold another lossy room at the exact same temperature.

## Future coupled cooling

The existing single-room Cooler model already exposes cold-side capacity, hot-side temperature and hot-side heat output.

The next coupled-room layer will replace the scalar hot-side assumption with an explicit thermal zone where appropriate and inject Cooler hot-side heat into that zone.

## Doors

Doors remain separate from Vent. They may reuse the generic building-equalization primitive but need source-backed rate/cadence/state behavior.

## Persistence, routing and backend

Persistence remains deferred.

Vue Router remains unnecessary while the product is one calculator surface.

No backend is required.
