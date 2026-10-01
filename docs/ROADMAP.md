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

Status: completed on the current work branch; awaiting owner verification/merge.

- Shared rectangular climate scenario extracted from heating-specific code.
- Source-backed Cooler efficiency implemented.
- Cooler hot-side temperature modeled explicitly.
- Cooler cooling demand and minimum-count use-cases implemented.
- Passive Cooler strict source cutoff and 17 C planning floor implemented.
- Cooling domain regression tests added.

## 7. Cooling calculator UI

Status: next.

- Add Cooler and Passive Cooler recommendations.
- Surface cooling demand and Cooler efficiency.
- Surface/configure hot-side temperature assumption.
- Show Passive Cooler 17 C limitation.
- Add frontend interaction tests.

## 8. Room coupling and ventilation

Status: planned.

- Support vents as heat-transfer devices rather than heat producers.
- Define adjacent thermal zones.
- Add doors/room coupling only where source behavior is understood and tested.
- Reuse explicit Cooler hot-side zone concepts where appropriate.

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
