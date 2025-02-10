<script setup>
    import EquipmentSelector from '@/components/EquipmentSelector/EquipmentSelector.vue'
    import RoomList from '@/components/RoomList/RoomList.vue'
    import { useSystemCalculations } from '@/composables/useSystemCalculations'
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
                        <tr>
                            <td>Вентиляция</td>
                            <td>{{ getVentResources(system).type }}</td>
                            <td class="has-text-right">{{ getVentResources(system).count }}</td>
                            <td class="has-text-right">{{ getVentResources(system).steel }}</td>
                            <td class="has-text-center">-</td>
                            <td class="has-text-center">-</td>
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