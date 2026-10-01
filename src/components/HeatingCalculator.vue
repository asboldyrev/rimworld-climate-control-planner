<script setup>
import { computed, reactive } from 'vue'
import {
  AlertTriangle,
  Campfire,
  Flame,
  Gauge,
  House,
  Info,
  Snowflake,
  Thermometer,
} from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import {
  createRectangularHeatingScenario,
  findMinimumCampfireCount,
  findMinimumHeaterCount,
  heatingDemandAtTemperature,
} from '@/domain/climate/vanilla'

const form = reactive({
  width: 10,
  height: 10,
  outdoorTemperature: -30,
  targetTemperature: 20,
  wallLayers: 1,
  roofType: 'thin',
})

const roofOptions = {
  thin: {
    label: 'Обычная крыша',
    values: {
      thinRoofCoverage: 1,
      noRoofCoverage: 0,
      thickRoofCoverage: 0,
      undergroundMap: false,
    },
  },
  thick: {
    label: 'Толстая горная крыша',
    values: {
      thinRoofCoverage: 0,
      noRoofCoverage: 0,
      thickRoofCoverage: 1,
      undergroundMap: false,
    },
  },
  open: {
    label: 'Без крыши',
    values: {
      thinRoofCoverage: 0,
      noRoofCoverage: 1,
      thickRoofCoverage: 0,
      undergroundMap: false,
    },
  },
}

const scenario = computed(() => {
  try {
    return createRectangularHeatingScenario({
      width: Number(form.width),
      height: Number(form.height),
      outdoorTemperature: Number(form.outdoorTemperature),
      targetTemperature: Number(form.targetTemperature),
      wallLayers: Number(form.wallLayers),
      ...roofOptions[form.roofType].values,
    })
  } catch {
    return null
  }
})

const demand = computed(() => scenario.value
  ? heatingDemandAtTemperature({
    scenario: scenario.value,
    roomTemperature: scenario.value.targetTemperature,
  })
  : null)

const heaterResult = computed(() => scenario.value
  ? findMinimumHeaterCount({ scenario: scenario.value })
  : null)

const campfireResult = computed(() => scenario.value
  ? findMinimumCampfireCount({ scenario: scenario.value })
  : null)

const roomArea = computed(() => scenario.value?.geometry.cellCount ?? null)

const formatNumber = (value, digits = 1) => Number(value).toFixed(digits)

const heaterSummary = computed(() => {
  if (!heaterResult.value) {
    return { primary: '—', secondary: 'Проверьте параметры помещения.' }
  }

  if (!heaterResult.value.reachable) {
    return {
      primary: 'Недостижимо',
      secondary: heaterResult.value.reason === 'heater-has-no-capacity-at-target'
        ? 'При этой температуре обогреватель уже не даёт тепла.'
        : 'Для расчёта требуется слишком много устройств.',
    }
  }

  return {
    primary: String(heaterResult.value.requiredCount),
    secondary: heaterResult.value.requiredCount === 1
      ? 'обогреватель'
      : 'обогревателя',
  }
})

const campfireSummary = computed(() => {
  if (!campfireResult.value) {
    return { primary: '—', secondary: 'Проверьте параметры помещения.' }
  }

  if (!campfireResult.value.reachable) {
    return {
      primary: 'Недостижимо',
      secondary: 'Костёр прекращает новые тепловые импульсы при 28 °C.',
    }
  }

  return {
    primary: String(campfireResult.value.requiredCount),
    secondary: campfireResult.value.requiredCount === 1
      ? 'костёр'
      : 'костра',
  }
})

const roofLabel = computed(() => roofOptions[form.roofType].label)
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
    <div class="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-muted-foreground">
            Параметры помещения
          </p>
          <h2 class="mt-1 text-xl font-semibold tracking-tight">
            Отопление
          </h2>
        </div>

        <div class="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <House class="size-5" aria-hidden="true" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-medium">Ширина, клеток</span>
          <input
            v-model.number="form.width"
            data-testid="width-input"
            type="number"
            min="1"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Высота, клеток</span>
          <input
            v-model.number="form.height"
            data-testid="height-input"
            type="number"
            min="1"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Снаружи, °C</span>
          <input
            v-model.number="form.outdoorTemperature"
            data-testid="outdoor-input"
            type="number"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Целевая, °C</span>
          <input
            v-model.number="form.targetTemperature"
            data-testid="target-input"
            type="number"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Стены</span>
          <select
            v-model.number="form.wallLayers"
            data-testid="wall-layers-select"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option :value="1">
              Одинарные
            </option>
            <option :value="2">
              Двойные
            </option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Крыша</span>
          <select
            v-model="form.roofType"
            data-testid="roof-select"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="thin">
              Обычная
            </option>
            <option value="thick">
              Толстая горная
            </option>
            <option value="open">
              Нет крыши
            </option>
          </select>
        </label>
      </div>

      <div class="mt-5 rounded-xl bg-muted/45 p-4">
        <div class="flex items-center gap-2 text-sm font-medium">
          <Info class="size-4" aria-hidden="true" />
          Текущая модель
        </div>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          Изолированная прямоугольная комната без дверей и соседних помещений.
          Вентиляция будет добавлена отдельным этапом.
        </p>
      </div>
    </div>

    <div
      v-if="scenario"
      class="space-y-5"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <Badge variant="secondary">
                Heater
              </Badge>
              <p
                data-testid="heater-count"
                class="mt-4 text-4xl font-semibold tracking-tight"
              >
                {{ heaterSummary.primary }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ heaterSummary.secondary }}
              </p>
            </div>

            <div class="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Flame class="size-5" aria-hidden="true" />
            </div>
          </div>

          <div
            v-if="heaterResult.reachable"
            class="mt-5 border-t border-border pt-4 text-sm"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">Запас мощности</span>
              <span class="font-medium">
                {{ formatNumber(heaterResult.evaluation.marginEnergy, 1) }} energy / 120 ticks
              </span>
            </div>
          </div>

          <div
            v-else
            class="mt-5 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm"
          >
            <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ heaterSummary.secondary }}</span>
          </div>
        </article>

        <article class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline">
                Campfire
              </Badge>
              <p
                data-testid="campfire-count"
                class="mt-4 text-4xl font-semibold tracking-tight"
              >
                {{ campfireSummary.primary }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ campfireSummary.secondary }}
              </p>
            </div>

            <div class="flex size-10 items-center justify-center rounded-xl border border-border">
              <Campfire class="size-5" aria-hidden="true" />
            </div>
          </div>

          <div class="mt-5 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm">
            <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Костёр не поддерживает точную заданную температуру: это только расчёт достаточной средней мощности.
            </span>
          </div>
        </article>
      </div>

      <article class="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Тепловой баланс при {{ form.targetTemperature }} °C
            </p>
            <h3 class="mt-1 text-lg font-semibold">
              Потери помещения
            </h3>
          </div>

          <Gauge class="size-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <dl class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Площадь
            </dt>
            <dd data-testid="room-area" class="mt-1 text-xl font-semibold">
              {{ roomArea }} клеток
            </dd>
          </div>

          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Нужно тепла
            </dt>
            <dd data-testid="required-heat" class="mt-1 text-xl font-semibold">
              {{ formatNumber(demand.requiredHeatPerSecond, 1) }} heat/s
            </dd>
          </div>

          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Стены
            </dt>
            <dd class="mt-1 text-xl font-semibold">
              {{ formatNumber(demand.walls, 3) }} °C
            </dd>
            <p class="mt-1 text-xs text-muted-foreground">
              за 120 тиков
            </p>
          </div>

          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Крыша
            </dt>
            <dd class="mt-1 text-xl font-semibold">
              {{ formatNumber(demand.roof.total, 3) }} °C
            </dd>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ roofLabel }}, за 120 тиков
            </p>
          </div>
        </dl>

        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <span class="inline-flex items-center gap-2">
            <Thermometer class="size-4" aria-hidden="true" />
            Внутри {{ form.targetTemperature }} °C
          </span>
          <span class="inline-flex items-center gap-2">
            <Snowflake class="size-4" aria-hidden="true" />
            Снаружи {{ form.outdoorTemperature }} °C
          </span>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-2xl border border-border bg-card p-6 shadow-sm"
      data-testid="validation-message"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 class="font-semibold">Проверьте параметры</h3>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">
            Ширина и высота должны быть целыми числами больше нуля, а температуры — корректными числами.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
