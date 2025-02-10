export function createPersistedState() {
    return ({ store }) => {
        const storageKey = `climate-control-${store.$id}`

        // Всегда сохраняем настройки
        if (store.$id === 'settings') {
            const savedState = localStorage.getItem(storageKey)
            if (savedState) {
                store.$patch(JSON.parse(savedState))
            }

            store.$subscribe(
                (mutation, state) => {
                    localStorage.setItem(storageKey, JSON.stringify(state))
                },
                { detached: true }
            )
            return
        }

        // Загружаем сохраненные настройки
        const settingsKey = 'climate-control-settings'
        const settingsData = localStorage.getItem(settingsKey)
        const saveEnabled = settingsData ? JSON.parse(settingsData).saveEnabled : true

        // Если автосохранение включено, загружаем данные из localStorage
        if (saveEnabled) {
            const savedState = localStorage.getItem(storageKey)
            if (savedState) {
                store.$patch(JSON.parse(savedState))
            }
        }

        // Подписываемся на изменения
        store.$subscribe(
            (mutation, state) => {
                const currentSettings = localStorage.getItem(settingsKey)
                const shouldSave = currentSettings ? JSON.parse(currentSettings).saveEnabled : true

                if (shouldSave) {
                    localStorage.setItem(storageKey, JSON.stringify(state))
                }
            },
            { detached: true }
        )
    }
} 