import { deviceSpecs } from '@/constants/deviceSpecs'

export function useRoomCalculations() {
    // Базовый расчет требуемой мощности для комнаты
    const calculateRoomRequiredCapacity = (room) => {
        let R = room.length * room.width * 1.3
        if (room.doubleWall) {
            R /= 2
        }
        return R
    }

    // Подбор оптимального типа вентиляции для комнаты
    const autoSelectVentForRoom = (room) => {
        let R = calculateRoomRequiredCapacity(room)
        let best = null

        Object.keys(deviceSpecs.vents).forEach(type => {
            let count = Math.max(1, Math.round(R / deviceSpecs.vents[type].capacity))
            let cost = count * deviceSpecs.vents[type].steel
            if (!best || cost < best.cost || (cost === best.cost && count < best.count)) {
                best = { selectedType: type, count, cost }
            }
        })

        return best
    }

    // Расчет количества вентиляции для комнаты
    const calculateRoomVents = (room, system) => {
        let R = calculateRoomRequiredCapacity(room)
        if (system.ventType === 'auto') {
            let autoRes = autoSelectVentForRoom(room)
            return autoRes.count
        } else {
            let ventCapacity = deviceSpecs.vents[system.ventType].capacity
            return Math.max(1, Math.round(R / ventCapacity))
        }
    }

    return {
        calculateRoomRequiredCapacity,
        autoSelectVentForRoom,
        calculateRoomVents
    }
} 