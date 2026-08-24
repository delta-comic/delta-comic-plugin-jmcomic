import * as items from '@/models/items'
import * as pages from '@/models/pages'
import { runtime } from '@/runtime/PluginRuntime'

export const expose = { runtime, pages, items } as const

export type LibJmcomic = typeof expose