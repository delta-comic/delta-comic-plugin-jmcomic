import type { ExpInfo, Gender } from './user'
import type { Numeric } from './utils'

export * from './generated/novel'

/** @zod */
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

/** @zod */
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
  is_favorite: boolean | null
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

/** @zod */
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

/** @zod */
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

/** @zod */
export interface NovelComment {
  CID: Numeric
  parent_CID?: Numeric
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
  replys?: NovelComment[]
  /**
   * @deprecated 无意义，使用`comment`代替
   */
  content: string
  spoiler: Numeric
}

/** @zod */
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
  comment_total: NovelComment[]
}

/** @zod */
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