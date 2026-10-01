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


## Capacity-planning time model

Natural room equalization runs when `TicksGame % 120 == 7`.

Rare-tick temperature devices run on a 250-tick cadence with object hash scheduling. A planner knows device count but not the future in-game Thing IDs/hash phases, so exact pulse timing cannot be determined from normal calculator inputs.

ADR 0003 therefore defines an average-power model for capacity planning:

```text
natural interval = 120 ticks = 2 seconds
device energy per interval = effective heat/s * 2 seconds
```

Temperature-dependent efficiency and cutoffs are evaluated at the temperature being tested.

This does not replace low-level pulse behavior; it provides a deterministic capacity model for device-count planning.

## Rectangular-room heating capacity

`heating.js` composes the source-backed room primitives into a simple isolated rectangular-room model.

At a requested temperature:

1. compute wall exchange;
2. compute roof exchange;
3. convert total natural temperature change back to room energy using cell count;
4. if natural exchange is a loss, that absolute energy is the heating demand;
5. compare demand with the average effective device energy over the same 120 ticks.

### Example

For a 10x10 room with one wall layer, full thin roof, -30 C outdoors and a 20 C target:

```text
wall change = -0.408 C / interval
roof change = -0.300 C / interval
total       = -0.708 C / interval

room cells = 100
energy demand = 70.8 per interval
heat demand   = 35.4 per second
```

At 20 C a Heater still has 100% efficiency:

```text
one Heater = 21 heat/s
           = 42 energy / 120-tick interval
```

Therefore one Heater is insufficient and two provide enough average capacity.

The model returns the required count together with the energy margin so UI can explain the recommendation.

## Heater equilibrium

The model can also calculate the maximum average-power equilibrium for a fixed Heater count, assuming the thermostat is set high enough not to be the limiting factor.

This is solved numerically from:

```text
natural room temperature change
+ average Heater temperature change
= 0
```

For the 10x10 / -30 C example above, one Heater equilibrates at approximately -0.339 C.

This is a capacity equilibrium, not a prediction of exact tick-to-tick temperature ripple.

## Campfire planning

Campfire uses the same average-energy comparison only while the room is below its 28 C heat-push cutoff.

Campfire is not thermostat-controlled. The planner must therefore distinguish:

- enough average power to reach/sustain a lower target band;
- precise thermostat regulation, which Campfire cannot provide.

Targets at or above the heat-push cutoff are not reported as directly sustainable by the average-capacity model. Discrete in-game heat pulses can temporarily overshoot 28 C, but that is not stable controlled heating.


## Cooler

Cooler behavior is implemented from `Building_Cooler.TickRare()`.

The cold-side energy value is:

```text
base energy per second = -21
```

Efficiency depends on the cold-side and hot-side temperatures.

The source computes:

```text
difference = hotSide - coldSide
penaltyFloor = hotSide - 40
effectiveDifference = max(difference, penaltyFloor)

efficiency = max(0, 1 - effectiveDifference / 130)
```

There is **no upper clamp at 1** in the game code. If the hot side is substantially colder than the cold side, Cooler efficiency can therefore exceed 100%.

The planner preserves this behavior.

### Hot-side temperature

The cold room's outdoor temperature and the Cooler's hot-side temperature are different domain concepts.

For a normal Cooler mounted in an exterior wall and venting directly outside, the cooling scenario defaults:

```text
hotSideTemperature = outdoorTemperature
```

The domain API allows a different hot-side temperature so future room-to-room exhaust layouts can be modeled without changing the Cooler formula.

### Hot-side heat output

When Cooler is actively cooling, the source pushes heat to the hot side using:

```text
hot-side heat = available cooling energy * 1.25
```

This is based on the Cooler's available TickRare energy when active, not on a separate conservation-of-energy reconstruction.

The current capacity model exposes the corresponding average hot-side heat rate for later multi-room work.

## Rectangular-room cooling capacity

`cooling.js` uses the same rectangular room geometry and natural wall/roof exchange model as heating.

At a requested cold-room temperature:

1. compute natural wall/roof energy change;
2. if natural change is positive, that energy must be removed;
3. compute source-backed Cooler efficiency using the requested cold-side temperature and hot-side temperature;
4. compare required removal with average device removal over the same 120-tick planning interval.

### Reference room example

For a 10x10 room with one wall layer, full thin roof, 40 C outdoors and a 20 C target:

```text
natural temperature gain = +0.2832 C / 120 ticks
energy gain              = +28.32 / interval
cooling demand           = 14.16 / second
```

With a 40 C hot side and 20 C cold side:

```text
Cooler efficiency = 1 - 20/130
                  = 0.846153...
effective cooling = 17.7692... / second
```

One Cooler therefore has enough average capacity for this scenario.

For a -10 C freezer with a 40 C hot side, the same room requires three Coolers in the current rectangular-room model.

## Passive Cooler

Passive Cooler uses `CompHeatPusherPowered` / `CompHeatPusher`.

Verified definition values:

```text
heatPerSecond = -11
heatPushMinTemperature = 17
```

The source uses a strict activation condition:

```text
ambientTemperature > 17 C
```

so no new cooling pulse begins at exactly 17 C. The RimWorld Wiki likewise describes 17 C as its minimum cooling temperature. cite placeholder not stored in repository docs; source-backed value verified during implementation.

### Planning interpretation at 17 C

For device-count planning, 17 C is treated as the **lower controllable temperature band**:

- target < 17 C: unreachable by Passive Cooler;
- target = 17 C: capacity is evaluated as cycling immediately above the cutoff;
- target > 17 C: full -11 heat/s capacity is available while cooling is needed.

This follows ADR 0003's average-power approach and should not be interpreted as a claim that Passive Cooler continuously runs at exactly 17.000 C.

The result remains non-thermostatic and should be presented as holding the room near the cutoff rather than regulating an exact setpoint.
