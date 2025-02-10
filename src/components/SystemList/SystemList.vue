<script setup>
    import { ref } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useSystemsStore } from '@/stores/systems'
    import { useSettingsStore } from '@/stores/settings'
    import SystemCard from './SystemCard.vue'
    import SummaryTable from '@/components/SummaryTable.vue'

    const systemsStore = useSystemsStore()
    const settingsStore = useSettingsStore()
    const { systems } = storeToRefs(systemsStore)
    const { saveEnabled } = storeToRefs(settingsStore)

    const fileInput = ref(null)

    const handleImport = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const success = await systemsStore.importConfig(file)
        if (!success) {
            alert('Ошибка при импорте файла. Проверьте формат файла и попробуйте снова.')
        }

        event.target.value = ''
    }

    const toggleSaveEnabled = (event) => {
        const newValue = event.target.checked

        if (!newValue) {
            const hasChanges = JSON.stringify(systems.value) !== JSON.stringify([{
                fanType: 'auto',
                centralUnitType: 'auto',
                ventType: 'auto',
                rooms: [{ length: 3, width: 4, doubleWall: false }]
            }])

            if (!hasChanges || confirm('Вы уверены, что хотите отключить автосохранение? Данные будут удалены из локального хранилища, но текущие настройки останутся без изменений.')) {
                settingsStore.toggleSave(newValue)
                localStorage.removeItem(`climate-control-systems`)
            } else {
                event.target.checked = true
            }
        } else {
            settingsStore.toggleSave(newValue)
            // Сразу сохраняем текущее состояние
            localStorage.setItem('climate-control-systems', JSON.stringify({
                systems: systems.value
            }))
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
                    <button class="button" @click="fileInput?.click()">
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
                        <input type="checkbox" :checked="saveEnabled" @change="toggleSaveEnabled">
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