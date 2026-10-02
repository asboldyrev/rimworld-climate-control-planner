# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Two-room Vent heating capacity planning is implemented on the current work branch and is ready for owner verification.

The exact thermal-zone/Vent foundation is now part of the accepted `dev` baseline.

## Current accepted baseline

The application/domain now includes:

- user-facing isolated-room heating and cooling calculators;
- source-backed room/device primitives;
- explicit thermal zones;
- exact single-pulse Vent behavior;
- deterministic multiple-Vent cadence model from ADR 0005;
- two-room heating simulation combining natural losses, Vent transfer and Heater thermostat/capacity;
- minimum Heater-count search for two Vent-connected rooms;
- unreachable-target detection when the selected thermostat setpoint cannot create enough temperature gradient.

No multi-room UI exists yet.

Two-room cooling with Cooler hot-side heat injection is not implemented yet and remains the next coupled-room domain task.

## Verified reference scenario

Two 10x10 rooms, both exposed to -30 C, single walls and ordinary roofs:

- room A Heater setpoint/target: 25 C;
- room B target: 15 C;
- Vent count: 2.

Result:

- minimum Heater count: 4.

With one Vent and the same 25 C Heater setpoint, room B cannot reach 15 C even with unlimited Heater capacity; its modeled limit is about 8.67 C.

## Immediate next work

1. Add two-room Cooler planning, including hot-side heat output into an adjacent thermal zone.
2. Verify Heater/Cooler coupled-room reference scenarios.
3. Then build the first multi-room/Vent UI.
4. Keep door coupling as a separate later sub-stage.

## Known blockers

None currently.
