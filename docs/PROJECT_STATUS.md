# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Vanilla heating model is implemented on the current work branch and is ready for owner verification.

The calculation-engine foundation is now part of the accepted `dev` baseline.

## Current accepted baseline

The rewrite now includes:

- Vue + Pinia + Tailwind CSS + shadcn-vue-compatible local UI + Lucide frontend foundation;
- Vitest/Vue Test Utils/jsdom automated-test foundation;
- framework-independent vanilla climate domain under `src/domain/climate/vanilla`;
- RimWorld **1.6.4850** as the supported calculation baseline;
- source/provenance policy through ADR 0002 and `docs/RIMWORLD_TEMPERATURE_MODEL.md`;
- tested low-level room thermal primitives;
- tested Heater and Campfire device primitives;
- deterministic rectangular-room heating capacity model;
- minimum Heater/Campfire count use-cases;
- maximum average-power Heater equilibrium calculation;
- ADR 0003 defining the average-power planning model instead of pretending unknown Thing hash offsets are known.

The UI still intentionally has no real calculator form/results. The next product step is to connect this heating model to the Vue UI, or proceed with cooling-domain mechanics if UI work is intentionally deferred.

## Verified reference scenario

For a 10x10 room, one wall layer, full thin roof, -30 C outdoors and +20 C target:

- natural loss: about 70.8 energy per 120 ticks;
- required heating: about 35.4 heat/s;
- one Heater: insufficient;
- two Heaters: sufficient;
- one-Heater maximum average-power equilibrium: about -0.339 C.

## Immediate next work

1. Build the first user-facing heating calculator form/result using the new use-cases.
2. Surface assumptions, power margin and unreachable/non-thermostatic warnings.
3. Add frontend interaction tests for the heating flow.
4. After the heating slice is usable, start Cooler and Passive Cooler mechanics.

## Known blockers

None currently.
