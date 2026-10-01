import {
  ROOM_EQUALIZATION,
  ROOM_TEMPERATURE_LIMITS,
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS,
} from './constants'

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`)
  }
}

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`)
  }
}

function assertCoverage(value, name) {
  assertFiniteNumber(value, name)

  if (value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1`)
  }
}

export function clampRoomTemperature(temperature) {
  assertFiniteNumber(temperature, 'temperature')

  return Math.min(
    ROOM_TEMPERATURE_LIMITS.max,
    Math.max(ROOM_TEMPERATURE_LIMITS.min, temperature),
  )
}

export function createRectangularRoomGeometry({ width, height }) {
  assertPositiveInteger(width, 'width')
  assertPositiveInteger(height, 'height')

  return Object.freeze({
    width,
    height,
    cellCount: width * height,
    exposedWallSampleCount: 2 * (width + height),
  })
}

export function adjustedOutdoorTemperatureDifference({
  roomTemperature,
  outdoorTemperature,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')
  assertFiniteNumber(outdoorTemperature, 'outdoorTemperature')

  const difference = outdoorTemperature - roomTemperature

  if (Math.abs(difference) < 100) {
    return difference
  }

  const sign = Math.sign(difference)

  return sign * 100 + 5 * (difference - sign * 100)
}

export function wallEqualizationTemperatureChangePerInterval({
  averageSampleTemperatureDelta,
  equalizeCellCount,
  roomCellCount,
}) {
  assertFiniteNumber(averageSampleTemperatureDelta, 'averageSampleTemperatureDelta')
  assertPositiveInteger(equalizeCellCount, 'equalizeCellCount')
  assertPositiveInteger(roomCellCount, 'roomCellCount')

  return (
    averageSampleTemperatureDelta *
    equalizeCellCount *
    TEMPERATURE_EQUALIZATION_INTERVAL_TICKS *
    ROOM_EQUALIZATION.wallEqualizeFactor /
    roomCellCount
  )
}

export function outdoorWallSampleTemperatureDelta({
  roomTemperature,
  outdoorTemperature,
  wallLayers = 1,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')
  assertFiniteNumber(outdoorTemperature, 'outdoorTemperature')

  if (wallLayers !== 1 && wallLayers !== 2) {
    throw new RangeError('wallLayers must be 1 or 2 for the current rectangular-room model')
  }

  const factor = wallLayers === 1
    ? ROOM_EQUALIZATION.directOutdoorWallFactor
    : ROOM_EQUALIZATION.blockedOutdoorWallFactor

  return (outdoorTemperature - roomTemperature) * factor
}

export function roofEqualizationTemperatureChangePerInterval({
  roomTemperature,
  outdoorTemperature,
  thinRoofCoverage = 1,
  noRoofCoverage = 0,
  thickRoofCoverage = 0,
  undergroundMap = false,
}) {
  assertCoverage(thinRoofCoverage, 'thinRoofCoverage')
  assertCoverage(noRoofCoverage, 'noRoofCoverage')
  assertCoverage(thickRoofCoverage, 'thickRoofCoverage')

  const totalCoverage = thinRoofCoverage + noRoofCoverage + thickRoofCoverage

  if (Math.abs(totalCoverage - 1) > 1e-9) {
    throw new RangeError('roof coverage fractions must sum to 1')
  }

  const outdoorDifference = adjustedOutdoorTemperatureDifference({
    roomTemperature,
    outdoorTemperature,
  })

  const thinRoof = thinRoofCoverage < 0.001
    ? 0
    : (
      outdoorDifference *
      thinRoofCoverage *
      ROOM_EQUALIZATION.thinRoofEqualizeRate *
      TEMPERATURE_EQUALIZATION_INTERVAL_TICKS
    )

  const noRoof = noRoofCoverage < 0.001
    ? 0
    : (
      outdoorDifference *
      noRoofCoverage *
      ROOM_EQUALIZATION.noRoofEqualizeRate *
      TEMPERATURE_EQUALIZATION_INTERVAL_TICKS
    )

  let thickRoof = 0

  if (thickRoofCoverage >= 0.001) {
    const deepDifference = ROOM_EQUALIZATION.deepRoofReferenceTemperature - roomTemperature

    if (deepDifference <= 0) {
      const rate = undergroundMap
        ? ROOM_EQUALIZATION.undergroundEqualizeFractionPerTick
        : ROOM_EQUALIZATION.deepEqualizeFractionPerTick

      thickRoof = (
        deepDifference *
        thickRoofCoverage *
        rate *
        TEMPERATURE_EQUALIZATION_INTERVAL_TICKS
      )
    }
  }

  return Object.freeze({
    thinRoof,
    noRoof,
    thickRoof,
    total: thinRoof + noRoof + thickRoof,
  })
}

export function controlTemperatureChange({
  roomTemperature,
  targetTemperature,
  roomCellCount,
  energyLimit,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')
  assertFiniteNumber(targetTemperature, 'targetTemperature')
  assertPositiveInteger(roomCellCount, 'roomCellCount')
  assertFiniteNumber(energyLimit, 'energyLimit')

  if (energyLimit === 0) {
    return 0
  }

  const maximumChange = energyLimit / roomCellCount
  const targetDifference = targetTemperature - roomTemperature

  if (energyLimit > 0) {
    return Math.max(Math.min(targetDifference, maximumChange), 0)
  }

  return Math.min(Math.max(targetDifference, maximumChange), 0)
}
