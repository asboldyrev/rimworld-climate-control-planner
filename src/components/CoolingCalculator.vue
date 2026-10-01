<script setup>
import { computed, reactive } from 'vue'
import {
  AlertTriangle,
  Gauge,
  House,
  Info,
  Snowflake,
  Thermometer,
} from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import {
  coolingDemandAtTemperature,
  createRectangularCoolingScenario,
  findMinimumCoolerCount,
  findMinimumPassiveCoolerCount,
} from '@/domain/climate/vanilla'

const form = reactive({
  width: 10,
  height: 10,
  outdoorTemperature: 40,
  targetTemperature: 20,
  wallLayers: 1,
  roofType: 'thin',
  useOutdoorAsHotSide: true,
  hotSideTemperature: 40,
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

const effectiveHotSideTemperature = computed(() => (
  form.useOutdoorAsHotSide
    ? Number(form.outdoorTemperature)
    : Number(form.hotSideTemperature)
))

const scenario = computed(() => {
  try {
    return createRectangularCoolingScenario({
      width: Number(form.width),
      height: Number(form.height),
      outdoorTemperature: Number(form.outdoorTemperature),
      targetTemperature: Number(form.targetTemperature),
      wallLayers: Number(form.wallLayers),
      hotSideTemperature: effectiveHotSideTemperature.value,
      ...roofOptions[form.roofType].values,
    })
  } catch {
    return null
  }
})

const demand = computed(() => scenario.value
  ? coolingDemandAtTemperature({
    scenario: scenario.value,
    roomTemperature: scenario.value.targetTemperature,
  })
  : null)

const coolerResult = computed(() => scenario.value
  ? findMinimumCoolerCount({ scenario: scenario.value })
  : null)

const passiveResult = computed(() => scenario.value
  ? findMinimumPassiveCoolerCount({ scenario: scenario.value })
  : null)

const roomArea = computed(() => scenario.value?.geometry.cellCount ?? null)

const formatNumber = (value, digits = 1) => Number(value).toFixed(digits)
const formatPercent = (value) => `${formatNumber(value * 100, 1)}%`

const coolerSummary = computed(() => {
  if (!coolerResult.value) {
    return { primary: '—', secondary: 'Проверьте параметры помещения.' }
  }

  if (!coolerResult.value.reachable) {
    return {
      primary: 'Недостижимо',
      secondary: coolerResult.value.reason === 'cooler-has-no-capacity-at-target'
        ? 'При такой разнице температур эффективность кондиционера падает до нуля.'
        : 'Для расчёта требуется слишком много устройств.',
    }
  }

  return {
    primary: String(coolerResult.value.requiredCount),
    secondary: coolerResult.value.requiredCount === 1
      ? 'кондиционер'
      : 'кондиционера',
  }
})

const passiveSummary = computed(() => {
  if (!passiveResult.value) {
    return { primary: '—', secondary: 'Проверьте параметры помещения.' }
  }

  if (!passiveResult.value.reachable) {
    return {
      primary: 'Недостижимо',
      secondary: passiveResult.value.reason === 'passive-cooler-minimum-temperature'
        ? 'Испарительный охладитель не может удерживать температуру ниже 17 °C.'
        : 'Для расчёта требуется слишком много устройств.',
    }
  }

  return {
    primary: String(passiveResult.value.requiredCount),
    secondary: passiveResult.value.requiredCount === 1
      ? 'испарительный охладитель'
      : 'испарительных охладителя',
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
            Охлаждение
          </h2>
        </div>

        <div class="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Snowflake class="size-5" aria-hidden="true" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-medium">Ширина, клеток</span>
          <input
            v-model.number="form.width"
            data-testid="cooling-width-input"
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
            data-testid="cooling-height-input"
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
            data-testid="cooling-outdoor-input"
            type="number"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Целевая, °C</span>
          <input
            v-model.number="form.targetTemperature"
            data-testid="cooling-target-input"
            type="number"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium">Стены</span>
          <select
            v-model.number="form.wallLayers"
            data-testid="cooling-wall-layers-select"
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
            data-testid="cooling-roof-select"
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

      <div class="mt-5 rounded-xl border border-border p-4">
        <label class="flex items-start gap-3">
          <input
            v-model="form.useOutdoorAsHotSide"
            data-testid="hot-side-outdoor-checkbox"
            type="checkbox"
            class="mt-1 size-4 rounded border-input"
          >
          <span>
            <span class="block text-sm font-medium">Горячая сторона выходит наружу</span>
            <span class="mt-1 block text-sm leading-6 text-muted-foreground">
              Тогда её температура считается равной наружной.
            </span>
          </span>
        </label>

        <label
          v-if="!form.useOutdoorAsHotSide"
          class="mt-4 block space-y-2"
        >
          <span class="text-sm font-medium">Температура горячей стороны, °C</span>
          <input
            v-model.number="form.hotSideTemperature"
            data-testid="hot-side-input"
            type="number"
            step="1"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
        </label>
      </div>

      <div class="mt-5 rounded-xl bg-muted/45 p-4">
        <div class="flex items-center gap-2 text-sm font-medium">
          <Info class="size-4" aria-hidden="true" />
          Текущая модель
        </div>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          Изолированная прямоугольная комната. Для кондиционера отдельно учитывается
          температура горячей стороны. Соседние помещения и вентиляция будут добавлены позже.
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
                Cooler
              </Badge>
              <p
                data-testid="cooler-count"
                class="mt-4 text-4xl font-semibold tracking-tight"
              >
                {{ coolerSummary.primary }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ coolerSummary.secondary }}
              </p>
            </div>

            <div class="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Snowflake class="size-5" aria-hidden="true" />
            </div>
          </div>

          <div
            v-if="coolerResult.reachable"
            class="mt-5 space-y-3 border-t border-border pt-4 text-sm"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">Эффективность</span>
              <span
                data-testid="cooler-efficiency"
                class="font-medium"
              >
                {{ formatPercent(coolerResult.evaluation.unit.efficiency) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">Горячая сторона</span>
              <span data-testid="hot-side-value" class="font-medium">
                {{ effectiveHotSideTemperature }} °C
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-muted-foreground">Запас мощности</span>
              <span class="font-medium">
                {{ formatNumber(coolerResult.evaluation.marginEnergy, 1) }} energy / 120 ticks
              </span>
            </div>
          </div>

          <div
            v-else
            class="mt-5 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm"
          >
            <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ coolerSummary.secondary }}</span>
          </div>
        </article>

        <article class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline">
                Passive Cooler
              </Badge>
              <p
                data-testid="passive-cooler-count"
                class="mt-4 text-4xl font-semibold tracking-tight"
              >
                {{ passiveSummary.primary }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ passiveSummary.secondary }}
              </p>
            </div>

            <div class="flex size-10 items-center justify-center rounded-xl border border-border">
              <Snowflake class="size-5" aria-hidden="true" />
            </div>
          </div>

          <div class="mt-5 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm">
            <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Испарительный охладитель не является точным термостатом и не может охлаждать ниже 17 °C.
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
              Теплоприток помещения
            </h3>
          </div>

          <Gauge class="size-5 text-muted-foreground" aria-hidden="true" />
        </div>

        <dl class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Площадь
            </dt>
            <dd data-testid="cooling-room-area" class="mt-1 text-xl font-semibold">
              {{ roomArea }} клеток
            </dd>
          </div>

          <div class="rounded-xl bg-muted/40 p-4">
            <dt class="text-sm text-muted-foreground">
              Нужно отвести
            </dt>
            <dd data-testid="required-cooling" class="mt-1 text-xl font-semibold">
              {{ formatNumber(demand.requiredCoolingPerSecond, 2) }} heat/s
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
      data-testid="cooling-validation-message"
    >
      <div class="flex items-start gap-3">
        <AlertTriangle class="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 class="font-semibold">Проверьте параметры</h3>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">
            Размеры комнаты должны быть целыми числами больше нуля, а температуры — корректными числами.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
