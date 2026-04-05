export interface Category {
  id?: string
  title?: string
}

export interface Series {
  id: string
  name: string
  sort: string
}

export interface BaseComic {
  id: string
  name: string
  is_favorite: boolean
  liked: boolean
}

export interface LessComic extends BaseComic {
  addtime: string
  images: string[]
  series: Series[]
  series_id: string
  tags: string
}

export interface CommonComic extends BaseComic {
  author: string
  description?: string
  image: string
  category: Category
  category_sub: Category
  update_at?: number
}

export interface RecommendComic {
  id: string
  author: string
  name: string
  image: string
}

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