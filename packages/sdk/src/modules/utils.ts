import { type StreamQuery } from '@delta-comic/model'

import type { JMComic } from '..'
import type { List, PaginationQuery } from '../model/utils'

export class Utils {
  constructor(protected sdk: JMComic) {}
  public toStreamQuery<T extends PaginationQuery<{}>, TR>(
    fn: (data: T, signal?: AbortSignal) => Promise<List<TR>>
  ): StreamQuery {
    const pageLimit = forumList.total ? Math.ceil(Number(forumList.total) / 10) : 0
    const hasNextPage = page <= pageLimit
    // return (page:number)=>
  }
}