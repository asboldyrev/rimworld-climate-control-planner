# Current project status

Last updated: 2026-10-02

## Active roadmap stage

The first user-facing vanilla heating calculator UI is implemented on the current work branch and is ready for owner verification.

The vanilla heating domain model is now part of the accepted `dev` baseline.

## Current accepted baseline

The application now includes:

- Vue + Pinia + Tailwind CSS + shadcn-vue-compatible local UI + Lucide frontend foundation;
- framework-independent vanilla thermal calculation domain;
- RimWorld 1.6.4850 source/provenance baseline;
- source-backed room thermal primitives and Heater/Campfire behavior;
- rectangular-room heating-capacity model;
- minimum Heater/Campfire recommendation use-cases;
- first interactive heating calculator screen;
- frontend interaction tests that verify calculator inputs update domain-backed results.

The current UI intentionally supports only the geometry/environment inputs implemented by the domain model:

- rectangular room width/height;
- outdoor and target temperature;
- one- or two-layer exterior walls;
- full thin roof, full thick roof, or no roof.

Doors, adjacent rooms, vents, partial mixed roof coverage and cooling are not yet part of the user-facing calculator.

## Current reference UI scenario

Default inputs:

- room: 10x10;
- outdoors: -30 C;
- target: +20 C;
- single walls;
- ordinary thin roof.

Displayed result:

- 100 room cells;
- approximately 35.4 heat/s required;
- 2 Heaters;
- 2 Campfires for average capacity, with a non-thermostatic warning.

## Immediate next work

1. Verify the heating UI manually on desktop/mobile widths.
2. Start the vanilla Cooler and Passive Cooler domain model.
3. Add cooling recommendations to the calculator after the domain model is source-backed and tested.
4. Keep ventilation/adjacent rooms as a later thermal-zone stage.

## Known blockers

None currently.
