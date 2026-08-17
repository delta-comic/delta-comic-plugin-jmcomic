import { describe, expect, it, vi } from 'vitest'

vi.mock('@delta-comic/plugin', () => ({ pluginI18n: { translate: vi.fn((key: string) => key) } }))

import { pluginI18n } from '@delta-comic/plugin'

import { jmcomicMessages, translate } from '.'

describe('jmcomic locale messages', () => {
  it('exposes only Simplified Chinese messages', () => {
    expect(Object.keys(jmcomicMessages)).toEqual(['zh-CN'])
    expect(jmcomicMessages['zh-CN'].jmcomic.remotes).toEqual({
      api: 'API 分流',
      autoSelect: '自动选择',
    })
  })

  it('delegates translation to the host locale registry', () => {
    expect(translate('jmcomic.reader.page', { page: 2 })).toBe('jmcomic.reader.page')
    expect(pluginI18n.translate).toHaveBeenCalledWith('jmcomic.reader.page', { page: 2 })
  })
})