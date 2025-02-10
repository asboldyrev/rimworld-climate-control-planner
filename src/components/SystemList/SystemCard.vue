<script setup>
    import EquipmentSelector from '@/components/EquipmentSelector/EquipmentSelector.vue'
    import RoomList from '@/components/RoomList/RoomList.vue'
    import SystemWarnings from '@/components/SystemWarnings.vue'
    import { useSystemCalculations } from '@/composables/useSystemCalculations'
    import { useRoomCalculations } from '@/composables/useRoomCalculations'
    import { deviceSpecs } from '@/constants/deviceSpecs'
    import { computed } from 'vue'

    const props = defineProps({
        modelValue: {
            type: Object,
            required: true,
            validator: (value) => {
                return ['fanType', 'centralUnitType', 'ventType', 'rooms'].every(prop => prop in value)
            }
        },
        index: {
            type: Number,
            required: true
        }
    })

    const emit = defineEmits(['update:modelValue', 'remove'])

    const { getFanResources, getUnitResources, getVentResources, calculateSystemResources } = useSystemCalculations()
    const { autoSelectVentForRoom, calculateRoomVents } = useRoomCalculations()

    // Создаем вычисляемое свойство для системы
    const system = computed({
        get: () => props.modelValue,
        set: (newValue) => emit('update:modelValue', newValue)
    })

    const updateSystem = (newData) => {
        emit('update:modelValue', {
            ...props.modelValue,
            ...newData
        })
    }

    const calculateVentCount = (type) => {
        if (system.value.ventType === type) {
            return system.value.rooms.reduce((total, room) => {
                const count = room.count || 1
                return total + (calculateRoomVents(room, system.value) * count)
            }, 0)
        }
        return system.value.ventType === 'auto' ? system.value.rooms.reduce((sum, room) => {
            const info = autoSelectVentForRoom(room)
            const count = room.count || 1
            return sum + (info.selectedType === type ? info.count * count : 0)
        }, 0) : 0
    }

    const calculateVentSteel = (type) => {
        if (system.value.ventType === type) {
            return system.value.rooms.reduce((total, room) => {
                const count = room.count || 1
                return total + (calculateRoomVents(room, system.value) * count * deviceSpecs.vents[type].steel)
            }, 0)
        }
        return system.value.ventType === 'auto' ? system.value.rooms.reduce((sum, room) => {
            const info = autoSelectVentForRoom(room)
            const count = room.count || 1
            return sum + (info.selectedType === type ? info.count * count * deviceSpecs.vents[type].steel : 0)
        }, 0) : 0
    }

    const fanResources = computed(() => getFanResources(system.value))
    const unitResources = computed(() => getUnitResources(system.value))
    const ventResources = computed(() => getVentResources(system.value))
    const totalResources = computed(() => calculateSystemResources(system.value))

    const ventBreakdown = computed(() => {
        if (system.value.ventType === 'auto') {
            const breakdown = {}
            system.value.rooms.forEach(room => {
                const res = autoSelectVentForRoom(room)
                const count = room.count || 1
                if (!breakdown[res.selectedType]) {
                    breakdown[res.selectedType] = { count: 0, steel: 0 }
                }
                breakdown[res.selectedType].count += res.count * count
                breakdown[res.selectedType].steel += res.count * count * deviceSpecs.vents[res.selectedType].steel
            })
            return breakdown
        }
        return {}
    })
</script>

<template>
    <div class="box">
        <div class="level mb-5">
            <div class="level-left">
                <div class="level-item">
                    <h3 class="title is-4 mb-0">Система {{ index + 1 }}</h3>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <button class="button is-danger" @click="$emit('remove')">
                        <span class="icon">
                            <i class="ri-delete-bin-line"></i>
                        </span>
                        <span>Удалить систему</span>
                    </button>
                </div>
            </div>
        </div>

        <SystemWarnings :rooms="system.rooms" class="mb-5" />

        <EquipmentSelector :model-value="system" @update:model-value="updateSystem" class="mb-5" />

        <RoomList :model-value="system.rooms" @update:model-value="updateSystem({ rooms: $event })" class="mb-5" />

        <div class="box is-light">
            <h4 class="title is-5 mb-4">Сводка по системе</h4>
            <div class="table-container">
                <table class="table is-fullwidth is-bordered">
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
                        <!-- Вентиляторы -->
                        <tr>
                            <td>Вентилятор</td>
                            <td>{{ fanResources.type }}</td>
                            <td class="has-text-right">{{ fanResources.count }}</td>
                            <td class="has-text-right">{{ fanResources.steel }}</td>
                            <td class="has-text-right">{{ fanResources.components }}</td>
                            <td class="has-text-right">{{ fanResources.power }}</td>
                        </tr>
                        <!-- Центральные блоки -->
                        <tr>
                            <td>Центральный блок</td>
                            <td>{{ unitResources.type }}</td>
                            <td class="has-text-right">{{ unitResources.count }}</td>
                            <td class="has-text-right">{{ unitResources.steel }}</td>
                            <td class="has-text-right">{{ unitResources.components }}</td>
                            <td class="has-text-right">{{ unitResources.power }}</td>
                        </tr>
                        <!-- Вентиляция -->
                        <template v-if="system.ventType === 'auto'">
                            <tr v-for="(data, type) in ventBreakdown" :key="type">
                                <td>Вентиляция</td>
                                <td>{{ deviceSpecs.vents[type].name }}</td>
                                <td class="has-text-right">{{ data.count }}</td>
                                <td class="has-text-right">{{ data.steel }}</td>
                                <td class="has-text-right">-</td>
                                <td class="has-text-right">-</td>
                            </tr>
                        </template>
                        <tr v-else>
                            <td>Вентиляция</td>
                            <td>{{ ventResources.type }}</td>
                            <td class="has-text-right">{{ ventResources.count }}</td>
                            <td class="has-text-right">{{ ventResources.steel }}</td>
                            <td class="has-text-right">-</td>
                            <td class="has-text-right">-</td>
                        </tr>
                        <!-- Итого -->
                        <tr class="has-background-light">
                            <td colspan="2"><strong>Итого</strong></td>
                            <td class="has-text-right"><strong>{{ fanResources.count + unitResources.count + ventResources.count }}</strong></td>
                            <td class="has-text-right"><strong>{{ totalResources.steel }}</strong></td>
                            <td class="has-text-right"><strong>{{ totalResources.components }}</strong></td>
                            <td class="has-text-right"><strong>{{ totalResources.power }}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .system-summary ul {
        margin-top: 0;
    }

    .table td {
        vertical-align: middle;
    }
</style>