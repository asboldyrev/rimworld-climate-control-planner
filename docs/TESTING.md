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

Pure domain tests live under `tests/domain/`.

Existing suites cover:

- room thermal primitives;
- heating devices/capacity;
- cooling devices/capacity;
- global temperature bounds;
- exact Vent/thermal-zone coupling;
- deterministic two-room Vent planning.

### Exact Vent tests

`vanilla-vent.test.js` protects source-level one-pulse behavior:

- rate 14;
- energy transfer;
- room-size response;
- overshoot prevention;
- outdoor-temperature zones;
- vacuum factor;
- room deduplication.

### Coupled-room planner tests

`vanilla-coupled-rooms.test.js` protects planning behavior:

- one Vent corresponds to 0.48 expected pulses per 120 ticks;
- multiple expected pulses are applied sequentially rather than by multiplying the first pulse;
- aggregate Vent transfer remains energy-conserving between two normal rooms;
- two-room Heater simulations converge;
- equal source/adjacent targets can be unreachable because Vent needs a gradient;
- the 10x10 / -30 C / 25→15 C / 2 Vent reference scenario requires 4 Heaters.

Exact-pulse tests and average-planner tests must remain separate.

## Frontend interaction tests

The UI still covers isolated-room heating/cooling only. No new frontend tests are required until multi-room controls are introduced.

## Source-backed scenarios

Expected behavior should remain traceable to game code or documented planning ADRs.

## Numerical comparisons

Use exact equality for structural values and `toBeCloseTo` for floating-point thermal results.

## Production build

`npm run build` remains a separate required verification gate.

## Verification truthfulness

Do not claim tests/build passed unless they were actually run successfully.
