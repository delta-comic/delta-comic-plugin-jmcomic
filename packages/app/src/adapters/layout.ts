import type { LibLayout } from '@delta-comic/delta-comic-plugin-layout'
import { usePluginStore } from '@delta-comic/plugin'

export const layoutPluginName = 'layout'

export const getLayout = (): LibLayout => {
  const layout = usePluginStore().plugins.get(layoutPluginName)?.model?.expose
  if (!layout) throw new Error('layout plugin is not ready')
  return layout as LibLayout
}