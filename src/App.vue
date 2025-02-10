<script setup>
  import SystemList from '@/components/SystemList/SystemList.vue'
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="has-text-centered mb-6">
        <h1 class="title">RimWorld CCC Калькулятор</h1>
        <p class="subtitle">Планировщик систем централизованного климат-контроля</p>
      </div>
      <SystemList />
    </div>
  </section>
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