import { ROOM_TEMPERATURE_LIMITS } from './constants'
import { createRectangularRoomGeometry } from './room'

export function assertTemperatureWithinLimits(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`)
  }

  if (
    value < ROOM_TEMPERATURE_LIMITS.min ||
    value > ROOM_TEMPERATURE_LIMITS.max
  ) {
    throw new RangeError(
      `${name} must be between ${ROOM_TEMPERATURE_LIMITS.min} and ${ROOM_TEMPERATURE_LIMITS.max} C`,
    )
  }
}

export function createRectangularClimateScenario({
  width,
  height,
  outdoorTemperature,
  targetTemperature,
  wallLayers = 1,
  thinRoofCoverage = 1,
  noRoofCoverage = 0,
  thickRoofCoverage = 0,
  undergroundMap = false,
}) {
  const geometry = createRectangularRoomGeometry({ width, height })

  assertTemperatureWithinLimits(outdoorTemperature, 'outdoorTemperature')
  assertTemperatureWithinLimits(targetTemperature, 'targetTemperature')

  return Object.freeze({
    geometry,
    outdoorTemperature,
    targetTemperature,
    wallLayers,
    roof: Object.freeze({
      thinRoofCoverage,
      noRoofCoverage,
      thickRoofCoverage,
      undergroundMap,
    }),
  })
}
