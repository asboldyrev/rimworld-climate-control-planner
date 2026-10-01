<script setup>
import { ThermometerSun } from '@lucide/vue'

import HeatingCalculator from '@/components/HeatingCalculator.vue'
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
      <header class="mb-8 border-b border-border pb-8">
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
                Рассчитайте, сколько отопительных устройств нужно для поддержания температуры
                в изолированной комнате с учётом её размеров, стен и крыши.
              </p>
            </div>
          </div>
        </div>
      </header>

      <HeatingCalculator />
    </main>
  </div>
</template>
