import { isString } from 'es-toolkit/compat'

import { pluginName } from '../symbol'

export const spiltUsers = (userString = '') =>
  userString
    .split(/\,|，|\&|\||、|＆|(\sand\s)|(\s和\s)|(\s[xX]\s)/gi)
    .filter(Boolean)
    .map(v => v.trim())
    .filter(Boolean)

export const isCosplay = (tags: string[] | string) =>
  tags.includes('COSPLAY') || tags.includes('cosplay')
export const createAuthor = (item: { author: string | string[]; tags?: string | string[] }) =>
  (isString(item.author) ? spiltUsers(item.author) : item.author).map(v => ({
    label: v,
    description: item.tags ? (isCosplay(item.tags) ? 'coser' : '作者') : '作者',
    icon: item.tags ? (isCosplay(item.tags) ? 'coser' : 'draw') : 'coser',
    actions: ['search'],
    subscribe: 'keyword',
    $$plugin: pluginName
  }))

export enum QueryKeys {
  Comic = 'jmcomic::comic_detail'
}