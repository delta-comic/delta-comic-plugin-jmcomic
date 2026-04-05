import type { JMComic } from '..'
import { jsonToFormData } from '../helpers'
import type { FullComic, LessComic } from '../model/comic'

export class Comic {
  constructor(protected sdk: JMComic) {}

  public async getComic(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<FullComic>(this.sdk.config.apiPath.comic_getInfo, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }

  /**
   * @returns 形如`["/media/photos/350234/00001.webp"]`的数组，本质`/media/photos/${data.id}/${img}`
   */
  public getComicPages = async (data: { id: string }, signal?: AbortSignal) => {
    const ky = this.sdk.requester.create()
    const comic = await ky
      .get<LessComic>(this.sdk.config.apiPath.comic_getPages, {
        searchParams: { id: data.id },
        signal
      })
      .json()
    return comic.images.map(img => `/media/photos/${data.id}/${img}`)
  }

  public async likeComic(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky.post('/like', { signal, body: jsonToFormData({ id: data.id }) }).json()
  }

  public async favoriteComic(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ status: string; msg: string; type: 'add' | 'remove' }>('/favorite', {
        body: jsonToFormData({ aid: data.id }),
        signal
      })
      .json()
  }

  public getComment = async (Id: string, page: number = 1, signal?: AbortSignal) => {
    const all = await jmStore.api.value!.get<{ list: RawComment[]; total: string }>('/forum', {
      params: { mode: 'manhua', page, aid: Id },
      signal
    })
    return { list: all.list.map(v => new Comment(v)), total: Number(all.total) }
  }

  public createCommentsStream = (blogId: string) =>
    toStreamQuery((page, signal) => getComment(blogId, page, signal))

  public sendComment = (id: string, content: string, isSpoiler: boolean, signal?: AbortSignal) =>
    jmStore.api.value!.postForm(
      '/comment',
      { aid: id, content, comment: content, isSpoiler },
      { signal }
    )

  public sendChildComment = (
    id: string,
    parentCId: string,
    content: string,
    isSpoiler: boolean,
    signal?: AbortSignal
  ) =>
    jmStore.api.value!.postForm(
      '/comment',
      { aid: id, content, comment: content, isSpoiler, comment_id: parentCId },
      { signal }
    )
}