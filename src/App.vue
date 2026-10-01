<script setup>
import { ref } from 'vue'
import { Snowflake, ThermometerSun } from '@lucide/vue'

import CoolingCalculator from '@/components/CoolingCalculator.vue'
import HeatingCalculator from '@/components/HeatingCalculator.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const mode = ref('heating')
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
      <header class="mb-8 border-b border-border pb-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-4">
            <Badge variant="secondary">
              RimWorld 1.6.4850 · Vanilla
            </Badge>

            <div class="flex items-start gap-3">
              <div class="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                <ThermometerSun class="size-6" aria-hidden="true" />
              </div>

              <div>
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
                  RimWorld Climate Control Planner
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  Рассчитайте климат-контроль для изолированной комнаты с учётом размеров,
                  стен, крыши и температуры окружающей среды.
                </p>
              </div>
            </div>
          </div>

          <div
            class="inline-flex w-full rounded-lg border border-border bg-card p-1 shadow-sm sm:w-auto"
            role="tablist"
            aria-label="Режим калькулятора"
          >
            <Button
              data-testid="heating-mode"
              size="sm"
              :variant="mode === 'heating' ? 'default' : 'ghost'"
              class="flex-1 sm:flex-none"
              role="tab"
              :aria-selected="mode === 'heating'"
              @click="mode = 'heating'"
            >
              <ThermometerSun class="size-4" aria-hidden="true" />
              Отопление
            </Button>

            <Button
              data-testid="cooling-mode"
              size="sm"
              :variant="mode === 'cooling' ? 'default' : 'ghost'"
              class="flex-1 sm:flex-none"
              role="tab"
              :aria-selected="mode === 'cooling'"
              @click="mode = 'cooling'"
            >
              <Snowflake class="size-4" aria-hidden="true" />
              Охлаждение
            </Button>
          </div>
        </div>
      </header>

      <HeatingCalculator v-if="mode === 'heating'" />
      <CoolingCalculator v-else />
    </main>
  </div>
</template>
