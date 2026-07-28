import { describe, expect, it, vi } from 'vitest'

vi.mock('@delta-comic/plugin', () => ({ pluginI18n: { translate: vi.fn((key: string) => key) } }))

import { pluginI18n } from '@delta-comic/plugin'

import { templateMessages, translate } from '.'

const entries = (value: object, prefix = ''): [string, string][] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof child === 'string' ? [[path, child]] : entries(child as object, path)
  })

const placeholders = (message: string) =>
  [...message.matchAll(/\{([^}]+)\}/g)].map(match => match[1])

describe('template locale messages', () => {
  it('keeps locale keys and interpolation parameters in sync', () => {
    const baseline = new Map(entries(templateMessages['zh-CN']))

    for (const locale of ['zh-TW', 'en-US'] as const) {
      const localized = new Map(entries(templateMessages[locale]))
      expect([...localized.keys()].toSorted()).toEqual([...baseline.keys()].toSorted())
      for (const [key, message] of localized) {
        expect(placeholders(message).toSorted()).toEqual(
          placeholders(baseline.get(key) ?? '').toSorted(),
        )
      }
    }
  })

  it('delegates translation to the host locale registry', () => {
    expect(translate('template.greeting', { name: 'Delta' })).toBe('template.greeting')
    expect(pluginI18n.translate).toHaveBeenCalledWith('template.greeting', { name: 'Delta' })
  })
})