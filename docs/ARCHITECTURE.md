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

The UI now exposes three surfaces from `App.vue`:

- isolated heating;
- isolated cooling;
- connected rooms.

`MultiRoomCalculator.vue` owns only connected-room form state and presentation. It switches internally between coupled heating and coupled cooling.

It constructs the existing domain plans and presents their results; it does not implement thermal formulas.

The connected-room UI exposes room geometry/material assumptions, Vent count, device-side/placement information, thermostat setpoints and per-room targets.

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

## Coupled cooling

`coupledCooling.js` models a Cooler between explicit cold-side and hot-side thermal zones.

It owns:

- exact source-faithful Cooler pulse behavior between two rooms;
- full-capacity hot-side heat output when a Cooler pulse is active;
- expected multi-Cooler cadence over a 120-tick planning interval;
- optional Vent interaction between the same rooms;
- convergence of cold/exhaust room temperatures;
- minimum Cooler-count search subject to both the cold-room maximum and exhaust-room maximum.

The isolated-room cooling UI may still use a scalar hot-side temperature. The coupled-room planner uses a real thermal zone instead.

## Doors

Doors remain separate from Vent. They may reuse the generic building-equalization primitive but need source-backed rate/cadence/state behavior.

## Persistence, routing and backend

Persistence remains deferred.

Vue Router remains unnecessary while the product is one calculator surface.

No backend is required.
