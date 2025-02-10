<script setup>
    import { deviceSpecs } from '@/constants/deviceSpecs'

    const props = defineProps({
        modelValue: {
            type: String,
            required: true
        },
        deviceType: {
            type: String,
            required: true,
            validator: (value) => ['fans', 'units', 'vents'].includes(value)
        },
        label: {
            type: String,
            required: true
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const devices = deviceSpecs[props.deviceType]
</script>

<template>
    <div class="field">
        <label class="label is-small">{{ label }}</label>
        <div class="control">
            <div class="select is-fullwidth">
                <select :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
                    <option value="auto">Автоматический подбор</option>
                    <template v-if="deviceType === 'fans' || deviceType === 'units'">
                        <option v-for="(spec, type) in devices" :key="type" :value="type">
                            {{ spec.name }} ({{ spec.capacity }} cc/s, {{ spec.power }} Вт)
                        </option>
                    </template>
                    <template v-else>
                        <option v-for="(spec, type) in devices" :key="type" :value="type">
                            {{ spec.name }} ({{ spec.capacity }} cc/s)
                        </option>
                    </template>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .label.is-small {
        font-size: 0.875rem;
    }

    .select select {
        font-size: 0.875rem;
    }
</style>