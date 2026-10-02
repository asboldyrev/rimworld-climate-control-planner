import {
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS,
  TICK_RARE_INTERVAL_TICKS,
  TICK_RARE_SECONDS,
  VANILLA_DEVICES,
} from './constants'
import { averageVentTransferPerInterval } from './coupledRooms'
import { coolerEfficiency } from './devices'
import { roomNaturalTemperatureChangePerCoolingInterval } from './cooling'
import {
  clampRoomTemperature,
  controlTemperatureChange,
} from './room'
import { assertTemperatureWithinLimits } from './scenario'
import { createThermalZone } from './thermalZones'

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`)
  }
}

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

function applyEnergy(zone, energy) {
  if (zone.usesOutdoorTemperature) {
    return createThermalZone(zone)
  }

  return createThermalZone({
    ...zone,
    temperature: clampRoomTemperature(
      zone.temperature + energy / zone.cellCount,
    ),
  })
}

export function coolerBetweenRoomsPulse({
  coldRoom,
  hotRoom,
  targetTemperature,
}) {
  const cold = createThermalZone(coldRoom)
  const hot = createThermalZone(hotRoom)

  assertTemperatureWithinLimits(targetTemperature, 'targetTemperature')

  if (cold.usesOutdoorTemperature) {
    return Object.freeze({
      active: false,
      efficiency: 0,
      availableColdEnergy: 0,
      hotEnergyRequested: 0,
      energyChanges: Object.freeze([0, 0]),
      zones: Object.freeze([cold, hot]),
    })
  }

  const efficiency = coolerEfficiency({
    coldSideTemperature: cold.temperature,
    hotSideTemperature: hot.temperature,
  })

  const coldEnergyLimit = (
    VANILLA_DEVICES.cooler.heatPerSecond *
    efficiency *
    TICK_RARE_SECONDS
  )

  const coldTemperatureChange = controlTemperatureChange({
    roomTemperature: cold.temperature,
    targetTemperature,
    roomCellCount: cold.cellCount,
    energyLimit: coldEnergyLimit,
  })

  if (coldTemperatureChange === 0) {
    return Object.freeze({
      active: false,
      efficiency,
      availableColdEnergy: coldEnergyLimit,
      hotEnergyRequested: 0,
      energyChanges: Object.freeze([0, 0]),
      zones: Object.freeze([cold, hot]),
    })
  }

  const coldEnergyChange = coldTemperatureChange * cold.cellCount
  const hotEnergyRequested = (
    -coldEnergyLimit * VANILLA_DEVICES.cooler.heatOutputMultiplier
  )

  const nextCold = applyEnergy(cold, coldEnergyChange)
  const nextHot = applyEnergy(hot, hotEnergyRequested)

  const hotEnergyChange = (
    (nextHot.temperature - hot.temperature) * hot.cellCount
  )

  return Object.freeze({
    active: true,
    efficiency,
    availableColdEnergy: coldEnergyLimit,
    hotEnergyRequested,
    energyChanges: Object.freeze([
      coldEnergyChange,
      hotEnergyChange,
    ]),
    zones: Object.freeze([nextCold, nextHot]),
  })
}

export function averageCoolerTransferPerInterval({
  coldRoom,
  hotRoom,
  coolerCount,
  targetTemperature,
}) {
  assertNonNegativeInteger(coolerCount, 'coolerCount')
  assertTemperatureWithinLimits(targetTemperature, 'targetTemperature')

  const startCold = createThermalZone(coldRoom)
  const startHot = createThermalZone(hotRoom)

  if (coolerCount === 0) {
    return Object.freeze({
      expectedPulseCount: 0,
      fullPulses: 0,
      fractionalPulse: 0,
      activePulseEquivalent: 0,
      energyChanges: Object.freeze([0, 0]),
      temperatureChanges: Object.freeze([0, 0]),
      zones: Object.freeze([startCold, startHot]),
    })
  }

  const expectedPulseCount = (
    coolerCount *
    TEMPERATURE_EQUALIZATION_INTERVAL_TICKS /
    TICK_RARE_INTERVAL_TICKS
  )

  const fullPulses = Math.floor(expectedPulseCount)
  const fractionalPulse = expectedPulseCount - fullPulses

  let currentCold = startCold
  let currentHot = startHot
  let totalColdEnergy = 0
  let totalHotEnergy = 0
  let activePulseEquivalent = 0

  for (let pulse = 0; pulse < fullPulses; pulse += 1) {
    const result = coolerBetweenRoomsPulse({
      coldRoom: currentCold,
      hotRoom: currentHot,
      targetTemperature,
    })

    if (result.active) {
      activePulseEquivalent += 1
    }

    totalColdEnergy += result.energyChanges[0]
    totalHotEnergy += result.energyChanges[1]
    currentCold = result.zones[0]
    currentHot = result.zones[1]
  }

  if (fractionalPulse > 0) {
    const result = coolerBetweenRoomsPulse({
      coldRoom: currentCold,
      hotRoom: currentHot,
      targetTemperature,
    })

    if (result.active) {
      activePulseEquivalent += fractionalPulse
    }

    const coldEnergy = result.energyChanges[0] * fractionalPulse
    const hotEnergy = result.energyChanges[1] * fractionalPulse

    totalColdEnergy += coldEnergy
    totalHotEnergy += hotEnergy
    currentCold = applyEnergy(currentCold, coldEnergy)
    currentHot = applyEnergy(currentHot, hotEnergy)
  }

  return Object.freeze({
    expectedPulseCount,
    fullPulses,
    fractionalPulse,
    activePulseEquivalent,
    energyChanges: Object.freeze([
      totalColdEnergy,
      totalHotEnergy,
    ]),
    temperatureChanges: Object.freeze([
      currentCold.temperature - startCold.temperature,
      currentHot.temperature - startHot.temperature,
    ]),
    zones: Object.freeze([currentCold, currentHot]),
  })
}

export function createTwoRoomCoolingPlan({
  coldRoom,
  hotRoom,
  coolerSetpoint = coldRoom.targetTemperature,
  ventCount = 0,
  inVacuum = false,
}) {
  assertTemperatureWithinLimits(coolerSetpoint, 'coolerSetpoint')
  assertNonNegativeInteger(ventCount, 'ventCount')

  return Object.freeze({
    coldRoom,
    hotRoom,
    coolerSetpoint,
    ventCount,
    inVacuum: Boolean(inVacuum),
  })
}

function roomStateFromScenario(id, scenario, temperature) {
  return createThermalZone({
    id,
    temperature,
    cellCount: scenario.geometry.cellCount,
  })
}

export function simulateTwoRoomCoolingPlan({
  plan,
  coolerCount,
  initialColdTemperature = plan.coldRoom.outdoorTemperature,
  initialHotTemperature = plan.hotRoom.outdoorTemperature,
  tolerance = 0.001,
  maxIterations = 5000,
}) {
  assertNonNegativeInteger(coolerCount, 'coolerCount')
  assertFinitePositiveNumber(tolerance, 'tolerance')
  assertPositiveInteger(maxIterations, 'maxIterations')

  let coldTemperature = clampRoomTemperature(initialColdTemperature)
  let hotTemperature = clampRoomTemperature(initialHotTemperature)

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const naturalCold = roomNaturalTemperatureChangePerCoolingInterval({
      scenario: plan.coldRoom,
      roomTemperature: coldTemperature,
    })
    const naturalHot = roomNaturalTemperatureChangePerCoolingInterval({
      scenario: plan.hotRoom,
      roomTemperature: hotTemperature,
    })

    const vent = averageVentTransferPerInterval({
      roomA: roomStateFromScenario('cold', plan.coldRoom, coldTemperature),
      roomB: roomStateFromScenario('hot', plan.hotRoom, hotTemperature),
      ventCount: plan.ventCount,
      inVacuum: plan.inVacuum,
    })

    const preCoolerCold = applyEnergy(
      roomStateFromScenario('cold', plan.coldRoom, coldTemperature),
      naturalCold.totalEnergyChange + vent.energyChanges[0],
    )
    const preCoolerHot = applyEnergy(
      roomStateFromScenario('hot', plan.hotRoom, hotTemperature),
      naturalHot.totalEnergyChange + vent.energyChanges[1],
    )

    const cooler = averageCoolerTransferPerInterval({
      coldRoom: preCoolerCold,
      hotRoom: preCoolerHot,
      coolerCount,
      targetTemperature: plan.coolerSetpoint,
    })

    const nextColdTemperature = cooler.zones[0].temperature
    const nextHotTemperature = cooler.zones[1].temperature

    const deltaCold = nextColdTemperature - coldTemperature
    const deltaHot = nextHotTemperature - hotTemperature

    coldTemperature = nextColdTemperature
    hotTemperature = nextHotTemperature

    if (Math.max(Math.abs(deltaCold), Math.abs(deltaHot)) <= tolerance) {
      return Object.freeze({
        converged: true,
        iterations: iteration,
        temperatures: Object.freeze({
          cold: coldTemperature,
          hot: hotTemperature,
        }),
        lastInterval: Object.freeze({
          naturalCold,
          naturalHot,
          vent,
          cooler,
        }),
      })
    }
  }

  return Object.freeze({
    converged: false,
    iterations: maxIterations,
    temperatures: Object.freeze({
      cold: coldTemperature,
      hot: hotTemperature,
    }),
    reason: 'iteration-limit',
  })
}

function meetsCoolingTargets(plan, simulation, tolerance) {
  return (
    simulation.converged &&
    simulation.temperatures.cold <= plan.coldRoom.targetTemperature + tolerance &&
    simulation.temperatures.hot <= plan.hotRoom.targetTemperature + tolerance
  )
}

export function findMinimumCoolerCountForTwoRooms({
  plan,
  maxDevices = 100,
  tolerance = 0.01,
}) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')
  assertFinitePositiveNumber(tolerance, 'tolerance')

  let bestHotTemperature = Infinity
  let bestColdTemperature = Infinity
  let bestAttempt = null

  for (let coolerCount = 0; coolerCount <= maxDevices; coolerCount += 1) {
    const simulation = simulateTwoRoomCoolingPlan({
      plan,
      coolerCount,
      tolerance: Math.min(tolerance / 10, 0.001),
    })

    if (simulation.temperatures.hot < bestHotTemperature) {
      bestHotTemperature = simulation.temperatures.hot
    }

    if (simulation.temperatures.cold < bestColdTemperature) {
      bestColdTemperature = simulation.temperatures.cold
      bestAttempt = Object.freeze({
        coolerCount,
        simulation,
      })
    }

    if (meetsCoolingTargets(plan, simulation, tolerance)) {
      return Object.freeze({
        reachable: true,
        requiredCount: coolerCount,
        simulation,
      })
    }
  }

  return Object.freeze({
    reachable: false,
    requiredCount: null,
    reason: 'targets-unreachable-within-device-limit',
    bestColdTemperature,
    bestHotTemperature,
    bestAttempt,
  })
}
