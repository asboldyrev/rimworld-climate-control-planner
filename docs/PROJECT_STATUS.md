# Current project status

Last updated: 2026-10-02

## Active roadmap stage

The first user-facing vanilla cooling calculator UI is implemented on the current work branch and is ready for owner verification.

Heating and cooling domain models are both part of the accepted `dev` baseline.

## Current accepted baseline

The application now includes:

- working vanilla heating calculator UI;
- working vanilla cooling calculator UI;
- mode switch between heating and cooling;
- source-backed Heater, Campfire, Cooler and Passive Cooler domain models;
- shared rectangular-room climate geometry/environment model;
- explicit Cooler hot-side temperature handling;
- user-visible Cooler efficiency and cooling-demand breakdown;
- Passive Cooler 17 C limitation and non-thermostatic warning;
- frontend interaction tests covering both calculator modes.

The current user-facing model still assumes an isolated rectangular room without doors, adjacent thermal zones or vents.

## Cooling UI reference scenario

Default cooling inputs:

- room: 10x10;
- outdoors: +40 C;
- target: +20 C;
- single walls;
- ordinary thin roof;
- Cooler hot side: outdoors (+40 C).

Displayed result:

- 100 room cells;
- approximately 14.16 heat/s must be removed;
- Cooler efficiency: about 84.6%;
- 1 Cooler;
- 2 Passive Coolers.

The user can decouple the Cooler hot side from outdoor temperature and enter a custom hot-side temperature.

## Immediate next work

1. Verify the cooling UI manually at desktop/mobile widths.
2. Start the room-coupling / ventilation domain model.
3. Define adjacent thermal zones and Vent equalization behavior.
4. Reuse the existing explicit Cooler hot-side concept where room-to-room exhaust is modeled.
5. Add user-facing room-coupling inputs only after the domain model is source-backed and tested.

## Known blockers

None currently.
