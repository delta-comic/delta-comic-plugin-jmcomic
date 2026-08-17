import { pluginI18n, type PluginLocaleMessages } from '@delta-comic/plugin'

import zhCN from './locales/zh-CN'

export const jmcomicMessages = { 'zh-CN': zhCN } satisfies PluginLocaleMessages

export const translate = (key: string, params?: Record<string, number | string>) =>
  pluginI18n.translate(key, params)