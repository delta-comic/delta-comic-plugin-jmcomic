import { StreamQuery, UniComment, UniUser, type UniResourceRaw } from '@delta-comic/model'
import {
  JmApiError,
  type BlogComment,
  type ComicComment,
  type Comment,
  type NovelComment,
} from 'jmcomic-sdk'

import { richTextToPlainText } from '@/adapters/richText'
import { contentKeys, pluginName } from '@/constants'
import { runtime } from '@/runtime/PluginRuntime'

type JmCommentRaw = BlogComment | ComicComment | NovelComment
type CommentKind = 'blog' | 'comic' | 'novel'

const commentText = (comment: JmCommentRaw) =>
  'comment' in comment ? comment.comment : richTextToPlainText(comment.content)

const commentTime = (value: number | string) => {
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric
  const parsed = Date.parse(String(value))
  return Number.isNaN(parsed) ? Date.now() : parsed
}

class JmCommentUser extends UniUser {
  public override customUser: { comment: JmCommentRaw }

  public constructor(comment: JmCommentRaw) {
    const avatar: UniResourceRaw | undefined = comment.photo.includes('nopic')
      ? undefined
      : {
          $$plugin: pluginName,
          pathname: `/media/users/${comment.photo || `${comment.UID}.jpg`}`,
          type: 'default',
        }
    super({
      $$plugin: pluginName,
      avatar,
      id: String(comment.UID),
      name: comment.nickname || comment.username,
    })
    this.customUser = { comment }
  }
}

export class JmComment extends UniComment {
  public override sender: UniUser
  public override fetchChildren: StreamQuery<UniComment>

  public constructor(
    private readonly kind: CommentKind,
    private readonly raw: JmCommentRaw,
  ) {
    const sender = new JmCommentUser(raw)
    super({
      $$plugin: pluginName,
      $$meta: { kind, raw },
      childrenCount: raw.replys?.length ?? 0,
      content: { type: 'string', text: commentText(raw) },
      id: String(raw.CID),
      isLiked: false,
      isTop: 'pinning' in raw ? Boolean(Number(raw.pinning)) : false,
      likeCount: Number(raw.likes),
      reported: false,
      sender,
      time: commentTime(raw.addtime),
    })
    this.sender = sender
    this.fetchChildren = new StreamQuery(
      async () => ({
        data: (raw.replys ?? []).map(
          child =>
            new JmComment(kind, {
              ...raw,
              ...(child as JmCommentRaw),
              replys: undefined,
            } as JmCommentRaw),
        ),
      }),
      1,
    )
  }

  public override like(): Promise<never> {
    return Promise.reject(new JmApiError('UNSUPPORTED_OPERATION', '服务端不支持评论点赞'))
  }

  public override report(): Promise<never> {
    return Promise.reject(new JmApiError('UNSUPPORTED_OPERATION', '服务端不支持评论举报'))
  }

  public override sendComment(text: string, signal?: AbortSignal): Promise<unknown> {
    const parentCommentId = Number(this.raw.parent_CID) > 0 ? this.raw.parent_CID : this.raw.CID
    switch (this.kind) {
      case contentKeys.comic:
        if ((this.raw as ComicComment).AID === undefined)
          throw new JmApiError('INVALID_RESPONSE', '评论缺少漫画编号')
        return runtime.jm.comic.sendComment(
          {
            comicId: (this.raw as ComicComment).AID!,
            content: text,
            isSpoiled: false,
            parentCommentId,
          },
          signal,
        )
      case contentKeys.blog:
        return runtime.jm.blog.sendComment(
          { id: (this.raw as BlogComment).BID, content: text, parentCommentId },
          signal,
        )
      case contentKeys.novel: {
        const raw = this.raw as NovelComment
        if (raw.NID === undefined) throw new JmApiError('INVALID_RESPONSE', '评论缺少小说编号')
        return runtime.jm.novel.sendComment(
          {
            novelId: raw.NID,
            chapterId: raw.NCID,
            content: text,
            isSpoiled: false,
            parentCommentId,
          },
          signal,
        )
      }
    }
  }
}

export const fromComicComment = (comment: ComicComment) => new JmComment('comic', comment)
export const fromBlogComment = (comment: BlogComment) => new JmComment('blog', comment)
export const fromNovelComment = (comment: NovelComment) => new JmComment('novel', comment)

export type JmForumComment = Comment | NovelComment