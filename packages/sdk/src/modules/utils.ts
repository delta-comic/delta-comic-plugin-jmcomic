import { StreamQuery } from '@delta-comic/model'

import type { JMComic } from '..'
import type { List, PaginationQuery } from '../model/utils'

export class Utils {
  constructor(protected sdk: JMComic) {}
  public toStreamQuery<T extends object, TR>(
    fn: (data: PaginationQuery<T>, signal?: AbortSignal) => Promise<List<TR>>
  ) {
    return new StreamQuery<TR, T>(async (data, page, signal) => {
      page = Number(page)
      const result = await fn({ ...data, page }, signal)
      const pageLimit = result.total ? Math.ceil(result.total / 10) : 0
      const hasNextPage = page <= pageLimit
      const hasPrevPage = page > 1
      return {
        data: result.list,
        lastPage: hasPrevPage ? page - 1 : undefined,
        nextPage: hasNextPage ? page + 1 : undefined
      }
    }, 1)
  }
  public curryQuery<T extends object, TR>(
    fn: (data: PaginationQuery<T>, signal?: AbortSignal) => Promise<List<TR>>,
    data: T
  ) {
    return async (page: number, signal?: AbortSignal) => fn({ ...data, page }, signal)
  }
}