# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Coupled-room heating and cooling capacity planning are implemented on the current work branch and ready for owner verification.

The two-room Vent heating planner is part of the accepted `dev` baseline.

## Current accepted baseline

The domain now includes:

- exact thermal-zone/Vent primitives;
- deterministic multiple-Vent planning;
- two-room Heater simulation and minimum-count search;
- exact Cooler pulse behavior between two mutable rooms;
- Cooler hot-side heat injection into a real adjacent thermal zone;
- deterministic multiple-Cooler cadence planning;
- two-room cooling simulation with optional Vent coupling;
- minimum Cooler-count search that also respects the exhaust-room maximum temperature.

No multi-room UI exists yet.

## Verified coupled-room reference scenarios

Heating:

- two 10x10 rooms;
- -30 C outdoors;
- room A Heater setpoint/target 25 C;
- room B target 15 C;
- 2 Vent;
- minimum Heater count: 4.

Cooling:

- two 10x10 rooms;
- 40 C outdoors;
- cold-room target/setpoint 20 C;
- indoor exhaust-room maximum 100 C;
- no Vent;
- minimum Cooler count: 3.

## Immediate next work

1. Build the first multi-room/Vent UI on top of the completed coupled-room domain.
2. Expose room A / room B configuration and Vent count.
3. Expose where Heater/Cooler is located and the relevant thermostat/setpoint.
4. Present unreachable states caused by insufficient Vent coupling or overheating of a Cooler exhaust room.
5. Keep doors as a separate later sub-stage.

## Known blockers

None currently.
