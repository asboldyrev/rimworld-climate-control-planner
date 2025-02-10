import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        saveEnabled: true
    }),

    actions: {
        toggleSave(value) {
            this.saveEnabled = value
        }
    }
}) 