<script setup>
import { computed } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps({
  variant: { type: String, default: 'default' },
  class: { type: [String, Array, Object], default: undefined },
})

const classes = computed(() => cn(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    'border-transparent bg-primary text-primary-foreground': props.variant === 'default',
    'border-transparent bg-secondary text-secondary-foreground': props.variant === 'secondary',
    'border-border text-foreground': props.variant === 'outline',
  },
  props.class,
))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
