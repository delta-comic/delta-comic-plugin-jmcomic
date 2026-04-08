import z from 'zod'

export const sCategory = z.object(
  { id: z.string('Id is illegal.'), title: z.string('Title is illegal.') },
  'Category is illegal.'
)
export interface Category {
  id: string
  title: string
}

export const sSeries = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, 'Id is illegal.'),
    name: z.string('Name is illegal.'),
    sort: z.string('Sort is illegal.')
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
    id: z.number('Id is illegal.'),
    name: z.string('Name is illegal.'),
    is_favorite: z.boolean('Is favorite is illegal.'),
    liked: z.boolean('Liked is illegal.')
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
  addtime: z.date('Addtime is illegal.'),
  images: z.array(z.string('Image is illegal.')),
  series: z.array(sSeries),
  series_id: z.stringFormat('Numeric', /\d+/, 'Series id is illegal.'),
  tags: z.string('Tags is illegal.')
})
export interface LessComic extends BaseComic {
  addtime: string
  images: string[]
  series: Series[]
  series_id: string
  tags: string
}

export const sCommonComic = sBaseComic.extend({
  author: z.string('Author is illegal.'),
  description: z.string('Description is illegal.').optional(),
  image: z.string('Image is illegal.'),
  category: sCategory,
  category_sub: sCategory,
  update_at: z.date('Update at is illegal.').optional()
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
    id: z.stringFormat('Numeric', /\d+/, 'Id is illegal.'),
    author: z.string('Author is illegal.'),
    name: z.string('Name is illegal.'),
    image: z.string('Image is illegal.')
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
  images: z.array(z.string('Image is illegal.')),
  addtime: z.date('Addtime is illegal.'),
  description: z.string('Description is illegal.'),
  total_views: z.stringFormat('Numeric', /\d+/, 'Total views is illegal.'),
  series: z.array(sSeries),
  series_id: z.stringFormat('Numeric', /\d+/, 'Series id is illegal.'),
  comment_total: z.stringFormat('Numeric', /\d+/, 'Comment total is illegal.'),
  author: z.array(z.string('Author is illegal.')),
  tags: z.array(z.string('Tag is illegal.')),
  works: z.array(z.string('Work is illegal.')),
  actors: z.array(z.string('Actor is illegal.')),
  related_list: z.array(sRecommendComic),
  liked: z.boolean('Liked is illegal.'),
  is_aids: z.boolean('Is aids is illegal.'),
  price: z.stringFormat('Numeric', /\d+/, 'Price is illegal.'),
  purchased: z.string('Purchased is illegal.'),
  likes: z.stringFormat('Numeric', /\d+/, 'Likes is illegal.')
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