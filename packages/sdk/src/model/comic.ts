import z from 'zod'

export const sCategory = z.object(
  {
    id: z.string({ error: r => `Id is illegal. (Input ${r.input})` }),
    title: z.string({ error: r => `Title is illegal. (Input ${r.input})` })
  },
  'Category is illegal.'
)
export interface Category {
  id: string
  title: string
}

export const sSeries = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, { error: r => `Id is illegal. (Input ${r.input})` }),
    name: z.string({ error: r => `Name is illegal. (Input ${r.input})` }),
    sort: z.string({ error: r => `Sort is illegal. (Input ${r.input})` })
  },
  'Series is illegal.'
)
export interface Series {
  id: string
  name: string
  sort: string
}

export const sBaseComic = z.object(
  {
    id: z.number({ error: r => `Id is illegal. (Input ${r.input})` }),
    name: z.string({ error: r => `Name is illegal. (Input ${r.input})` }),
    is_favorite: z.boolean({ error: r => `Is favorite is illegal. (Input ${r.input})` }),
    liked: z.boolean({ error: r => `Liked is illegal. (Input ${r.input})` })
  },
  'Comic is illegal.'
)
export interface BaseComic {
  /**
   * @description 漫画的唯一id
   * @alias `AID`
   */
  id: number
  name: string
  is_favorite: boolean
  liked: boolean
}

export const sLessComic = sBaseComic.extend({
  addtime: z.string({ error: r => `Addtime is illegal. (Input ${r.input})` }),
  images: z.array(z.string({ error: r => `Image is illegal. (Input ${r.input})` })),
  tags: z.string({ error: r => `Tags is illegal. (Input ${r.input})` }),
  series: z.array(sSeries),
  series_id: z.stringFormat('Numeric', /\d+/, {
    error: r => `'Series id is illegal. (Input ${r.input})`
  })
})
export interface LessComic extends BaseComic {
  addtime: string
  images: string[]
  series: Series[]
  series_id: string
  tags: string
}

export const sCommonComic = sBaseComic.extend({
  author: z.string({ error: r => `Author is illegal. (Input ${r.input})` }),
  description: z.string({ error: r => `Description is illegal. (Input ${r.input})` }).optional(),
  image: z.string({ error: r => `Image is illegal. (Input ${r.input})` }),
  category: sCategory,
  category_sub: sCategory,
  update_at: z.string({ error: r => `Update at is illegal. (Input ${r.input})` }).optional()
})
export interface CommonComic extends BaseComic {
  author: string
  description?: string
  image: string
  category: Category
  category_sub: Category
  update_at?: number
}

export const sRecommendComic = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, { error: r => `Id is illegal. (Input ${r.input})` }),
    author: z.string({ error: r => `Author is illegal. (Input ${r.input})` }),
    name: z.string({ error: r => `Name is illegal. (Input ${r.input})` }),
    image: z.string({ error: r => `Image is illegal. (Input ${r.input})` })
  },
  'RecommendComic is illegal.'
)
export interface RecommendComic {
  id: string
  author: string
  name: string
  image: string
}

export const sFullComic = sBaseComic.extend({
  images: z.array(z.string({ error: r => `Image is illegal. (Input ${r.input})` })),
  addtime: z.string({ error: r => `Addtime is illegal. (Input ${r.input})` }),
  description: z.string({ error: r => `Description is illegal. (Input ${r.input})` }),
  total_views: z.stringFormat('Numeric', /\d+/, {
    error: r => `Total views is illegal. (Input ${r.input})`
  }),
  series: z.array(sSeries),
  series_id: z.stringFormat('Numeric', /\d+/, {
    error: r => `Series id is illegal. (Input ${r.input})`
  }),
  comment_total: z.stringFormat('Numeric', /\d+/, {
    error: r => `Comment total is illegal. (Input ${r.input})`
  }),
  author: z.array(z.string({ error: r => `Author is illegal. (Input ${r.input})` })),
  tags: z.array(z.string({ error: r => `Tag is illegal. (Input ${r.input})` })),
  works: z.array(z.string({ error: r => `Work is illegal. (Input ${r.input})` })),
  actors: z.array(z.string({ error: r => `Actor is illegal. (Input ${r.input})` })),
  related_list: z.array(sRecommendComic),
  liked: z.boolean({ error: r => `Liked is illegal. (Input ${r.input})` }),
  is_aids: z.boolean({ error: r => `Is aids is illegal. (Input ${r.input})` }),
  purchased: z.string({ error: r => `Purchased is illegal. (Input ${r.input})` }),
  price: z.stringFormat('Numeric', /\d*/, { error: r => `Price is illegal. (Input ${r.input})` }),
  likes: z.stringFormat('Numeric', /\d+/, { error: r => `Likes is illegal. (Input ${r.input})` })
})
export interface FullComic extends BaseComic {
  images: string[]
  addtime: string
  description: string
  total_views: string
  series: Series[]
  series_id: string
  comment_total: string
  author: string[]
  tags: string[]
  works: string[]
  actors: string[]
  related_list: RecommendComic[]
  liked: boolean
  is_aids: boolean
  price: string
  purchased: string
  likes: string
}