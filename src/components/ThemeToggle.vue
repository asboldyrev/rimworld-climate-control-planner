<script setup>
    import { useSettingsStore } from '@/stores/settings'

    const settingsStore = useSettingsStore()
</script>

<template>
    <button class="button is-small" @click="settingsStore.toggleTheme" :title="settingsStore.settings.theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'">
        <span class="icon">
            <i :class="settingsStore.settings.theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'"></i>
        </span>
    </button>
</template>