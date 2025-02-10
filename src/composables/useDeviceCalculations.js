import { deviceSpecs } from '@/constants/deviceSpecs'
import { useRoomCalculations } from '@/composables/useRoomCalculations'

export function useDeviceCalculations() {
    const { calculateRoomRequiredCapacity } = useRoomCalculations()

    // Вентиляторы
    const autoSelectFan = (system) => {
        const totalCapacity = system.rooms.reduce((total, room) => {
            const count = room.count || 1
            return total + (calculateRoomRequiredCapacity(room) * count)
        }, 0)

        const countSmall = Math.ceil(totalCapacity / deviceSpecs.fans.smallFan.capacity)
        const costSmall = countSmall * deviceSpecs.fans.smallFan.steel +
            countSmall * deviceSpecs.fans.smallFan.components
        const elecSmall = countSmall * deviceSpecs.fans.smallFan.power

        const countLarge = Math.ceil(totalCapacity / deviceSpecs.fans.largeFan.capacity)
        const costLarge = countLarge * deviceSpecs.fans.largeFan.steel +
            countLarge * deviceSpecs.fans.largeFan.components
        const elecLarge = countLarge * deviceSpecs.fans.largeFan.power

        if (costSmall < costLarge || (costSmall === costLarge && elecSmall <= elecLarge)) {
            return { selectedType: 'smallFan', count: countSmall }
        } else {
            return { selectedType: 'largeFan', count: countLarge }
        }
    }

    const calculateFansManual = (system) => {
        const totalCapacity = system.rooms.reduce((total, room) => {
            const count = room.count || 1
            return total + (calculateRoomRequiredCapacity(room) * count)
        }, 0)
        return Math.ceil(totalCapacity / deviceSpecs.fans[system.fanType].capacity)
    }

    // Центральные блоки
    const autoSelectUnit = (system) => {
        const totalCapacity = system.rooms.reduce((total, room) => {
            const count = room.count || 1
            return total + (calculateRoomRequiredCapacity(room) * count)
        }, 0)

        const countSmall = Math.ceil(totalCapacity / deviceSpecs.units.smallUnit.capacity)
        const costSmall = countSmall * deviceSpecs.units.smallUnit.steel +
            countSmall * deviceSpecs.units.smallUnit.components
        const elecSmall = countSmall * deviceSpecs.units.smallUnit.power

        const countLarge = Math.ceil(totalCapacity / deviceSpecs.units.largeUnit.capacity)
        const costLarge = countLarge * deviceSpecs.units.largeUnit.steel +
            countLarge * deviceSpecs.units.largeUnit.components
        const elecLarge = countLarge * deviceSpecs.units.largeUnit.power

        if (costSmall < costLarge || (costSmall === costLarge && elecSmall <= elecLarge)) {
            return { selectedType: 'smallUnit', count: countSmall }
        } else {
            return { selectedType: 'largeUnit', count: countLarge }
        }
    }

    const calculateUnitsManual = (system) => {
        const totalCapacity = system.rooms.reduce((total, room) => {
            const count = room.count || 1
            return total + (calculateRoomRequiredCapacity(room) * count)
        }, 0)
        return Math.ceil(totalCapacity / deviceSpecs.units[system.centralUnitType].capacity)
    }

    return {
        autoSelectFan,
        calculateFansManual,
        autoSelectUnit,
        calculateUnitsManual
    }
} 