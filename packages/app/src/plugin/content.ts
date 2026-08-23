import type { Content } from '@delta-comic/plugin'
import { SortType } from 'jmcomic-sdk'

import { getLayout } from '@/adapters/layout'
import { barcode, searchMethods } from '@/adapters/search'
import JmCommentRow from '@/components/JmCommentRow.vue'
import JmItemCard from '@/components/JmItemCard.vue'
import PromoteTab from '@/components/search/PromoteTab.vue'
import WeekBestTab from '@/components/search/WeekBestTab.vue'
import { searchKeys } from '@/constants'
import { fromCommonComic, translateItem } from '@/models/items'
import { contentPages } from '@/models/pages'
import { runtime } from '@/runtime/PluginRuntime'

export const categories: Content.Category[] = []

export const search: Content.Search = {
  methods: Object.values(searchMethods),
  barcode: [barcode],
  async getHotSearch(signal) {
    return (await runtime.jm.promote.getHotTags(signal)).map(input => ({
      input,
      search: { method: searchKeys.keyword },
    }))
  },
}

export const promotes: Content.Promotes = {
  categories,
  fetchRandomItems: async signal =>
    (await runtime.jm.promote.getRandomProvide(signal)).map(fromCommonComic),
  tabbar: [
    { comp: PromoteTab, id: 'promotes', title: 'jmcomic.search.comic' },
    { comp: WeekBestTab, id: 'week-best', title: 'jmcomic.search.weekly' },
  ],
  hotPageContent: {
    levelboard: [
      {
        id: 'most-viewed',
        name: 'jmcomic.sort.views',
        content: async signal =>
          (
            await runtime.jm.comic.searchByKeyword(
              { keyword: '', order: SortType.TotalViewBest, page: 1 },
              signal,
            )
          ).list.map(fromCommonComic),
      },
      {
        id: 'latest',
        name: 'jmcomic.search.comic',
        content: async signal =>
          (await runtime.jm.promote.getLatest({ page: 1 }, signal)).map(fromCommonComic),
      },
    ],
  },
}

export const models: Content.Model[] = Object.entries(contentPages).map(([name, ContentPage]) => ({
  name,
  ItemCard: JmItemCard,
  CommentRow: JmCommentRow,
  get Layout() {
    return getLayout().layout.Default
  },
  ContentPage,
  ItemTranslator: translateItem,
}))

export const content = { models, search, promotes }