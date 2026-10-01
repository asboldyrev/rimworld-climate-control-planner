# ADR 0003: Average-power model for climate capacity planning

Status: accepted

Date: 2026-10-02

## Context

RimWorld does not update every temperature mechanism on the same tick schedule.

Natural room equalization runs every 120 ticks at a fixed map-level phase. Heater/Cooler `TickRare` runs every 250 ticks and individual things can be hash-offset. Campfire heat pushes run every 60 ticks and are also object-scheduled.

A planner knows room geometry and device counts, but it does not know the future in-game thing IDs/hash phases of devices. Attempting to reproduce exact pulse timing would therefore manufacture precision that the user's input cannot determine.

## Decision

Capacity planning and target-sustainability calculations use **average device energy over the 120-tick natural-equalization interval**.

Source-faithful temperature-dependent efficiency/cutoff rules still apply at the evaluated room temperature.

The model therefore compares:

- source-backed natural room energy change over 120 ticks;
- average device energy available during the same 120 ticks.

This model is used to answer questions such as minimum device count and maximum average-power equilibrium.

Low-level source-faithful pulse behavior remains separately implemented/tested where useful, such as Heater TickRare and Campfire heat-push primitives.

## Consequences

- Device-count results are deterministic and independent of unknowable Thing hash offsets.
- Results model thermal capacity, not the exact short-term temperature ripple seen between individual in-game pulses.
- Thermostat devices can be evaluated for whether they have enough capacity to sustain a requested target.
- Campfire results must explicitly state that the device is not thermostat-controlled.
- Later in-game validation should compare both recommended counts and expected temperature bands, not require tick-for-tick pulse identity.
