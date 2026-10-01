import { describe, expect, it } from 'vitest'

import {
  campfireTemperatureChangePerSecond,
  heaterEfficiencyAtTemperature,
  heaterTemperatureChangePerRareTick,
} from '@/domain/climate/vanilla'

describe('vanilla heating devices', () => {
  it('runs a heater at full efficiency below 20 C', () => {
    expect(heaterEfficiencyAtTemperature(19.9)).toBe(1)
  })

  it('linearly reduces heater efficiency between 20 C and 120 C', () => {
    expect(heaterEfficiencyAtTemperature(70)).toBeCloseTo(0.5, 10)
  })

  it('stops heater output above 120 C', () => {
    expect(heaterEfficiencyAtTemperature(120.1)).toBe(0)
  })

  it('applies one heater TickRare worth of heat across room cells', () => {
    expect(heaterTemperatureChangePerRareTick({
      roomTemperature: 0,
      targetTemperature: 21,
      roomCellCount: 100,
    })).toBeCloseTo(0.875, 10)
  })

  it('stops a heater at its configured target', () => {
    expect(heaterTemperatureChangePerRareTick({
      roomTemperature: 21,
      targetTemperature: 21,
      roomCellCount: 100,
    })).toBe(0)
  })

  it('applies campfire heat while below its hard maximum', () => {
    expect(campfireTemperatureChangePerSecond({
      roomTemperature: 20,
      roomCellCount: 100,
    })).toBeCloseTo(0.21, 10)
  })

  it('does not clamp the final campfire push to 28 C', () => {
    expect(campfireTemperatureChangePerSecond({
      roomTemperature: 27.95,
      roomCellCount: 10,
    })).toBeCloseTo(2.1, 10)
  })

  it('stops new campfire heat pushes once ambient temperature reaches 28 C', () => {
    expect(campfireTemperatureChangePerSecond({
      roomTemperature: 28,
      roomCellCount: 100,
    })).toBe(0)
  })
})
