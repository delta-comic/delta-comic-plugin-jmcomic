import type { SpecialModel } from '@delta-comic/plugin'
import { SortType } from 'jmcomic-sdk'

import { searchKeys } from '@/constants'
import { translate } from '@/i18n'
import { categories } from '@/plugin/content'
import { runtime } from '@/runtime/PluginRuntime'

export const special: SpecialModel = [
  {
    name: 'jmcomic.progress.checkIn',
    async call(setDescription) {
      if (!runtime.jm.auth.session?.user) return
      setDescription(translate('jmcomic.progress.checkIn'))
      try {
        await runtime.jm.user.dailyCheck(runtime.signal)
        setDescription(translate('jmcomic.progress.checkInDone'))
      } catch {
        // Repeated check-ins are expected and must not prevent the plugin from loading.
      }
    },
  },
  {
    name: 'jmcomic.progress.preload',
    async call(setDescription) {
      setDescription(translate('jmcomic.progress.categories'))
      await runtime.preload()
      categories.splice(
        0,
        categories.length,
        ...(runtime.categories?.categories ?? []).flatMap(category => [
          {
            title: category.name,
            namespace: category.slug,
            search: {
              input: `category:${category.slug}`,
              search: { method: searchKeys.keyword, sort: SortType.Relate },
            },
          },
          ...(category.sub_categories ?? []).map(child => ({
            title: child.name,
            namespace: child.slug,
            search: {
              input: `category:${child.slug}`,
              search: { method: searchKeys.keyword, sort: SortType.Relate },
            },
          })),
        ]),
      )
    },
  },
]