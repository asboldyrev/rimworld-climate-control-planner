# Current project status

Last updated: 2026-10-02

## Active roadmap stage

The first multi-room/Vent calculator UI is implemented on the current work branch and is ready for owner verification.

Coupled-room heating and cooling capacity planning are part of the accepted `dev` baseline.

## Current accepted baseline

The application now exposes three calculator surfaces:

- isolated-room heating;
- isolated-room cooling;
- two connected thermal zones.

The connected-room UI supports:

- separate room A / room B dimensions;
- separate wall and roof configuration;
- shared outdoor temperature;
- Vent count;
- Heater placement in room A or B;
- Heater thermostat setpoint;
- minimum-temperature targets for both heated rooms;
- Cooler cold-side room selection;
- Cooler thermostat setpoint;
- maximum temperature for the cold room and exhaust room;
- stable modeled temperatures for both rooms;
- unreachable-state messaging when Vent coupling or exhaust constraints prevent the requested targets.

The UI calls the existing coupled-room domain use-cases directly and does not duplicate thermal formulas.

## Default multi-room reference scenarios

Heating:

- two 10x10 rooms;
- -30 C outdoors;
- room A minimum/setpoint 25 C;
- room B minimum 15 C;
- 2 Vent;
- Heater in room A;
- result: 4 Heater.

Cooling:

- two 10x10 rooms;
- +40 C outdoors;
- room A cold-side maximum/setpoint 20 C;
- room B exhaust maximum 100 C;
- 0 Vent;
- result: 3 Cooler.

## Immediate next work

1. Manually verify multi-room layout at desktop/mobile widths.
2. Research and implement vanilla door temperature coupling as the remaining planned room-coupling mechanism.
3. After doors, start broader vanilla validation against representative in-game scenarios.
4. Revisit persistence/export only after the final room-input model is stable.

## Known blockers

None currently.
