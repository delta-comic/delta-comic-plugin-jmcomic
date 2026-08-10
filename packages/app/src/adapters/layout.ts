import { pluginContributions, pluginModelChannels } from '@delta-comic/plugin'

import type { LibLayout } from '@/types/layout-plugin'

export const layoutPluginName = 'layout'

export const getLayout = (): LibLayout => {
  const layout = pluginContributions
    .channel(pluginModelChannels.expose)
    .get(layoutPluginName, 'default')?.value
  if (!layout) throw new Error('layout plugin is not ready')
  return layout
}