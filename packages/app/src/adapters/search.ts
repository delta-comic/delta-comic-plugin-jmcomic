import type { StreamQuery, UniItem, UniItemAuthor } from '@delta-comic/model'
import type { Search, Subscribe } from '@delta-comic/plugin'
import {
  SortType,
  type CommonBook,
  type CommonComic,
  type CommonNovel,
  type LessNovel,
  type PromoteItem,
} from 'jmcomic-sdk'

import { createPagedStream } from '@/adapters/stream'
import { contentKeys, pluginName, searchKeys } from '@/constants'
import {
  fromBlog,
  fromBookAuthor,
  fromCommonBook,
  fromCommonComic,
  fromCommonNovel,
  fromLessNovel,
} from '@/models/items'
import { runtime } from '@/runtime/PluginRuntime'

const sorts = [
  { text: 'jmcomic.sort.relate', value: SortType.Relate },
  { text: 'jmcomic.sort.likes', value: SortType.Like },
  { text: 'jmcomic.sort.views', value: SortType.TotalViewBest },
] as const

export const comicSearch = createPagedStream<UniItem, { input: string; sort: string }>(
  async ({ input, sort }, page, signal) => {
    const result = input.startsWith('category:')
      ? await runtime.jm.comic.searchByCategory(
          { category: input.slice('category:'.length), order: sort as SortType, page },
          signal,
        )
      : await runtime.jm.comic.searchByKeyword(
          { keyword: input, order: sort as SortType, page },
          signal,
        )
    return { total: result.total, list: result.list.map(fromCommonComic) }
  },
)

export const blogSearch = createPagedStream<UniItem, { input: string; sort: string }>(
  async ({ input, sort }, page, signal) => {
    const result = await runtime.jm.blog.search(
      { keyword: input, order: sort as SortType, page, type: 'all' },
      signal,
    )
    return { total: result.total, list: result.list.map(fromBlog) }
  },
)

export const novelSearch = createPagedStream<UniItem, { input: string; sort: string }>(
  async ({ input }, page, signal) => {
    const result = await runtime.jm.novel.search({ keyword: input, page }, signal)
    return { total: result.total, list: result.list.map(fromCommonNovel) }
  },
)

export const creatorSearch = createPagedStream<UniItem, { input: string; sort: string }>(
  async ({ input }, page, signal) => {
    const result = await runtime.jm.book.search({ keyword: input, page }, signal)
    return { total: result.total, list: result.list.map(fromBookAuthor) }
  },
)

const autocomplete = async (input: string, signal: AbortSignal) =>
  (await runtime.jm.promote.getHotTags(signal))
    .filter(tag => tag.toLocaleLowerCase().includes(input.toLocaleLowerCase()))
    .slice(0, 12)
    .map(tag => ({ text: tag, value: tag }))

export const searchMethods = {
  [searchKeys.keyword]: {
    name: 'jmcomic.search.comic',
    sorts: [...sorts],
    defaultSort: SortType.Relate,
    fetchSearchResult: comicSearch,
    getAutoComplete: autocomplete,
  },
  [searchKeys.blog]: {
    name: 'jmcomic.search.blog',
    sorts: [...sorts],
    defaultSort: SortType.Relate,
    fetchSearchResult: blogSearch,
    getAutoComplete: autocomplete,
  },
  [searchKeys.novel]: {
    name: 'jmcomic.search.novel',
    sorts: [{ text: 'jmcomic.sort.relate', value: SortType.Relate }],
    defaultSort: SortType.Relate,
    fetchSearchResult: novelSearch,
    getAutoComplete: autocomplete,
  },
  [searchKeys.creator]: {
    name: 'jmcomic.search.creator',
    sorts: [{ text: 'jmcomic.sort.relate', value: SortType.Relate }],
    defaultSort: SortType.Relate,
    fetchSearchResult: creatorSearch,
    getAutoComplete: autocomplete,
  },
} satisfies NonNullable<Search.Config['methods']>

export const mapPromoteContent = (promote: PromoteItem): UniItem[] =>
  promote.content.map(entry => {
    if ('category' in entry) return fromCommonComic(entry as CommonComic)
    if (promote.type.toLocaleLowerCase().includes('novel')) return fromLessNovel(entry as LessNovel)
    return fromCommonBook(entry as CommonBook)
  })

export const mapWeekContent = (entries: (CommonComic | CommonBook | CommonNovel)[], type: string) =>
  entries.map(entry => {
    if ('category' in entry) return fromCommonComic(entry)
    if (type.toLocaleLowerCase().includes('novel')) return fromCommonNovel(entry as CommonNovel)
    return fromCommonBook(entry as CommonBook)
  })

const authorStream = (
  source: StreamQuery<UniItem, { input: string; sort: string }>,
): Subscribe.Config['fetchAuthorContent'] =>
  createPagedStream(async ({ author }: { author: UniItemAuthor }, page, signal) => {
    const result = await source.query({ input: author.label, sort: SortType.Relate }, page, signal)
    return {
      list: result.data,
      total: result.nextPage ? Number.MAX_SAFE_INTEGER : result.data.length,
    }
  })

export const createSubscribe = (
  source: StreamQuery<UniItem, { input: string; sort: string }>,
): Subscribe.Config => {
  const fetchAuthorContent = authorStream(source)
  return {
    fetchAuthorContent,
    async getUpdateList(olds, signal) {
      const whichUpdated: UniItemAuthor[] = []
      for (const old of olds) {
        const latest = await fetchAuthorContent.query(
          { author: old.author },
          fetchAuthorContent.initPage,
          signal,
        )
        const known = new Set(old.list.map(item => item.id))
        if (latest.data.some(item => !known.has(item.id))) whichUpdated.push(old.author)
      }
      return { isUpdated: whichUpdated.length > 0, whichUpdated }
    },
  }
}

export const barcode: Search.Barcode = {
  name: 'jmcomic.search.barcode',
  match: text => /^(?:JM)?\s*\d+$/i.test(text.trim()),
  async getContent(text) {
    return [[pluginName, contentKeys.comic], text.replace(/\D/g, ''), '']
  },
}