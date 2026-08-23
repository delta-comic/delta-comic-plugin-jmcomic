import type { DCPluginConfig } from '@delta-comic/plugin'

import { jmcomicSubscribe } from '@/adapters/search'
import { pluginName } from '@/constants'
import { jmcomicMessages } from '@/i18n'
import { content } from '@/plugin/content'
import { hooks } from '@/plugin/hooks'
import { special } from '@/plugin/progress'
import { remotes } from '@/plugin/remotes'
import { user } from '@/plugin/user'
import { runtime } from '@/runtime/PluginRuntime'

export const jmcomicPluginConfig = {
  name: pluginName,
  i18n: jmcomicMessages,
  model: {
    content,
    expose: { jm: runtime.jm },
    remotes,
    social: { subscribe: jmcomicSubscribe },
    special,
    user,
  },
  hooks,
} satisfies DCPluginConfig