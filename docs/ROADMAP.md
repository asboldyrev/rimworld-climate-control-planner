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

Status: completed.

### 8.2 Coupled-room capacity planning

Status: completed on the current work branch; awaiting owner verification/merge.

Completed:

- deterministic multiple-Vent cadence model;
- sequential exact-pulse handling for multiple expected Vent pulses;
- two-room natural heat exchange + Vent simulation;
- Heater thermostat/capacity integration;
- minimum Heater count search;
- target-unreachable detection caused by insufficient temperature gradient;
- ADR 0005 documenting the Vent cadence approximation.

Additional completed cooling work:

- exact Cooler pulse between explicit cold/hot thermal zones;
- source-faithful hot-side heat injection;
- deterministic multi-Cooler cadence planning;
- two-room cooling convergence;
- minimum Cooler count with exhaust-room maximum constraints;
- optional Vent interaction between cold and exhaust rooms.

### 8.3 Multi-room calculator UI

Status: completed on the current work branch; awaiting owner verification/merge.

- Add adjacent-room configuration.
- Add Vent count.
- Explain which room contains climate-control devices.
- Present cross-room heat-transfer breakdown.
- Add frontend interaction tests.

### 8.4 Doors

Status: next.

- Research door definition rates/cadences.
- Implement open/closed door coupling only after source behavior is fully documented.

## 9. Extended calculator UX and persistence

Status: planned.

## 10. Validation and vanilla release baseline

Status: planned.

## 11. Mod support

Status: deferred until the vanilla baseline is stable.
