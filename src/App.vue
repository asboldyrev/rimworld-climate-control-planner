<script setup>
  import { onMounted } from 'vue'
  import SystemList from '@/components/SystemList/SystemList.vue'
  import ThemeToggle from '@/components/ThemeToggle.vue'
  import { useSettingsStore } from '@/stores/settings'

  const settingsStore = useSettingsStore()

  onMounted(() => {
    settingsStore.initSettings()
  })
</script>

<template>
  <div class="container is-max-desktop p-4">
    <div class="level mb-6">
      <div class="level-left">
        <div class="level-item">
          <div>
            <h1 class="title">
              RimWorld CCC Калькулятор
            </h1>
            <h2 class="subtitle">
              Планировщик систем централизованного климат-контроля
            </h2>
          </div>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <ThemeToggle />
        </div>
      </div>
    </div>
    <SystemList />
  </div>
</template>

<style>
  html {
    overflow-y: auto;
  }

  .equipment-selection .columns {
    margin-bottom: 0;
  }

  .equipment-selection .column .field-label {
    min-width: 150px;
  }

  .table td {
    vertical-align: middle;
  }
</style>