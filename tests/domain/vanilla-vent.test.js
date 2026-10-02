import { describe, expect, it } from 'vitest'

import {
  createThermalZone,
  equalizeThermalZonesThroughBuildingPulse,
  equalizeTwoRoomsThroughVentPulse,
  totalMutableZoneEnergyChange,
  VANILLA_DEVICES,
} from '@/domain/climate/vanilla'

describe('vanilla Vent thermal-zone equalization', () => {
  it('uses the source-backed Vent rate of 14', () => {
    expect(VANILLA_DEVICES.vent.equalizationRate).toBe(14)
  })

  it('moves equal and opposite energy between two ordinary rooms', () => {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: createThermalZone({
        id: 'hot',
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        id: 'cold',
        temperature: 10,
        cellCount: 100,
      }),
    })

    expect(result.averageTemperature).toBe(20)
    expect(result.scale).toBe(1)
    expect(result.zones[0].temperature).toBeCloseTo(28.6, 10)
    expect(result.zones[1].temperature).toBeCloseTo(11.4, 10)
    expect(result.energyChanges[0]).toBeCloseTo(-140, 10)
    expect(result.energyChanges[1]).toBeCloseTo(140, 10)
    expect(totalMutableZoneEnergyChange(result)).toBeCloseTo(0, 10)
  })

  it('changes smaller rooms more for the same transferred energy', () => {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 25,
      }),
    })

    expect(result.zones[0].temperature).toBeCloseTo(28.6, 10)
    expect(result.zones[1].temperature).toBeCloseTo(15.6, 10)
    expect(result.energyChanges[0]).toBeCloseTo(-140, 10)
    expect(result.energyChanges[1]).toBeCloseTo(140, 10)
  })

  it('scales the whole transfer so a tiny room cannot overshoot the arithmetic mean', () => {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 10,
      }),
    })

    expect(result.averageTemperature).toBe(20)
    expect(result.scale).toBeCloseTo(10 / 14, 10)
    expect(result.zones[0].temperature).toBeCloseTo(29, 10)
    expect(result.zones[1].temperature).toBeCloseTo(20, 10)
    expect(result.energyChanges[0]).toBeCloseTo(-100, 10)
    expect(result.energyChanges[1]).toBeCloseTo(100, 10)
  })

  it('includes an outdoor-temperature room in the average but does not mutate it', () => {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 100,
        usesOutdoorTemperature: true,
      }),
    })

    expect(result.averageTemperature).toBe(20)
    expect(result.zones[0].temperature).toBeCloseTo(28.6, 10)
    expect(result.zones[1].temperature).toBe(10)
    expect(result.energyChanges[0]).toBeCloseTo(-140, 10)
    expect(result.energyChanges[1]).toBe(0)
  })

  it('applies the RimWorld vacuum factor only when a mutable room is losing heat', () => {
    const result = equalizeTwoRoomsThroughVentPulse({
      roomA: createThermalZone({
        temperature: 30,
        cellCount: 100,
      }),
      roomB: createThermalZone({
        temperature: 10,
        cellCount: 100,
      }),
      inVacuum: true,
    })

    expect(result.zones[0].temperature).toBeCloseTo(29.86, 10)
    expect(result.zones[1].temperature).toBeCloseTo(11.4, 10)
    expect(result.energyChanges[0]).toBeCloseTo(-14, 10)
    expect(result.energyChanges[1]).toBeCloseTo(140, 10)
  })

  it('returns a no-op when the building resolves to only one unique room', () => {
    const room = createThermalZone({
      id: 'same-room',
      temperature: 20,
      cellCount: 100,
    })

    const result = equalizeThermalZonesThroughBuildingPulse({
      zones: [room, room],
      rate: VANILLA_DEVICES.vent.equalizationRate,
    })

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].temperature).toBe(20)
    expect(result.energyChanges[0]).toBe(0)
  })

  it('deduplicates separate zone objects that carry the same room id', () => {
    const result = equalizeThermalZonesThroughBuildingPulse({
      zones: [
        createThermalZone({
          id: 'same-room',
          temperature: 20,
          cellCount: 100,
        }),
        createThermalZone({
          id: 'same-room',
          temperature: 20,
          cellCount: 100,
        }),
      ],
      rate: VANILLA_DEVICES.vent.equalizationRate,
    })

    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].temperature).toBe(20)
  })

  it('rejects invalid thermal-zone temperatures through the shared game bounds', () => {
    expect(() => createThermalZone({
      temperature: -273.16,
      cellCount: 100,
    })).toThrow(RangeError)

    expect(() => createThermalZone({
      temperature: 1000.01,
      cellCount: 100,
    })).toThrow(RangeError)
  })
})
