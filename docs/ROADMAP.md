# RimWorld Climate Control Planner roadmap

This file tracks major project stages, not individual PRs. Fine-grained deferred work belongs in `BACKLOG.md`; the immediate execution checkpoint belongs in `PROJECT_STATUS.md`.

## 1. Documentation and repository workflow foundation

Status: completed.

## 2. Frontend rewrite foundation

Status: completed.

## 3. Calculation-engine foundation

Status: completed.

- Framework-independent vanilla domain core.
- RimWorld 1.6.4850 source baseline.
- Source-backed constants and low-level room/device primitives.
- Deterministic domain regression tests.

## 4. Vanilla heating model

Status: completed on the current work branch; awaiting owner verification/merge.

- Wall and roof losses composed into room heating demand.
- Average-power capacity model defined in ADR 0003.
- Minimum Heater count calculation implemented.
- Minimum Campfire capacity calculation implemented with non-thermostatic limitation.
- Maximum average-power Heater equilibrium implemented.
- Numeric end-to-end heating scenarios covered by tests.

## 5. First heating calculator UI

Status: next.

- Add room size, outdoor temperature and target temperature inputs.
- Add wall-layer and roof configuration inputs supported by the current domain model.
- Present minimum Heater/Campfire recommendations.
- Present energy-loss/output breakdown and power margin.
- Present unreachable and Campfire non-thermostatic warnings.
- Add component/interaction tests.

## 6. Vanilla cooling model

Status: planned.

- Support vanilla Cooler including efficiency behavior.
- Support Passive Cooler and its operational limits.
- Model hot-side/cold-side constraints where required.
- Protect calculations with regression tests against verified scenarios.

## 7. Room coupling and ventilation

Status: planned.

- Support vents as heat-transfer devices rather than heat producers.
- Define representation of adjacent rooms/thermal zones.
- Account for doors or other coupling behavior only where it materially affects supported calculations.
- Validate multi-room scenarios against game behavior.

## 8. Extended calculator UX and persistence

Status: planned.

- Add richer room/environment configuration as the domain model expands.
- Add local persistence/export/import only after the rewrite data model is stable and if still useful.
- Ensure responsive desktop/mobile behavior.

## 9. Validation and vanilla release baseline

Status: planned.

- Compare representative calculator scenarios with verified in-game behavior.
- Resolve known formula/model discrepancies.
- Harden error/edge-state UX.
- Finalize vanilla documentation and calculation-source notes.
- Prepare a stable vanilla-first release.

## 10. Mod support

Status: deferred until the vanilla baseline is stable.

- Reintroduce Centralized Climate Control as a separate ruleset/integration.
- Reuse generic calculator abstractions only where they genuinely fit both vanilla and mod mechanics.
- Do not alter vanilla behavior to simplify mod support.
- Add mod-specific tests and documentation independently from vanilla rules.
