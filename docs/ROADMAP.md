# RimWorld Climate Control Planner roadmap

This file tracks major project stages, not individual PRs. Fine-grained deferred work belongs in `BACKLOG.md`; the immediate execution checkpoint belongs in `PROJECT_STATUS.md`.

## 1. Documentation and repository workflow foundation

Status: completed.

## 2. Frontend rewrite foundation

Status: completed.

- Legacy mod-oriented application surface removed.
- Vue + Pinia + Tailwind CSS + shadcn-vue-compatible UI + Lucide foundation established.
- Vitest/Vue Test Utils/jsdom test foundation established.
- Vue Router intentionally deferred until needed.

## 3. Calculation-engine foundation

Status: completed on the current work branch; awaiting owner verification/merge.

- Framework-independent vanilla domain core introduced.
- RimWorld 1.6.4850 selected as the initial calculation baseline.
- Source-backed constants and provenance documentation added.
- Room temperature primitives implemented.
- Heater and Campfire low-level behavior implemented.
- Deterministic domain regression tests added.
- Simplified rectangular geometry is explicitly separated from source-faithful thermal formulas.

## 4. Vanilla heating model

Status: next.

- Compose low-level primitives into room heat-loss/output simulation.
- Determine equilibrium/stable temperature.
- Calculate minimum Heater/Campfire count for a target.
- Define unreachable/unsafe result handling.
- Build the first end-to-end heating calculator slice.

## 5. Vanilla cooling model

Status: planned.

- Support vanilla cooler including efficiency behavior.
- Support passive cooler and its operational limits.
- Model hot-side/cold-side constraints where required.
- Protect calculations with regression tests against verified scenarios.

## 6. Room coupling and ventilation

Status: planned.

- Support vents as heat-transfer devices rather than heat producers.
- Define representation of adjacent rooms/thermal zones.
- Account for doors or other coupling behavior only where it materially affects supported calculations.
- Validate multi-room scenarios against game behavior.

## 7. Calculator UX and persistence

Status: planned.

- Build clear room/environment/device inputs.
- Provide understandable recommendations and assumptions.
- Support useful result breakdowns instead of a single unexplained number.
- Add local persistence/export/import only after the rewrite data model is stable and if still useful.
- Ensure responsive desktop/mobile behavior.

## 8. Validation and vanilla release baseline

Status: planned.

- Compare representative calculator scenarios with verified in-game behavior.
- Resolve known formula/model discrepancies.
- Harden error/edge-state UX.
- Finalize vanilla documentation and calculation-source notes.
- Prepare a stable vanilla-first release.

## 9. Mod support

Status: deferred until the vanilla baseline is stable.

- Reintroduce Centralized Climate Control as a separate ruleset/integration.
- Reuse generic calculator abstractions only where they genuinely fit both vanilla and mod mechanics.
- Do not alter vanilla behavior to simplify mod support.
- Add mod-specific tests and documentation independently from vanilla rules.
