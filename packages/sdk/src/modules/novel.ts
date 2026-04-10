import type { CommonNovel, JMComic, List, PaginationQuery } from '..'

export class Novel {
  constructor(protected sdk: JMComic) {}
  public getNovelList(
    data: PaginationQuery<{}>,
    signal?: AbortSignal
  ): Promise<List<CommonNovel>> {}
}