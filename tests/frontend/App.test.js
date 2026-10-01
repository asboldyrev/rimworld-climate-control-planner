import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'

describe('heating calculator UI', () => {
  it('renders the default 10x10 / -30 C / 20 C heating recommendation', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('RimWorld Climate Control Planner')
    expect(wrapper.get('[data-testid="room-area"]').text()).toContain('100')
    expect(wrapper.get('[data-testid="required-heat"]').text()).toContain('35.4')
    expect(wrapper.get('[data-testid="heater-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="campfire-count"]').text()).toBe('2')
  })

  it('reacts to room-size changes using the domain calculation model', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="width-input"]').setValue('5')
    await wrapper.get('[data-testid="height-input"]').setValue('5')

    expect(wrapper.get('[data-testid="room-area"]').text()).toContain('25')
    expect(wrapper.get('[data-testid="heater-count"]').text()).toBe('1')
  })

  it('reduces wall losses when switching from single to double walls', async () => {
    const wrapper = mount(App)

    const before = wrapper.get('[data-testid="required-heat"]').text()

    await wrapper.get('[data-testid="wall-layers-select"]').setValue('2')

    const after = wrapper.get('[data-testid="required-heat"]').text()

    expect(before).toContain('35.4')
    expect(after).toContain('25.2')
  })

  it('shows an unreachable heater result above the heater cutoff', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="target-input"]').setValue('121')

    expect(wrapper.get('[data-testid="heater-count"]').text()).toBe('Недостижимо')
    expect(wrapper.text()).toContain('обогреватель уже не даёт тепла')
  })

  it('shows the campfire limitation at its 28 C cutoff', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="target-input"]').setValue('28')

    expect(wrapper.get('[data-testid="campfire-count"]').text()).toBe('Недостижимо')
    expect(wrapper.text()).toContain('Костёр прекращает новые тепловые импульсы при 28 °C')
  })

  it('shows validation instead of throwing while a required numeric field is invalid', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="width-input"]').setValue('')

    expect(wrapper.get('[data-testid="validation-message"]').text()).toContain('Проверьте параметры')
  })
})
