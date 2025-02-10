export const SYSTEM_WARNINGS = {
    // Предупреждение о слишком большой площади для одной системы
    LARGE_AREA: {
        check: (rooms) => {
            const totalArea = rooms.reduce((sum, room) => sum + room.length * room.width, 0)
            return totalArea > 400
        },
        message: 'Большая площадь помещений. Рекомендуется разделить на несколько систем для лучшей эффективности.'
    },
    // Предупреждение о слишком маленькой площади
    SMALL_AREA: {
        check: (rooms) => {
            const totalArea = rooms.reduce((sum, room) => sum + room.length * room.width, 0)
            return totalArea < 20
        },
        message: 'Маленькая площадь помещений. Возможно избыточное потребление ресурсов.'
    },
    // Предупреждение о большом количестве комнат
    TOO_MANY_ROOMS: {
        check: (rooms) => rooms.length > 8,
        message: 'Большое количество комнат. Рекомендуется разделить на несколько систем для лучшей надежности.'
    }
} 