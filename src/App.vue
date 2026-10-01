<script setup>
import { Calculator, Flame, Snowflake, ThermometerSun, Wind } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const plannedDevices = [
  { name: 'Heating', detail: 'Heater and campfire', icon: Flame },
  { name: 'Cooling', detail: 'Cooler and passive cooler', icon: Snowflake },
  { name: 'Air exchange', detail: 'Vents and connected rooms', icon: Wind },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-10 sm:px-8 lg:py-16">
      <header class="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-start sm:justify-between">
        <div class="max-w-3xl space-y-4">
          <Badge variant="secondary">
            Vanilla-first rewrite
          </Badge>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="flex size-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                <ThermometerSun class="size-6" aria-hidden="true" />
              </div>
              <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
                RimWorld Climate Control Planner
              </h1>
            </div>

            <p class="max-w-2xl text-base leading-7 text-muted-foreground">
              A new source-backed calculator for vanilla RimWorld heating and cooling.
              The legacy Centralized Climate Control calculator is no longer the active UI.
            </p>
          </div>
        </div>

        <Button variant="outline" disabled>
          <Calculator class="size-4" aria-hidden="true" />
          Calculator coming next
        </Button>
      </header>

      <section class="grid gap-4 py-10 md:grid-cols-3">
        <article
          v-for="device in plannedDevices"
          :key="device.name"
          class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
        >
          <component :is="device.icon" class="mb-5 size-5 text-muted-foreground" aria-hidden="true" />
          <h2 class="font-medium">{{ device.name }}</h2>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ device.detail }}</p>
        </article>
      </section>

      <section class="mt-auto rounded-xl border border-dashed border-border bg-muted/35 p-5">
        <p class="text-sm font-medium">Foundation stage</p>
        <p class="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          The frontend stack and test harness are being rebuilt first. Verified RimWorld thermal
          rules will live in a framework-independent calculation core in the next stage.
        </p>
      </section>
    </main>
  </div>
</template>
