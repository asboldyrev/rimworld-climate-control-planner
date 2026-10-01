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

Status: completed.

## 6. Vanilla cooling model

Status: completed.

## 7. Cooling calculator UI

Status: completed on the current work branch; awaiting owner verification/merge.

- Heating/Cooling mode switch added.
- Cooler and Passive Cooler recommendations exposed.
- Cooling demand displayed.
- Cooler efficiency displayed.
- Hot-side temperature defaults to outdoors but can be configured separately.
- Passive Cooler 17 C limitation surfaced.
- Frontend interaction regression tests added.

## 8. Room coupling and ventilation

Status: next.

- Support Vent as a heat-transfer device rather than a heat producer.
- Define adjacent thermal zones.
- Model room-to-room temperature equalization.
- Add doors/other coupling only where source behavior is understood and tested.
- Reuse explicit Cooler hot-side thermal-zone concepts where appropriate.

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
