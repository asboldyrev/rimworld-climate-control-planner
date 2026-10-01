import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'

describe('App foundation', () => {
  it('renders the vanilla-first rewrite shell instead of the legacy mod calculator', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('RimWorld Climate Control Planner')
    expect(wrapper.text()).toContain('Vanilla-first rewrite')
    expect(wrapper.text()).toContain('legacy Centralized Climate Control calculator is no longer the active UI')
  })
})
