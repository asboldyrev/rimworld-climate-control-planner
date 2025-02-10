<script setup>
    import { computed } from 'vue'
    import { deviceSpecs } from '@/constants/deviceSpecs'
    import { useDeviceCalculations } from '@/composables/useDeviceCalculations'
    import { useSystemCalculations } from '@/composables/useSystemCalculations'
    import { useRoomCalculations } from '@/composables/useRoomCalculations'
    import { useSystemsStore } from '@/stores/systems'

    const store = useSystemsStore()
    const { systems } = store

    const { autoSelectFan, autoSelectUnit } = useDeviceCalculations()
    const { getFanResources, getUnitResources, getVentResources, calculateSystemResources } = useSystemCalculations()
    const { autoSelectVentForRoom, calculateRoomVents } = useRoomCalculations()

    // Вспомогательные функции для вентиляции
    const calculateTotalVentCount = (type) => {
        return systems.reduce((sum, sys) => {
            if (sys.ventType === type) {
                return sum + sys.rooms.reduce((total, room) => {
                    const count = room.count || 1
                    return total + (calculateRoomVents(room, sys) * count)
                }, 0)
            }
            return sum + (sys.ventType === 'auto' ? sys.rooms.reduce((roomSum, room) => {
                const info = autoSelectVentForRoom(room)
                const count = room.count || 1
                return roomSum + (info.selectedType === type ? info.count * count : 0)
            }, 0) : 0)
        }, 0)
    }

    const calculateTotalVentSteel = (type) => {
        return systems.reduce((sum, sys) => {
            if (sys.ventType === type) {
                return sum + sys.rooms.reduce((total, room) => {
                    const count = room.count || 1
                    return total + (calculateRoomVents(room, sys) * count * deviceSpecs.vents[type].steel)
                }, 0)
            }
            return sum + (sys.ventType === 'auto' ? sys.rooms.reduce((roomSum, room) => {
                const info = autoSelectVentForRoom(room)
                const count = room.count || 1
                return roomSum + (info.selectedType === type ? info.count * count * deviceSpecs.vents[type].steel : 0)
            }, 0) : 0)
        }, 0)
    }

    const calculateTotalVents = (system) => {
        return system.rooms.reduce((total, room) => total + calculateRoomVents(room, system), 0)
    }

    // Вычисляемые итоги
    const totalDeviceCount = computed(() => {
        return systems.reduce((total, sys) => {
            const fanRes = getFanResources(sys)
            const unitRes = getUnitResources(sys)
            const ventRes = getVentResources(sys)
            return total + fanRes.count + unitRes.count + ventRes.count
        }, 0)
    })

    const totalSteel = computed(() => {
        return systems.reduce((total, sys) => {
            const resources = calculateSystemResources(sys)
            return total + resources.steel
        }, 0)
    })

    const totalComponents = computed(() => {
        return systems.reduce((total, sys) => {
            const resources = calculateSystemResources(sys)
            return total + resources.components
        }, 0)
    })

    const totalPower = computed(() => {
        return systems.reduce((total, sys) => {
            const resources = calculateSystemResources(sys)
            return total + resources.power
        }, 0)
    })
</script>

<template>
    <div class="box">
        <h3 class="title is-4 mb-4">Общая сводка</h3>
        <div class="table-container">
            <table class="table is-bordered is-fullwidth is-striped is-narrow">
                <thead>
                    <tr>
                        <th>Тип оборудования</th>
                        <th>Наименование</th>
                        <th class="has-text-right">Количество (шт.)</th>
                        <th class="has-text-right">Сталь (ед.)</th>
                        <th class="has-text-right">Компоненты (ед.)</th>
                        <th class="has-text-right">Мощность (Вт)</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="systems.length > 0">
                        <!-- Вентиляторы -->
                        <template v-for="(fan, type) in deviceSpecs.fans" :key="type">
                            <tr v-if="systems.some(sys =>
                                (sys.fanType === 'auto' && autoSelectFan(sys).selectedType === type) ||
                                sys.fanType === type
                            )">
                                <td>Вентиляторы</td>
                                <td>{{ fan.name }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.fanType === 'auto') {
                                        return sum + (autoSelectFan(sys).selectedType === type ? getFanResources(sys).count : 0)
                                    }
                                    return sum + (sys.fanType === type ? getFanResources(sys).count : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.fanType === 'auto') {
                                        return sum + (autoSelectFan(sys).selectedType === type ? getFanResources(sys).steel : 0)
                                    }
                                    return sum + (sys.fanType === type ? getFanResources(sys).steel : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.fanType === 'auto') {
                                        return sum + (autoSelectFan(sys).selectedType === type ? getFanResources(sys).components : 0)
                                    }
                                    return sum + (sys.fanType === type ? getFanResources(sys).components : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.fanType === 'auto') {
                                        return sum + (autoSelectFan(sys).selectedType === type ? getFanResources(sys).power : 0)
                                    }
                                    return sum + (sys.fanType === type ? getFanResources(sys).power : 0)
                                }, 0) }}</td>
                            </tr>
                        </template>

                        <!-- Центральные блоки -->
                        <template v-for="(unit, type) in deviceSpecs.units" :key="type">
                            <tr v-if="systems.some(sys =>
                                (sys.centralUnitType === 'auto' && autoSelectUnit(sys).selectedType === type) ||
                                sys.centralUnitType === type
                            )">
                                <td>Центральные блоки</td>
                                <td>{{ unit.name }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.centralUnitType === 'auto') {
                                        return sum + (autoSelectUnit(sys).selectedType === type ? getUnitResources(sys).count : 0)
                                    }
                                    return sum + (sys.centralUnitType === type ? getUnitResources(sys).count : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.centralUnitType === 'auto') {
                                        return sum + (autoSelectUnit(sys).selectedType === type ? getUnitResources(sys).steel : 0)
                                    }
                                    return sum + (sys.centralUnitType === type ? getUnitResources(sys).steel : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.centralUnitType === 'auto') {
                                        return sum + (autoSelectUnit(sys).selectedType === type ? getUnitResources(sys).components : 0)
                                    }
                                    return sum + (sys.centralUnitType === type ? getUnitResources(sys).components : 0)
                                }, 0) }}</td>
                                <td class="has-text-right">{{ systems.reduce((sum, sys) => {
                                    if (sys.centralUnitType === 'auto') {
                                        return sum + (autoSelectUnit(sys).selectedType === type ? getUnitResources(sys).power : 0)
                                    }
                                    return sum + (sys.centralUnitType === type ? getUnitResources(sys).power : 0)
                                }, 0) }}</td>
                            </tr>
                        </template>

                        <!-- Вентиляционные отверстия -->
                        <template v-for="(vent, type) in deviceSpecs.vents" :key="type">
                            <tr v-if="systems.some(sys =>
                                sys.ventType === type ||
                                (sys.ventType === 'auto' && sys.rooms.some(room => autoSelectVentForRoom(room).selectedType === type))
                            )">
                                <td>Вентиляционные отверстия</td>
                                <td>{{ vent.name }}</td>
                                <td class="has-text-right">{{ calculateTotalVentCount(type) }}</td>
                                <td class="has-text-right">{{ calculateTotalVentSteel(type) }}</td>
                                <td class="has-text-center">-</td>
                                <td class="has-text-center">-</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
                <tfoot>
                    <tr class="has-background-info-light has-text-weight-bold">
                        <td colspan="2">Итого</td>
                        <td class="has-text-right">{{ totalDeviceCount }}</td>
                        <td class="has-text-right">{{ totalSteel }}</td>
                        <td class="has-text-right">{{ totalComponents }}</td>
                        <td class="has-text-right">{{ totalPower }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<style scoped>
    .table th {
        vertical-align: middle;
    }

    .table td {
        vertical-align: middle;
    }
</style>