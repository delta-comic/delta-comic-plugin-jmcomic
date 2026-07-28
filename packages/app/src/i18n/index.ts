import { pluginI18n, type PluginLocaleMessages } from '@delta-comic/plugin'

const zhCN = {
  template: {
    actions: { confirm: '确认' },
    config: { enabled: '启用示例功能', title: '插件模板' },
    greeting: '你好，{name}',
    title: 'Delta Comic 插件模板',
  },
}

const zhTW = {
  template: {
    actions: { confirm: '確認' },
    config: { enabled: '啟用範例功能', title: '外掛模板' },
    greeting: '你好，{name}',
    title: 'Delta Comic 外掛模板',
  },
}

const enUS = {
  template: {
    actions: { confirm: 'Confirm' },
    config: { enabled: 'Enable example feature', title: 'Plugin template' },
    greeting: 'Hello, {name}',
    title: 'Delta Comic plugin template',
  },
}

export const templateMessages = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
} satisfies PluginLocaleMessages

export const translate = (key: string, params?: Record<string, number | string>) =>
  pluginI18n.translate(key, params)