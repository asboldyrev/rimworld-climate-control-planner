<script setup>
    import { computed } from 'vue'
    import RoomCard from './RoomCard.vue'
    import { useRoomCalculations } from '@/composables/useRoomCalculations'

    const props = defineProps({
        modelValue: {
            type: Array,
            required: true
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const { calculateRoomRequiredCapacity } = useRoomCalculations()

    const updateRoom = (index, newRoom) => {
        const newRooms = [...props.modelValue]
        newRooms[index] = newRoom
        emit('update:modelValue', newRooms)
    }

    const removeRoom = (index) => {
        const newRooms = [...props.modelValue]
        newRooms.splice(index, 1)
        emit('update:modelValue', newRooms)
    }

    const addRoom = () => {
        emit('update:modelValue', [
            ...props.modelValue,
            { length: 3, width: 4, doubleWall: false }
        ])
    }

    const totalCapacity = computed(() => {
        return props.modelValue.reduce((total, room) => {
            return total + calculateRoomRequiredCapacity(room)
        }, 0)
    })
</script>

<template>
    <div class="room-list">
        <div class="level mb-4">
            <div class="level-left">
                <div class="level-item">
                    <h4 class="title is-5 mb-0">
                        Комнаты
                        <span class="has-text-grey-light">
                            (Общая мощность: {{ totalCapacity.toFixed(1) }} cc/s)
                        </span>
                    </h4>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <button class="button is-primary" @click="addRoom">
                        <span class="icon">
                            <i class="ri-add-line"></i>
                        </span>
                        <span>Добавить комнату</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modelValue.length === 0" class="notification is-warning">
            <span class="icon">
                <i class="ri-error-warning-line"></i>
            </span>
            <span>Добавьте хотя бы одну комнату</span>
        </div>

        <div v-else class="columns is-multiline">
            <div v-for="(room, index) in modelValue" :key="index" class="column is-12-mobile is-4-tablet">
                <RoomCard :model-value="room" :index="index" @update:model-value="newRoom => updateRoom(index, newRoom)" @remove="removeRoom(index)" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .columns {
        margin-top: -0.75rem;
    }

    .column {
        margin-top: 0.75rem;
    }

    .notification {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>