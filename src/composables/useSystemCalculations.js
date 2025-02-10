import { deviceSpecs } from '@/constants/deviceSpecs'
import { useDeviceCalculations } from '@/composables/useDeviceCalculations'
import { useRoomCalculations } from '@/composables/useRoomCalculations'

export function useSystemCalculations() {
    const { autoSelectFan, calculateFansManual, autoSelectUnit, calculateUnitsManual } = useDeviceCalculations()
    const { calculateRoomVents, autoSelectVentForRoom } = useRoomCalculations()

    // Расчет ресурсов для вентиляторов
    const getFanResources = (system) => {
        let fanCount, fanType
        if (system.fanType === 'auto') {
            const info = autoSelectFan(system)
            fanCount = info.count
            fanType = info.selectedType
        } else {
            fanCount = calculateFansManual(system)
            fanType = system.fanType
        }
        let spec = deviceSpecs.fans[fanType]
        return {
            type: spec.name,
            count: fanCount,
            steel: fanCount * spec.steel,
            components: fanCount * spec.components,
            power: fanCount * spec.power
        }
    }

    // Расчет ресурсов для центральных блоков
    const getUnitResources = (system) => {
        let unitCount, unitType
        if (system.centralUnitType === 'auto') {
            const info = autoSelectUnit(system)
            unitCount = info.count
            unitType = info.selectedType
        } else {
            unitCount = calculateUnitsManual(system)
            unitType = system.centralUnitType
        }
        let spec = deviceSpecs.units[unitType]
        return {
            type: spec.name,
            count: unitCount,
            steel: unitCount * spec.steel,
            components: unitCount * spec.components,
            power: unitCount * spec.power
        }
    }

    // Расчет ресурсов для вентиляции
    const getVentResources = (system) => {
        if (system.ventType !== 'auto') {
            const totalCount = system.rooms.reduce((total, room) => {
                const count = room.count || 1
                return total + (calculateRoomVents(room, system) * count)
            }, 0)
            const totalSteel = totalCount * deviceSpecs.vents[system.ventType].steel
            return {
                type: deviceSpecs.vents[system.ventType].name,
                count: totalCount,
                steel: totalSteel
            }
        } else {
            const breakdown = {}
            system.rooms.forEach(room => {
                const res = autoSelectVentForRoom(room)
                const count = room.count || 1
                if (!breakdown[res.selectedType]) {
                    breakdown[res.selectedType] = { count: 0, steel: 0 }
                }
                breakdown[res.selectedType].count += res.count * count
                breakdown[res.selectedType].steel += res.count * count * deviceSpecs.vents[res.selectedType].steel
            })

            const totalCount = Object.values(breakdown).reduce((sum, v) => sum + v.count, 0)
            const totalSteel = Object.values(breakdown).reduce((sum, v) => sum + v.steel, 0)
            const descArr = Object.entries(breakdown).map(([type, data]) =>
                `${deviceSpecs.vents[type].name}: ${data.count} шт`)

            return {
                type: descArr.join('; '),
                count: totalCount,
                steel: totalSteel
            }
        }
    }

    // Расчет общей мощности системы
    const calculateSystemPower = (system) => {
        const fanRes = getFanResources(system)
        const unitRes = getUnitResources(system)
        return fanRes.power + unitRes.power
    }

    // Расчет общих ресурсов системы
    const calculateSystemResources = (system) => {
        const fanRes = getFanResources(system)
        const unitRes = getUnitResources(system)
        const ventRes = getVentResources(system)

        return {
            steel: fanRes.steel + unitRes.steel + ventRes.steel,
            components: fanRes.components + unitRes.components,
            power: fanRes.power + unitRes.power
        }
    }

    return {
        getFanResources,
        getUnitResources,
        getVentResources,
        calculateSystemPower,
        calculateSystemResources
    }
} 