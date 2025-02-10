import { defineStore } from 'pinia'

const STORAGE_KEY = 'climate-control-settings'
const SYSTEMS_KEY = 'climate-control-systems'

const DEFAULT_SETTINGS = {
    autoSave: true,
    theme: 'light'
}

const DEFAULT_SYSTEM = {
    fanType: 'auto',
    centralUnitType: 'auto',
    ventType: 'auto',
    rooms: [{ length: 3, width: 4, doubleWall: false }]
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: { ...DEFAULT_SETTINGS }
    }),

    actions: {
        initSettings() {
            const savedSettings = localStorage.getItem(STORAGE_KEY)
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings)
            }
            document.documentElement.classList.toggle('is-dark', this.settings.theme === 'dark')
        },

        toggleTheme() {
            this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light'
            document.documentElement.classList.toggle('is-dark', this.settings.theme === 'dark')
            this.saveSettings()
        },

        setAutoSave(value) {
            if (!value) {
                const savedData = localStorage.getItem(SYSTEMS_KEY)
                if (savedData) {
                    const currentSystems = JSON.parse(savedData)
                    const hasChanges = JSON.stringify(currentSystems) !== JSON.stringify([DEFAULT_SYSTEM])

                    if (hasChanges && !confirm('При отключении автосохранения текущие данные будут удалены. Продолжить?')) {
                        return true
                    }
                    localStorage.removeItem(SYSTEMS_KEY)
                }
            }
            this.settings.autoSave = value
            this.saveSettings()
            return false
        },

        saveSettings() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
        },

        clearSettings() {
            this.settings = { ...DEFAULT_SETTINGS }
            localStorage.removeItem(STORAGE_KEY)
            document.documentElement.classList.remove('is-dark')
        }
    }
}) 