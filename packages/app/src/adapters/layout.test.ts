import { pluginContributions, pluginModelChannels } from '@delta-comic/plugin'
import { describe, expect, it, vi } from 'vitest'

import { getLayout } from './layout'

describe('layout adapter', () => {
  it('fails clearly when the layout contribution is unavailable', () => {
    const expose = pluginContributions.channel(pluginModelChannels.expose)
    vi.spyOn(expose, 'get').mockReturnValueOnce(undefined)

    expect(getLayout).toThrow('layout plugin is not ready')
  })
})