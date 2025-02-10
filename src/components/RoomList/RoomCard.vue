<script setup>
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
        emit('update:modelValue', {
            ...props.modelValue,
            [field]: field === 'doubleWall' ? value : Number(value)
        })
    }
</script>

<template>
    <div class="box">
        <div class="level is-mobile mb-3">
            <div class="level-left">
                <div class="level-item">
                    <h5 class="title is-6 mb-0">Комната {{ index + 1 }}</h5>
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
                <input class="input" type="number" min="1" :value="modelValue.length" @input="updateRoom('length', $event.target.value)">
            </div>
        </div>

        <div class="field">
            <label class="label is-small">Ширина</label>
            <div class="control">
                <input class="input" type="number" min="1" :value="modelValue.width" @input="updateRoom('width', $event.target.value)">
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
    </div>
</template>

<style scoped>
    .box {
        height: 100%;
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
</style>