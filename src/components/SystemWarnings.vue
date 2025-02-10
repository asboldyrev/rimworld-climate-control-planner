<script setup>
    import { computed } from 'vue'
    import { SYSTEM_WARNINGS } from '@/constants/warnings'

    const props = defineProps({
        rooms: {
            type: Array,
            required: true
        }
    })

    const warnings = computed(() => {
        return Object.entries(SYSTEM_WARNINGS)
            .filter(([_, rule]) => rule.check(props.rooms))
            .map(([_, rule]) => rule.message)
    })

    const hasWarnings = computed(() => warnings.value.length > 0)
</script>

<template>
    <div v-if="hasWarnings" class="system-warnings">
        <div class="notification is-warning is-light">
            <div class="notification-header mb-2">
                <span class="icon-text">
                    <span class="icon">
                        <i class="ri-error-warning-line"></i>
                    </span>
                    <span class="has-text-weight-medium">Предупреждения</span>
                </span>
            </div>
            <ul class="ml-5">
                <li v-for="(warning, index) in warnings" :key="index" class="is-size-7">
                    {{ warning }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
    .system-warnings {
        margin-bottom: 1.5rem;
    }

    .notification {
        padding: 1rem;
    }

    .notification-header {
        display: flex;
        align-items: center;
    }

    ul {
        list-style: disc;
    }
</style>