import {
  AuthorDetail,
  BookDetail,
  BookPages,
  type RawAuthorDetail,
  type RawBookDetail,
  type RawBookPages,
  type RawListBook
} from '@/model/book'
import { jmStore } from '@/store'

import { toStreamQuery } from './utils'

export const getSearchAuthor = async (
  page: number,
  search_query?: string,
  signal?: AbortSignal
) => {
  const res = await jmStore.api.value!.get<{ content: RawListBook[]; total: number }>(
    '/creator_author',
    { params: { page, search_query }, signal }
  )
  return { total: res.total, list: res.content }
}

export const createSearchAuthorStream = (search_query?: string) =>
  toStreamQuery((page, signal) => getSearchAuthor(page, search_query, signal))

export const getSearchKeyword = async (
  page: number,
  search_query?: string,
  lang?: string,
  source?: string,
  signal?: AbortSignal
) => {
  const res = await jmStore.api.value!.get<{ content: RawListBook[]; total: number }>(
    '/creator_author',
    { params: { page, search_query, lang, source }, signal }
  )
  return { total: res.total, list: res.content }
}

export const createSearchKeywordStream = (search_query?: string, lang?: string, source?: string) =>
  toStreamQuery((page, signal) => getSearchKeyword(page, search_query, lang, source, signal))

export const getAuthorDetail = async (
  id: string,
  lang?: string,
  source?: string,
  signal?: AbortSignal
) =>
  jmStore.api
    .value!.get<RawAuthorDetail>('/creator_author_work', { params: { id, lang, source }, signal })
    .then(v => new AuthorDetail(v))

export const getBookDetail = async (id: string, signal?: AbortSignal) =>
  jmStore.api
    .value!.get<RawBookDetail>('/creator_work_info', { params: { id }, signal })
    .then(v => new BookDetail(v))

export const getBookFullDetail = async (id: string, signal?: AbortSignal) =>
  jmStore.api
    .value!.get<RawBookPages>('/creator_work_info_detail', { params: { id }, signal })
    .then(v => new BookPages(v))