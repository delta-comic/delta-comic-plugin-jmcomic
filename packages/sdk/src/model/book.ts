export interface CommonBook {
  author: string
  id: string
  image: string
  name: string
  update_at: number
}

export interface LessBook {
  id: string
  author_name: string
  /**
   * @example "77 days ago"
   */
  update_date: string
  author_avatar: string
  background_image: string
}

export interface RelatedBook {
  id: string
  /**
   * @example "/media/library/album/1043902/thumb/album.jpg"
   */
  work_image: string
  work_title: string
  work_date: string
  platform_name: string
}

export interface AuthorDetail {
  /**
   * @deprecated 恒定为该无意义值
   */
  work_title: ''
  /**
   * @deprecated 恒定为该无意义值
   */
  work_date: ''
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

export interface BookDetail {
  /**
   * @example "20392 days ago"
   */
  work_date: string
  author_name: string
  work_title: string
  related_works: RelatedBook[]
}

export interface BookPages {
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