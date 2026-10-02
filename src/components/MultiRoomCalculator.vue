<script setup>
import { computed, reactive, ref } from 'vue'
import {
  AlertTriangle,
  Flame,
  Snowflake,
  Thermometer,
  Wind,
} from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  createRectangularCoolingScenario,
  createRectangularHeatingScenario,
  createTwoRoomCoolingPlan,
  createTwoRoomHeatingPlan,
  findMinimumCoolerCountForTwoRooms,
  findMinimumHeaterCountForTwoRooms,
} from '@/domain/climate/vanilla'

const mode = ref('heating')

const roofOptions = {
  thin: {
    label: 'Обычная',
    values: {
      thinRoofCoverage: 1,
      noRoofCoverage: 0,
      thickRoofCoverage: 0,
      undergroundMap: false,
    },
  },
  thick: {
    label: 'Толстая горная',
    values: {
      thinRoofCoverage: 0,
      noRoofCoverage: 0,
      thickRoofCoverage: 1,
      undergroundMap: false,
    },
  },
  open: {
    label: 'Нет крыши',
    values: {
      thinRoofCoverage: 0,
      noRoofCoverage: 1,
      thickRoofCoverage: 0,
      undergroundMap: false,
    },
  },
}

const heatingForm = reactive({
  outdoorTemperature: -30,
  ventCount: 2,
  heaterRoom: 'A',
  heaterSetpoint: 25,
  roomA: {
    width: 10,
    height: 10,
    targetTemperature: 25,
    wallLayers: 1,
    roofType: 'thin',
  },
  roomB: {
    width: 10,
    height: 10,
    targetTemperature: 15,
    wallLayers: 1,
    roofType: 'thin',
  },
})

const coolingForm = reactive({
  outdoorTemperature: 40,
  ventCount: 0,
  coldRoom: 'A',
  coolerSetpoint: 20,
  roomA: {
    width: 10,
    height: 10,
    targetTemperature: 20,
    wallLayers: 1,
    roofType: 'thin',
  },
  roomB: {
    width: 10,
    height: 10,
    targetTemperature: 100,
    wallLayers: 1,
    roofType: 'thin',
  },
})

function createHeatingRoom(room) {
  return createRectangularHeatingScenario({
    width: Number(room.width),
    height: Number(room.height),
    outdoorTemperature: Number(heatingForm.outdoorTemperature),
    targetTemperature: Number(room.targetTemperature),
    wallLayers: Number(room.wallLayers),
    ...roofOptions[room.roofType].values,
  })
}

function createCoolingRoom(room) {
  return createRectangularCoolingScenario({
    width: Number(room.width),
    height: Number(room.height),
    outdoorTemperature: Number(coolingForm.outdoorTemperature),
    targetTemperature: Number(room.targetTemperature),
    wallLayers: Number(room.wallLayers),
    ...roofOptions[room.roofType].values,
  })
}

const heatingPlan = computed(() => {
  try {
    return createTwoRoomHeatingPlan({
      roomA: createHeatingRoom(heatingForm.roomA),
      roomB: createHeatingRoom(heatingForm.roomB),
      ventCount: Number(heatingForm.ventCount),
      heaterRoom: heatingForm.heaterRoom,
      heaterSetpoint: Number(heatingForm.heaterSetpoint),
    })
  } catch {
    return null
  }
})

const heatingResult = computed(() => {
  if (!heatingPlan.value) {
    return null
  }

  return findMinimumHeaterCountForTwoRooms({
    plan: heatingPlan.value,
    maxDevices: 1000,
  })
})

const coolingPlan = computed(() => {
  try {
    const roomA = createCoolingRoom(coolingForm.roomA)
    const roomB = createCoolingRoom(coolingForm.roomB)

    return createTwoRoomCoolingPlan({
      coldRoom: coolingForm.coldRoom === 'A' ? roomA : roomB,
      hotRoom: coolingForm.coldRoom === 'A' ? roomB : roomA,
      coolerSetpoint: Number(coolingForm.coolerSetpoint),
      ventCount: Number(coolingForm.ventCount),
    })
  } catch {
    return null
  }
})

const coolingResult = computed(() => {
  if (!coolingPlan.value) {
    return null
  }

  return findMinimumCoolerCountForTwoRooms({
    plan: coolingPlan.value,
    maxDevices: 100,
  })
})

const formatTemperature = (value) => `${Number(value).toFixed(1)} °C`

const heatingTemperatures = computed(() => {
  if (!heatingResult.value) {
    return null
  }

  if (heatingResult.value.reachable) {
    return heatingResult.value.simulation.temperatures
  }

  return heatingResult.value.theoreticalMaximum?.temperatures ?? null
})

const coolingTemperatures = computed(() => {
  if (!coolingResult.value) {
    return null
  }

  if (coolingResult.value.reachable) {
    const temperatures = coolingResult.value.simulation.temperatures

    return coolingForm.coldRoom === 'A'
      ? { A: temperatures.cold, B: temperatures.hot }
      : { A: temperatures.hot, B: temperatures.cold }
  }

  const best = coolingResult.value.bestAttempt?.simulation?.temperatures
  if (!best) {
    return null
  }

  return coolingForm.coldRoom === 'A'
    ? { A: best.cold, B: best.hot }
    : { A: best.hot, B: best.cold }
})
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Badge variant="secondary">
          Thermal zones + Vent
        </Badge>
        <h2 class="mt-2 text-xl font-semibold tracking-tight">
          Связанные комнаты
        </h2>
        <p class="mt-1 text-sm leading-6 text-muted-foreground">
          Две комнаты обмениваются теплом через Vent. Расчёт учитывает собственные теплопотери каждой комнаты.
        </p>
      </div>

      <div
        class="inline-flex rounded-lg border border-border bg-background p-1"
        role="tablist"
        aria-label="Режим связанных комнат"
      >
        <Button
          data-testid="multi-heating-mode"
          size="sm"
          :variant="mode === 'heating' ? 'default' : 'ghost'"
          role="tab"
          :aria-selected="mode === 'heating'"
          @click="mode = 'heating'"
        >
          <Flame class="size-4" aria-hidden="true" />
          Отопление
        </Button>
        <Button
          data-testid="multi-cooling-mode"
          size="sm"
          :variant="mode === 'cooling' ? 'default' : 'ghost'"
          role="tab"
          :aria-selected="mode === 'cooling'"
          @click="mode = 'cooling'"
        >
          <Snowflake class="size-4" aria-hidden="true" />
          Охлаждение
        </Button>
      </div>
    </div>

    <template v-if="mode === 'heating'">
      <div class="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
        <article
          v-for="roomKey in ['A', 'B']"
          :key="roomKey"
          class="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">Тепловая зона</p>
              <h3 class="text-lg font-semibold">Комната {{ roomKey }}</h3>
            </div>
            <Badge
              v-if="heatingForm.heaterRoom === roomKey"
              variant="secondary"
            >
              Heater
            </Badge>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium">Ширина</span>
              <input
                v-model.number="heatingForm[`room${roomKey}`].width"
                :data-testid="`multi-heat-${roomKey.toLowerCase()}-width`"
                type="number"
                min="1"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Высота</span>
              <input
                v-model.number="heatingForm[`room${roomKey}`].height"
                type="number"
                min="1"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Минимум, °C</span>
              <input
                v-model.number="heatingForm[`room${roomKey}`].targetTemperature"
                :data-testid="`multi-heat-${roomKey.toLowerCase()}-target`"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Стены</span>
              <select
                v-model.number="heatingForm[`room${roomKey}`].wallLayers"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option :value="1">Одинарные</option>
                <option :value="2">Двойные</option>
              </select>
            </label>

            <label class="space-y-2 sm:col-span-2 xl:col-span-1 2xl:col-span-2">
              <span class="text-sm font-medium">Крыша</span>
              <select
                v-model="heatingForm[`room${roomKey}`].roofType"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option
                  v-for="(roof, key) in roofOptions"
                  :key="key"
                  :value="key"
                >
                  {{ roof.label }}
                </option>
              </select>
            </label>
          </div>
        </article>

        <article class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 class="text-lg font-semibold">Связь и отопление</h3>

          <div class="mt-5 space-y-4">
            <label class="space-y-2">
              <span class="text-sm font-medium">Снаружи, °C</span>
              <input
                v-model.number="heatingForm.outdoorTemperature"
                data-testid="multi-heat-outdoor"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Количество Vent</span>
              <input
                v-model.number="heatingForm.ventCount"
                data-testid="multi-heat-vent-count"
                type="number"
                min="0"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Heater находится в</span>
              <select
                v-model="heatingForm.heaterRoom"
                data-testid="multi-heater-room"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="A">Комнате A</option>
                <option value="B">Комнате B</option>
              </select>
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Термостат Heater, °C</span>
              <input
                v-model.number="heatingForm.heaterSetpoint"
                data-testid="multi-heater-setpoint"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>
          </div>
        </article>
      </div>

      <article
        v-if="heatingPlan && heatingResult"
        class="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div class="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Рекомендация</p>
            <p
              data-testid="multi-heater-count"
              class="mt-2 text-4xl font-semibold tracking-tight"
            >
              {{ heatingResult.reachable ? heatingResult.requiredCount : 'Недостижимо' }}
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ heatingResult.reachable ? 'Heater' : 'при выбранных Vent и термостате' }}
            </p>

            <div
              v-if="!heatingResult.reachable"
              class="mt-4 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm"
            >
              <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Даже неограниченная мощность Heater не позволяет удержать обе комнаты на заданных минимумах.
                Увеличьте температуру термостата или количество Vent.
              </span>
            </div>
          </div>

          <div
            v-if="heatingTemperatures"
            class="grid gap-3 sm:grid-cols-2"
          >
            <div class="rounded-xl bg-muted/40 p-4">
              <p class="text-sm text-muted-foreground">Стабильно · комната A</p>
              <p data-testid="multi-heat-temp-a" class="mt-1 text-2xl font-semibold">
                {{ formatTemperature(heatingTemperatures.A) }}
              </p>
            </div>
            <div class="rounded-xl bg-muted/40 p-4">
              <p class="text-sm text-muted-foreground">Стабильно · комната B</p>
              <p data-testid="multi-heat-temp-b" class="mt-1 text-2xl font-semibold">
                {{ formatTemperature(heatingTemperatures.B) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <span class="inline-flex items-center gap-2">
            <Wind class="size-4" aria-hidden="true" />
            {{ heatingForm.ventCount }} Vent
          </span>
          <span class="inline-flex items-center gap-2">
            <Thermometer class="size-4" aria-hidden="true" />
            Снаружи {{ heatingForm.outdoorTemperature }} °C
          </span>
        </div>
      </article>

      <div
        v-else
        data-testid="multi-heating-validation"
        class="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <p class="font-semibold">Проверьте параметры связанных комнат.</p>
      </div>
    </template>

    <template v-else>
      <div class="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
        <article
          v-for="roomKey in ['A', 'B']"
          :key="roomKey"
          class="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">Тепловая зона</p>
              <h3 class="text-lg font-semibold">Комната {{ roomKey }}</h3>
            </div>
            <Badge
              :variant="coolingForm.coldRoom === roomKey ? 'secondary' : 'outline'"
            >
              {{ coolingForm.coldRoom === roomKey ? 'Cold side' : 'Hot side' }}
            </Badge>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium">Ширина</span>
              <input
                v-model.number="coolingForm[`room${roomKey}`].width"
                type="number"
                min="1"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Высота</span>
              <input
                v-model.number="coolingForm[`room${roomKey}`].height"
                type="number"
                min="1"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">
                {{ coolingForm.coldRoom === roomKey ? 'Максимум холода, °C' : 'Максимум exhaust, °C' }}
              </span>
              <input
                v-model.number="coolingForm[`room${roomKey}`].targetTemperature"
                :data-testid="`multi-cool-${roomKey.toLowerCase()}-target`"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Стены</span>
              <select
                v-model.number="coolingForm[`room${roomKey}`].wallLayers"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option :value="1">Одинарные</option>
                <option :value="2">Двойные</option>
              </select>
            </label>

            <label class="space-y-2 sm:col-span-2 xl:col-span-1 2xl:col-span-2">
              <span class="text-sm font-medium">Крыша</span>
              <select
                v-model="coolingForm[`room${roomKey}`].roofType"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option
                  v-for="(roof, key) in roofOptions"
                  :key="key"
                  :value="key"
                >
                  {{ roof.label }}
                </option>
              </select>
            </label>
          </div>
        </article>

        <article class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 class="text-lg font-semibold">Связь и Cooler</h3>

          <div class="mt-5 space-y-4">
            <label class="space-y-2">
              <span class="text-sm font-medium">Снаружи, °C</span>
              <input
                v-model.number="coolingForm.outdoorTemperature"
                data-testid="multi-cool-outdoor"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Vent между комнатами</span>
              <input
                v-model.number="coolingForm.ventCount"
                data-testid="multi-cool-vent-count"
                type="number"
                min="0"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Холодная сторона Cooler</span>
              <select
                v-model="coolingForm.coldRoom"
                data-testid="multi-cold-room"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="A">Комната A</option>
                <option value="B">Комната B</option>
              </select>
            </label>

            <label class="space-y-2">
              <span class="text-sm font-medium">Термостат Cooler, °C</span>
              <input
                v-model.number="coolingForm.coolerSetpoint"
                data-testid="multi-cooler-setpoint"
                type="number"
                min="-273"
                max="1000"
                step="1"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
            </label>
          </div>

          <p class="mt-4 text-xs leading-5 text-muted-foreground">
            Cooler стоит между комнатами: одна сторона охлаждается, вторая получает горячий выброс.
            Vent между этими же комнатами может заметно ухудшить охлаждение.
          </p>
        </article>
      </div>

      <article
        v-if="coolingPlan && coolingResult"
        class="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div class="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Рекомендация</p>
            <p
              data-testid="multi-cooler-count"
              class="mt-2 text-4xl font-semibold tracking-tight"
            >
              {{ coolingResult.reachable ? coolingResult.requiredCount : 'Недостижимо' }}
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ coolingResult.reachable ? 'Cooler' : 'при текущих ограничениях комнат' }}
            </p>

            <div
              v-if="!coolingResult.reachable"
              class="mt-4 flex gap-2 rounded-lg bg-muted/60 p-3 text-sm"
            >
              <AlertTriangle class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Не удалось одновременно удержать cold room ниже её максимума и exhaust room ниже допустимой температуры.
              </span>
            </div>
          </div>

          <div
            v-if="coolingTemperatures"
            class="grid gap-3 sm:grid-cols-2"
          >
            <div class="rounded-xl bg-muted/40 p-4">
              <p class="text-sm text-muted-foreground">Стабильно · комната A</p>
              <p data-testid="multi-cool-temp-a" class="mt-1 text-2xl font-semibold">
                {{ formatTemperature(coolingTemperatures.A) }}
              </p>
            </div>
            <div class="rounded-xl bg-muted/40 p-4">
              <p class="text-sm text-muted-foreground">Стабильно · комната B</p>
              <p data-testid="multi-cool-temp-b" class="mt-1 text-2xl font-semibold">
                {{ formatTemperature(coolingTemperatures.B) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <span class="inline-flex items-center gap-2">
            <Wind class="size-4" aria-hidden="true" />
            {{ coolingForm.ventCount }} Vent
          </span>
          <span class="inline-flex items-center gap-2">
            <Thermometer class="size-4" aria-hidden="true" />
            Снаружи {{ coolingForm.outdoorTemperature }} °C
          </span>
        </div>
      </article>

      <div
        v-else
        data-testid="multi-cooling-validation"
        class="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <p class="font-semibold">Проверьте параметры связанных комнат.</p>
      </div>
    </template>
  </section>
</template>
