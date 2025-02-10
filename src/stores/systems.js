import { defineStore } from 'pinia'

const DEFAULT_SYSTEM = {
    fanType: 'auto',
    centralUnitType: 'auto',
    ventType: 'auto',
    rooms: [{ length: 3, width: 4, doubleWall: false, useArea: false, count: 1 }]
}

export const useSystemsStore = defineStore('systems', {
    state: () => ({
        systems: [{ ...DEFAULT_SYSTEM }]
    }),

    actions: {
        updateSystem(index, newSystem) {
            this.systems[index] = newSystem
        },

        removeSystem(index) {
            this.systems.splice(index, 1)
        },

        addSystem() {
            this.systems.push({ ...DEFAULT_SYSTEM })
        },

        // Экспорт конфигурации
        exportConfig() {
            const data = JSON.stringify(this.systems, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = 'climate-control-config.json'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        },

        // Импорт конфигурации
        async importConfig(file) {
            try {
                const text = await file.text()
                const data = JSON.parse(text)

                // Простая валидация данных
                if (!Array.isArray(data)) {
                    throw new Error('Неверный формат файла')
                }

                if (!data.every(system =>
                    ['fanType', 'centralUnitType', 'ventType', 'rooms'].every(prop => prop in system)
                )) {
                    throw new Error('Неверная структура данных')
                }

                this.systems = data
                return true
            } catch (error) {
                console.error('Ошибка импорта:', error)
                return false
            }
        },

        resetToDefault() {
            this.systems = [{ ...DEFAULT_SYSTEM }]
        },

        clearStorage() {
            const hasChanges = JSON.stringify(this.systems) !== JSON.stringify([DEFAULT_SYSTEM])

            if (!hasChanges || confirm('Вы уверены, что хотите сбросить все настройки? Все несохраненные изменения будут потеряны.')) {
                localStorage.removeItem(`climate-control-${this.$id}`)
                this.resetToDefault()
            }
        }
    }
}) 