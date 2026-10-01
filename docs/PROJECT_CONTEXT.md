# RimWorld Climate Control Planner project context

## Product

RimWorld Climate Control Planner is a browser-based calculator for planning heating and cooling in RimWorld.

The project is a vanilla-first rewrite of an older calculator centered on the Centralized Climate Control mod. That old implementation is legacy reference material rather than a compatibility target.

The product direction is:

1. implement accurate support for vanilla RimWorld climate-control mechanics;
2. build the calculator around a reusable, testable thermal/calculation engine;
3. add mod support later as an extension without contaminating vanilla rules.

The calculator should answer practical planning questions such as how many heating or cooling devices are required for a room under specified conditions and explain the assumptions behind the result.

## Supported RimWorld baseline

The initial calculation baseline targets **RimWorld 1.6.4850**.

ADR 0002 defines the version/source policy. `docs/RIMWORLD_TEMPERATURE_MODEL.md` records implemented mechanics, constants, sources and accuracy boundaries.

## Current product scope

The vanilla rewrite targets:

- heater;
- cooler;
- passive cooler;
- vent;
- campfire;
- room size and geometry where required by the simulation;
- indoor target temperature;
- outdoor temperature;
- roof/wall heat exchange and other vanilla factors required for a useful result.

Exact supported inputs and mechanics must be derived from verified RimWorld behavior and accepted calculation decisions.

## Repository and stack

The project is a client-side Vue application built with Vite.

Current technologies:

- Vue;
- Pinia;
- Tailwind CSS;
- shadcn-vue-compatible local UI components;
- `@lucide/vue`;
- Vitest + Vue Test Utils + jsdom.

Vue Router is intentionally absent until multiple URL-addressable application surfaces justify it.

## Calculation authority

The calculation engine is based on verified RimWorld mechanics rather than informal rules of thumb when reliable source data is available.

Preferred evidence, in descending order:

1. current/decompiled vanilla game logic for the supported RimWorld version;
2. official or authoritative game data where available;
3. RimWorld Wiki and other maintained references for confirmation/explanation;
4. controlled in-game observations when source behavior needs validation.

Every important constant or non-obvious rule used by the calculator should be traceable to documented source material or an accepted ADR/research note.

## Vanilla and mod boundaries

Vanilla rules are the primary domain model.

Future Centralized Climate Control support must be implemented as a separate ruleset/adapter/module where practical. A mod-specific concept must not silently alter vanilla calculations.

If shared abstractions are introduced, they should express generic calculator concepts rather than forcing vanilla mechanics into the shape of the old mod.

## Product direction

The immediate goal is not feature parity with the legacy calculator. The goal is a clean vanilla-first rewrite with reliable calculations, clear UX, and a foundation that can later host additional RimWorld/mod rulesets.

The authoritative execution order is `docs/ROADMAP.md`; the current checkpoint is `docs/PROJECT_STATUS.md`; calculation and UI test expectations are defined in `docs/TESTING.md`.
