<script setup>
    import DeviceSelect from './DeviceSelect.vue'

    const props = defineProps({
        modelValue: {
            type: Object,
            required: true,
            validator: (value) => {
                return ['fanType', 'centralUnitType', 'ventType'].every(prop => prop in value)
            }
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const updateDevice = (type, value) => {
        emit('update:modelValue', {
            ...props.modelValue,
            [type]: value
        })
    }
</script>

<template>
    <div class="box is-light equipment-selection">
        <h4 class="title is-5 mb-4">Выбор оборудования</h4>
        <div class="columns is-multiline">
            <div class="column is-12-mobile is-4-tablet">
                <DeviceSelect :model-value="modelValue.fanType" device-type="fans" label="Тип вентилятора" @update:model-value="value => updateDevice('fanType', value)" />
            </div>
            <div class="column is-12-mobile is-4-tablet">
                <DeviceSelect :model-value="modelValue.centralUnitType" device-type="units" label="Тип центрального блока" @update:model-value="value => updateDevice('centralUnitType', value)" />
            </div>
            <div class="column is-12-mobile is-4-tablet">
                <DeviceSelect :model-value="modelValue.ventType" device-type="vents" label="Тип вентиляции" @update:model-value="value => updateDevice('ventType', value)" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .equipment-selection .columns {
        margin-bottom: -0.75rem;
    }

    .equipment-selection .column {
        margin-bottom: 0.75rem;
    }
</style>