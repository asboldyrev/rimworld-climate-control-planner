# Current project status

Last updated: 2026-10-02

## Active roadmap stage

The vanilla cooling domain model is implemented on the current work branch and is ready for owner verification.

The first heating calculator UI is now part of the accepted `dev` baseline.

## Current accepted baseline

The application now includes:

- working user-facing vanilla heating calculator;
- framework-independent shared rectangular climate scenario;
- source-backed Heater, Campfire, Cooler and Passive Cooler primitives;
- heating-capacity use-cases;
- cooling-demand and minimum Cooler/Passive Cooler use-cases;
- explicit hot-side temperature modeling for Cooler;
- source-backed Cooler efficiency including the 40 C hot-side penalty floor;
- Passive Cooler 17 C lower-limit planning behavior;
- domain regression tests for both heating and cooling.

Cooling is not yet exposed in the Vue UI.

## Verified cooling reference scenarios

For a 10x10 room with single walls, ordinary roof and 40 C outdoors:

At a 20 C target:

- cooling demand: about 14.16 heat/s removed;
- Cooler hot side defaults to 40 C;
- Cooler efficiency: about 84.62%;
- minimum Cooler count: 1.

At a -10 C freezer target with the same 40 C hot side:

- minimum Cooler count: 3.

At a 17 C Passive Cooler target:

- two Passive Coolers are required by the current average-capacity model;
- targets below 17 C are unreachable.

## Immediate next work

1. Build the user-facing cooling calculator UI.
2. Expose Cooler and Passive Cooler recommendations alongside the existing room inputs.
3. Make the Cooler hot-side assumption visible and allow it to diverge from outdoors when appropriate.
4. Add frontend interaction tests for cooling.
5. After the cooling slice is usable, start room coupling / ventilation.

## Known blockers

None currently.
