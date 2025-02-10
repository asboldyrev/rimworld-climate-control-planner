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

    const { getFanResources, getUnitResources, getVentResources } = useSystemCalculations()
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
            return system.value.rooms.reduce((total, room) => total + calculateRoomVents(room, system.value), 0)
        }
        return system.value.ventType === 'auto' ? system.value.rooms.reduce((sum, room) => {
            const info = autoSelectVentForRoom(room)
            return sum + (info.selectedType === type ? info.count : 0)
        }, 0) : 0
    }

    const calculateVentSteel = (type) => {
        const count = calculateVentCount(type)
        return count * deviceSpecs.vents[type].steel
    }
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
                <table class="table is-bordered is-fullwidth is-striped is-narrow">
                    <thead>
                        <tr>
                            <th>Тип оборудования</th>
                            <th>Наименование</th>
                            <th>Количество (шт.)</th>
                            <th>Сталь (ед.)</th>
                            <th>Компоненты (ед.)</th>
                            <th>Мощность (Вт)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Вентиляторы</td>
                            <td>{{ getFanResources(system).type }}</td>
                            <td class="has-text-right">{{ getFanResources(system).count }}</td>
                            <td class="has-text-right">{{ getFanResources(system).steel }}</td>
                            <td class="has-text-right">{{ getFanResources(system).components }}</td>
                            <td class="has-text-right">{{ getFanResources(system).power }}</td>
                        </tr>
                        <tr>
                            <td>Центральные блоки</td>
                            <td>{{ getUnitResources(system).type }}</td>
                            <td class="has-text-right">{{ getUnitResources(system).count }}</td>
                            <td class="has-text-right">{{ getUnitResources(system).steel }}</td>
                            <td class="has-text-right">{{ getUnitResources(system).components }}</td>
                            <td class="has-text-right">{{ getUnitResources(system).power }}</td>
                        </tr>
                        <template v-for="(vent, type) in deviceSpecs.vents" :key="type">
                            <tr v-if="
                                system.ventType === type ||
                                (system.ventType === 'auto' && system.rooms.some(room => autoSelectVentForRoom(room).selectedType === type))
                            ">
                                <td>Вентиляция</td>
                                <td>{{ vent.name }}</td>
                                <td class="has-text-right">{{ calculateVentCount(type) }}</td>
                                <td class="has-text-right">{{ calculateVentSteel(type) }}</td>
                                <td class="has-text-center">-</td>
                                <td class="has-text-center">-</td>
                            </tr>
                        </template>
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