import '@/index.css'
import { definePlugin } from '@delta-comic/plugin'

import PluginPanel from './components/PluginPanel.vue'
import { templateConfig } from './config'
import { templateMessages } from './i18n'
import { pluginMetadata } from './metadata'

export interface TemplatePluginLibrary {
  readonly components: { readonly PluginPanel: typeof PluginPanel }
}

const plugin = definePlugin({
  name: pluginMetadata.name.id,
  config: [templateConfig],
  i18n: templateMessages,
  onBooted: (): TemplatePluginLibrary => ({ components: { PluginPanel } }),
})

export default plugin