# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Thermal-zone foundation and source-faithful Vent pulse behavior are implemented on the current work branch and are ready for owner verification.

Heating and cooling calculator UIs are part of the accepted `dev` baseline.

## Current accepted baseline

The application includes:

- user-facing vanilla heating and cooling calculators;
- source-backed isolated-room heating/cooling domain models;
- exact RimWorld temperature input bounds in the domain and whole-degree UI bounds;
- explicit thermal-zone domain objects for room coupling;
- a source-faithful generic building temperature-equalization pulse;
- a Vent wrapper using vanilla rate 14 and two-room coupling;
- regression tests for energy transfer, different room sizes, overshoot prevention, outdoor-temperature rooms and vacuum behavior;
- ADR 0004 defining explicit thermal zones as the multi-room architecture.

No multi-room planner/use-case or Vent UI exists yet. The new primitives model a single equalization pulse, not the averaged effect of an arbitrary count of hash-offset Vent buildings.

## Immediate next work

1. Build a deterministic two-room planning model on top of exact Vent pulses.
2. Define how multiple Vent buildings are represented under the existing average-power planning policy.
3. Combine each room's natural wall/roof exchange with Vent coupling.
4. Add Heater/Cooler capacity planning across two connected rooms.
5. Only then expose adjacent-room/Vent inputs in the UI.

## Known blockers

None currently.
