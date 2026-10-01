# Current project status

Last updated: 2026-10-02

## Active roadmap stage

Calculation-engine foundation is implemented on the current work branch and is ready for owner verification.

The frontend foundation is now treated as the accepted `dev` baseline.

## Current accepted baseline

The rewrite now includes:

- Vue + Pinia + Tailwind CSS + shadcn-vue-compatible local UI + Lucide frontend foundation;
- Vitest/Vue Test Utils/jsdom automated-test foundation;
- framework-independent vanilla climate domain under `src/domain/climate/vanilla`;
- RimWorld **1.6.4850** as the initial supported calculation baseline;
- documented source/provenance policy through ADR 0002 and `docs/RIMWORLD_TEMPERATURE_MODEL.md`;
- tested low-level room temperature primitives for wall/roof exchange and controlled temperature changes;
- tested Heater and Campfire low-level behavior;
- explicit separation between source-faithful thermal rules and the simplified first rectangular-room geometry helper.

The UI still intentionally contains no real calculator inputs/results. That belongs to the heating-model stage after the core can determine device requirements.

## Immediate next work

1. Compose room losses and heating output into a deterministic room simulation/use-case.
2. Determine stable/equilibrium temperature for a chosen device count.
3. Find the minimum Heater/Campfire count needed to reach a target.
4. Define result/warning contracts for unreachable or marginal targets.
5. Connect the first heating use-case to the Vue UI.

## Known blockers

None currently.
