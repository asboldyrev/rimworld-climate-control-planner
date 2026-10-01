# RimWorld vanilla temperature model

This document records the source-backed temperature mechanics currently implemented by the calculator core.

## Supported game version

The calculation baseline targets **RimWorld 1.6.4850**, released by Ludeon Studios on 2026-06-08.

The decompiled source snapshot used for code-level verification is commit:

`2d508035082e7cb0c8e29e230d26bda6e546928f`

from `Chillu1/RimWorldDecompiled`, inspected on 2026-10-02.

The decompiled repository is used as a behavioral reference only. Game code is not copied into this project.

## Primary source files

Current mechanics are derived from these RimWorld classes:

- `Verse/RoomTempTracker.cs`
- `Verse/Room.cs`
- `Verse/GenTemperature.cs`
- `RimWorld/Building_Heater.cs`
- `RimWorld/Building_Cooler.cs`
- `RimWorld/Building_Vent.cs`
- `Verse/CompHeatPusher.cs`

Reference repository:

https://github.com/Chillu1/RimWorldDecompiled

Device definition values are cross-checked against RimWorld Wiki pages/properties:

- Heater: https://rimworldwiki.com/wiki/Heater
- Cooler: https://rimworldwiki.com/wiki/Cooler
- Passive cooler: https://rimworldwiki.com/wiki/Passive_cooler
- Campfire: https://rimworldwiki.com/wiki/Campfire
- Heat-per-second property: https://rimworldwiki.com/wiki/Property:Heat_Per_Second

## Room temperature storage

RimWorld stores one temperature value for a room.

Direct heat pushes change room temperature by:

```text
temperature change = energy / room cell count
```

Room temperature is clamped by the game to -273.15 C ... 1000 C.

## Temperature equalization interval

Natural room equalization is calculated on a 120-tick interval.

At 60 game ticks per second this is 2 in-game seconds of simulation time.

## Outdoor-temperature adjustment

For an absolute indoor/outdoor difference below 100 C, the raw difference is used.

For larger differences RimWorld accelerates the excess difference:

```text
if abs(diff) < 100:
    adjusted = diff
else:
    adjusted = sign(diff) * 100
             + 5 * (diff - sign(diff) * 100)
```

This is implemented by `adjustedOutdoorTemperatureDifference()`.

## Roof exchange

Current source constants:

| Mechanism | Per-tick rate |
| --- | ---: |
| thin roof | 0.00005 |
| no roof | 0.0007 |
| thick roof, normal map | 0.00005 |
| thick roof, underground map | 0.002 |

Thin/no-roof exchange uses the adjusted outdoor temperature difference and the relevant roof coverage fraction.

No roof therefore has 14x the per-tick exchange rate of an ordinary thin roof for equal coverage.

### Thick roof

Thick roof does not use outdoor temperature in the same way.

It pulls temperatures **down toward 15 C only when the room is above 15 C**. In the current source it does not warm a room that is colder than 15 C.

Underground maps use the much larger 0.002 rate.

## Wall exchange

The low-level wall formula is:

```text
change =
    average sampled temperature delta
    * equalize cell count
    * 120
    * 0.00017
    / room cell count
```

The game derives equalization samples from room geometry.

For the calculator's first rectangular-room model, an unobstructed rectangle uses:

```text
equalize samples = 2 * (width + height)
```

This is an application geometry helper, not a universal replacement for RimWorld's region scan.

### Standard double-wall case

When the second sampled cell is blocked instead of belonging to a directly readable adjacent room, the source falls back to a 50% interpolation toward outdoor temperature.

For a simple isolated rectangular room this makes the standard double-wall outdoor sample use half the single-wall temperature delta.

This behavior is intentionally represented as a separate helper so the low-level wall formula remains faithful to the source.

## Controlled temperature devices

`GenTemperature.ControlTemperatureTempChange` divides available energy by room cell count and clamps the change so a thermostat-controlled device does not cross its target temperature.

This primitive is used by Heater and Cooler.

## Heater

Definition value:

```text
heat per second = +21
```

The Heater runs on `TickRare` (250 ticks), so at full efficiency one update has:

```text
21 * (250 / 60) = 87.5 energy
```

Efficiency:

- below 20 C: 100%;
- 20 C ... 120 C: linear falloff;
- above 120 C: 0%.

The thermostat then limits the final temperature change to the configured target.

## Campfire

Definition values:

```text
heat per second = +21
stops starting new heat pushes at 28 C
```

Campfire uses `CompHeatPusher`, which pushes heat every 60 ticks.

Unlike Heater, this is not a thermostat-clamped temperature change. If the room is slightly below 28 C, the final heat push can overshoot 28 C; subsequent pushes then stop.

## Cooler, passive cooler and vent

Their constants are already recorded in `src/domain/climate/vanilla/constants.js`, but their calculation behavior is intentionally deferred to their roadmap stages.

Current verified values:

- Cooler: -21 heat/s, 1.25 hot-side heat multiplier, efficiency loss 1/130 per degree of relevant temperature difference;
- Passive cooler: -11 heat/s, stops cooling at 17 C;
- Vent: equalization rate 14.

## Accuracy boundary

The current core implements source-faithful low-level primitives plus the first simple rectangular-room geometry helper.

It does **not** yet claim to reproduce every possible RimWorld room shape, doorway, neighboring room, mountain layout or region-grid edge case.

Those cases should be added as explicit domain features and source-backed tests instead of silently extending the simple rectangular model.
