import type { Search } from '@delta-comic/plugin'
import { useQuery } from '@pinia/colada'
import { random } from 'es-toolkit/compat'

import type { JmItem } from '@/model/comic'
import {
  Promote,
  type ByCategory,
  type ByKeyword,
  type CategoriesResult,
  type PromoteItem,
  type RawPromote,
  type SortType,
  type WeekBestItem,
  type WeekBestList
} from '@/model/search'
import { jmStore } from '@/store'

import { createCommonToUniItem, QueryKeys, toStreamQuery } from './utils'

export const byKeyword = (
  searchQuery: string,
  order: SortType = '',
  page = 1,
  signal?: AbortSignal
) =>
  jmStore.api
    .value!.get<ByKeyword>('/search', {
      signal,
      params: { search_query: searchQuery, page, o: order }
    })
    .then<{ list: JmItem[]; total: number }>(v => ({
      list: v.content.map(createCommonToUniItem),
      total: Number(v.total)
    }))

export const createKeywordStream = (searchQuery: string, order: SortType = '') =>
  toStreamQuery((page, signal) => byKeyword(searchQuery, order, page, signal))

export const byCategory = (c: string, order: SortType = '', page = 1, signal?: AbortSignal) =>
  jmStore.api
    .value!.get<ByCategory>('/categories/filter', { signal, params: { c: c, page, o: order } })
    .then<{ list: JmItem[]; total: number }>(v => ({
      list: v.content.map(createCommonToUniItem),
      total: Number(v.total)
    }))

export const createCategoryStream = (c: string, order: SortType = '') =>
  toStreamQuery((page, signal) => byCategory(c, order, page, signal))

export const getPromote = (signal?: AbortSignal) =>
  jmStore.api
    .value!.get<RawPromote[]>(`/promote`, { signal, params: { page: 1 } })
    .then(v => v.map(v => new Promote(v)))

export const getPromoteItem = (id: number, page = 1, signal?: AbortSignal) =>
  jmStore.api
    .value!.get<PromoteItem>(`/promote_list`, { signal, params: { page, id } })
    .then<{ list: JmItem[]; total: number }>(v => ({
      list: v.list.map(createCommonToUniItem),
      total: Number(v.total)
    }))

export const createPromoteStream = (id: number) =>
  toStreamQuery((page, signal) => getPromoteItem(id, page, signal))

export const getWeekBestList = (signal?: AbortSignal) =>
  jmStore.api.value!.get<WeekBestList>('/week', { signal })

export const getWeekBestComic = (id: number, type: string, signal?: AbortSignal) =>
  jmStore.api
    .value!.get<WeekBestItem>(`/week/filter`, { signal, params: { type, id } })
    .then<{ list: JmItem[]; total: number }>(v => ({
      list: v.list.map(createCommonToUniItem),
      total: Number(v.total)
    }))

export const getRandomComics = async (signal?: AbortSignal) =>
  await byCategory('', undefined, random(1, 100), signal)

export const createRandomComicStream = () =>
  toStreamQuery((_page, signal) => getRandomComics(signal))

export const getLevelboard = () =>
  [
    {
      name: '日排行',
      content: () =>
        useQuery({
          key: () => [QueryKeys.Levelboard],
          async query({ signal }) {
            const { list } = await byCategory('', 'mv_t', undefined, signal)
            return list
          }
        })
    },
    {
      name: '周排行',
      content: () =>
        useQuery({
          key: () => [QueryKeys.Levelboard],
          async query({ signal }) {
            const { list } = await byCategory('', 'mv_w', undefined, signal)
            return list
          }
        })
    },
    {
      name: '月排行',
      content: () =>
        useQuery({
          key: () => [QueryKeys.Levelboard],
          async query({ signal }) {
            const { list } = await byCategory('', 'mv_m', undefined, signal)
            return list
          }
        })
    }
  ] satisfies Search.HotLevelboard[]

export const getCategories = (signal?: AbortSignal) =>
  jmStore.api.value!.get<CategoriesResult>('/categories', { signal })