<script setup>
import { computed } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps({
  as: { type: String, default: 'button' },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  class: { type: [String, Array, Object], default: undefined },
})

const classes = computed(() => cn(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  {
    'bg-primary text-primary-foreground shadow hover:bg-primary/90': props.variant === 'default',
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground': props.variant === 'outline',
    'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
    'h-9 px-4 py-2': props.size === 'default',
    'h-8 rounded-md px-3 text-xs': props.size === 'sm',
    'h-10 rounded-md px-8': props.size === 'lg',
    'size-9': props.size === 'icon',
  },
  props.class,
))
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
