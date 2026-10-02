# ADR 0004: Explicit thermal zones for room coupling

Status: accepted

Date: 2026-10-02

## Context

The first calculator stages model one isolated room. Vanilla Vent, doors and Cooler hot-side exhaust connect temperatures between distinct rooms.

Representing those effects as ad-hoc extra heat-loss coefficients on one room would hide where energy moves and would make future multi-room calculations difficult to audit.

RimWorld itself performs Vent equalization between Room objects found around the building.

## Decision

Room-to-room climate mechanics are represented as explicit **thermal zones**.

A thermal zone has at least:

- temperature;
- cell count / thermal capacity;
- whether it uses outdoor temperature rather than mutable room temperature.

Coupling mechanisms such as Vent operate on zones and return temperature/energy changes for each affected zone.

The source-faithful Vent primitive models one exact `EqualizeTemperaturesThroughBuilding(..., rate: 14, twoWay: true)` pulse.

Capacity planning for several Vent buildings will be implemented separately from this exact pulse primitive because each Vent runs on a hash-offset `TickRare` schedule. The planner must not invent exact Thing IDs or pulse phases.

## Consequences

- Heat transferred by Vent between two ordinary rooms can be checked for energy conservation.
- Small and large rooms respond differently according to cell count.
- Outdoor-temperature zones can participate in the source algorithm without being mutated.
- Vacuum behavior remains explicit rather than hidden in a generic heat-loss coefficient.
- Cooler hot-side temperature can later reference a real thermal zone instead of remaining only a scalar UI input.
- Doors can reuse the generic building-equalization primitive later while supplying their own rate/cadence/two-way behavior.
