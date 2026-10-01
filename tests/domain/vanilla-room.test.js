import { describe, expect, it } from 'vitest'

import {
  adjustedOutdoorTemperatureDifference,
  controlTemperatureChange,
  createRectangularRoomGeometry,
  outdoorWallSampleTemperatureDelta,
  roofEqualizationTemperatureChangePerInterval,
  wallEqualizationTemperatureChangePerInterval,
} from '@/domain/climate/vanilla'

describe('vanilla room temperature primitives', () => {
  it('derives cell count and exposed wall samples for a rectangular room', () => {
    expect(createRectangularRoomGeometry({ width: 10, height: 10 })).toEqual({
      width: 10,
      height: 10,
      cellCount: 100,
      exposedWallSampleCount: 40,
    })
  })

  it('uses the raw outdoor temperature difference below 100 C', () => {
    expect(adjustedOutdoorTemperatureDifference({
      roomTemperature: 20,
      outdoorTemperature: -30,
    })).toBe(-50)
  })

  it('applies RimWorld accelerated extreme-temperature adjustment beyond 100 C', () => {
    expect(adjustedOutdoorTemperatureDifference({
      roomTemperature: 150,
      outdoorTemperature: -50,
    })).toBe(-600)
  })

  it('calculates thin-roof exchange for a fully roofed room', () => {
    const result = roofEqualizationTemperatureChangePerInterval({
      roomTemperature: 20,
      outdoorTemperature: -30,
    })

    expect(result.thinRoof).toBeCloseTo(-0.3, 10)
    expect(result.noRoof).toBe(0)
    expect(result.thickRoof).toBe(0)
    expect(result.total).toBeCloseTo(-0.3, 10)
  })

  it('makes missing roof fourteen times as conductive as thin roof for the same coverage', () => {
    const thin = roofEqualizationTemperatureChangePerInterval({
      roomTemperature: 20,
      outdoorTemperature: -30,
      thinRoofCoverage: 1,
      noRoofCoverage: 0,
      thickRoofCoverage: 0,
    })

    const open = roofEqualizationTemperatureChangePerInterval({
      roomTemperature: 20,
      outdoorTemperature: -30,
      thinRoofCoverage: 0,
      noRoofCoverage: 1,
      thickRoofCoverage: 0,
    })

    expect(open.total / thin.total).toBeCloseTo(14, 10)
  })

  it('only lets thick roof pull temperatures down toward 15 C', () => {
    const hotRoom = roofEqualizationTemperatureChangePerInterval({
      roomTemperature: 25,
      outdoorTemperature: 40,
      thinRoofCoverage: 0,
      noRoofCoverage: 0,
      thickRoofCoverage: 1,
    })

    const coldRoom = roofEqualizationTemperatureChangePerInterval({
      roomTemperature: 5,
      outdoorTemperature: -30,
      thinRoofCoverage: 0,
      noRoofCoverage: 0,
      thickRoofCoverage: 1,
    })

    expect(hotRoom.total).toBeCloseTo(-0.06, 10)
    expect(coldRoom.total).toBe(0)
  })

  it('calculates wall exchange from average sampled temperature delta', () => {
    const change = wallEqualizationTemperatureChangePerInterval({
      averageSampleTemperatureDelta: -50,
      equalizeCellCount: 40,
      roomCellCount: 100,
    })

    expect(change).toBeCloseTo(-0.408, 10)
  })

  it('models the standard double-wall outdoor fallback as half the direct delta', () => {
    expect(outdoorWallSampleTemperatureDelta({
      roomTemperature: 20,
      outdoorTemperature: -30,
      wallLayers: 1,
    })).toBe(-50)

    expect(outdoorWallSampleTemperatureDelta({
      roomTemperature: 20,
      outdoorTemperature: -30,
      wallLayers: 2,
    })).toBe(-25)
  })

  it('limits controlled heating to both available energy and thermostat target', () => {
    expect(controlTemperatureChange({
      roomTemperature: 0,
      targetTemperature: 21,
      roomCellCount: 100,
      energyLimit: 87.5,
    })).toBeCloseTo(0.875, 10)

    expect(controlTemperatureChange({
      roomTemperature: 20.8,
      targetTemperature: 21,
      roomCellCount: 100,
      energyLimit: 87.5,
    })).toBeCloseTo(0.2, 10)
  })
})
