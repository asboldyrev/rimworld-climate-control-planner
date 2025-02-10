<script setup>
    import { ref, watch } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useSystemsStore } from '@/stores/systems'
    import { useSettingsStore } from '@/stores/settings'
    import SystemCard from './SystemCard.vue'
    import SummaryTable from '@/components/SummaryTable.vue'

    const systemsStore = useSystemsStore()
    const settingsStore = useSettingsStore()
    const { systems } = storeToRefs(systemsStore)

    // Следим за изменениями в системах и сохраняем их, если включено автосохранение
    watch(
        systems,
        () => {
            if (settingsStore.settings.autoSave) {
                localStorage.setItem(`climate-control-${systemsStore.$id}`, JSON.stringify(systems.value))
            }
        },
        { deep: true }
    )

    // Загружаем сохраненные данные при монтировании компонента
    const savedData = localStorage.getItem(`climate-control-${systemsStore.$id}`)
    if (savedData) {
        systemsStore.systems = JSON.parse(savedData)
    }

    const toggleSaveEnabled = (event) => {
        const shouldRevert = settingsStore.setAutoSave(event.target.checked)
        if (shouldRevert) {
            // Если пользователь отменил действие, возвращаем чекбокс в включенное состояние
            setTimeout(() => {
                event.target.checked = true
            }, 0)
        } else if (event.target.checked) {
            localStorage.setItem(`climate-control-${systemsStore.$id}`, JSON.stringify(systems.value))
        }
    }

    const handleImport = async (event) => {
        const file = event.target.files?.[0]
        if (file) {
            const success = await systemsStore.importConfig(file)
            if (success) {
                event.target.value = ''
            }
        }
    }
</script>

<template>
    <div class="systems-container">
        <div class="level mb-5">
            <div class="level-left">
                <div class="level-item">
                    <button class="button" @click="systemsStore.exportConfig">
                        <span class="icon">
                            <i class="ri-download-line"></i>
                        </span>
                        <span>Экспорт</span>
                    </button>
                </div>
                <div class="level-item">
                    <button class="button" @click="$refs.fileInput.click()">
                        <span class="icon">
                            <i class="ri-upload-line"></i>
                        </span>
                        <span>Импорт</span>
                    </button>
                    <input ref="fileInput" type="file" accept=".json" class="is-hidden" @change="handleImport">
                </div>
                <div class="level-item">
                    <button class="button is-danger is-light" @click="systemsStore.resetToDefault">
                        <span class="icon">
                            <i class="ri-refresh-line"></i>
                        </span>
                        <span>Сбросить</span>
                    </button>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <label class="checkbox">
                        <input type="checkbox" :checked="settingsStore.settings.autoSave" @change="toggleSaveEnabled">
                        Автосохранение
                    </label>
                </div>
            </div>
        </div>

        <div v-for="(system, index) in systems" :key="index" class="mb-6">
            <SystemCard :model-value="system" :index="index" @update:model-value="newSystem => systemsStore.updateSystem(index, newSystem)" @remove="systemsStore.removeSystem(index)" />
        </div>

        <div class="has-text-centered mb-6">
            <button class="button is-primary is-medium is-fullwidth" @click="systemsStore.addSystem">
                <span class="icon">
                    <i class="ri-add-line"></i>
                </span>
                <span>Добавить новую систему</span>
            </button>
        </div>

        <SummaryTable :systems="systems" />
    </div>
</template>

<style scoped>
    .systems-container {
        max-width: 960px;
        margin: 0 auto;
    }

    .checkbox {
        cursor: pointer;
    }
</style>