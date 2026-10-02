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

Status: completed.

## 8. Room coupling and ventilation

Status: in progress.

### 8.1 Thermal-zone and exact Vent foundation

Status: completed on the current work branch; awaiting owner verification/merge.

- Explicit thermal-zone representation.
- Source-faithful `EqualizeTemperaturesThroughBuilding` primitive.
- Vent rate 14 wrapper.
- Different room-size behavior and overshoot limiting.
- Outdoor-temperature-room behavior.
- Vacuum directional factor.
- Domain regression tests.

### 8.2 Two-room capacity planning

Status: next.

- Define deterministic multiple-Vent planning model.
- Combine room natural exchange with Vent transfer.
- Calculate steady/sustainable conditions for two connected rooms.
- Integrate Heater/Cooler capacity with the coupled system.

### 8.3 Multi-room calculator UI

Status: planned.

- Add adjacent-room configuration.
- Add Vent count.
- Explain which room contains climate-control devices.
- Present cross-room heat-transfer breakdown.
- Add frontend interaction tests.

### 8.4 Doors

Status: planned separately after Vent.

- Research door definition rates/cadences.
- Implement open/closed door coupling only after source behavior is fully documented.

## 9. Extended calculator UX and persistence

Status: planned.

- Add richer room/environment configuration as the domain model expands.
- Re-evaluate local persistence/export/import after the input model stabilizes.
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
