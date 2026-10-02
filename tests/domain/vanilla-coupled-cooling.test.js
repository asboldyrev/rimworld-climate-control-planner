import { describe, expect, it } from 'vitest'

import {
  averageCoolerTransferPerInterval,
  coolerBetweenRoomsPulse,
  createRectangularCoolingScenario,
  createThermalZone,
  createTwoRoomCoolingPlan,
  findMinimumCoolerCountForTwoRooms,
  simulateTwoRoomCoolingPlan,
} from '@/domain/climate/vanilla'

describe('two-room Cooler planning', () => {
  it('injects full available hot-side heat when an active pulse is thermostat-clamped', () => {
    const result = coolerBetweenRoomsPulse({
      coldRoom: createThermalZone({
        temperature: 20.1,
        cellCount: 100,
      }),
      hotRoom: createThermalZone({
        temperature: 40,
        cellCount: 100,
      }),
      targetTemperature: 20,
    })

    expect(result.active).toBe(true)
    expect(result.energyChanges[0]).toBeCloseTo(-10, 10)
    expect(result.hotEnergyRequested).toBeGreaterThan(90)
    expect(result.energyChanges[1]).toBeCloseTo(result.hotEnergyRequested, 10)
  })

  it('does not heat an outdoor-temperature hot side', () => {
    const result = coolerBetweenRoomsPulse({
      coldRoom: createThermalZone({
        temperature: 25,
        cellCount: 100,
      }),
      hotRoom: createThermalZone({
        temperature: 40,
        cellCount: 100,
        usesOutdoorTemperature: true,
      }),
      targetTemperature: 20,
    })

    expect(result.active).toBe(true)
    expect(result.energyChanges[0]).toBeLessThan(0)
    expect(result.energyChanges[1]).toBe(0)
    expect(result.zones[1].temperature).toBe(40)
  })

  it('uses 120/250 expected Cooler pulses per device per planning interval', () => {
    const result = averageCoolerTransferPerInterval({
      coldRoom: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      hotRoom: createThermalZone({
        temperature: 40,
        cellCount: 100,
      }),
      coolerCount: 1,
      targetTemperature: 20,
    })

    expect(result.expectedPulseCount).toBeCloseTo(0.48, 10)
    expect(result.fullPulses).toBe(0)
    expect(result.fractionalPulse).toBeCloseTo(0.48, 10)
    expect(result.energyChanges[0]).toBeLessThan(0)
    expect(result.energyChanges[1]).toBeGreaterThan(0)
  })

  it('stops later sequential pulses after the cold side reaches setpoint', () => {
    const result = averageCoolerTransferPerInterval({
      coldRoom: createThermalZone({
        temperature: 20.1,
        cellCount: 100,
      }),
      hotRoom: createThermalZone({
        temperature: 40,
        cellCount: 100,
      }),
      coolerCount: 5,
      targetTemperature: 20,
    })

    expect(result.expectedPulseCount).toBeCloseTo(2.4, 10)
    expect(result.zones[0].temperature).toBeCloseTo(20, 10)
    expect(result.activePulseEquivalent).toBe(1)
  })

  it('converges a cold room and a real indoor exhaust room', () => {
    const coldRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 20,
    })
    const hotRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 100,
    })

    const plan = createTwoRoomCoolingPlan({
      coldRoom,
      hotRoom,
      coolerSetpoint: 20,
    })

    const result = simulateTwoRoomCoolingPlan({
      plan,
      coolerCount: 3,
    })

    expect(result.converged).toBe(true)
    expect(result.temperatures.cold).toBeCloseTo(20, 2)
    expect(result.temperatures.hot).toBeGreaterThan(40)
    expect(result.temperatures.hot).toBeLessThan(100)
  })

  it('finds three Coolers for the 20 C room with a 100 C exhaust-room limit', () => {
    const coldRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 20,
    })
    const hotRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 100,
    })

    const result = findMinimumCoolerCountForTwoRooms({
      plan: createTwoRoomCoolingPlan({
        coldRoom,
        hotRoom,
        coolerSetpoint: 20,
      }),
      maxDevices: 10,
    })

    expect(result.reachable).toBe(true)
    expect(result.requiredCount).toBe(3)
    expect(result.simulation.temperatures.cold).toBeLessThanOrEqual(20.01)
    expect(result.simulation.temperatures.hot).toBeLessThanOrEqual(100.01)
  })

  it('can become unreachable when the exhaust-room maximum is too low', () => {
    const coldRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 20,
    })
    const hotRoom = createRectangularCoolingScenario({
      width: 10,
      height: 10,
      outdoorTemperature: 40,
      targetTemperature: 60,
    })

    const result = findMinimumCoolerCountForTwoRooms({
      plan: createTwoRoomCoolingPlan({
        coldRoom,
        hotRoom,
        coolerSetpoint: 20,
      }),
      maxDevices: 10,
    })

    expect(result.reachable).toBe(false)
    expect(result.reason).toBe('targets-unreachable-within-device-limit')
  })
})
