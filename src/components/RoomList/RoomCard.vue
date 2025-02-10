<script setup>
    import { computed } from 'vue'
    import { ROOM_VALIDATION } from '@/constants/validation'

    const props = defineProps({
        modelValue: {
            type: Object,
            required: true,
            validator: (value) => {
                return ['length', 'width', 'doubleWall'].every(prop => prop in value)
            }
        },
        index: {
            type: Number,
            required: true
        }
    })

    const emit = defineEmits(['update:modelValue', 'remove'])

    const updateRoom = (field, value) => {
        const newValue = field === 'doubleWall' ? value : Number(value)
        emit('update:modelValue', {
            ...props.modelValue,
            [field]: newValue
        })
    }

    const roomArea = computed(() => props.modelValue.length * props.modelValue.width)

    const errors = computed(() => {
        const result = {}

        if (props.modelValue.length < ROOM_VALIDATION.length.min) {
            result.length = ROOM_VALIDATION.length.message
        }

        if (props.modelValue.width < ROOM_VALIDATION.width.min) {
            result.width = ROOM_VALIDATION.width.message
        }

        return result
    })

    const hasErrors = computed(() => Object.keys(errors.value).length > 0)
</script>

<template>
    <div class="box" :class="{ 'has-error': hasErrors }">
        <div class="level is-mobile mb-3">
            <div class="level-left">
                <div class="level-item">
                    <h5 class="title is-6 mb-0">
                        Комната {{ index + 1 }}
                        <span class="has-text-grey-light is-size-7">
                            ({{ roomArea }} клеток)
                        </span>
                    </h5>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <button class="button is-danger is-small" @click="$emit('remove')">
                        <span class="icon is-small">
                            <i class="ri-close-line"></i>
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <div class="field">
            <label class="label is-small">Длина</label>
            <div class="control">
                <input class="input" :class="{ 'is-danger': errors.length }" type="number" :min="ROOM_VALIDATION.length.min" :value="modelValue.length" @input="updateRoom('length', $event.target.value)">
            </div>
            <p v-if="errors.length" class="help is-danger">{{ errors.length }}</p>
        </div>

        <div class="field">
            <label class="label is-small">Ширина</label>
            <div class="control">
                <input class="input" :class="{ 'is-danger': errors.width }" type="number" :min="ROOM_VALIDATION.width.min" :value="modelValue.width" @input="updateRoom('width', $event.target.value)">
            </div>
            <p v-if="errors.width" class="help is-danger">{{ errors.width }}</p>
        </div>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input type="checkbox" :checked="modelValue.doubleWall" @change="updateRoom('doubleWall', $event.target.checked)">
                    Двойные стены
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .box {
        height: 100%;
        transition: all 0.3s ease;
    }

    .box.has-error {
        border: 1px solid hsl(348, 100%, 61%);
    }

    .level.is-mobile {
        margin-bottom: 0.75rem !important;
    }

    .field:not(:last-child) {
        margin-bottom: 0.75rem;
    }

    .label.is-small {
        font-size: 0.875rem;
    }

    .checkbox {
        font-size: 0.875rem;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>