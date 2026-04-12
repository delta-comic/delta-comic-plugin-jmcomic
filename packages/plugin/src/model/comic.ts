import { uni } from '@delta-comic/model'
import { StreamQuery } from '@delta-comic/model'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isEmpty } from 'es-toolkit/compat'
import type {
  BaseComic,
  ComicComment,
  CommonComic,
  FullComic,
  LessComic,
  RecommendComic
} from 'jmcomic-sdk'

import { sdk } from '../sdk'
import { pluginName } from '../symbol'

import { JmComicPage } from './page'
import { JmUser } from './user'
import { createAuthor } from './utils'

export class JmComic extends uni.item.Item {
  public override async like(signal?: AbortSignal): Promise<any> {
    return sdk.comic.like({ id: this.id }, signal)
  }
  public override async report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('不支持.')
  }
  public override async sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sdk.comic.sendComment({ comicId: this.id, content: text, isSpoiled: false }, signal)
  }
  constructor(v: uni.item.RawItem) {
    super(v)
  }
  private static createCategory(items: string[], group: string) {
    return items
      .filter(v => !isEmpty(v))
      .map(v => ({
        name: v,
        group,
        search: { keyword: v, sort: '', source: 'keyword' },
        $$plugin: pluginName
      }))
  }

  private static createComicItem<T extends Partial<uni.item.RawItem>>(
    comic: BaseComic | RecommendComic,
    overrides?: T
  ) {
    const base = {
      $$meta: { comic },
      $$plugin: pluginName,
      cover: {
        $$plugin: pluginName,
        forkNamespace: 'default',
        path: `/media/albums/${comic.id}_3x4.jpg`
      },
      title: comic.name,
      id: String(comic.id),
      customIsAI: false,
      contentType: JmComicPage.contentType,
      length: '',
      commentSendable: true
    } satisfies Partial<uni.item.RawItem>
    return Object.assign(base, overrides)
  }

  public static fromLessComic(comic: LessComic) {
    const currentSeries = comic.series.find(v => v.sort === comic.series_id)!
    return new this(
      this.createComicItem(comic, {
        author: [],
        categories: this.createCategory(comic.tags.split(' '), '标签'),
        isLiked: comic.liked,
        updateTime: Number(comic.addtime),
        epLength: comic.series.length.toString(),
        thisEp: { $$plugin: pluginName, name: currentSeries.name, id: String(comic.series_id) }
      })
    )
  }

  public static fromCommonComic(comic: CommonComic) {
    const categories = [
      ...this.createCategory([comic.category.title ?? ''], '分类'),
      ...this.createCategory([comic.category_sub.title ?? ''], '分类')
    ]
    return new this(
      this.createComicItem(comic, {
        categories,
        author: createAuthor(comic),
        isLiked: comic.liked,
        updateTime: Number(comic.update_at),
        thisEp: { $$plugin: pluginName, name: comic.name, id: String(comic.id) },
        epLength: ''
      })
    )
  }

  public static fromRecommendComic(comic: RecommendComic) {
    return new this(
      this.createComicItem(comic, {
        categories: [],
        author: createAuthor(comic),
        thisEp: { $$plugin: pluginName, name: comic.name, id: String(comic.id) },
        epLength: ''
      })
    )
  }

  public static fromFullComic(comic: FullComic) {
    const categories = [
      ...this.createCategory(comic.tags, '标签'),
      ...this.createCategory(comic.works, '作品'),
      ...this.createCategory(comic.actors, '角色')
    ]
    return new this(
      this.createComicItem(comic, {
        categories,
        length: comic.images.length.toString(),
        author: createAuthor(comic),
        epLength: comic.series.length.toString(),
        thisEp: { $$plugin: pluginName, name: comic.name, id: String(comic.series_id) },
        description: comic.description,
        commentNumber: Number(comic.comment_total),
        isLiked: comic.liked,
        likeNumber: Number(comic.likes),
        updateTime: Number(comic.addtime),
        viewNumber: Number(comic.total_views)
      })
    )
  }
}

export class JmComicComment extends uni.comment.Comment {
  override sender: JmUser
  private raw: ComicComment
  constructor(c: ComicComment) {
    const time = String(c.addtime)
    dayjs.extend(customParseFormat)
    const item = {
      $$plugin: pluginName,
      id: c.CID.toString(),
      reported: false,
      likeCount: Number(c.likes),
      isLiked: false,
      time: /^\d+$/.test(time) ? Number(time) : dayjs(time, 'MMM DD, YYYY').toDate().getTime(),
      isTop: false,
      content: { text: c.content, type: 'html' },
      sender: new JmUser({
        $$plugin: pluginName,
        id: c.UID.toString(),
        name: c.nickname || c.username,
        avatar:
          c.photo.includes('nopic') || isEmpty(c.photo)
            ? undefined
            : { $$plugin: pluginName, type: 'default', pathname: `/media/users/${c.UID}.jpg` }
      }),
      childrenCount: c.replys?.length ?? 0
    } satisfies Partial<uni.comment.RawComment>
    super(item)
    this.raw = c
    this.sender = item.sender
  }
  override async like(_signal?: AbortSignal): Promise<boolean> {
    window.$message.warning('不支持.')
    return false
  }
  override async report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('不支持.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    const c = this.raw
    if (Number(c.parent_CID) > 0)
      return sdk.comic.sendComment(
        { comicId: c.AID, content: text, isSpoiled: false, parentCommentId: c.parent_CID },
        signal
      )
    return sdk.comic.sendComment({ comicId: c.AID, content: text, isSpoiled: false }, signal)
  }
  override fetchChildren = new StreamQuery(
    async () => ({ data: this.raw.replys?.map(c => new JmComicComment(c)) ?? [] }),
    0
  )
}