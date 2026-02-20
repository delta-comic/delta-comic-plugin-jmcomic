import { PromiseContent } from '@delta-comic/model'

import { jmStore } from '@/store'

import { _jmBook } from '../book'
import { jmStream } from './utils'

export namespace _jmApiBook {
  export const getSearchAuthor = PromiseContent.fromAsyncFunction(
    async (page: number, search_query?: string, signal?: AbortSignal) => {
      const res = await jmStore.api.value!.get<{ content: _jmBook.RawListBook[]; total: number }>(
        '/creator_author',
        { params: { page, search_query }, signal }
      )
      return { total: res.total, list: res.content }
    }
  )
  export const createSearchAuthorStream = (search_query?: string) =>
    jmStream((page, signal) => getSearchAuthor(page, search_query, signal))

  export const getSearchKeyword = PromiseContent.fromAsyncFunction(
    async (
      page: number,
      search_query?: string,
      lang?: string,
      source?: string,
      signal?: AbortSignal
    ) => {
      const res = await jmStore.api.value!.get<{ content: _jmBook.RawListBook[]; total: number }>(
        '/creator_author',
        { params: { page, search_query, lang, source }, signal }
      )
      return { total: res.total, list: res.content }
    }
  )
  export const createSearchKeywordStream = (
    search_query?: string,
    lang?: string,
    source?: string
  ) => jmStream((page, signal) => getSearchKeyword(page, search_query, lang, source, signal))

  export const getAuthorDetail = PromiseContent.fromAsyncFunction(
    async (id: string, lang?: string, source?: string, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<_jmBook.RawAuthorDetail>('/creator_author_work', {
          params: { id, lang, source },
          signal
        })
        .then(v => new _jmBook.AuthorDetail(v))
  )

  export const getBookDetail = PromiseContent.fromAsyncFunction(
    async (id: string, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<_jmBook.RawBookDetail>('/creator_work_info', { params: { id }, signal })
        .then(v => new _jmBook.BookDetail(v))
  )

  export const getBookFullDetail = PromiseContent.fromAsyncFunction(
    async (id: string, signal?: AbortSignal) =>
      jmStore.api
        .value!.get<_jmBook.RawBookPages>('/creator_work_info_detail', { params: { id }, signal })
        .then(v => new _jmBook.BookPages(v))
  )
}