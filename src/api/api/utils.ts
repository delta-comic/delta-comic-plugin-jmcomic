import { Stream } from '@delta-comic/model'
import dayjs from 'dayjs'
import { ceil, isEmpty, isString, uniq } from 'es-toolkit/compat'

import { pluginName } from '@/symbol'

import { jm } from '..'
import { JmBlogPage, JmBookPage, JmComicPage } from '../page'

export const spiltUsers = (userString = '') =>
  userString
    .split(/\,|，|\&|\||、|＆|(\sand\s)|(\s和\s)|(\s[xX]\s)/gi)
    .filter(Boolean)
    .map(v => v.trim())
    .filter(Boolean)

const isCosplay = (tags: string[] | string) => tags.includes('COSPLAY') || tags.includes('cosplay')
const createAuthor = (item: { author: string | string[]; tags?: string | string[] }) =>
  (isString(item.author) ? spiltUsers(item.author) : item.author).map(v => ({
    label: v,
    description: item.tags ? (isCosplay(item.tags) ? 'coser' : '作者') : '作者',
    icon: item.tags ? (isCosplay(item.tags) ? 'coser' : 'draw') : 'coser',
    actions: ['search'],
    subscribe: 'keyword',
    $$plugin: pluginName
  }))

export const createLessToUniItem = (comic: jm.comic.RawLessComic) =>
  new jm.comic.JmItem({
    $$meta: { comic },
    $$plugin: pluginName,
    author: [],
    categories: comic.tags
      .split(' ')
      .filter(v => !isEmpty(v))
      .map(v => ({ name: v, search: { keyword: v, sort: '', source: 'keyword' }, group: '标签' })),
    cover: {
      $$plugin: pluginName,
      forkNamespace: 'default',
      path: `/media/albums/${comic.id}_3x4.jpg`
    },
    title: comic.name,
    id: comic.id,
    isLiked: comic.liked,
    updateTime: Number(comic.addtime),
    customIsAI: false,
    contentType: JmComicPage.contentType,
    length: '',
    epLength: comic.series.length.toString(),
    thisEp: {
      $$plugin: pluginName,
      name: comic.series.find(v => v.sort == comic.series_id)!.name,
      index: comic.series_id
    },
    commentSendable: true
  })

export const createCommonToUniItem = (comic: jm.comic.RawCommonComic) =>
  new jm.comic.JmItem({
    $$meta: { comic },
    $$plugin: pluginName,
    author: createAuthor(comic),
    categories: uniq([comic.category.title ?? '', comic.category_sub.title ?? ''])
      .filter(v => !isEmpty(v))
      .map(v => ({ name: v, group: '分类', search: { keyword: v, sort: '', source: 'keyword' } })),
    cover: {
      $$plugin: pluginName,
      forkNamespace: 'default',
      path: `/media/albums/${comic.id}_3x4.jpg`
    },
    title: comic.name,
    id: comic.id,
    isLiked: comic.liked,
    updateTime: comic.update_at && Number(comic.update_at),
    customIsAI: false,
    contentType: JmComicPage.contentType,
    length: '',
    epLength: '',
    thisEp: { $$plugin: pluginName, name: comic.name, index: comic.id },
    commentSendable: true
  })

export const createRecommendToUniItem = (comic: jm.comic.RawRecommendComic) =>
  new jm.comic.JmItem({
    $$meta: { comic },
    $$plugin: pluginName,
    author: createAuthor(comic),
    categories: [],
    cover: {
      $$plugin: pluginName,
      forkNamespace: 'default',
      path: `/media/albums/${comic.id}_3x4.jpg`
    },
    title: comic.name,
    id: comic.id,
    customIsAI: false,
    contentType: JmComicPage.contentType,
    length: '',
    epLength: '',
    thisEp: { $$plugin: pluginName, name: comic.name, index: comic.id },
    commentSendable: true
  })

export const createFullToUniItem = (comic: jm.comic.RawFullComic) =>
  new jm.comic.JmItem({
    $$meta: { comic },
    $$plugin: pluginName,
    author: createAuthor(comic),
    categories: comic.tags
      .filter(v => !isEmpty(v))
      .map(v => ({ name: v, group: '标签', search: { keyword: v, sort: '', source: 'keyword' } }))
      .concat(
        comic.works.map(v => ({
          name: v,
          group: '作品',
          search: { keyword: v, sort: '', source: 'keyword' }
        })),
        comic.actors.map(v => ({
          name: v,
          group: '角色',
          search: { keyword: v, sort: '', source: 'keyword' }
        }))
      ),
    cover: {
      $$plugin: pluginName,
      forkNamespace: 'default',
      path: `/media/albums/${comic.id}_3x4.jpg`
    },
    title: comic.name,
    id: comic.id,
    customIsAI: false,
    contentType: JmComicPage.contentType,
    length: comic.images.length.toString(),
    epLength: comic.series.length.toString(),
    thisEp: { $$plugin: pluginName, name: comic.name, index: comic.id },
    commentSendable: true,
    description: comic.description,
    commentNumber: Number(comic.comment_total),
    isLiked: comic.liked,
    likeNumber: Number(comic.likes),
    updateTime: Number(comic.addtime),
    viewNumber: Number(comic.total_views)
  })

export const createCommonBlogToUniItem = (
  blog: jm.blog.RawCommonBlog,
  searchSource: string = 'keyword'
) =>
  new jm.blog.JmBlog({
    $$plugin: pluginName,
    $$meta: { raw: blog },
    author: [
      {
        label: blog.username,
        description: '作者',
        icon: 'coser',
        $$meta: { user: blog },
        $$plugin: pluginName
      }
    ],
    commentSendable: true,
    categories: blog.tags
      .flatMap(v => v.split(','))
      .map(v => ({
        name: v,
        search: { keyword: v, sort: '', source: searchSource },
        group: '标签'
      })),
    contentType: JmBlogPage.contentType,
    cover: { $$plugin: pluginName, forkNamespace: 'default', path: blog.photo },
    epLength: '1',
    id: blog.id,
    length: blog.content.length.toString(),
    thisEp: { $$plugin: pluginName, index: blog.id, name: blog.title },
    title: blog.title,
    commentNumber: Number(blog.total_comments),
    likeNumber: Number(blog.total_likes),
    viewNumber: Number(blog.total_views),
    updateTime: dayjs(blog.date, 'YYYY-MM-DD').toDate().getTime()
  })

export const createFullBlogToUniItem = (
  blog: jm.blog.RawFullBlog,
  searchSource: string = 'keyword'
) =>
  new jm.blog.JmBlog({
    $$plugin: pluginName,
    $$meta: { raw: blog },
    author: [
      {
        label: blog.nickname,
        description: '作者',
        icon: { $$plugin: pluginName, forkNamespace: 'default', path: blog.user_photo ?? '' },
        $$meta: { user: blog },
        $$plugin: pluginName
      }
    ],
    commentSendable: true,
    categories: blog.tags
      .flatMap(v => v.split(','))
      .map(v => ({
        name: v,
        group: '标签',
        search: { keyword: v, sort: '', source: searchSource }
      })),
    contentType: JmBlogPage.contentType,
    cover: { $$plugin: pluginName, forkNamespace: 'default', path: blog.photo },
    epLength: '1',
    id: blog.id,
    length: blog.content.length.toString(),
    thisEp: { $$plugin: pluginName, index: blog.id, name: blog.title },
    title: blog.title,
    commentNumber: Number(blog.total_comments),
    likeNumber: Number(blog.total_likes),
    viewNumber: Number(blog.total_views),
    updateTime: dayjs(blog.date, 'YYYY-MM-DD').toDate().getTime(),
    isLiked: blog.is_liked
  })

export const createCommonBookToItem = (book: jm.book.RawCommonBook) =>
  new jm.book.JmBook({
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
    id: book.id,
    length: 'unknown',
    thisEp: { $$plugin: pluginName, index: book.id, name: book.name },
    title: book.name,
    commentNumber: 0,
    likeNumber: 0,
    viewNumber: 0,
    updateTime: dayjs(book.update_at, 'YYYY-MM-DD').toDate().getTime()
  })

export const createListBookToItem = (book: jm.book.RawListBook) =>
  new jm.book.JmBook({
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
    id: book.id,
    length: 'unknown',
    thisEp: { $$plugin: pluginName, index: book.id, name: book.author_name },
    title: book.author_name,
    commentNumber: 0,
    likeNumber: 0,
    viewNumber: 0,
    updateTime: dateTranslate(book.update_date).toDate().getTime()
  })

export const createRelatedBookToItem = (book: jm.book.RawRelatedBook) =>
  new jm.book.JmBook({
    $$plugin: pluginName,
    $$meta: { raw: book },
    author: [],
    commentSendable: false,
    categories: [],
    contentType: JmBookPage.contentType,
    cover: { $$plugin: pluginName, forkNamespace: 'default', path: book.work_image },
    epLength: '1',
    id: book.id,
    length: 'unknown',
    thisEp: { $$plugin: pluginName, index: book.id, name: book.work_title },
    title: book.work_title,
    commentNumber: 0,
    likeNumber: 0,
    viewNumber: 0,
    updateTime: dateTranslate(book.work_date).toDate().getTime()
  })

export const dateTranslate = (date: string) => {
  const daysAgo = Number(date.match(/^\d+/g)?.[0])
  return dayjs().add(-daysAgo, 'day')
}

export const jmStream = <T>(
  api: (page: number, signal: AbortSignal) => PromiseLike<{ list: T[]; total: number }>
) =>
  Stream.create<T>(async function* (signal, that) {
    while (true) {
      if (that.pages.value <= that.page.value) return
      that.page.value++
      const { list: result, total } = await api(that.page.value, signal)
      if (total == 0 || isEmpty(result)) return
      if (that.page.value == 1) that.pageSize.value = result.length
      that.total.value = total
      // eg: total: 300 result: 60 pages: t/r向上取整
      that.pages.value = ceil(total / that.pageSize.value)
      yield result
    }
  })