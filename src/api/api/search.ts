import { PromiseContent } from '@delta-comic/model'
import type { Search } from '@delta-comic/plugin'
import { random } from 'es-toolkit/compat'

import { jmStore } from '@/store'

import { type jm as JmType } from '..'
import { _jmSearch } from '../search'
import { createCommonToUniItem, jmStream } from './utils'
export namespace _jmApiSearch.utils {
  export const byKeyword = PromiseContent.fromAsyncFunction(
    (searchQuery: string, order: JmType.SortType = '', page = 1, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<JmType.search.ByKeyword>('/search', {
          signal,
          params: { search_query: searchQuery, page, o: order }
        })
        .then<{ list: JmType.comic.JmItem[]; total: number }>(v => ({
          list: v.content.map(createCommonToUniItem),
          total: Number(v.total)
        }))
  )
  export const createKeywordStream = (searchQuery: string, order: JmType.SortType = '') =>
    jmStream((page, signal) => byKeyword(searchQuery, order, page, signal))

  export const byCategory = PromiseContent.fromAsyncFunction(
    (c: string, order: JmType.SortType = '', page = 1, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<JmType.search.ByCategory>('/categories/filter', {
          signal,
          params: { c: c, page, o: order }
        })
        .then<{ list: JmType.comic.JmItem[]; total: number }>(v => ({
          list: v.content.map(createCommonToUniItem),
          total: Number(v.total)
        }))
  )
  export const createCategoryStream = (c: string, order: JmType.SortType = '') =>
    jmStream((page, signal) => byCategory(c, order, page, signal))
}

export namespace _jmApiSearch {
  export const getPromote = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    jmStore.api
      .value!.get<JmType.search.RawPromote[]>(`/promote`, { signal, params: { page: 1 } })
      .then<_jmSearch.Promote[]>(v => v.map(v => new _jmSearch.Promote(v)))
  )
  export const getPromoteItem = PromiseContent.fromAsyncFunction(
    (id: number, page = 1, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<JmType.search.PromoteItem>(`/promote_list`, { signal, params: { page, id } })
        .then<{ list: JmType.comic.JmItem[]; total: number }>(v => ({
          list: v.list.map(createCommonToUniItem),
          total: Number(v.total)
        }))
  )
  export const createPromoteStream = (id: number) =>
    jmStream((page, signal) => getPromoteItem(id, page, signal))

  export const getWeekBestList = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    jmStore.api.value!.get<JmType.search.WeekBestList>('/week', { signal })
  )
  export const getWeekBestComic = PromiseContent.fromAsyncFunction(
    (id: number, type: string, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<JmType.search.WeekBestItem>(`/week/filter`, { signal, params: { type, id } })
        .then<{ list: JmType.comic.JmItem[]; total: number }>(v => ({
          list: v.list.map(createCommonToUniItem),
          total: Number(v.total)
        }))
  )

  export const getRandomComics = PromiseContent.fromAsyncFunction(
    async (signal?: AbortSignal) =>
      await _jmApiSearch.utils.byCategory('', undefined, random(1, 100), signal)
  )
  export const createRandomComicStream = () => jmStream((_page, signal) => getRandomComics(signal))

  export const getLevelboard = () =>
    [
      {
        name: '日排行',
        content: () => _jmApiSearch.utils.byCategory('', 'mv_t').setProcessor(v => v.list)
      },
      {
        name: '周排行',
        content: () => _jmApiSearch.utils.byCategory('', 'mv_w').setProcessor(v => v.list)
      },
      {
        name: '月排行',
        content: () => _jmApiSearch.utils.byCategory('', 'mv_m').setProcessor(v => v.list)
      }
    ] satisfies Search.HotLevelboard[]

  export const getCategories = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    jmStore.api.value!.get<JmType.search.CategoriesResult>('/categories', { signal })
  )
}