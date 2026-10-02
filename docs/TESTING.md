# Testing strategy

This document defines the regression strategy for the rewritten RimWorld Climate Control Planner.

## Current test foundation

The rewrite uses Vitest, Vue Test Utils and jsdom.

Canonical commands:

```bash
npm test
npm run test:watch
npm run build
```

Tests live under `tests/`.

## Domain tests

Pure domain tests live under `tests/domain/` and must not depend on Vue or browser state.

Existing suites cover:

- room thermal primitives;
- heating devices and capacity planning;
- cooling devices and capacity planning;
- global temperature bounds;
- Vent/thermal-zone coupling.

### Vent/thermal-zone coverage

`tests/domain/vanilla-vent.test.js` verifies:

- vanilla Vent rate 14;
- equal/opposite energy transfer between two normal rooms;
- temperature response for different room cell counts;
- global scaling that prevents a small room from overshooting the arithmetic mean;
- participation of an outdoor-temperature room without mutating it;
- the directional 0.1 vacuum factor;
- no-op behavior when only one unique room resolves around the building;
- shared temperature-bound validation.

These tests protect the exact single-pulse primitive. Future multiple-Vent/capacity tests belong in a separate coupled-room planning suite rather than weakening the exact source-level expectations.

## Frontend interaction tests

`tests/frontend/App.test.js` protects the user-facing heating and cooling calculator flows.

The UI does not expose Vent/multi-room controls yet, so this stage does not require new frontend tests.

## Source-backed scenarios

Expected behavior should be traceable to game code, maintained documentation or controlled in-game verification.

`docs/RIMWORLD_TEMPERATURE_MODEL.md` is the source map for implemented mechanics.

## Numerical comparisons

Use exact equality for structural values and `toBeCloseTo` for floating-point thermal calculations with tight tolerances.

## Production build

A successful `npm run build` is required as a separate verification gate but does not prove thermal correctness.

## Bug fixes

Calculation or critical-flow bug fixes should add regression coverage when practical.

## CI

CI is not yet established. When introduced, it should run `npm test` and `npm run build` for pull requests targeting `dev` and `main`.

## Verification truthfulness

Do not claim a command/test passed unless it was actually run successfully.
