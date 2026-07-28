import { vi } from 'vitest'

vi.mock('@delta-comic/plugin', () => ({
  definePlugin: (config: unknown) => () => config,
  Global: { addCategories: vi.fn(), addTabbar: vi.fn(), removeOwnedRegistrations: vi.fn() },
  pluginI18n: { translate: vi.fn((key: string) => key) },
}))

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