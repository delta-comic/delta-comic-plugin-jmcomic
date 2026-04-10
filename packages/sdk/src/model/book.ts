import z from 'zod'

export const sCommonBook = z.object({
  author: z.string({ error: r => `Author is illegal. (Input ${JSON.stringify(r.input)})` }),
  id: z.stringFormat('Numeric', /\d+/, {
    error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  image: z.string({ error: r => `Image is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  update_at: z.number({ error: r => `Update time is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface CommonBook {
  author: string
  /**
   * @description 这个字段是book的唯一id，本质数字
   * @example '1145'
   */
  id: string
  image: string
  name: string
  update_at: number
}

export const sLessBook = z.object({
  author_name: z.string({
    error: r => `Author name is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  id: z.stringFormat('Numeric', /\d+/, {
    error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  update_date: z.string({
    error: r => `Update date is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  author_avatar: z.string({
    error: r => `Author avatar is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  background_image: z.string({
    error: r => `Background image is illegal. (Input ${JSON.stringify(r.input)})`
  })
})
export interface LessBook {
  /**
   * @description 这个字段是book的唯一id，本质数字
   * @example '1145'
   */
  id: string
  author_name: string
  /**
   * @example "77 days ago"
   */
  update_date: string
  author_avatar: string
  background_image: string
}

export const sRelatedBook = z.object({
  id: z.stringFormat('Numeric', /\d+/, {
    error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  work_image: z.string({ error: r => `Work image is illegal. (Input ${JSON.stringify(r.input)})` }),
  work_title: z.string({ error: r => `Work title is illegal. (Input ${JSON.stringify(r.input)})` }),
  work_date: z.string({ error: r => `Work date is illegal. (Input ${JSON.stringify(r.input)})` }),
  platform_name: z.string({
    error: r => `Platform name is illegal. (Input ${JSON.stringify(r.input)})`
  })
})
export interface RelatedBook {
  /**
   * @description 这个字段是book的唯一id，本质数字
   * @example '1145'
   */
  id: string
  /**
   * @example "/media/library/album/1043902/thumb/album.jpg"
   */
  work_image: string
  work_title: string
  work_date: string
  platform_name: string
}

export const sAuthorDetail = z.object({
  author_name: z.string({
    error: r => `Author name is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  author_avatar: z.string({
    error: r => `Author avatar is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  background_image: z.string({
    error: r => `Background image is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  sponsor: z
    .object({
      platform_url: z.string({
        error: r => `Sponsor platform url is illegal. (Input ${JSON.stringify(r.input)})`
      }),
      platform_name: z.string({
        error: r => `Sponsor platform name is illegal. (Input ${JSON.stringify(r.input)})`
      })
    })
    .array(),
  related_works: sRelatedBook.array(),
  filters: z.object({
    language: z
      .string({ error: r => `Filter language is illegal. (Input ${JSON.stringify(r.input)})` })
      .array(),
    source: z
      .object({
        service: z.string({
          error: r => `Filter source service is illegal. (Input ${JSON.stringify(r.input)})`
        }),
        name: z.string({
          error: r => `Filter source name is illegal. (Input ${JSON.stringify(r.input)})`
        })
      })
      .array()
  })
})
export interface AuthorDetail {
  /**
   * @deprecated 恒定为该无意义值
   */
  work_title: ''
  /**
   * @deprecated 恒定为该无意义值
   */
  work_date: ''
  author_id: string
  author_name: string
  /**
   * @example "/media/library/artists/6212623/icon/136650067.gif"
   */
  author_avatar: string
  /**
   * @example "/media/library/artists/6212623/banner/136650067.gif"
   */
  background_image: string
  sponsor: {
    /**
     * @example "https://www.patreon.com/user?u=136650067"
     */
    platform_url: string
    platform_name: string
  }[]
  related_works: RelatedBook[]
  filters: { language: string[]; source: { service: string; name: string }[] }
}

export const sBookDetail = z.object({
  work_date: z.string({ error: r => `Work date is illegal. (Input ${JSON.stringify(r.input)})` }),
  author_name: z.string({
    error: r => `Author name is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  work_title: z.string({ error: r => `Work title is illegal. (Input ${JSON.stringify(r.input)})` }),
  related_works: sRelatedBook.array()
})
export interface BookDetail {
  /**
   * @example "20392 days ago"
   */
  work_date: string
  author_name: string
  work_title: string
  related_works: RelatedBook[]
}

export const sBookPages = z.object({
  id: z.number({ error: r => `Id is illegal. (Input ${JSON.stringify(r.input)})` }),
  name: z.string({ error: r => `Name is illegal. (Input ${JSON.stringify(r.input)})` }),
  total_page: z.number({ error: r => `Total page is illegal. (Input ${JSON.stringify(r.input)})` }),
  images: z
    .object({
      page: z.number({ error: r => `Page number is illegal. (Input ${JSON.stringify(r.input)})` }),
      image: z.string({ error: r => `Image url is illegal. (Input ${JSON.stringify(r.input)})` })
    })
    .array(),
  content: z.string({ error: r => `Content is illegal. (Input ${JSON.stringify(r.input)})` }),
  addtime: z.number({ error: r => `Add time is illegal. (Input ${JSON.stringify(r.input)})` }),
  adddt: z.string({ error: r => `Add date is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface BookPages {
  /**
   * @description 这个字段是book的唯一id，本质数字
   * @example '1145'
   */
  id: number
  name: string
  total_page: number
  images: {
    page: number
    /**
     * @example "https://cdn-msp12.jmdanjonproxy.xyz/media/library/album/1023045/00000.jpg"
     */
    image: string
  }[]
  /**
   * @example "<p>72Pic</p>"
   * @description 该内容疑似已经在服务端完成xss过滤，但仍建议再进行本地过滤
   */
  content: string
  /**
   * @deprecated 使用`adddt`代替
   * @example 1970 // 恒定为该无意义值
   */
  addtime: number
  /**
   * @example "2025-05-18 01:00:14"
   */
  adddt: string
}