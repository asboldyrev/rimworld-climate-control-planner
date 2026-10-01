import { describe, expect, it } from 'vitest'

import {
  coolerAverageCapacityAtTemperature,
  coolingDemandAtTemperature,
  createRectangularCoolingScenario,
  findMinimumCoolerCount,
  findMinimumPassiveCoolerCount,
  passiveCoolerAverageCapacityAtTemperature,
} from '@/domain/climate/vanilla'

describe('vanilla rectangular-room cooling model', () => {
  it('calculates cooling demand for a hot 10x10 room target', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 20,
    })

    const demand = coolingDemandAtTemperature({
      scenario,
      roomTemperature: 20,
    })

    expect(demand.totalTemperatureChange).toBeCloseTo(0.2832, 10)
    expect(demand.requiredEnergyRemoval).toBeCloseTo(28.32, 10)
    expect(demand.requiredCoolingPerSecond).toBeCloseTo(14.16, 10)
  })

  it('applies source-backed Cooler efficiency at 40 C hot side and 20 C cold side', () => {
    const unit = coolerAverageCapacityAtTemperature({
      coldSideTemperature: 20,
      hotSideTemperature: 40,
    })

    expect(unit.efficiency).toBeCloseTo(110 / 130, 10)
    expect(unit.coolingPerSecond).toBeCloseTo(17.7692307692, 10)
  })

  it('requires one Cooler for the 10x10 / 40 C / 20 C scenario', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 20,
    })

    const result = findMinimumCoolerCount({ scenario })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(1)
    expect(result.evaluation.canSustain).toBe(true)
  })

  it('requires three Coolers for a -10 C freezer with a 40 C hot side', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: -10,
    })

    const result = findMinimumCoolerCount({ scenario })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(3)
  })

  it('allows hot-side temperature to differ from outdoors', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      hotSideTemperature: 60,
      targetTemperature: -10,
    })

    const result = findMinimumCoolerCount({ scenario })

    expect(result.requiredCount).toBe(4)
    expect(result.evaluation.unit.efficiency).toBeCloseTo(60 / 130, 10)
  })

  it('marks a Cooler target unreachable when efficiency reaches zero', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 200,
      hotSideTemperature: 200,
      targetTemperature: 20,
    })

    const result = findMinimumCoolerCount({ scenario })

    expect(result.reachable).toBe(false)
    expect(result.reason).toBe('cooler-has-no-capacity-at-target')
  })

  it('treats 17 C as the Passive Cooler lower planning limit', () => {
    const atLimit = passiveCoolerAverageCapacityAtTemperature(17)
    const belowLimit = passiveCoolerAverageCapacityAtTemperature(16.9)

    expect(atLimit.canControlAtTarget).toBe(true)
    expect(atLimit.activeAtExactTemperature).toBe(false)
    expect(atLimit.coolingPerSecond).toBe(11)

    expect(belowLimit.canControlAtTarget).toBe(false)
    expect(belowLimit.coolingPerSecond).toBe(0)
  })

  it('requires two Passive Coolers to hold near 17 C in the reference hot room', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 17,
    })

    const result = findMinimumPassiveCoolerCount({ scenario })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(2)
  })

  it('rejects Passive Cooler targets below 17 C', () => {
    const scenario = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 10,
    })

    const result = findMinimumPassiveCoolerCount({ scenario })

    expect(result.reachable).toBe(false)
    expect(result.reason).toBe('passive-cooler-minimum-temperature')
  })
})
