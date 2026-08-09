import {
  UniContentPage,
  UniEp,
  UniImage,
  type StreamQuery,
  type UniComment,
  type UniContentViewComponent,
  type UniItem,
} from '@delta-comic/model'
import type { BlogDetail, BookAuthor, BookContents, FullNovel } from 'jmcomic-sdk'

import { getLayout } from '@/adapters/layout'
import { createArrayStream, createPagedStream, emptyStream } from '@/adapters/stream'
import CreatorReader from '@/components/content/CreatorReader.vue'
import RichTextReader from '@/components/content/RichTextReader.vue'
import { contentKeys, pluginName } from '@/constants'
import { fromBlogComment, fromComicComment, fromNovelComment } from '@/models/comments'
import {
  fromBlog,
  fromBookAuthor,
  fromFullComic,
  fromFullNovel,
  fromRelatedBook,
  fromRecommendComic,
  image,
} from '@/models/items'
import { runtime } from '@/runtime/PluginRuntime'

abstract class JmContentPage extends UniContentPage {
  public override readonly plugin = pluginName

  protected createEp(id: string | number, name: string) {
    return new UniEp({ $$plugin: pluginName, id: String(id), name })
  }
}

export class ComicPage extends JmContentPage {
  public override readonly contentType: [string, string] = [pluginName, contentKeys.comic]
  public override get ViewComponent(): UniContentViewComponent {
    return getLayout().view.Image
  }

  public override async fetchShortId() {
    return `JM${this.id}`
  }

  public override async fetchDetail(signal?: AbortSignal) {
    return fromFullComic(await runtime.jm.comic.getInfo({ id: this.id }, signal))
  }

  public override fetchRecommends = createArrayStream(async (_data, signal) => {
    const detail = await runtime.jm.comic.getInfo({ id: this.id }, signal)
    return detail.related_list.map(fromRecommendComic)
  })

  public override fetchComments = createPagedStream(async (_data, page, signal) => {
    const result = await runtime.jm.comic.getComments({ id: this.id, page }, signal)
    return { total: result.total, list: result.list.map(fromComicComment) }
  })

  public override fetchEps = createArrayStream(async (_data, signal) => {
    const detail = await runtime.jm.comic.getInfo({ id: this.id }, signal)
    return detail.series.map(series => this.createEp(series.id, series.name))
  })

  public async fetchImages(signal?: AbortSignal): Promise<UniImage[]> {
    const detail = await runtime.jm.comic.getInfo({ id: this.id }, signal)
    const chapterId = this.ep || String(detail.series_id)
    const paths = await runtime.jm.comic.getPages({ id: chapterId }, signal)
    return paths.map((path, index) =>
      UniImage.create({
        ...image(path, { comicId: this.id, page: index + 1 }),
        processSteps: ['comicDecode'],
      }),
    )
  }
}

export class BlogPage extends JmContentPage {
  public override readonly contentType: [string, string] = [pluginName, contentKeys.blog]
  public override readonly ViewComponent: UniContentViewComponent = RichTextReader

  public override async fetchShortId() {
    return `BLOG-${this.id}`
  }

  public override async fetchDetail(signal?: AbortSignal) {
    return fromBlog((await this.loadDetail(signal)).info)
  }

  public override fetchRecommends = createArrayStream(async (_data, signal) => {
    const detail = await this.loadDetail(signal)
    return [
      ...(detail.related_blogs ?? []).map(fromBlog),
      ...(detail.related_comics ?? []).map(fromRecommendComic),
    ]
  })

  public override fetchComments = createPagedStream(async (_data, page, signal) => {
    const result = await runtime.jm.blog.getComments({ id: this.id, page }, signal)
    return { total: result.total, list: result.list.map(fromBlogComment) }
  })

  public override fetchEps = createArrayStream(() => [
    this.createEp(this.id, this.preload?.title ?? this.id),
  ])

  public async loadDetail(signal?: AbortSignal): Promise<BlogDetail> {
    return runtime.jm.blog.getInfo({ id: this.id }, signal)
  }

  public async loadRichText(signal?: AbortSignal): Promise<string> {
    return (await this.loadDetail(signal)).info.content
  }
}

export class NovelPage extends JmContentPage {
  public override readonly contentType: [string, string] = [pluginName, contentKeys.novel]
  public override readonly ViewComponent: UniContentViewComponent = RichTextReader

  public override async fetchShortId() {
    return `NOVEL-${this.id}`
  }

  public override async fetchDetail(signal?: AbortSignal) {
    return fromFullNovel(await this.loadDetail(signal))
  }

  public override fetchRecommends = createArrayStream(async (_data, signal) => {
    const detail = await this.loadDetail(signal)
    return detail.related_list.map(related =>
      fromFullNovel({
        ...detail,
        id: related.id,
        name: related.name,
        images: related.image,
        author: related.author,
        addtime: related.chapter_update_at,
        likes: related.likes,
        series: [],
        related_list: [],
        comment_total: [],
      }),
    )
  })

  public override fetchComments = createArrayStream(async (_data, signal) =>
    (await this.loadDetail(signal)).comment_total.map(fromNovelComment),
  )

  public override fetchEps = createArrayStream(async (_data, signal) =>
    (await this.loadDetail(signal)).series.map(series => this.createEp(series.NCID, series.title)),
  )

  public async loadDetail(signal?: AbortSignal): Promise<FullNovel> {
    return runtime.jm.novel.getInfo({ id: this.id }, signal)
  }

  public async loadRichText(signal?: AbortSignal): Promise<string> {
    const detail = await this.loadDetail(signal)
    const chapterId = this.ep || String(detail.series_id)
    return (await runtime.jm.novel.getContent({ chapterId, lang: 'cn' }, signal)).content
  }
}

export class BookAuthorPage extends JmContentPage {
  public override readonly contentType: [string, string] = [pluginName, contentKeys.bookAuthor]
  public override readonly ViewComponent: UniContentViewComponent = CreatorReader

  public override async fetchShortId() {
    return `CREATOR-${this.id}`
  }

  public override async fetchDetail(signal?: AbortSignal) {
    return fromBookAuthor(await this.loadAuthor(signal))
  }

  public override fetchRecommends = createArrayStream(async (_data, signal) =>
    (await this.loadAuthor(signal)).related_works.map(fromRelatedBook),
  )

  public override fetchComments = emptyStream<UniComment>()

  public override fetchEps = createArrayStream(async (_data, signal) =>
    (await this.loadAuthor(signal)).related_works.map(work =>
      this.createEp(work.id, work.work_title),
    ),
  )

  public async loadAuthor(signal?: AbortSignal): Promise<BookAuthor> {
    return runtime.jm.book.getAuthorDetail({ id: this.id }, signal)
  }
}

export class BookPage extends JmContentPage {
  public override readonly contentType: [string, string] = [pluginName, contentKeys.book]
  public override get ViewComponent(): UniContentViewComponent {
    return getLayout().view.Image
  }

  public override async fetchShortId() {
    return `BOOK-${this.id}`
  }

  public override async fetchDetail(signal?: AbortSignal): Promise<UniItem> {
    const [detail, pages] = await Promise.all([
      runtime.jm.book.getBookDetail({ id: this.id }, signal),
      this.loadPages(signal),
    ])
    return fromRelatedBook({
      id: this.id,
      platform_name: '',
      work_date: detail.work_date,
      work_image: pages.images[0]?.image ?? `/media/library/album/${this.id}/thumb/album.jpg`,
      work_title: detail.work_title || pages.name,
    })
  }

  public override fetchRecommends = createArrayStream(async (_data, signal) =>
    (await runtime.jm.book.getBookDetail({ id: this.id }, signal)).related_works.map(
      fromRelatedBook,
    ),
  )

  public override fetchComments = emptyStream<UniComment>()

  public override fetchEps = createArrayStream(async (_data, signal) => {
    const pages = await this.loadPages(signal)
    return [this.createEp(pages.id, pages.name)]
  })

  public async loadPages(signal?: AbortSignal): Promise<BookContents> {
    return runtime.jm.book.getBookPages({ id: this.ep || this.id }, signal)
  }

  public async fetchImages(signal?: AbortSignal): Promise<UniImage[]> {
    return (await this.loadPages(signal)).images.map(entry => UniImage.create(image(entry.image)))
  }
}

export type JmPage = ComicPage | BlogPage | NovelPage | BookAuthorPage | BookPage

export const contentPages = {
  [contentKeys.comic]: ComicPage,
  [contentKeys.blog]: BlogPage,
  [contentKeys.novel]: NovelPage,
  [contentKeys.bookAuthor]: BookAuthorPage,
  [contentKeys.book]: BookPage,
} satisfies Record<
  string,
  new (preload: UniItem | undefined, id: string, ep: string) => UniContentPage
>

export type JmStream = StreamQuery<UniItem>