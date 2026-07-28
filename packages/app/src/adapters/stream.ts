import { StreamQuery, type PageKey } from '@delta-comic/model'
import type { PageResult } from 'jmcomic-sdk'

const getNextPage = (page: number, result: PageResult<unknown>) => {
  if (result.list.length === 0 || page * result.list.length >= result.total) return undefined
  return page + 1
}

export const createPagedStream = <TResult, TData extends object = object>(
  fetchPage: (data: TData, page: number, signal?: AbortSignal) => Promise<PageResult<TResult>>,
) =>
  new StreamQuery<TResult, TData>(async (data, page, signal) => {
    const currentPage = Number(page)
    const result = await fetchPage(data, currentPage, signal)
    return { data: result.list, nextPage: getNextPage(currentPage, result) }
  }, 1)

export const createArrayStream = <TResult, TData extends object = object>(
  fetchItems: (data: TData, signal?: AbortSignal) => Promise<TResult[]> | TResult[],
) =>
  new StreamQuery<TResult, TData>(
    async (data, page: PageKey, signal) => ({
      data: Number(page) === 1 ? await fetchItems(data, signal) : [],
    }),
    1,
  )

export const emptyStream = <TResult>() => createArrayStream<TResult>(() => [])