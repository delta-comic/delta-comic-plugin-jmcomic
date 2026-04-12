import { StreamQuery, uni } from '@delta-comic/model'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isEmpty } from 'es-toolkit/compat'
import {
  SortType,
  type CommonNovel,
  type FullNovel,
  type LessNovel,
  type NovelComment,
  type Numeric
} from 'jmcomic-sdk'

import { sdk } from '../sdk'
import { pluginName } from '../symbol'

import { JmNovelPage } from './page'
import { JmUser } from './user'

export class JmNovel extends uni.item.Item {
  override like(signal?: AbortSignal): Promise<any> {
    return sdk.novel.like({ id: this.id }, signal)
  }
  override report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('不存在实现.')
    throw new Error('Method not implemented.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sdk.novel.sendComment({ novelId: this.id, content: text, isSpoiled: false }, signal)
  }
  public sendChapterComment(chapterId: Numeric, text: string, signal?: AbortSignal): Promise<any> {
    return sdk.novel.sendComment(
      { novelId: this.id, chapterId, content: text, isSpoiled: false },
      signal
    )
  }
  constructor(v: uni.item.RawItem) {
    super(v)
    this.$$meta = <any>v.$$meta
  }

  private static createNovelItem<T extends Partial<uni.item.RawItem>>(
    novel: LessNovel | CommonNovel | FullNovel,
    override: T
  ) {
    const base = {
      $$meta: { novel },
      $$plugin: pluginName,
      cover: {
        $$plugin: pluginName,
        forkNamespace: 'default',
        path: `/media/novels/${novel.id}.jpg`
      },
      categories: [],
      title: novel.name,
      id: String(novel.id),
      customIsAI: false,
      contentType: JmNovelPage.contentType,
      commentSendable: true,
      thisEp: { $$plugin: pluginName, id: String(novel.id), name: novel.name },
      length: '0',
      epLength: '0',
      author: [
        {
          label: novel.author,
          description: '作者',
          icon: 'coser',
          actions: ['search'],
          subscribe: 'keyword',
          $$plugin: pluginName
        }
      ]
    } satisfies Partial<uni.item.RawItem>
    return Object.assign(base, override)
  }
  public static fromLessNovel(novel: LessNovel) {
    return new this(this.createNovelItem(novel, { updateTime: Number(novel.update_at) }))
  }
  public static fromCommonNovel(novel: CommonNovel) {
    return new this(
      this.createNovelItem(novel, {
        updateTime: Number(novel.update_at),
        epLength: String(Number(novel.last_chapter_index) + 1),
        likeNumber: Number(novel.likes),
        isLiked: novel.liked
      })
    )
  }
  public static fromFullNovel(novel: FullNovel) {
    return new this(
      this.createNovelItem(novel, {
        epLength: String(novel.series.length),
        isLiked: novel.liked,
        thisEp: { $$plugin: pluginName, id: String(novel.series_id), name: novel.name },
        description: novel.description,
        updateTime: Number(novel.addtime),
        categories: novel.tags.map(v => ({
          $$plugin: pluginName,
          group: '分类',
          name: v,
          search: { keyword: v, sort: SortType.Relate, source: 'keyword' }
        })),
        commentNumber: Number(novel.comment_total),
        likeNumber: Number(novel.likes),
        viewNumber: Number(novel.total_views)
      })
    )
  }
}

export class JmNovelComment extends uni.comment.Comment {
  override sender: JmUser
  private raw: NovelComment
  constructor(c: NovelComment) {
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
      content: { text: c.comment, type: 'string' },
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
  override async report(_signal?: AbortSignal): Promise<void> {
    window.$message.warning('不支持.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    const c = this.raw
    if (Number(c.parent_CID) > 0)
      return sdk.novel.sendComment(
        {
          novelId: c.NID,
          chapterId: c.NCID,
          content: text,
          parentCommentId: c.parent_CID,
          isSpoiled: false
        },
        signal
      )
    return sdk.novel.sendComment(
      { novelId: c.NID, chapterId: c.NCID, content: text, isSpoiled: false },
      signal
    )
  }
  override fetchChildren = new StreamQuery(
    async () => ({ data: this.raw.replys?.map(c => new JmNovelComment(c)) ?? [] }),
    0
  )
}