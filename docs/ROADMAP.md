# RimWorld Climate Control Planner roadmap

This file tracks major project stages, not individual PRs. Fine-grained deferred work belongs in `BACKLOG.md`; the immediate execution checkpoint belongs in `PROJECT_STATUS.md`.

## 1. Documentation and repository workflow foundation

Status: completed.

## 2. Frontend rewrite foundation

Status: completed.

## 3. Calculation-engine foundation

Status: completed.

## 4. Vanilla heating model

Status: completed.

## 5. First heating calculator UI

Status: completed on the current work branch; awaiting owner verification/merge.

- Room width/height inputs.
- Outdoor and target temperature inputs.
- Single/double wall selection.
- Thin/thick/open roof selection supported by the current domain model.
- Minimum Heater and Campfire recommendations.
- Heat-loss and required-power breakdown.
- Heater unreachable state and Campfire non-thermostatic warnings.
- Component/interaction regression tests.

## 6. Vanilla cooling model

Status: next.

- Implement Cooler efficiency/hot-side behavior.
- Implement Passive Cooler limits.
- Define cooling demand and minimum device count use-cases.
- Protect the model with source-backed domain tests.

## 7. Cooling calculator UI

Status: planned.

- Add Cooler/Passive Cooler recommendations.
- Surface hot-side assumptions and unreachable conditions.
- Add UI interaction tests.

## 8. Room coupling and ventilation

Status: planned.

- Support vents as heat-transfer devices rather than heat producers.
- Define adjacent thermal zones.
- Add doors/room coupling only where source behavior is understood and tested.

## 9. Extended calculator UX and persistence

Status: planned.

- Add richer room/environment configuration as the domain model expands.
- Add local persistence/export/import only after the rewrite data model is stable and if still useful.
- Ensure responsive desktop/mobile behavior.

## 10. Validation and vanilla release baseline

Status: planned.

- Compare representative calculator scenarios with verified in-game behavior.
- Resolve model discrepancies.
- Harden edge-state UX.
- Prepare a stable vanilla-first release.

## 11. Mod support

Status: deferred until the vanilla baseline is stable.

- Reintroduce Centralized Climate Control as a separate ruleset/integration.
- Keep mod calculations independently tested/documented.
- Do not alter vanilla behavior to simplify mod integration.
