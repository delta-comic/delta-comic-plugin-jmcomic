import '@/index.css'
import { defineDeltaComicPlugin } from '@delta-comic/plugin'

import { jmcomicPluginConfig } from '@/plugin/config'
import { runtime } from '@/runtime/PluginRuntime'

export { jmcomicPluginConfig }

export default defineDeltaComicPlugin(
  () => jmcomicPluginConfig as { model: { expose: { jm: typeof runtime.jm } } },
)