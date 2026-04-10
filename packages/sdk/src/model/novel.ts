import z from 'zod'

export const sLessNovel = z.object({
  id: z.stringFormat('Numeric', /\d+/, {
    error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  author: z.string({ error: r => `'Author is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `'Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  image: z.string({ error: r => `'Image is illegal. (Input ${JSON.stringify(r.input)})` }),
  update_at: z.stringFormat('Numeric', /\d+/, {
    error: r => `'Update at is not a numeric string. (Input ${JSON.stringify(r.input)})`
  })
})
export interface LessNovel {
  /**
   * @description 唯一id，本质数字
   * @example '53'
   */
  id: string
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
  id: z.stringFormat('Numeric', /\d+/, {
    error: r => `'Id is not numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  author: z.string({ error: r => `'Id is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `'Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  image: z.string({ error: r => `'Image is illegal. (Input ${JSON.stringify(r.input)})` }),
  liked: z.boolean({ error: r => `'Liked is illegal. (Input ${JSON.stringify(r.input)})` }),
  is_favorite: z.null({
    error: r => `'Is favorite is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  update_at: z.number({ error: r => `'Update at is illegal. (Input ${JSON.stringify(r.input)})` }),
  likes: z.stringFormat('Numeric', /\d+/, {
    error: r => `'Likes is not numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  last_chapter_index: z.stringFormat('Numeric', /\d+/, {
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
  id: string
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