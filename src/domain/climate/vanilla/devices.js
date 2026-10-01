import {
  TICK_RARE_SECONDS,
  VANILLA_DEVICES,
} from './constants'
import { controlTemperatureChange } from './room'

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

export function heaterEfficiencyAtTemperature(ambientTemperature) {
  assertFiniteNumber(ambientTemperature, 'ambientTemperature')

  const { fullEfficiencyBelow, zeroEfficiencyAbove } = VANILLA_DEVICES.heater

  if (ambientTemperature < fullEfficiencyBelow) {
    return 1
  }

  if (ambientTemperature > zeroEfficiencyAbove) {
    return 0
  }

  return (
    zeroEfficiencyAbove - ambientTemperature
  ) / (
    zeroEfficiencyAbove - fullEfficiencyBelow
  )
}

export function heaterTemperatureChangePerRareTick({
  roomTemperature,
  targetTemperature,
  roomCellCount,
}) {
  const efficiency = heaterEfficiencyAtTemperature(roomTemperature)
  const energyLimit = (
    VANILLA_DEVICES.heater.heatPerSecond *
    efficiency *
    TICK_RARE_SECONDS
  )

  return controlTemperatureChange({
    roomTemperature,
    targetTemperature,
    roomCellCount,
    energyLimit,
  })
}

export function campfireTemperatureChangePerSecond({
  roomTemperature,
  roomCellCount,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')
  assertPositiveInteger(roomCellCount, 'roomCellCount')

  const { heatPerSecond, maximumHeatingTemperature } = VANILLA_DEVICES.campfire

  if (roomTemperature >= maximumHeatingTemperature) {
    return 0
  }

  return heatPerSecond / roomCellCount
}


export function coolerEfficiency({
  coldSideTemperature,
  hotSideTemperature,
}) {
  assertFiniteNumber(coldSideTemperature, 'coldSideTemperature')
  assertFiniteNumber(hotSideTemperature, 'hotSideTemperature')

  const temperatureDifference = hotSideTemperature - coldSideTemperature
  const hotSidePenaltyFloor = hotSideTemperature - 40
  const effectiveDifference = Math.max(
    temperatureDifference,
    hotSidePenaltyFloor,
  )

  return Math.max(
    0,
    1 - effectiveDifference * VANILLA_DEVICES.cooler.efficiencyLossPerDegreeDifference,
  )
}

export function coolerTemperatureChangePerRareTick({
  roomTemperature,
  targetTemperature,
  roomCellCount,
  hotSideTemperature,
}) {
  const efficiency = coolerEfficiency({
    coldSideTemperature: roomTemperature,
    hotSideTemperature,
  })

  const energyLimit = (
    VANILLA_DEVICES.cooler.heatPerSecond *
    efficiency *
    TICK_RARE_SECONDS
  )

  return controlTemperatureChange({
    roomTemperature,
    targetTemperature,
    roomCellCount,
    energyLimit,
  })
}

export function passiveCoolerIsActive(roomTemperature) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  return roomTemperature > VANILLA_DEVICES.passiveCooler.minimumTemperature
}

export function passiveCoolerTemperatureChangePerSecond({
  roomTemperature,
  roomCellCount,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')
  assertPositiveInteger(roomCellCount, 'roomCellCount')

  if (!passiveCoolerIsActive(roomTemperature)) {
    return 0
  }

  return VANILLA_DEVICES.passiveCooler.heatPerSecond / roomCellCount
}
