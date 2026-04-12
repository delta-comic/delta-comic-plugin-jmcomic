import { StreamQuery, uni } from '@delta-comic/model'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isEmpty } from 'es-toolkit/compat'
import type { BlogComment, CommonBlog, FullBlog } from 'jmcomic-sdk'

import { sdk } from '../sdk'
import { pluginName } from '../symbol'

import { JmBlogPage } from './page'
import { JmUser } from './user'

export class JmBlog extends uni.item.Item {
  override like(signal?: AbortSignal): Promise<any> {
    return sdk.blog.like({ id: this.id }, signal)
  }
  override report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('不存在实现.')
    throw new Error('Method not implemented.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sdk.blog.sendComment({ id: this.id, content: text }, signal)
  }
  constructor(v: uni.item.RawItem) {
    super(v)
  }

  private static createBlogItem<T extends Partial<uni.item.RawItem>>(
    blog: CommonBlog | FullBlog,
    overrides?: T
  ) {
    const base = {
      $$meta: { blog },
      $$plugin: pluginName,
      cover: { $$plugin: pluginName, forkNamespace: 'default', path: blog.photo },
      title: blog.title,
      id: String(blog.id),
      customIsAI: false,
      contentType: JmBlogPage.contentType,
      commentSendable: true,
      commentNumber: Number(blog.total_comments),
      likeNumber: Number(blog.total_likes),
      viewNumber: Number(blog.total_views),
      updateTime: dayjs(blog.date, 'YYYY-MM-DD').toDate().getTime(),
      categories: blog.tags
        .flatMap(v => v.split(','))
        .map(v => ({
          name: v,
          group: '标签',
          search: { keyword: v, sort: '', source: 'keyword' },
          $$plugin: pluginName
        })),
      length: blog.content.length.toString(),
      epLength: '1',
      thisEp: { $$plugin: pluginName, id: String(blog.id), name: blog.title }
    } satisfies Partial<uni.item.RawItem>
    return Object.assign(base, overrides)
  }

  public static fromCommonBlog(blog: CommonBlog) {
    return new this(
      this.createBlogItem(blog, {
        author: [
          {
            label: blog.username,
            description: '作者',
            icon: !blog.user_photo?.includes('nopic')
              ? { $$plugin: pluginName, type: 'default', pathname: `/media/users/${blog.uid}.jpg` }
              : 'coser',
            $$meta: { user: blog },
            $$plugin: pluginName
          }
        ]
      })
    )
  }
  public static fromFullBlog(blog: FullBlog) {
    return new this(
      this.createBlogItem(blog, {
        author: [
          {
            label: blog.username,
            description: '作者',
            icon: !blog.user_photo?.includes('nopic')
              ? { $$plugin: pluginName, type: 'default', pathname: `/media/users/${blog.uid}.jpg` }
              : 'coser',
            $$meta: { user: blog },
            $$plugin: pluginName
          }
        ]
      })
    )
  }
}

export class JmBlogComment extends uni.comment.Comment {
  override sender: JmUser
  private raw: BlogComment
  constructor(c: BlogComment) {
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
      return sdk.blog.sendComment(
        { id: c.BID, content: text, parentCommentId: c.parent_CID },
        signal
      )
    return sdk.blog.sendComment({ id: c.BID, content: text }, signal)
  }
  override fetchChildren = new StreamQuery(
    async () => ({ data: this.raw.replys?.map(c => new JmBlogComment(c)) ?? [] }),
    0
  )
}