# RimWorld Climate Control Planner roadmap

This file tracks major project stages, not individual PRs. Fine-grained deferred work belongs in `BACKLOG.md`; the immediate execution checkpoint belongs in `PROJECT_STATUS.md`.

## 1. Documentation and repository workflow foundation

Status: completed.

- Project documentation structure and ownership rules are established.
- `dev` is the integration branch.
- Short-lived `feature/*` and `agent/*` branches target `dev`.
- ADR 0001 records the vanilla-first rewrite decision.

## 2. Frontend rewrite foundation

Status: completed on the current work branch; awaiting owner verification/merge.

- Legacy mod-oriented UI/application code is removed from the active frontend.
- Vue + Pinia remain the application foundation.
- Tailwind CSS v4 is configured.
- shadcn-vue project configuration and initial local UI primitives are present.
- `@lucide/vue` replaces Remix Icon.
- Vue Router remains intentionally absent until route-level separation is useful.
- Bulma and Remix Icon are removed from active dependencies.
- Vitest/Vue Test Utils/jsdom provide the initial automated test foundation.

## 3. Calculation-engine foundation

Status: next.

- Separate calculation/domain logic from Vue components and Pinia stores.
- Establish typed or explicitly validated domain inputs/results.
- Introduce a source/constant structure for verified RimWorld values.
- Add deterministic automated tests around the calculation engine.
- Define numerical tolerances and simulation/iteration rules where required.

## 4. Vanilla heating model

Status: planned.

- Implement verified room thermal behavior required for heating.
- Support vanilla heater.
- Support campfire.
- Account for room size/geometry, roof/wall exchange and relevant environmental inputs.
- Return both required device count and useful explanatory calculation details.

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
