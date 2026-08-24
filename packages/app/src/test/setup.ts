import { vi } from 'vitest'

vi.mock('@delta-comic/plugin', () => {
  const exposeRegistry = {
    get: (owner: string, id: string) =>
      owner === 'layout' && id === 'default'
        ? {
            id,
            owner,
            value: {
              layout: { Default: { name: 'LayoutDefault' } },
              view: { Image: { name: 'LayoutImage' }, Video: { name: 'LayoutVideo' } },
            },
          }
        : undefined,
  }

  return {
    defineDeltaComicPlugin: (config: unknown) =>
      typeof config === 'function' ? config : () => config,
    pluginI18n: { translate: vi.fn((key: string) => key) },
    pluginContributions: { channel: () => exposeRegistry },
    pluginModelChannels: { expose: {} },
  }
})

vi.mock('@delta-comic/plugin-layout', () => ({ PLUGIN_LAYOUT_ID: 'layout' }))

vi.mock('@delta-comic/utils', () => ({ SharedFunction: { call: vi.fn().mockResolvedValue([]) } }))

vi.mock('@delta-comic/db', () => {
  const query = {
    deleteFrom: vi.fn(),
    execute: vi.fn().mockResolvedValue([]),
    executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    replaceInto: vi.fn(),
    select: vi.fn(),
    selectFrom: vi.fn(),
    values: vi.fn(),
    where: vi.fn(),
  }
  for (const method of [
    'deleteFrom',
    'replaceInto',
    'select',
    'selectFrom',
    'values',
    'where',
  ] as const) {
    query[method].mockReturnValue(query)
  }
  return { db: query }
})