import { pluginContributions, pluginModelChannels } from '@delta-comic/plugin'
import type { LibLayout } from '@delta-comic/plugin-layout'

import { pluginLayoutId } from '@/constants'

export const getLayout = (): LibLayout => {
  const layout = pluginContributions
    .channel(pluginModelChannels.expose)
    .get(pluginLayoutId, 'default')?.value
  if (!layout) throw new Error('layout plugin is not ready')
  return layout
}