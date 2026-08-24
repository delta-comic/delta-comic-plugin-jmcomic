import '@/index.css'
import { defineDeltaComicPlugin } from '@delta-comic/plugin'

import { jmcomicSubscribe } from '@/adapters/search'
import { pluginName } from '@/constants'
import { expose } from '@/expose'
import { jmcomicMessages } from '@/i18n'
import { content } from '@/plugin/content'
import { hooks } from '@/plugin/hooks'
import { special } from '@/plugin/progress'
import { remotes } from '@/plugin/remotes'
import { user } from '@/plugin/user'

export default defineDeltaComicPlugin({
  name: pluginName,
  i18n: jmcomicMessages,
  model: { content, expose, remotes, social: { subscribe: jmcomicSubscribe }, special, user },
  hooks,
})

export type { LibJmcomic } from '@/expose'

export { pluginName as PLUGIN_JMCOMIC_ID } from '@/constants'