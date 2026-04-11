import z from 'zod'

import type { ExpInfo, Gender } from './user'
import { sNumeric, type Numeric } from './utils'

export const sLessNovel = z.object({
  id: sNumeric,
  author: z.string({ error: r => `'Author is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `'Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  image: z.string({ error: r => `'Image is illegal. (Input ${JSON.stringify(r.input)})` }),
  update_at: z.stringFormat('Numeric', /^\d+$/, {
    error: r => `'Update at is not a numeric string. (Input ${JSON.stringify(r.input)})`
  })
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
  update_at: string
}

export const sCommonNovel = z.object({
  id: sNumeric,
  author: z.string({ error: r => `'Id is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `'Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  image: z.string({ error: r => `'Image is illegal. (Input ${JSON.stringify(r.input)})` }),
  liked: z.boolean({ error: r => `'Liked is illegal. (Input ${JSON.stringify(r.input)})` }),
  is_favorite: z.null({
    error: r => `'Is favorite is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  update_at: z.number({ error: r => `'Update at is illegal. (Input ${JSON.stringify(r.input)})` }),
  likes: z.stringFormat('Numeric', /^\d+$/, {
    error: r => `'Likes is not numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  last_chapter_index: z.stringFormat('Numeric', /^\d+$/, {
    error: r => `'Last chapter index is not numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  last_chapter_title: z.string({
    error: r => `'Last chapter title is illegal. (Input ${JSON.stringify(r.input)})`
  })
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
  update_at: number
  /**
   * @description 点赞数，本质数字
   * @example '524'
   */
  likes: string
  /**
   * @description 当前最后一章的index，本质数字
   * @example '5'
   */
  last_chapter_index: string
  /**
   * @description 当前最后一章的章节标题
   * @example '第五章'
   */
  last_chapter_title: string
}

export const sFullNovel = z.object({})
export interface FullNovel {
  id: Numeric
  series_id: Numeric
  name: string
  images: string
  /**
   * @example 添加时间，本质数字
   * @example '174298021'
   */
  addtime: string
  description: string
  /**
   * @description 观看数，本质数字
   * @example '524'
   */
  total_views: string
  /**
   * @description 点赞数，本质数字
   * @example '524'
   */
  likes: string
  /**
   * @description 是否剧透，本质布尔值，但`boolean->number->string`
   * @example
   * '0' // false
   * '1' // true
   */
  is_end: '1'
  serial_status: 'Completed'
  author: '石角春之助'
  tags: ['人妻', '未亡人', '群交', '口交', '完结']
  liked: false
  is_favorite: false
  series: [
    {
      NCID: '6'
      title: '第一章'
      sort: '1'
      created_at: '2025-05-27 16:00:24'
      status: '1'
      on_at: '2025-09-03 09:33:02'
      buy_nc: '0'
      is_need_buy_nc: '0'
      is_need_login: '0'
      id: '6'
      name: '第一章'
      new: false
      purchased: false
    }
  ]
  related_list: [
    {
      NID: '47'
      id: '47'
      pic_s: '/media/novels/47_tmb.jpg'
      image: '/media/novels/47_tmb.jpg'
      name: '[ジャスミン书房编集部] 神婚狐缘：处男无业男成为狐巫女的夫婿 | こんこん神婚 童贞无职は狐巫女に嫁ぎます'
      author: 'ジャスミン书房编集部'
      chapter_update_at: '1775232000'
      update_at: '2026-04-11 10:32:07'
      last_chapter_index: '11'
      last_chapter_title: '第4.3话'
      likes: '177'
    }
  ]
  comment_total: {
    CID: '29'
    NID: '4'
    NCID: '6'
    UID: '7701246'
    comment: '有骨科'
    addtime: '1758041693'
    likes: string
    status: string
    username: string
    nickname: string
    photo: '7701246.jpg'
    gender: Gender
    update_at: '1706885742'
    pinning: '0' // bool
    expinfo: ExpInfo
    replys?: {
      CID: '332'
      UID: '2471384'
      NCID: '0'
      comment: '没人啊'
      addtime: string
      likes: string
      username: string
      nickname: string
      photo: '2471384.jpg'
      gender: Gender
      update_at: string
      status: string
      parent_CID: '255'
      expinfo: [object]
    }[]
    content: "<div style='flex-direction:row;flex-wrap:wrap;'></div>"
    spoiler: '2'
  }[]
}