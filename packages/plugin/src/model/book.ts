import { uni } from '@delta-comic/model'
import dayjs from 'dayjs'
import type { CommonBook, LessBook, RelatedBook } from 'jmcomic-sdk'

import { pluginName } from '../symbol'

import { JmBookPage } from './page'

export class JmBook extends uni.item.Item {
  override async like(_signal?: AbortSignal): Promise<boolean> {
    window.$message.warning('不支持.')
    return false
  }
  override async report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('不支持.')
  }
  override async sendComment(_text: string, _signal?: AbortSignal): Promise<any> {
    window.$message.warning('不支持.')
  }
  constructor(v: uni.item.RawItem) {
    super(v)
  }
  public static fromRelatedBook(book: RelatedBook) {
    return new this({
      $$plugin: pluginName,
      $$meta: { raw: book },
      author: [],
      commentSendable: false,
      categories: [],
      contentType: JmBookPage.contentType,
      cover: { $$plugin: pluginName, forkNamespace: 'default', path: book.work_image },
      epLength: '1',
      id: String(book.id),
      length: 'unknown',
      thisEp: { $$plugin: pluginName, id: String(book.id), name: book.work_title },
      title: book.work_title,
      commentNumber: 0,
      likeNumber: 0,
      viewNumber: 0,
      updateTime: dateTranslate(book.work_date).toDate().getTime()
    })
  }
  public static fromLessBook(book: LessBook) {
    return new this({
      $$plugin: pluginName,
      $$meta: {
        raw: book,
        background: { $$plugin: pluginName, forkNamespace: 'default', path: book.background_image }
      },
      author: [
        {
          label: book.author_name,
          description: '作者',
          icon: { $$plugin: pluginName, forkNamespace: 'default', path: book.author_avatar },
          $$meta: { user: book },
          $$plugin: pluginName
        }
      ],
      commentSendable: false,
      categories: [],
      contentType: JmBookPage.contentType,
      cover: { $$plugin: pluginName, forkNamespace: 'default', path: book.author_avatar },
      epLength: '1',
      id: String(book.id),
      length: 'unknown',
      thisEp: { $$plugin: pluginName, id: String(book.id), name: book.author_name },
      title: book.author_name,
      commentNumber: 0,
      likeNumber: 0,
      viewNumber: 0,
      updateTime: dateTranslate(book.update_date).toDate().getTime()
    })
  }
  public static fromCommonBook(book: CommonBook) {
    return new this({
      $$plugin: pluginName,
      $$meta: { raw: book },
      author: [
        {
          label: book.author,
          description: '作者',
          icon: { $$plugin: pluginName, forkNamespace: 'default', path: book.image },
          $$meta: { user: book },
          $$plugin: pluginName
        }
      ],
      commentSendable: false,
      categories: [],
      contentType: JmBookPage.contentType,
      cover: { $$plugin: pluginName, forkNamespace: 'default', path: book.image },
      epLength: '1',
      id: String(book.id),
      length: 'unknown',
      thisEp: { $$plugin: pluginName, id: String(book.id), name: book.name },
      title: book.name,
      commentNumber: 0,
      likeNumber: 0,
      viewNumber: 0,
      updateTime: dayjs(book.update_at, 'YYYY-MM-DD').toDate().getTime()
    })
  }
}
const dateTranslate = (date: string) => {
  const daysAgo = Number(date.match(/^\d+/g)?.[0])
  return dayjs().add(-daysAgo, 'day')
}