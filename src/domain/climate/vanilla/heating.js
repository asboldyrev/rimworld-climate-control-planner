import {
  RIMWORLD_TICKS_PER_SECOND,
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS,
  VANILLA_DEVICES,
} from './constants'
import { heaterEfficiencyAtTemperature } from './devices'
import {
  outdoorWallSampleTemperatureDelta,
  roofEqualizationTemperatureChangePerInterval,
  wallEqualizationTemperatureChangePerInterval,
} from './room'
import { createRectangularClimateScenario } from './scenario'

const EQUALIZATION_INTERVAL_SECONDS = (
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS / RIMWORLD_TICKS_PER_SECOND
)

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`)
  }
}

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`)
  }
}

export function createRectangularHeatingScenario(scenario) {
  return createRectangularClimateScenario(scenario)
}
export function roomNaturalTemperatureChangePerInterval({
  scenario,
  roomTemperature,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  const {
    geometry,
    outdoorTemperature,
    wallLayers,
    roof,
  } = scenario

  const averageWallSampleDelta = outdoorWallSampleTemperatureDelta({
    roomTemperature,
    outdoorTemperature,
    wallLayers,
  })

  const walls = wallEqualizationTemperatureChangePerInterval({
    averageSampleTemperatureDelta: averageWallSampleDelta,
    equalizeCellCount: geometry.exposedWallSampleCount,
    roomCellCount: geometry.cellCount,
  })

  const roofChange = roofEqualizationTemperatureChangePerInterval({
    roomTemperature,
    outdoorTemperature,
    ...roof,
  })

  const totalTemperatureChange = walls + roofChange.total
  const totalEnergyChange = totalTemperatureChange * geometry.cellCount

  return Object.freeze({
    walls,
    roof: roofChange,
    totalTemperatureChange,
    totalEnergyChange,
  })
}

export function heatingDemandAtTemperature({
  scenario,
  roomTemperature,
}) {
  const natural = roomNaturalTemperatureChangePerInterval({
    scenario,
    roomTemperature,
  })

  const requiredEnergy = Math.max(0, -natural.totalEnergyChange)

  return Object.freeze({
    ...natural,
    requiredEnergy,
    requiredHeatPerSecond: requiredEnergy / EQUALIZATION_INTERVAL_SECONDS,
  })
}

export function heaterAverageCapacityAtTemperature(roomTemperature) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  const efficiency = heaterEfficiencyAtTemperature(roomTemperature)
  const heatPerSecond = VANILLA_DEVICES.heater.heatPerSecond * efficiency

  return Object.freeze({
    efficiency,
    heatPerSecond,
    energyPerInterval: heatPerSecond * EQUALIZATION_INTERVAL_SECONDS,
  })
}

export function campfireAverageCapacityAtTemperature(roomTemperature) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  const active = roomTemperature < VANILLA_DEVICES.campfire.maximumHeatingTemperature
  const heatPerSecond = active ? VANILLA_DEVICES.campfire.heatPerSecond : 0

  return Object.freeze({
    active,
    heatPerSecond,
    energyPerInterval: heatPerSecond * EQUALIZATION_INTERVAL_SECONDS,
  })
}

export function evaluateHeaterCount({
  scenario,
  heaterCount,
  roomTemperature = scenario.targetTemperature,
}) {
  assertNonNegativeInteger(heaterCount, 'heaterCount')

  const demand = heatingDemandAtTemperature({ scenario, roomTemperature })
  const unit = heaterAverageCapacityAtTemperature(roomTemperature)
  const availableEnergy = unit.energyPerInterval * heaterCount
  const marginEnergy = availableEnergy - demand.requiredEnergy

  return Object.freeze({
    device: 'heater',
    count: heaterCount,
    roomTemperature,
    demand,
    unit,
    availableEnergy,
    marginEnergy,
    canSustain: demand.requiredEnergy === 0 || marginEnergy >= -1e-9,
    thermostatic: true,
  })
}

export function findMinimumHeaterCount({ scenario, maxDevices = 1000 }) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')

  const demand = heatingDemandAtTemperature({
    scenario,
    roomTemperature: scenario.targetTemperature,
  })

  if (demand.requiredEnergy === 0) {
    return Object.freeze({
      device: 'heater',
      reachable: true,
      requiredCount: 0,
      evaluation: evaluateHeaterCount({ scenario, heaterCount: 0 }),
    })
  }

  const unit = heaterAverageCapacityAtTemperature(scenario.targetTemperature)

  if (unit.energyPerInterval <= 0) {
    return Object.freeze({
      device: 'heater',
      reachable: false,
      requiredCount: null,
      reason: 'heater-has-no-capacity-at-target',
      demand,
      unit,
    })
  }

  const requiredCount = Math.ceil(
    (demand.requiredEnergy - 1e-9) / unit.energyPerInterval,
  )

  if (requiredCount > maxDevices) {
    return Object.freeze({
      device: 'heater',
      reachable: false,
      requiredCount: null,
      reason: 'device-limit-exceeded',
      demand,
      unit,
      minimumWithoutLimit: requiredCount,
    })
  }

  return Object.freeze({
    device: 'heater',
    reachable: true,
    requiredCount,
    evaluation: evaluateHeaterCount({
      scenario,
      heaterCount: requiredCount,
    }),
  })
}

export function evaluateCampfireCount({
  scenario,
  campfireCount,
  roomTemperature = scenario.targetTemperature,
}) {
  assertNonNegativeInteger(campfireCount, 'campfireCount')

  const demand = heatingDemandAtTemperature({ scenario, roomTemperature })
  const unit = campfireAverageCapacityAtTemperature(roomTemperature)
  const availableEnergy = unit.energyPerInterval * campfireCount
  const marginEnergy = availableEnergy - demand.requiredEnergy

  return Object.freeze({
    device: 'campfire',
    count: campfireCount,
    roomTemperature,
    demand,
    unit,
    availableEnergy,
    marginEnergy,
    canSustain: demand.requiredEnergy === 0 || marginEnergy >= -1e-9,
    thermostatic: false,
  })
}

export function findMinimumCampfireCount({ scenario, maxDevices = 1000 }) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')

  const demand = heatingDemandAtTemperature({
    scenario,
    roomTemperature: scenario.targetTemperature,
  })

  if (demand.requiredEnergy === 0) {
    return Object.freeze({
      device: 'campfire',
      reachable: true,
      requiredCount: 0,
      thermostatic: false,
      evaluation: evaluateCampfireCount({ scenario, campfireCount: 0 }),
    })
  }

  const unit = campfireAverageCapacityAtTemperature(scenario.targetTemperature)

  if (unit.energyPerInterval <= 0) {
    return Object.freeze({
      device: 'campfire',
      reachable: false,
      requiredCount: null,
      thermostatic: false,
      reason: 'campfire-stops-heating-at-target',
      demand,
      unit,
    })
  }

  const requiredCount = Math.ceil(
    (demand.requiredEnergy - 1e-9) / unit.energyPerInterval,
  )

  if (requiredCount > maxDevices) {
    return Object.freeze({
      device: 'campfire',
      reachable: false,
      requiredCount: null,
      thermostatic: false,
      reason: 'device-limit-exceeded',
      demand,
      unit,
      minimumWithoutLimit: requiredCount,
    })
  }

  return Object.freeze({
    device: 'campfire',
    reachable: true,
    requiredCount,
    thermostatic: false,
    evaluation: evaluateCampfireCount({
      scenario,
      campfireCount: requiredCount,
    }),
  })
}

function heaterNetTemperatureChangePerInterval({
  scenario,
  heaterCount,
  roomTemperature,
}) {
  const natural = roomNaturalTemperatureChangePerInterval({
    scenario,
    roomTemperature,
  })

  const unit = heaterAverageCapacityAtTemperature(roomTemperature)
  const heatingTemperatureChange = (
    unit.energyPerInterval * heaterCount / scenario.geometry.cellCount
  )

  return natural.totalTemperatureChange + heatingTemperatureChange
}

export function findMaximumHeaterEquilibriumTemperature({
  scenario,
  heaterCount,
  tolerance = 0.001,
  maxIterations = 100,
}) {
  assertNonNegativeInteger(heaterCount, 'heaterCount')
  assertFiniteNumber(tolerance, 'tolerance')
  assertNonNegativeInteger(maxIterations, 'maxIterations')

  if (heaterCount === 0) {
    return Object.freeze({
      converged: true,
      temperature: scenario.outdoorTemperature,
      iterations: 0,
    })
  }

  let low = Math.min(scenario.outdoorTemperature, 15, scenario.targetTemperature) - 1
  let high = VANILLA_DEVICES.heater.zeroEfficiencyAbove

  const lowChange = heaterNetTemperatureChangePerInterval({
    scenario,
    heaterCount,
    roomTemperature: low,
  })
  const highChange = heaterNetTemperatureChangePerInterval({
    scenario,
    heaterCount,
    roomTemperature: high,
  })

  if (lowChange <= 0) {
    return Object.freeze({
      converged: false,
      temperature: low,
      iterations: 0,
      reason: 'no-positive-heating-region',
    })
  }

  if (highChange >= 0) {
    return Object.freeze({
      converged: false,
      temperature: high,
      iterations: 0,
      reason: 'no-equilibrium-below-heater-cutoff',
    })
  }

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const mid = (low + high) / 2
    const change = heaterNetTemperatureChangePerInterval({
      scenario,
      heaterCount,
      roomTemperature: mid,
    })

    if ((high - low) <= tolerance) {
      return Object.freeze({
        converged: true,
        temperature: mid,
        iterations: iteration,
      })
    }

    if (change > 0) {
      low = mid
    } else {
      high = mid
    }
  }

  return Object.freeze({
    converged: false,
    temperature: (low + high) / 2,
    iterations: maxIterations,
    reason: 'iteration-limit',
  })
}
