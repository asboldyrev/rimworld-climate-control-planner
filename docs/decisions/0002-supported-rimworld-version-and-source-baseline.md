# ADR 0002: Supported RimWorld version and calculation source baseline

Status: accepted

Date: 2026-10-02

## Context

The calculator aims to reproduce vanilla RimWorld climate behavior closely enough to make device-count recommendations useful.

Temperature formulas and constants can change between game versions. Without an explicit supported version and source baseline, future work could mix values from different releases or silently change existing calculations.

## Decision

The initial vanilla calculator targets **RimWorld 1.6.4850**.

Calculation mechanics should be verified primarily against current decompiled vanilla game behavior, with official release information and maintained RimWorld Wiki data used for version/device-value confirmation.

The initial decompiled source snapshot is:

`Chillu1/RimWorldDecompiled@2d508035082e7cb0c8e29e230d26bda6e546928f`

inspected on 2026-10-02.

Important constants and non-obvious mechanics must be recorded in `docs/RIMWORLD_TEMPERATURE_MODEL.md` and protected by automated tests.

The project must not copy or redistribute game source code. The source is a behavioral reference used to implement original calculator logic.

## Consequences

- Calculation changes caused by a newer RimWorld version require explicit source review.
- A version upgrade should update the supported-version constant, source documentation and affected regression tests together.
- Approximation layers, such as simplified rectangular room geometry, must be identified separately from source-faithful low-level formulas.
- Future mod rulesets must state which vanilla/game version they extend or override.
