import { describe, expect, it } from 'vitest'

import {
  campfireTemperatureChangePerSecond,
  coolerEfficiency,
  coolerTemperatureChangePerRareTick,
  heaterEfficiencyAtTemperature,
  heaterTemperatureChangePerRareTick,
  passiveCoolerIsActive,
  passiveCoolerTemperatureChangePerSecond,
} from '@/domain/climate/vanilla'

describe('vanilla heating devices', () => {
  it('runs a heater at full efficiency below 20 C', () => {
    expect(heaterEfficiencyAtTemperature(19.9)).toBe(1)
  })

describe('vanilla cooling device primitives', () => {
  it('applies the exact Cooler efficiency formula for hot and cold sides', () => {
    expect(coolerEfficiency({
      coldSideTemperature: 20,
      hotSideTemperature: 40,
    })).toBeCloseTo(110 / 130, 10)
  })

  it('uses the hot-side 40 C penalty floor when it dominates', () => {
    expect(coolerEfficiency({
      coldSideTemperature: 60,
      hotSideTemperature: 50,
    })).toBeCloseTo(120 / 130, 10)
  })

  it('clamps Cooler efficiency only at zero, not at one', () => {
    expect(coolerEfficiency({
      coldSideTemperature: 20,
      hotSideTemperature: 0,
    })).toBeGreaterThan(1)

    expect(coolerEfficiency({
      coldSideTemperature: 20,
      hotSideTemperature: 200,
    })).toBe(0)
  })

  it('applies one Cooler TickRare worth of cooling with thermostat clamping', () => {
    expect(coolerTemperatureChangePerRareTick({
      roomTemperature: 20,
      targetTemperature: 0,
      roomCellCount: 100,
      hotSideTemperature: 40,
    })).toBeCloseTo(-0.7403846154, 10)
  })

  it('uses a strict greater-than 17 C activation threshold for Passive Cooler', () => {
    expect(passiveCoolerIsActive(17)).toBe(false)
    expect(passiveCoolerIsActive(17.01)).toBe(true)
  })

  it('pushes Passive Cooler energy only while above its threshold', () => {
    expect(passiveCoolerTemperatureChangePerSecond({
      roomTemperature: 20,
      roomCellCount: 100,
    })).toBeCloseTo(-0.11, 10)

    expect(passiveCoolerTemperatureChangePerSecond({
      roomTemperature: 17,
      roomCellCount: 100,
    })).toBe(0)
  })
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
