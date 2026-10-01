import { createRectangularRoomGeometry } from './room'

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`)
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

  assertFiniteNumber(outdoorTemperature, 'outdoorTemperature')
  assertFiniteNumber(targetTemperature, 'targetTemperature')

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
