# Testing strategy

This document defines the regression strategy for the rewritten RimWorld Climate Control Planner.

## Current test foundation

The rewrite uses:

- Vitest as the test runner;
- Vue Test Utils for Vue component interaction tests;
- jsdom as the browser-like environment.

Canonical commands:

```bash
npm test
npm run test:watch
npm run build
```

Tests live under `tests/`.

## Calculation-core tests

Pure domain tests live under `tests/domain/` and must not require Vue mounting or browser state.

They protect source-backed mechanics, numerical boundaries and composed heating/cooling use-cases.

Current cooling-domain coverage includes:

- exact Cooler efficiency formula;
- hot-side 40 C penalty floor;
- zero-only efficiency clamp;
- Cooler TickRare cooling primitive;
- Passive Cooler strict >17 C activation;
- 10x10 hot-room cooling demand;
- minimum Cooler count for room-temperature and freezer scenarios;
- separate hot-side temperature effects;
- Passive Cooler 17 C planning floor and below-limit rejection.

Detailed arithmetic belongs here rather than in frontend tests.

## Frontend interaction tests

`tests/frontend/App.test.js` protects both user-facing calculator modes.

Heating coverage verifies:

- default 10x10 / -30 C / +20 C recommendation;
- room-size changes recalculate area/device count;
- double walls reduce required heating;
- Heater unreachable state above its effective cutoff;
- Campfire cutoff warning;
- invalid numeric input is handled without throwing;
- temperature inputs use whole-degree UI bounds of -273 C ... 1000 C while the domain preserves the exact -273.15 C ... 1000 C game bounds.

Cooling coverage verifies:

- mode switching;
- default 10x10 / +40 C / +20 C cooling recommendation;
- displayed Cooler efficiency;
- outdoor temperature used as hot side by default;
- custom hot-side temperature changes the recommendation;
- Passive Cooler below-17 C limitation;
- invalid numeric input is handled without throwing;
- custom Cooler hot-side UI input uses the whole-degree -273 C ... 1000 C range; domain tests protect the exact -273.15 C ... 1000 C bounds.

Frontend tests should assert user-visible behavior and representative results. They should not duplicate every domain numerical test.

## Source-backed scenarios

Expected behavior should be traceable to game code, maintained documentation or controlled in-game verification.

`docs/RIMWORLD_TEMPERATURE_MODEL.md` remains the source map for implemented mechanics.

When a game-version change alters verified mechanics, update source notes, tests and implementation together.

## Numerical comparisons

Use exact equality for structural values.

Use `toBeCloseTo` for floating-point thermal calculations with a tolerance tight enough to catch coefficient changes.

## Production build

A production build is a separate verification gate:

```bash
npm run build
```

Do not treat a successful build as proof that calculations are correct.

## Bug fixes

When a calculation or critical-flow bug is fixed, add regression coverage when practical.

## CI

CI is not yet established.

When introduced, it should run on pull requests targeting `dev` and `main` and include `npm test` plus `npm run build`.

## Verification truthfulness

Do not claim a command/test passed unless it was actually run successfully.
