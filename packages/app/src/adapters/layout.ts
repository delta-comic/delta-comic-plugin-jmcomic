import { pluginContributions, pluginModelChannels } from '@delta-comic/plugin'
import { PLUGIN_LAYOUT_ID } from '@delta-comic/plugin-layout'

export const getLayout = () => {
  const layout = pluginContributions
    .channel(pluginModelChannels.expose)
    .get(PLUGIN_LAYOUT_ID, 'default')?.value
  if (!layout) throw new Error('layout plugin is not ready')
  return layout
}