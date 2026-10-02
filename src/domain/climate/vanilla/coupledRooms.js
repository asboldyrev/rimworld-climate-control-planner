import {
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS,
  TICK_RARE_INTERVAL_TICKS,
} from './constants'
import {
  heaterAverageCapacityAtTemperature,
  roomNaturalTemperatureChangePerInterval,
} from './heating'
import { clampRoomTemperature } from './room'
import {
  createThermalZone,
  equalizeTwoRoomsThroughVentPulse,
} from './thermalZones'

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
  return createThermalZone({
    ...zone,
    temperature: clampRoomTemperature(
      zone.temperature + energy / zone.cellCount,
    ),
  })
}

export function averageVentTransferPerInterval({
  roomA,
  roomB,
  ventCount,
  inVacuum = false,
}) {
  assertNonNegativeInteger(ventCount, 'ventCount')

  const startA = createThermalZone(roomA)
  const startB = createThermalZone(roomB)

  if (ventCount === 0) {
    return Object.freeze({
      expectedPulseCount: 0,
      fullPulses: 0,
      fractionalPulse: 0,
      energyChanges: Object.freeze([0, 0]),
      temperatureChanges: Object.freeze([0, 0]),
      zones: Object.freeze([startA, startB]),
    })
  }

  const expectedPulseCount = (
    ventCount *
    TEMPERATURE_EQUALIZATION_INTERVAL_TICKS /
    TICK_RARE_INTERVAL_TICKS
  )

  const fullPulses = Math.floor(expectedPulseCount)
  const fractionalPulse = expectedPulseCount - fullPulses

  let currentA = startA
  let currentB = startB
  let totalEnergyA = 0
  let totalEnergyB = 0

  for (let pulse = 0; pulse < fullPulses; pulse += 1) {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: currentA,
      roomB: currentB,
      inVacuum,
    })

    const [energyA, energyB] = result.energyChanges
    totalEnergyA += energyA
    totalEnergyB += energyB
    currentA = result.zones[0]
    currentB = result.zones[1]
  }

  if (fractionalPulse > 0) {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: currentA,
      roomB: currentB,
      inVacuum,
    })

    const energyA = result.energyChanges[0] * fractionalPulse
    const energyB = result.energyChanges[1] * fractionalPulse

    totalEnergyA += energyA
    totalEnergyB += energyB
    currentA = applyEnergy(currentA, energyA)
    currentB = applyEnergy(currentB, energyB)
  }

  return Object.freeze({
    expectedPulseCount,
    fullPulses,
    fractionalPulse,
    energyChanges: Object.freeze([totalEnergyA, totalEnergyB]),
    temperatureChanges: Object.freeze([
      currentA.temperature - startA.temperature,
      currentB.temperature - startB.temperature,
    ]),
    zones: Object.freeze([currentA, currentB]),
  })
}

export function createTwoRoomHeatingPlan({
  roomA,
  roomB,
  ventCount = 1,
  heaterRoom = 'A',
  heaterSetpoint = roomA.targetTemperature,
  inVacuum = false,
}) {
  if (heaterRoom !== 'A' && heaterRoom !== 'B') {
    throw new RangeError("heaterRoom must be 'A' or 'B'")
  }

  assertNonNegativeInteger(ventCount, 'ventCount')

  if (!Number.isFinite(heaterSetpoint)) {
    throw new TypeError('heaterSetpoint must be a finite number')
  }

  return Object.freeze({
    roomA,
    roomB,
    ventCount,
    heaterRoom,
    heaterSetpoint,
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

function heaterEnergyForInterval({
  plan,
  heaterCount,
  roomTemperature,
  otherEnergy,
  roomCellCount,
}) {
  if (heaterCount === 0) {
    return 0
  }

  const unit = heaterAverageCapacityAtTemperature(roomTemperature)
  const availableEnergy = heaterCount === Infinity
    ? (unit.energyPerInterval > 0 ? Infinity : 0)
    : unit.energyPerInterval * heaterCount

  if (availableEnergy <= 0) {
    return 0
  }

  const energyNeededToSetpoint = (
    (plan.heaterSetpoint - roomTemperature) * roomCellCount - otherEnergy
  )

  return Math.max(0, Math.min(energyNeededToSetpoint, availableEnergy))
}

export function simulateTwoRoomHeatingPlan({
  plan,
  heaterCount,
  initialTemperatureA = plan.roomA.outdoorTemperature,
  initialTemperatureB = plan.roomB.outdoorTemperature,
  tolerance = 0.001,
  maxIterations = 5000,
}) {
  if (heaterCount !== Infinity) {
    assertNonNegativeInteger(heaterCount, 'heaterCount')
  }

  assertFinitePositiveNumber(tolerance, 'tolerance')
  assertPositiveInteger(maxIterations, 'maxIterations')

  let temperatureA = clampRoomTemperature(initialTemperatureA)
  let temperatureB = clampRoomTemperature(initialTemperatureB)

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const naturalA = roomNaturalTemperatureChangePerInterval({
      scenario: plan.roomA,
      roomTemperature: temperatureA,
    })
    const naturalB = roomNaturalTemperatureChangePerInterval({
      scenario: plan.roomB,
      roomTemperature: temperatureB,
    })

    const vent = averageVentTransferPerInterval({
      roomA: roomStateFromScenario('A', plan.roomA, temperatureA),
      roomB: roomStateFromScenario('B', plan.roomB, temperatureB),
      ventCount: plan.ventCount,
      inVacuum: plan.inVacuum,
    })

    let energyA = naturalA.totalEnergyChange + vent.energyChanges[0]
    let energyB = naturalB.totalEnergyChange + vent.energyChanges[1]

    if (plan.heaterRoom === 'A') {
      energyA += heaterEnergyForInterval({
        plan,
        heaterCount,
        roomTemperature: temperatureA,
        otherEnergy: energyA,
        roomCellCount: plan.roomA.geometry.cellCount,
      })
    } else {
      energyB += heaterEnergyForInterval({
        plan,
        heaterCount,
        roomTemperature: temperatureB,
        otherEnergy: energyB,
        roomCellCount: plan.roomB.geometry.cellCount,
      })
    }

    const nextTemperatureA = clampRoomTemperature(
      temperatureA + energyA / plan.roomA.geometry.cellCount,
    )
    const nextTemperatureB = clampRoomTemperature(
      temperatureB + energyB / plan.roomB.geometry.cellCount,
    )

    const deltaA = nextTemperatureA - temperatureA
    const deltaB = nextTemperatureB - temperatureB

    temperatureA = nextTemperatureA
    temperatureB = nextTemperatureB

    if (Math.max(Math.abs(deltaA), Math.abs(deltaB)) <= tolerance) {
      return Object.freeze({
        converged: true,
        iterations: iteration,
        temperatures: Object.freeze({
          A: temperatureA,
          B: temperatureB,
        }),
        lastInterval: Object.freeze({
          naturalA,
          naturalB,
          vent,
          energyA,
          energyB,
        }),
      })
    }
  }

  return Object.freeze({
    converged: false,
    iterations: maxIterations,
    temperatures: Object.freeze({
      A: temperatureA,
      B: temperatureB,
    }),
    reason: 'iteration-limit',
  })
}

function meetsRoomTargets(plan, simulation, tolerance) {
  return (
    simulation.converged &&
    simulation.temperatures.A >= plan.roomA.targetTemperature - tolerance &&
    simulation.temperatures.B >= plan.roomB.targetTemperature - tolerance
  )
}

export function findMinimumHeaterCountForTwoRooms({
  plan,
  maxDevices = 1000,
  tolerance = 0.01,
}) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')
  assertFinitePositiveNumber(tolerance, 'tolerance')

  const theoretical = simulateTwoRoomHeatingPlan({
    plan,
    heaterCount: Infinity,
    tolerance: Math.min(tolerance / 10, 0.001),
  })

  if (!meetsRoomTargets(plan, theoretical, tolerance)) {
    return Object.freeze({
      reachable: false,
      requiredCount: null,
      reason: 'targets-unreachable-at-heater-setpoint',
      theoreticalMaximum: theoretical,
    })
  }

  const zero = simulateTwoRoomHeatingPlan({
    plan,
    heaterCount: 0,
    tolerance: Math.min(tolerance / 10, 0.001),
  })

  if (meetsRoomTargets(plan, zero, tolerance)) {
    return Object.freeze({
      reachable: true,
      requiredCount: 0,
      simulation: zero,
    })
  }

  let low = 1
  let high = maxDevices
  let best = null

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const simulation = simulateTwoRoomHeatingPlan({
      plan,
      heaterCount: mid,
      tolerance: Math.min(tolerance / 10, 0.001),
    })

    if (meetsRoomTargets(plan, simulation, tolerance)) {
      best = Object.freeze({
        count: mid,
        simulation,
      })
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  if (!best) {
    return Object.freeze({
      reachable: false,
      requiredCount: null,
      reason: 'device-limit-exceeded',
      theoreticalMaximum: theoretical,
    })
  }

  return Object.freeze({
    reachable: true,
    requiredCount: best.count,
    simulation: best.simulation,
  })
}
