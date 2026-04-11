import z from 'zod'

import { sNumeric, sString, type Numeric } from './utils'

export const sCategory = z.object(
  { id: sString.nullable(), title: sString.nullable() },
  'Category is illegal.'
)
export interface Category {
  id: string | null
  title: string | null
}

export const sSeries = z.object(
  { id: sNumeric, name: sString, sort: sString },
  'Series is illegal.'
)
export interface Series {
  id: Numeric
  name: string
  sort: string
}

export const sBaseComic = z.object(
  {
    id: sNumeric,
    name: sString,
    is_favorite: z.boolean({
      error: r => `Is favorite is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    liked: z.boolean({ error: r => `Liked is illegal. (Input ${JSON.stringify(r.input)})` })
  },
  'Comic is illegal.'
)
export interface BaseComic {
  /**
   * @description 漫画的唯一id
   * @alias `AID`
   */
  id: Numeric
  name: string
  is_favorite: boolean
  liked: boolean
}

export const sLessComic = sBaseComic.extend({
  addtime: sString,
  images: z.array(sString),
  tags: sString,
  series: z.array(sSeries),
  series_id: sNumeric
})
export interface LessComic extends BaseComic {
  addtime: string
  images: string[]
  series: Series[]
  series_id: Numeric
  tags: string
}

export const sCommonComic = sBaseComic.extend({
  author: sString,
  description: sString.optional(),
  image: sString,
  category: sCategory,
  category_sub: sCategory,
  update_at: sNumeric.optional()
})
export interface CommonComic extends BaseComic {
  author: string
  description?: string
  image: string
  category: Category
  category_sub: Category
  update_at?: Numeric
}

export const sRecommendComic = z.object(
  { id: sNumeric, author: sString, name: sString, image: sString },
  'RecommendComic is illegal.'
)
export interface RecommendComic {
  id: Numeric
  author: string
  name: string
  image: string
}

export const sFullComic = sBaseComic.extend({
  images: z.array(sString),
  addtime: sNumeric,
  description: sString,
  total_views: sNumeric,
  series: z.array(sSeries),
  series_id: sNumeric,
  comment_total: sNumeric,
  author: z.array(sString),
  tags: z.array(sString),
  works: z.array(sString),
  actors: z.array(sString),
  related_list: z.array(sRecommendComic),
  liked: z.boolean({ error: r => `Liked is illegal. (Input ${JSON.stringify(r.input)})` }),
  is_aids: z.boolean({ error: r => `Is aids is illegal. (Input ${JSON.stringify(r.input)})` }),
  purchased: sNumeric,
  price: sNumeric,
  likes: sNumeric
})
export interface FullComic extends BaseComic {
  images: string[]
  addtime: string
  description: string
  total_views: Numeric
  series: Series[]
  series_id: Numeric
  comment_total: Numeric
  author: string[]
  tags: string[]
  works: string[]
  actors: string[]
  related_list: RecommendComic[]
  liked: boolean
  is_aids: boolean
  price: Numeric
  purchased: Numeric
  likes: Numeric
}