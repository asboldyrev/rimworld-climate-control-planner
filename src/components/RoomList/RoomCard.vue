<script setup>
    import { computed } from 'vue'
    import { ROOM_VALIDATION } from '@/constants/validation'
    import { deviceSpecs } from '@/constants/deviceSpecs'
    import { useRoomCalculations } from '@/composables/useRoomCalculations'

    const { calculateRoomRequiredCapacity, autoSelectVentForRoom } = useRoomCalculations()

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

    const roomArea = computed(() => {
        if (props.modelValue.useArea) {
            return props.modelValue.area || 0
        }
        return props.modelValue.length * props.modelValue.width
    })

    const isAreaMode = computed({
        get: () => props.modelValue.useArea ?? false,
        set: (value) => {
            const updates = { useArea: value }

            if (value) {
                // При переключении в режим площади, сохраняем текущую площадь
                updates.area = roomArea.value
            } else {
                // При переключении в режим размеров, вычисляем примерные размеры из площади
                const area = props.modelValue.area || roomArea.value
                const side = Math.sqrt(area)
                updates.length = Math.ceil(side)
                updates.width = Math.ceil(area / updates.length)
                delete updates.area
            }

            emit('update:modelValue', {
                ...props.modelValue,
                ...updates
            })
        }
    })

    const updateArea = (value) => {
        const newArea = Number(value)
        const side = Math.sqrt(newArea)
        const length = Math.ceil(side)
        const width = Math.ceil(newArea / length)

        emit('update:modelValue', {
            ...props.modelValue,
            area: newArea,
            length,
            width
        })
    }

    const totalArea = computed(() => {
        const baseArea = roomArea.value
        const count = props.modelValue.count || 1
        return baseArea * count
    })

    const errors = computed(() => {
        const result = {}

        if (!isAreaMode.value) {
            if (props.modelValue.length < ROOM_VALIDATION.length.min) {
                result.length = ROOM_VALIDATION.length.message
            }

            if (props.modelValue.width < ROOM_VALIDATION.width.min) {
                result.width = ROOM_VALIDATION.width.message
            }
        } else {
            if (roomArea.value < ROOM_VALIDATION.length.min * ROOM_VALIDATION.width.min) {
                result.area = 'Площадь слишком маленькая'
            }
        }

        return result
    })

    const ventInfo = computed(() => {
        const baseVentInfo = autoSelectVentForRoom(props.modelValue)
        const count = props.modelValue.count || 1
        return {
            type: deviceSpecs.vents[baseVentInfo.selectedType].name,
            singleCount: baseVentInfo.count,
            totalCount: baseVentInfo.count * count
        }
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
                            ({{ totalArea }} клеток)
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
            <label class="checkbox">
                <input type="checkbox" v-model="isAreaMode">
                Задать через площадь
            </label>
        </div>

        <template v-if="!isAreaMode">
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
        </template>

        <template v-else>
            <div class="field">
                <label class="label is-small">Площадь</label>
                <div class="control">
                    <input class="input" :class="{ 'is-danger': errors.area }" type="number" :min="ROOM_VALIDATION.length.min * ROOM_VALIDATION.width.min" :value="modelValue.area" @input="updateArea($event.target.value)">
                </div>
                <p v-if="errors.area" class="help is-danger">{{ errors.area }}</p>
            </div>
        </template>

        <div class="field">
            <label class="label is-small">Количество комнат</label>
            <div class="control">
                <input class="input" type="number" min="1" :value="modelValue.count || 1" @input="updateRoom('count', $event.target.value)">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input type="checkbox" :checked="modelValue.doubleWall" @change="updateRoom('doubleWall', $event.target.checked)">
                    Двойные стены
                </label>
            </div>
        </div>

        <div class="block">
            <h6 class="title is-7 mb-1">Вентиляция</h6>
            <p class="has-text-grey is-size-7 mb-0">Тип: {{ ventInfo.type }}</p>
            <p class="has-text-grey is-size-7" :class="{ 'mb-0': (modelValue.count || 1) > 1, 'mb-3': (modelValue.count || 1) <= 1 }">На комнату: {{ ventInfo.singleCount }} шт.</p>
            <p v-if="(modelValue.count || 1) > 1" class="has-text-grey is-size-7 mb-3">Всего: {{ ventInfo.totalCount }} шт.</p>
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