import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MultiRoomCalculator from '@/components/MultiRoomCalculator.vue'

describe('multi-room Vent calculator UI', () => {
  it('renders the two-room heating reference scenario', () => {
    const wrapper = mount(MultiRoomCalculator)

    expect(wrapper.get('[data-testid="multi-heater-count"]').text()).toBe('4')
    expect(wrapper.get('[data-testid="multi-heat-temp-a"]').text()).toContain('25.0')
    expect(wrapper.get('[data-testid="multi-heat-temp-b"]').text()).toContain('15.')
  })

  it('shows the one-Vent heating bottleneck as unreachable', async () => {
    const wrapper = mount(MultiRoomCalculator)

    await wrapper.get('[data-testid="multi-heat-vent-count"]').setValue('1')

    expect(wrapper.get('[data-testid="multi-heater-count"]').text()).toBe('Недостижимо')
    expect(wrapper.get('[data-testid="multi-heat-temp-b"]').text()).toContain('8.7')
  })

  it('switches to the coupled cooling reference scenario', async () => {
    const wrapper = mount(MultiRoomCalculator)

    await wrapper.get('[data-testid="multi-cooling-mode"]').trigger('click')

    expect(wrapper.get('[data-testid="multi-cooler-count"]').text()).toBe('3')
    expect(wrapper.get('[data-testid="multi-cool-temp-a"]').text()).toContain('20.0')
    expect(Number.parseFloat(wrapper.get('[data-testid="multi-cool-temp-b"]').text())).toBeGreaterThan(40)
  })

  it('surfaces invalid room geometry instead of throwing', async () => {
    const wrapper = mount(MultiRoomCalculator)

    await wrapper.get('[data-testid="multi-heat-a-width"]').setValue('')

    expect(wrapper.get('[data-testid="multi-heating-validation"]').text()).toContain('Проверьте параметры')
  })
})
