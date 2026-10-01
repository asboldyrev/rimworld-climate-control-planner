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

The calculation engine is the highest-value automated-test target.

Pure domain tests live under `tests/domain/` and must not require Vue mounting or browser state.

Current source-backed coverage includes:

- rectangular room geometry helper;
- adjusted extreme outdoor-temperature difference;
- thin/no/thick roof equalization;
- low-level wall equalization;
- simple single/double outdoor wall sample behavior;
- thermostat-controlled temperature change;
- Heater efficiency and TickRare output;
- Campfire heat-push behavior.

When a source-backed mechanic is implemented, add deterministic tests for its important boundaries and representative numeric examples.

## Source-backed scenarios

Expected behavior should be traceable to game code, maintained documentation or controlled in-game verification.

Tests must not merely encode whatever the current implementation happens to return.

`docs/RIMWORLD_TEMPERATURE_MODEL.md` is the human-readable source map for implemented mechanics.

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

## Numerical comparisons

Use exact equality for values that are structurally exact integers/flags.

Use `toBeCloseTo` for floating-point thermal calculations. Prefer enough precision to catch a changed game coefficient rather than masking it with a large tolerance.

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

When introduced, it should run on pull requests targeting `dev` and `main` and should include `npm test` plus `npm run build`.

## Verification truthfulness

Do not claim a command/test passed unless it was actually run successfully.

Update this document when frameworks, locations, canonical commands, CI gates, numerical-validation policy or the definition of critical coverage changes.
