# ADR 0005: Average Vent cadence for multi-room planning

Status: accepted

Date: 2026-10-02

## Context

The source-faithful Vent primitive models one exact `TickRare` equalization pulse.

A Vent runs every 250 ticks with a Thing hash offset. Natural room equalization runs every 120 ticks. A planner knows Vent count but does not know the future in-game Thing IDs and therefore cannot know exact pulse phases.

Simply multiplying one Vent pulse by the expected number of pulses can also be wrong for small rooms or many vents, because the exact source pulse contains nonlinear overshoot protection.

## Decision

Multi-room capacity planning uses the expected number of Vent pulses during one 120-tick natural-equalization interval:

```text
expected pulses = ventCount * 120 / 250
```

The deterministic planner applies:

1. the integer number of expected pulses sequentially using the exact source-faithful Vent primitive;
2. the fractional remainder as the corresponding fraction of one additional exact pulse.

For example:

```text
1 Vent  -> 0.48 expected pulses / interval
2 Vents -> 0.96
3 Vents -> 1.44
5 Vents -> 2.40
```

This preserves the per-pulse overshoot protection better than multiplying the first pulse by Vent count.

## Consequences

- Results are deterministic without inventing Thing hash phases.
- Multiple Vent planning remains tied to the exact source-level equalization primitive.
- Very short-term temperature ripple is intentionally not reproduced.
- Capacity results should be interpreted as long-run planning behavior.
- If later in-game validation reveals systematic bias from this cadence approximation, this ADR should be superseded rather than silently changing the model.
