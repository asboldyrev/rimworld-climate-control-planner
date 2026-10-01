import {
  RIMWORLD_TICKS_PER_SECOND,
  TEMPERATURE_EQUALIZATION_INTERVAL_TICKS,
  VANILLA_DEVICES,
} from './constants'
import {
  coolerEfficiency,
  passiveCoolerIsActive,
} from './devices'
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

export function createRectangularCoolingScenario({
  hotSideTemperature,
  ...scenario
}) {
  const base = createRectangularClimateScenario(scenario)

  const resolvedHotSideTemperature = hotSideTemperature ?? base.outdoorTemperature
  assertFiniteNumber(resolvedHotSideTemperature, 'hotSideTemperature')

  return Object.freeze({
    ...base,
    hotSideTemperature: resolvedHotSideTemperature,
  })
}

export function roomNaturalTemperatureChangePerCoolingInterval({
  scenario,
  roomTemperature,
}) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  const averageWallSampleDelta = outdoorWallSampleTemperatureDelta({
    roomTemperature,
    outdoorTemperature: scenario.outdoorTemperature,
    wallLayers: scenario.wallLayers,
  })

  const walls = wallEqualizationTemperatureChangePerInterval({
    averageSampleTemperatureDelta: averageWallSampleDelta,
    equalizeCellCount: scenario.geometry.exposedWallSampleCount,
    roomCellCount: scenario.geometry.cellCount,
  })

  const roof = roofEqualizationTemperatureChangePerInterval({
    roomTemperature,
    outdoorTemperature: scenario.outdoorTemperature,
    ...scenario.roof,
  })

  const totalTemperatureChange = walls + roof.total
  const totalEnergyChange = totalTemperatureChange * scenario.geometry.cellCount

  return Object.freeze({
    walls,
    roof,
    totalTemperatureChange,
    totalEnergyChange,
  })
}

export function coolingDemandAtTemperature({
  scenario,
  roomTemperature,
}) {
  const natural = roomNaturalTemperatureChangePerCoolingInterval({
    scenario,
    roomTemperature,
  })

  const requiredEnergyRemoval = Math.max(0, natural.totalEnergyChange)

  return Object.freeze({
    ...natural,
    requiredEnergyRemoval,
    requiredCoolingPerSecond: requiredEnergyRemoval / EQUALIZATION_INTERVAL_SECONDS,
  })
}

export function coolerAverageCapacityAtTemperature({
  coldSideTemperature,
  hotSideTemperature,
}) {
  const efficiency = coolerEfficiency({
    coldSideTemperature,
    hotSideTemperature,
  })

  const coolingPerSecond = Math.abs(VANILLA_DEVICES.cooler.heatPerSecond) * efficiency

  return Object.freeze({
    efficiency,
    coolingPerSecond,
    energyRemovalPerInterval: coolingPerSecond * EQUALIZATION_INTERVAL_SECONDS,
    hotSideHeatPerSecond: coolingPerSecond * VANILLA_DEVICES.cooler.heatOutputMultiplier,
  })
}

export function passiveCoolerAverageCapacityAtTemperature(roomTemperature) {
  assertFiniteNumber(roomTemperature, 'roomTemperature')

  const canControlAtTarget = roomTemperature >= VANILLA_DEVICES.passiveCooler.minimumTemperature
  const activeAtExactTemperature = passiveCoolerIsActive(roomTemperature)
  const coolingPerSecond = canControlAtTarget
    ? Math.abs(VANILLA_DEVICES.passiveCooler.heatPerSecond)
    : 0

  return Object.freeze({
    canControlAtTarget,
    activeAtExactTemperature,
    coolingPerSecond,
    energyRemovalPerInterval: coolingPerSecond * EQUALIZATION_INTERVAL_SECONDS,
  })
}

export function evaluateCoolerCount({
  scenario,
  coolerCount,
  roomTemperature = scenario.targetTemperature,
}) {
  assertNonNegativeInteger(coolerCount, 'coolerCount')

  const demand = coolingDemandAtTemperature({ scenario, roomTemperature })
  const unit = coolerAverageCapacityAtTemperature({
    coldSideTemperature: roomTemperature,
    hotSideTemperature: scenario.hotSideTemperature,
  })

  const availableEnergyRemoval = unit.energyRemovalPerInterval * coolerCount
  const marginEnergy = availableEnergyRemoval - demand.requiredEnergyRemoval

  return Object.freeze({
    device: 'cooler',
    count: coolerCount,
    roomTemperature,
    demand,
    unit,
    availableEnergyRemoval,
    marginEnergy,
    canSustain: demand.requiredEnergyRemoval === 0 || marginEnergy >= -1e-9,
    thermostatic: true,
  })
}

export function findMinimumCoolerCount({ scenario, maxDevices = 1000 }) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')

  const demand = coolingDemandAtTemperature({
    scenario,
    roomTemperature: scenario.targetTemperature,
  })

  if (demand.requiredEnergyRemoval === 0) {
    return Object.freeze({
      device: 'cooler',
      reachable: true,
      requiredCount: 0,
      evaluation: evaluateCoolerCount({ scenario, coolerCount: 0 }),
    })
  }

  const unit = coolerAverageCapacityAtTemperature({
    coldSideTemperature: scenario.targetTemperature,
    hotSideTemperature: scenario.hotSideTemperature,
  })

  if (unit.energyRemovalPerInterval <= 0) {
    return Object.freeze({
      device: 'cooler',
      reachable: false,
      requiredCount: null,
      reason: 'cooler-has-no-capacity-at-target',
      demand,
      unit,
    })
  }

  const requiredCount = Math.ceil(
    (demand.requiredEnergyRemoval - 1e-9) / unit.energyRemovalPerInterval,
  )

  if (requiredCount > maxDevices) {
    return Object.freeze({
      device: 'cooler',
      reachable: false,
      requiredCount: null,
      reason: 'device-limit-exceeded',
      demand,
      unit,
      minimumWithoutLimit: requiredCount,
    })
  }

  return Object.freeze({
    device: 'cooler',
    reachable: true,
    requiredCount,
    evaluation: evaluateCoolerCount({
      scenario,
      coolerCount: requiredCount,
    }),
  })
}

export function evaluatePassiveCoolerCount({
  scenario,
  passiveCoolerCount,
  roomTemperature = scenario.targetTemperature,
}) {
  assertNonNegativeInteger(passiveCoolerCount, 'passiveCoolerCount')

  const demand = coolingDemandAtTemperature({ scenario, roomTemperature })
  const unit = passiveCoolerAverageCapacityAtTemperature(roomTemperature)
  const availableEnergyRemoval = unit.energyRemovalPerInterval * passiveCoolerCount
  const marginEnergy = availableEnergyRemoval - demand.requiredEnergyRemoval

  return Object.freeze({
    device: 'passive-cooler',
    count: passiveCoolerCount,
    roomTemperature,
    demand,
    unit,
    availableEnergyRemoval,
    marginEnergy,
    canSustain: (
      unit.canControlAtTarget &&
      (demand.requiredEnergyRemoval === 0 || marginEnergy >= -1e-9)
    ),
    thermostatic: false,
    lowerTemperatureLimit: VANILLA_DEVICES.passiveCooler.minimumTemperature,
  })
}

export function findMinimumPassiveCoolerCount({ scenario, maxDevices = 1000 }) {
  assertNonNegativeInteger(maxDevices, 'maxDevices')

  const demand = coolingDemandAtTemperature({
    scenario,
    roomTemperature: scenario.targetTemperature,
  })

  if (demand.requiredEnergyRemoval === 0) {
    return Object.freeze({
      device: 'passive-cooler',
      reachable: true,
      requiredCount: 0,
      thermostatic: false,
      evaluation: evaluatePassiveCoolerCount({
        scenario,
        passiveCoolerCount: 0,
      }),
    })
  }

  const unit = passiveCoolerAverageCapacityAtTemperature(scenario.targetTemperature)

  if (!unit.canControlAtTarget) {
    return Object.freeze({
      device: 'passive-cooler',
      reachable: false,
      requiredCount: null,
      thermostatic: false,
      reason: 'passive-cooler-minimum-temperature',
      lowerTemperatureLimit: VANILLA_DEVICES.passiveCooler.minimumTemperature,
      demand,
      unit,
    })
  }

  const requiredCount = Math.ceil(
    (demand.requiredEnergyRemoval - 1e-9) / unit.energyRemovalPerInterval,
  )

  if (requiredCount > maxDevices) {
    return Object.freeze({
      device: 'passive-cooler',
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
    device: 'passive-cooler',
    reachable: true,
    requiredCount,
    thermostatic: false,
    lowerTemperatureLimit: VANILLA_DEVICES.passiveCooler.minimumTemperature,
    evaluation: evaluatePassiveCoolerCount({
      scenario,
      passiveCoolerCount: requiredCount,
    }),
  })
}
