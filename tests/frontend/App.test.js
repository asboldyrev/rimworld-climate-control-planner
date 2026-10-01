import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'

describe('climate calculator UI', () => {
  it('renders the default 10x10 / -30 C / 20 C heating recommendation', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('RimWorld Climate Control Planner')
    expect(wrapper.get('[data-testid="room-area"]').text()).toContain('100')
    expect(wrapper.get('[data-testid="required-heat"]').text()).toContain('35.4')
    expect(wrapper.get('[data-testid="heater-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="campfire-count"]').text()).toBe('2')
  })

  it('reacts to heating room-size changes using the domain calculation model', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="width-input"]').setValue('5')
    await wrapper.get('[data-testid="height-input"]').setValue('5')

    expect(wrapper.get('[data-testid="room-area"]').text()).toContain('25')
    expect(wrapper.get('[data-testid="heater-count"]').text()).toBe('1')
  })

  it('reduces heating wall losses when switching from single to double walls', async () => {
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

  it('shows validation instead of throwing while a heating field is invalid', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="width-input"]').setValue('')

    expect(wrapper.get('[data-testid="validation-message"]').text()).toContain('Проверьте параметры')
  })

  it('switches to cooling and renders the reference recommendation', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="cooling-mode"]').trigger('click')

    expect(wrapper.get('[data-testid="cooling-room-area"]').text()).toContain('100')
    expect(wrapper.get('[data-testid="required-cooling"]').text()).toContain('14.16')
    expect(wrapper.get('[data-testid="cooler-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="passive-cooler-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="cooler-efficiency"]').text()).toBe('84.6%')
    expect(wrapper.get('[data-testid="hot-side-value"]').text()).toContain('40')
  })

  it('uses outdoor temperature as Cooler hot side by default', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="cooling-mode"]').trigger('click')
    await wrapper.get('[data-testid="cooling-outdoor-input"]').setValue('50')

    expect(wrapper.get('[data-testid="hot-side-value"]').text()).toContain('50')
  })

  it('allows a custom Cooler hot-side temperature', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="cooling-mode"]').trigger('click')
    await wrapper.get('[data-testid="cooling-target-input"]').setValue('-10')
    await wrapper.get('[data-testid="hot-side-outdoor-checkbox"]').setValue(false)
    await wrapper.get('[data-testid="hot-side-input"]').setValue('60')

    expect(wrapper.get('[data-testid="hot-side-value"]').text()).toContain('60')
    expect(wrapper.get('[data-testid="cooler-count"]').text()).toBe('4')
  })

  it('shows the Passive Cooler lower-temperature limit', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="cooling-mode"]').trigger('click')
    await wrapper.get('[data-testid="cooling-target-input"]').setValue('10')

    expect(wrapper.get('[data-testid="passive-cooler-count"]').text()).toBe('Недостижимо')
    expect(wrapper.text()).toContain('не может удерживать температуру ниже 17 °C')
  })

  it('shows validation instead of throwing while a cooling field is invalid', async () => {
    const wrapper = mount(App)

    await wrapper.get('[data-testid="cooling-mode"]').trigger('click')
    await wrapper.get('[data-testid="cooling-width-input"]').setValue('')

    expect(wrapper.get('[data-testid="cooling-validation-message"]').text()).toContain('Проверьте параметры')
  })
})
