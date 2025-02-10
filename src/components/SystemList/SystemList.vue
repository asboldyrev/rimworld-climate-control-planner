<script setup>
    import SystemCard from './SystemCard.vue'
    import SummaryTable from '@/components/SummaryTable.vue'

    const props = defineProps({
        modelValue: {
            type: Array,
            required: true,
            validator: (value) => {
                return value.every(system =>
                    ['fanType', 'centralUnitType', 'ventType', 'rooms'].every(prop => prop in system)
                )
            }
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const updateSystem = (index, newSystem) => {
        const newSystems = [...props.modelValue]
        newSystems[index] = newSystem
        emit('update:modelValue', newSystems)
    }

    const removeSystem = (index) => {
        const newSystems = [...props.modelValue]
        newSystems.splice(index, 1)
        emit('update:modelValue', newSystems)
    }

    const addSystem = () => {
        emit('update:modelValue', [
            ...props.modelValue,
            {
                fanType: 'auto',
                centralUnitType: 'auto',
                ventType: 'auto',
                rooms: [{ length: 3, width: 4, doubleWall: false }]
            }
        ])
    }
</script>

<template>
    <div class="systems-container">
        <div v-for="(system, index) in modelValue" :key="index" class="mb-6">
            <SystemCard v-model="modelValue[index]" :index="index" @update:modelValue="newSystem => updateSystem(index, newSystem)" @remove="removeSystem(index)" />
        </div>

        <div class="has-text-centered mb-6">
            <button class="button is-primary is-medium is-fullwidth" @click="addSystem">
                <span class="icon">
                    <i class="ri-add-line"></i>
                </span>
                <span>Добавить новую систему</span>
            </button>
        </div>

        <SummaryTable :systems="modelValue" />
    </div>
</template>

<style scoped>
    .systems-container {
        max-width: 960px;
        margin: 0 auto;
    }
</style>