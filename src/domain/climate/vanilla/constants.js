export const SUPPORTED_RIMWORLD_VERSION = '1.6.4850'

export const RIMWORLD_TICKS_PER_SECOND = 60
export const TEMPERATURE_EQUALIZATION_INTERVAL_TICKS = 120
export const TICK_RARE_INTERVAL_TICKS = 250
export const TICK_RARE_SECONDS = TICK_RARE_INTERVAL_TICKS / RIMWORLD_TICKS_PER_SECOND

export const ROOM_TEMPERATURE_LIMITS = Object.freeze({
  min: -273.15,
  max: 1000,
})

export const ROOM_EQUALIZATION = Object.freeze({
  wallEqualizeFactor: 0.00017,
  thinRoofEqualizeRate: 0.00005,
  noRoofEqualizeRate: 0.0007,
  deepEqualizeFractionPerTick: 0.00005,
  undergroundEqualizeFractionPerTick: 0.002,
  deepRoofReferenceTemperature: 15,
  directOutdoorWallFactor: 1,
  blockedOutdoorWallFactor: 0.5,
})

export const VANILLA_DEVICES = Object.freeze({
  heater: Object.freeze({
    heatPerSecond: 21,
    fullEfficiencyBelow: 20,
    zeroEfficiencyAbove: 120,
  }),
  cooler: Object.freeze({
    heatPerSecond: -21,
    heatOutputMultiplier: 1.25,
    efficiencyLossPerDegreeDifference: 1 / 130,
  }),
  passiveCooler: Object.freeze({
    heatPerSecond: -11,
    minimumTemperature: 17,
  }),
  campfire: Object.freeze({
    heatPerSecond: 21,
    maximumHeatingTemperature: 28,
  }),
  vent: Object.freeze({
    equalizationRate: 14,
  }),
})

export const SOURCE_SNAPSHOT = Object.freeze({
  decompiledCommit: '2d508035082e7cb0c8e29e230d26bda6e546928f',
  verifiedAt: '2026-10-02',
})
