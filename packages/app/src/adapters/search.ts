import { StreamQuery, type UniItem, type UniItemAuthor } from '@delta-comic/model'
import type { Content, Subscribe } from '@delta-comic/plugin'
import {
  SortType,
  type CommonBook,
  type CommonComic,
  type CommonNovel,
  type LessNovel,
  type PromoteItem,
} from 'jmcomic-sdk'

import { createPagedStream } from '@/adapters/stream'
import { searchKeys, subscribeKeys } from '@/constants'
import { translate } from '@/i18n'
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
  { label: 'jmcomic.sort.relate', id: SortType.Relate },
  { label: 'jmcomic.sort.likes', id: SortType.Like },
  { label: 'jmcomic.sort.views', id: SortType.TotalViewBest },
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

const autocomplete = async (method: string, input: string, signal: AbortSignal) =>
  (await runtime.jm.promote.getHotTags(signal))
    .filter(tag => tag.toLocaleLowerCase().includes(input.toLocaleLowerCase()))
    .slice(0, 12)
    .map(tag => ({ input: tag, search: { method } }))

const adaptSearchStream = (
  source: StreamQuery<UniItem, { input: string; sort: string }>,
  defaultSort: string,
) =>
  new StreamQuery<UniItem, { aim: Content.SearchAim }>(
    ({ aim }, page, signal) =>
      source.query({ input: aim.input, sort: aim.search.sort ?? defaultSort }, page, signal),
    source.initPage,
  )

export const searchMethods = {
  [searchKeys.keyword]: {
    id: searchKeys.keyword,
    name: 'jmcomic.search.comic',
    sorts: { options: [...sorts], default: SortType.Relate },
    fetchSearchResult: adaptSearchStream(comicSearch, SortType.Relate),
    getAutoComplete: (input, signal) => autocomplete(searchKeys.keyword, input, signal),
  },
  [searchKeys.blog]: {
    id: searchKeys.blog,
    name: 'jmcomic.search.blog',
    sorts: { options: [...sorts], default: SortType.Relate },
    fetchSearchResult: adaptSearchStream(blogSearch, SortType.Relate),
    getAutoComplete: (input, signal) => autocomplete(searchKeys.blog, input, signal),
  },
  [searchKeys.novel]: {
    id: searchKeys.novel,
    name: 'jmcomic.search.novel',
    sorts: {
      options: [{ label: 'jmcomic.sort.relate', id: SortType.Relate }],
      default: SortType.Relate,
    },
    fetchSearchResult: adaptSearchStream(novelSearch, SortType.Relate),
    getAutoComplete: (input, signal) => autocomplete(searchKeys.novel, input, signal),
  },
  [searchKeys.creator]: {
    id: searchKeys.creator,
    name: 'jmcomic.search.creator',
    sorts: {
      options: [{ label: 'jmcomic.sort.relate', id: SortType.Relate }],
      default: SortType.Relate,
    },
    fetchSearchResult: adaptSearchStream(creatorSearch, SortType.Relate),
    getAutoComplete: (input, signal) => autocomplete(searchKeys.creator, input, signal),
  },
} satisfies Record<string, Content.SearchMethod>

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
): Subscribe['fetchAuthorContent'] =>
  createPagedStream(async ({ author }: { author: UniItemAuthor }, page, signal) => {
    const result = await source.query({ input: author.label, sort: SortType.Relate }, page, signal)
    return {
      list: result.data,
      total: result.nextPage ? Number.MAX_SAFE_INTEGER : result.data.length,
    }
  })

export const createSubscribe = (
  source: StreamQuery<UniItem, { input: string; sort: string }>,
): Subscribe => {
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

const subscribeSources = {
  [subscribeKeys.comicAuthor]: createSubscribe(comicSearch),
  [subscribeKeys.creator]: createSubscribe(creatorSearch),
  [subscribeKeys.novelAuthor]: createSubscribe(novelSearch),
} as const

const getSubscribe = (author: UniItemAuthor) => {
  switch (author.subscribe) {
    case subscribeKeys.creator:
      return subscribeSources[subscribeKeys.creator]
    case subscribeKeys.novelAuthor:
      return subscribeSources[subscribeKeys.novelAuthor]
    default:
      return subscribeSources[subscribeKeys.comicAuthor]
  }
}

export const jmcomicSubscribe: Subscribe = {
  fetchAuthorContent: new StreamQuery(
    ({ author }, page, signal) =>
      getSubscribe(author).fetchAuthorContent.query({ author }, page, signal),
    1,
  ),
  async getUpdateList(olds, signal) {
    const whichUpdated: UniItemAuthor[] = []
    for (const old of olds) {
      const result = await getSubscribe(old.author).getUpdateList([old], signal)
      whichUpdated.push(...result.whichUpdated)
    }
    return { isUpdated: whichUpdated.length > 0, whichUpdated }
  },
}

export const barcode: Content.Barcode = {
  id: 'jmcomic-id',
  name: 'jmcomic.search.barcode',
  isMatch: aim => /^(?:JM)?\s*\d+$/i.test(aim.input.trim()),
  getTipText: aim => `${translate('jmcomic.search.barcode')}: ${aim.input}`,
}