import { describe, expect, it } from 'vitest'

import {
  createRectangularHeatingScenario,
  evaluateHeaterCount,
  findMaximumHeaterEquilibriumTemperature,
  findMinimumCampfireCount,
  findMinimumHeaterCount,
  heatingDemandAtTemperature,
  roomNaturalTemperatureChangePerInterval,
} from '@/domain/climate/vanilla'

describe('vanilla rectangular-room heating model', () => {
  const scenario = createRectangularHeatingScenario({
    width: 10,
    height: 10,
    outdoorTemperature: -30,
    targetTemperature: 20,
  })

  it('combines wall and roof loss into one interval result', () => {
    const result = roomNaturalTemperatureChangePerInterval({
      scenario,
      roomTemperature: 20,
    })

    expect(result.walls).toBeCloseTo(-0.408, 10)
    expect(result.roof.total).toBeCloseTo(-0.3, 10)
    expect(result.totalTemperatureChange).toBeCloseTo(-0.708, 10)
    expect(result.totalEnergyChange).toBeCloseTo(-70.8, 10)
  })

  it('converts natural temperature loss into heating demand', () => {
    const result = heatingDemandAtTemperature({
      scenario,
      roomTemperature: 20,
    })

    expect(result.requiredEnergy).toBeCloseTo(70.8, 10)
    expect(result.requiredHeatPerSecond).toBeCloseTo(35.4, 10)
  })

  it('requires two heaters for a 10x10 room at -30 C targeting 20 C', () => {
    const result = findMinimumHeaterCount({ scenario })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(2)
    expect(result.evaluation.canSustain).toBe(true)
    expect(result.evaluation.marginEnergy).toBeCloseTo(13.2, 10)
  })

  it('shows one heater cannot sustain that target', () => {
    const result = evaluateHeaterCount({
      scenario,
      heaterCount: 1,
    })

    expect(result.canSustain).toBe(false)
    expect(result.marginEnergy).toBeCloseTo(-28.8, 10)
  })

  it('requires fewer heaters with standard double walls', () => {
    const doubleWallScenario = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 20,
      wallLayers: 2,
    })

    const demand = heatingDemandAtTemperature({
      scenario: doubleWallScenario,
      roomTemperature: 20,
    })

    expect(demand.requiredEnergy).toBeCloseTo(50.4, 10)
    expect(findMinimumHeaterCount({
      scenario: doubleWallScenario,
    }).requiredCount).toBe(2)
  })

  it('requires no heater when the environment naturally warms the room at target', () => {
    const warmOutside = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 30,
      targetTemperature: 20,
    })

    const result = findMinimumHeaterCount({ scenario: warmOutside })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(0)
  })

  it('marks targets above heater zero-efficiency temperature as unreachable', () => {
    const extreme = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 121,
    })

    const result = findMinimumHeaterCount({ scenario: extreme })

    expect(result.reachable).toBe(false)
    expect(result.reason).toBe('heater-has-no-capacity-at-target')
  })

  it('finds the maximum average-power equilibrium for a heater count', () => {
    const result = findMaximumHeaterEquilibriumTemperature({
      scenario,
      heaterCount: 1,
    })

    expect(result.converged).toBe(true)
    expect(result.temperature).toBeCloseTo(-0.339, 2)
  })

  it('accepts the global RimWorld temperature bounds and rejects values outside them', () => {
    expect(() => createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -273.15,
      targetTemperature: 1000,
    })).not.toThrow()

    expect(() => createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -273.16,
      targetTemperature: 20,
    })).toThrow(RangeError)

    expect(() => createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 1000.01,
    })).toThrow(RangeError)
  })

  it('treats campfire as non-thermostatic and refuses targets at its cutoff', () => {
    const campfireTarget = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 28,
    })

    const result = findMinimumCampfireCount({
      scenario: campfireTarget,
    })

    expect(result.reachable).toBe(false)
    expect(result.thermostatic).toBe(false)
    expect(result.reason).toBe('campfire-stops-heating-at-target')
  })
})
