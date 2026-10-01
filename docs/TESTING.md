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

The first frontend foundation test verifies that the active application is the vanilla-first rewrite shell rather than the removed legacy mod calculator.

## Primary testing priority: calculation core

The calculation engine is the highest-value automated-test target.

Tests should be deterministic and independent from Vue components.

Protect:

- individual verified constants/formulas;
- heater and cooler device behavior;
- passive-cooler/campfire limits;
- room heat-loss/heat-gain calculations;
- cooler efficiency behavior;
- ventilation/multi-room transfer when supported;
- numerical convergence/equilibrium rules when iterative simulation is used;
- edge cases such as unreachable target temperatures;
- regressions discovered by comparison with RimWorld behavior.

## Source-backed scenarios

Where practical, maintain a small set of representative scenarios whose expected behavior is traceable to game code, reliable documentation or controlled in-game verification.

Tests should not merely encode whatever the current implementation happens to return.

When a game-version change alters verified mechanics, update source notes, tests and implementation together.

## Frontend tests

Use component/interaction tests for critical user flows rather than exhaustive visual snapshots.

Protect interactions such as:

- editing room/environment inputs updates results correctly;
- switching device/ruleset options does not retain invalid stale state;
- validation errors preserve user-entered configuration;
- persisted/imported configurations restore safely if those features are implemented;
- important warnings and impossible-target states are surfaced correctly.

Pure CSS/layout adjustments generally do not require new tests unless they alter interaction semantics.

## Production build

A production build is a separate verification gate:

```bash
npm run build
```

Do not treat a successful build as proof that calculations are correct.

## Bug fixes

When a calculation or critical-flow bug is fixed, add regression coverage when practical so the same behavior cannot silently return.

## CI

CI is not yet established.

When introduced, it should run on pull requests targeting `dev` and `main` and should include `npm test` plus `npm run build`. Do not add a permanently failing required gate.

## Verification truthfulness

Do not claim a command/test passed unless it was actually run successfully.

Update this document when frameworks, locations, canonical commands, CI gates, numerical-validation policy or the definition of critical coverage changes.
