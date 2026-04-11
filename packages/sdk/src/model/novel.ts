import z from 'zod'

import { sExpInfo, sGender, type ExpInfo, type Gender } from './user'
import { sNumeric, sString, type Numeric } from './utils'

export const sLessNovel = z.object({
  id: sNumeric,
  author: sString,
  name: sString,
  image: sString,
  update_at: sNumeric
})
export interface LessNovel {
  /**
   * @description 唯一id，本质数字
   * @example '53'
   */
  id: Numeric
  author: string
  name: string
  /**
   * @description 封面图链接，相对路径
   * @example '/media/novels/53_tmb.jpg'
   */
  image: string
  /**
   * @description 更新日期，本质数字
   * @example '1775404800'
   */
  update_at: Numeric
}

export const sCommonNovel = z.object({
  id: sNumeric,
  author: sString,
  name: sString,
  image: sString,
  liked: z.boolean({ error: r => `'Liked is illegal. (Input ${JSON.stringify(r.input)})` }),
  is_favorite: z.any(),
  update_at: sNumeric,
  likes: sNumeric,
  last_chapter_index: sNumeric,
  last_chapter_title: sString
})
export interface CommonNovel {
  /**
   * @description 唯一id，本质数字
   * @example '4'
   */
  id: Numeric
  /**
   * @description 作者
   * @example '石角春之助'
   */
  author: string
  /**
   * @description 标题
   * @example '[石角春之助] 未亡人'
   */
  name: string
  /**
   * @description 封面图链接，建议只留path然后拼接分流
   * @example 'https://cdn-msp3.jmdanjonproxy.vip/media/novels/4_tmb.jpg'
   */
  image: string
  liked: boolean
  is_favorite: null
  update_at: Numeric
  /**
   * @description 点赞数，本质数字
   * @example '524'
   */
  likes: Numeric
  /**
   * @description 当前最后一章的index，本质数字
   * @example '5'
   */
  last_chapter_index: Numeric
  /**
   * @description 当前最后一章的章节标题
   * @example '第五章'
   */
  last_chapter_title: string
}

export const sNovelSeries = z.object({
  NCID: sNumeric,
  title: sString,
  sort: sNumeric,
  created_at: sString,
  status: sNumeric,
  on_at: sString,
  buy_nc: sNumeric,
  is_need_buy_nc: sNumeric,
  is_need_login: sNumeric,
  id: sNumeric,
  name: sString,
  new: z.boolean({ error: r => `'New is illegal. (Input ${JSON.stringify(r.input)})` }),
  purchased: z.boolean({ error: r => `'Purchased is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface NovelSeries {
  NCID: Numeric
  title: string
  sort: Numeric
  /**
   * @example '2025-05-27 16:00:24'
   */
  created_at: string
  status: Numeric
  /**
   * @example '2025-05-27 16:00:24'
   */
  on_at: string
  buy_nc: Numeric
  is_need_buy_nc: Numeric
  is_need_login: Numeric
  id: Numeric
  name: string
  new: boolean
  purchased: boolean
}

export const sNovelRelated = z.object({
  NID: sNumeric,
  id: sNumeric,
  pic_s: sString,
  image: sString,
  name: sString,
  author: sString,
  chapter_update_at: sNumeric,
  update_at: sString,
  last_chapter_index: sNumeric,
  last_chapter_title: sString,
  likes: sNumeric
})
export interface NovelRelated {
  NID: Numeric
  id: Numeric
  /**
   * @example '/media/novels/47_tmb.jpg'
   */
  pic_s: string
  /**
   * @example '/media/novels/47_tmb.jpg'
   */
  image: string
  name: string
  author: string
  chapter_update_at: Numeric
  /**
   * @example '2025-05-27 16:00:24'
   */
  update_at: string
  last_chapter_index: Numeric
  last_chapter_title: string
  likes: Numeric
}

export const sNovelCommentChild = z.object({
  CID: sNumeric,
  UID: sNumeric,
  NCID: sNumeric,
  comment: sString,
  addtime: sNumeric,
  likes: sNumeric,
  username: sString,
  nickname: sString,
  photo: sString,
  gender: sGender,
  update_at: sString,
  status: sString,
  parent_CID: sNumeric,
  expinfo: sExpInfo
})
export interface NovelCommentChild {
  CID: Numeric
  UID: Numeric
  NCID: Numeric
  comment: string
  addtime: Numeric
  likes: Numeric
  username: string
  nickname: string
  /**
   * @example '7701246.jpg'
   */
  photo: string
  gender: Gender
  update_at: string
  status: string
  parent_CID: Numeric
  expinfo: ExpInfo
}

export const sNovelCommentMain = z.object({
  CID: sNumeric,
  NID: sNumeric,
  NCID: sNumeric,
  UID: sNumeric,
  comment: sString,
  addtime: sNumeric,
  likes: sNumeric,
  status: sNumeric,
  username: sString,
  nickname: sString,
  photo: sString,
  gender: sGender,
  update_at: sNumeric,
  pinning: sNumeric,
  expinfo: sExpInfo,
  content: sString,
  spoiler: sNumeric
})
export interface NovelCommentMain {
  CID: Numeric
  NID: Numeric
  NCID: Numeric
  UID: Numeric
  comment: string
  /**
   * @example '1758041693'
   */
  addtime: Numeric
  likes: Numeric
  status: Numeric
  username: string
  nickname: string
  /**
   * @example '7701246.jpg'
   */
  photo: string
  gender: Gender
  /**
   * @example '1758041693'
   */
  update_at: Numeric
  pinning: Numeric // bool
  expinfo: ExpInfo
  replys?: NovelCommentChild[]
  /**
   * @deprecated 无意义，使用`comment`代替
   */
  content: string
  spoiler: Numeric
}

export const sFullNovel = z.object({
  id: sNumeric,
  series_id: sNumeric,
  name: sString,
  images: sString,
  addtime: sNumeric,
  description: sString,
  total_views: sNumeric,
  likes: sNumeric,
  is_end: sNumeric,
  serial_status: sString,
  author: sString,
  tags: z.array(sString),
  liked: z.boolean(),
  is_favorite: z.boolean(),
  series: z.array(sNovelSeries),
  related_list: z.array(sNovelRelated),
  comment_total: z.array(sNovelCommentMain)
})
export interface FullNovel {
  id: Numeric
  series_id: Numeric
  name: string
  images: string
  /**
   * @example 添加时间，本质数字
   * @example '174298021'
   */
  addtime: Numeric
  description: string
  /**
   * @description 观看数，本质数字
   * @example '524'
   */
  total_views: Numeric
  /**
   * @description 点赞数，本质数字
   * @example '524'
   */
  likes: Numeric
  /**
   * @description 是否剧透，本质布尔值，但`boolean->number->string`
   * @example
   * '0' // false
   * '1' // true
   */
  is_end: Numeric
  serial_status: string
  author: string
  tags: string[]
  liked: boolean
  is_favorite: boolean
  series: NovelSeries[]
  related_list: NovelRelated[]
  comment_total: NovelCommentMain[]
}

export const sNovelContent = z.object({
  ncid: sNumeric,
  nid: sNumeric,
  name: sString,
  title: sString,
  content: sString,
  last_chapter_title: sString,
  total_favorites: sNumeric,
  total_views: sNumeric,
  total_likes: sNumeric,
  addtime: sString,
  adddt: sString,
  is_favorite: z.boolean(),
  liked: z.boolean(),
  related_list: z.array(sNovelRelated)
})
export interface NovelContent {
  ncid: Numeric
  nid: Numeric
  name: string
  title: string
  /**
   * @description html内容
   * @example '<p>「唿、唿、唿、唿、唿！」<br />\r\n'
   */
  content: string
  last_chapter_title: string
  total_favorites: Numeric
  total_views: Numeric
  total_likes: Numeric
  /**
   * @example '1970-01-01 08:33:45'
   */
  addtime: string
  /**
   * @example '1970-01-01 08:33:45'
   */
  adddt: string
  is_favorite: boolean
  liked: boolean
  related_list: NovelRelated[]
}