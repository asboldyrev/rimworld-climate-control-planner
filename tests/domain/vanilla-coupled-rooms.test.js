import { describe, expect, it } from 'vitest'

import {
  averageVentTransferPerInterval,
  createRectangularHeatingScenario,
  createThermalZone,
  createTwoRoomHeatingPlan,
  findMinimumHeaterCountForTwoRooms,
  simulateTwoRoomHeatingPlan,
} from '@/domain/climate/vanilla'

describe('two-room Vent capacity planning', () => {
  it('uses 120/250 expected Vent pulses per natural-equalization interval', () => {
    const result = averageVentTransferPerInterval({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 100,
      }),
      ventCount: 1,
    })

    expect(result.expectedPulseCount).toBeCloseTo(0.48, 10)
    expect(result.fullPulses).toBe(0)
    expect(result.fractionalPulse).toBeCloseTo(0.48, 10)
    expect(result.energyChanges[0]).toBeCloseTo(-67.2, 10)
    expect(result.energyChanges[1]).toBeCloseTo(67.2, 10)
  })

  it('applies multiple expected pulses sequentially instead of multiplying the first pulse', () => {
    const result = averageVentTransferPerInterval({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 10,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 10,
      }),
      ventCount: 5,
    })

    expect(result.expectedPulseCount).toBeCloseTo(2.4, 10)
    expect(result.zones[0].temperature).toBeGreaterThanOrEqual(20)
    expect(result.zones[1].temperature).toBeLessThanOrEqual(20)
    expect(result.energyChanges[0] + result.energyChanges[1]).toBeCloseTo(0, 10)
  })

  it('converges two connected rooms under an average-power Heater model', () => {
    const roomA = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 25,
    })
    const roomB = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 15,
    })

    const plan = createTwoRoomHeatingPlan({
      roomA,
      roomB,
      ventCount: 1,
      heaterRoom: 'A',
      heaterSetpoint: 25,
    })

    const result = simulateTwoRoomHeatingPlan({
      plan,
      heaterCount: 4,
    })

    expect(result.converged).toBe(true)
    expect(result.temperatures.A).toBeLessThanOrEqual(25.001)
    expect(result.temperatures.A).toBeGreaterThan(result.temperatures.B)
    expect(result.temperatures.B).toBeGreaterThan(-30)
  })

  it('reports equal target temperatures as unreachable from one thermostat room when a gradient is required', () => {
    const roomA = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 20,
    })
    const roomB = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 20,
    })

    const plan = createTwoRoomHeatingPlan({
      roomA,
      roomB,
      ventCount: 1,
      heaterRoom: 'A',
      heaterSetpoint: 20,
    })

    const result = findMinimumHeaterCountForTwoRooms({ plan })

    expect(result.reachable).toBe(false)
    expect(result.reason).toBe('targets-unreachable-at-heater-setpoint')
    expect(result.theoreticalMaximum.temperatures.A).toBeCloseTo(20, 2)
    expect(result.theoreticalMaximum.temperatures.B).toBeLessThan(20)
  })

  it('finds a finite minimum Heater count when the source room setpoint is above the adjacent-room target', () => {
    const roomA = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 25,
    })
    const roomB = createRectangularHeatingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: -30,
      targetTemperature: 15,
    })

    const plan = createTwoRoomHeatingPlan({
      roomA,
      roomB,
      ventCount: 2,
      heaterRoom: 'A',
      heaterSetpoint: 25,
    })

    const result = findMinimumHeaterCountForTwoRooms({
      plan,
      maxDevices: 20,
    })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBeGreaterThan(0)
    expect(result.requiredCount).toBeLessThanOrEqual(20)
    expect(result.simulation.temperatures.A).toBeGreaterThanOrEqual(24.99)
    expect(result.simulation.temperatures.B).toBeGreaterThanOrEqual(14.99)
  })
})
