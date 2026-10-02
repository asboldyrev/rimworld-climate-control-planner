import {
  ROOM_TEMPERATURE_LIMITS,
  VANILLA_DEVICES,
} from './constants'
import { clampRoomTemperature } from './room'
import { assertTemperatureWithinLimits } from './scenario'

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`)
  }
}

function assertFinitePositiveNumber(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than zero`)
  }
}

export function createThermalZone({
  id = null,
  temperature,
  cellCount,
  usesOutdoorTemperature = false,
}) {
  assertTemperatureWithinLimits(temperature, 'temperature')
  assertPositiveInteger(cellCount, 'cellCount')

  return Object.freeze({
    id,
    temperature,
    cellCount,
    usesOutdoorTemperature: Boolean(usesOutdoorTemperature),
  })
}

function cloneZoneWithTemperature(zone, temperature) {
  return Object.freeze({
    ...zone,
    temperature: clampRoomTemperature(temperature),
  })
}

export function equalizeThermalZonesThroughBuildingPulse({
  zones,
  rate,
  inVacuum = false,
}) {
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new RangeError('zones must contain at least one thermal zone')
  }

  assertFinitePositiveNumber(rate, 'rate')

  const uniqueZones = []
  const seenObjects = new Set()
  const seenIds = new Set()

  for (const zone of uniqueZones) {
    createThermalZone(zone)

    const duplicateByObject = seenObjects.has(zone)
    const duplicateById = zone.id !== null && seenIds.has(zone.id)

    if (duplicateByObject || duplicateById) {
      continue
    }

    seenObjects.add(zone)

    if (zone.id !== null) {
      seenIds.add(zone.id)
    }

    uniqueZones.push(zone)
  }

  if (uniqueZones.length === 1) {
    return Object.freeze({
      averageTemperature: uniqueZones[0].temperature,
      scale: 1,
      zones: Object.freeze([
        cloneZoneWithTemperature(uniqueZones[0], uniqueZones[0].temperature),
      ]),
      energyChanges: Object.freeze([0]),
    })
  }

  const averageTemperature = (
    uniqueZones.reduce((sum, zone) => sum + zone.temperature, 0) / uniqueZones.length
  )

  let scale = 1

  for (const zone of uniqueZones) {
    if (zone.usesOutdoorTemperature) {
      continue
    }

    const temperatureDifference = averageTemperature - zone.temperature
    const rawEnergy = temperatureDifference * rate

    if (rawEnergy === 0) {
      continue
    }

    let candidateTemperature = zone.temperature + rawEnergy / zone.cellCount

    if (rawEnergy > 0 && candidateTemperature > averageTemperature) {
      candidateTemperature = averageTemperature
    } else if (rawEnergy < 0 && candidateTemperature < averageTemperature) {
      candidateTemperature = averageTemperature
    }

    const candidateScale = Math.abs(
      (candidateTemperature - zone.temperature) * zone.cellCount / rawEnergy,
    )

    if (candidateScale < scale) {
      scale = candidateScale
    }
  }

  const nextZones = []
  const energyChanges = []

  for (const zone of uniqueZones) {
    if (zone.usesOutdoorTemperature) {
      nextZones.push(cloneZoneWithTemperature(zone, zone.temperature))
      energyChanges.push(0)
      continue
    }

    const temperatureDifference = averageTemperature - zone.temperature
    const vacuumFactor = (
      inVacuum && temperatureDifference < 0
        ? 0.1
        : 1
    )

    const temperatureChange = (
      temperatureDifference *
      rate *
      scale *
      vacuumFactor /
      zone.cellCount
    )

    const nextTemperature = clampRoomTemperature(
      zone.temperature + temperatureChange,
    )

    nextZones.push(cloneZoneWithTemperature(zone, nextTemperature))
    energyChanges.push(
      (nextTemperature - zone.temperature) * zone.cellCount,
    )
  }

  return Object.freeze({
    averageTemperature,
    scale,
    zones: Object.freeze(nextZones),
    energyChanges: Object.freeze(energyChanges),
  })
}

export function equalizeTwoRoomsThroughVentPulse({
  roomA,
  roomB,
  inVacuum = false,
}) {
  return equalizeThermalZonesThroughBuildingPulse({
    zones: [roomA, roomB],
    rate: VANILLA_DEVICES.vent.equalizationRate,
    inVacuum,
  })
}

export function totalMutableZoneEnergyChange(result) {
  return result.energyChanges.reduce((sum, energy) => sum + energy, 0)
}

export { ROOM_TEMPERATURE_LIMITS }
