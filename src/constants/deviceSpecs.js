export const deviceSpecs = {
    fans: {
        smallFan: {
            name: 'Маленький вентилятор',
            capacity: 300,
            power: 150,
            steel: 100,
            components: 1
        },
        largeFan: {
            name: 'Большой вентилятор',
            capacity: 1500,
            power: 450,
            steel: 300,
            components: 3
        }
    },

    units: {
        smallUnit: {
            name: 'Маленький блок',
            capacity: 900,
            power: 200,
            steel: 200,
            components: 3
        },
        largeUnit: {
            name: 'Большой блок',
            capacity: 4500,
            power: 600,
            steel: 600,
            components: 9
        }
    },

    vents: {
        smallWallVent: {
            name: 'Маленькая настенная вентиляция',
            capacity: 50,
            steel: 35
        },
        largeWallVent: {
            name: 'Большая настенная вентиляция',
            capacity: 100,
            steel: 70
        },
        smallFloorVent: {
            name: 'Маленькая напольная вентиляция',
            capacity: 300,
            steel: 210
        },
        largeFloorVent: {
            name: 'Большая напольная вентиляция',
            capacity: 600,
            steel: 420
        }
    }
}

// Дополнительные константы, которые могут пригодиться
export const DEVICE_TYPES = {
    FAN: 'fan',
    UNIT: 'unit',
    VENT: 'vent'
}

export const AUTO_SELECT = 'auto'

// Можно добавить вспомогательные функции для работы со спецификациями
export function getDeviceSpec(type, deviceType) {
    return deviceSpecs[`${type}s`]?.[deviceType] || null
}

export function getDeviceName(type, deviceType) {
    return getDeviceSpec(type, deviceType)?.name || ''
}

export function getDeviceCapacity(type, deviceType) {
    return getDeviceSpec(type, deviceType)?.capacity || 0
} 