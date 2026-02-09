import { _jmApiAuth } from './api/auth'
import { _jmApiBlog } from './api/blog'
import { _jmApiBook } from './api/book'
import { _jmApiComic } from './api/comic'
import { _jmApiComment } from './api/comment'
import { _jmApiSearch } from './api/search'
import { _jmApiUser } from './api/user'
import { _jmAuth } from './auth'
import { _jmBlog } from './blog'
import { _jmBook } from './book'
import { _jmComic } from './comic'
import { _jmComment } from './comment'
import { _jmImage } from './image'
import { _jmSearch } from './search'
import { _jmUser } from './user'

export namespace jm {
  export type SearchMode = 'jid' | 'keyword' | 'category' | 'tag'
  export type SortType = 'mv' | 'mp' | 'tf' | '' | LevelSort
  export type LevelSort = 'mv_m' | 'mv_w' | 'mv_t'
  export const sortMap = [
    { text: '相关性最高', value: '' },
    { text: '点赞数最多', value: 'tf' },
    { text: '图片数最多', value: 'mp' },
    { text: '观看数最多', value: 'mv' },
    { text: '本月观看数最多', value: 'mv_m' },
    { text: '本周观看数最多', value: 'mv_w' },
    { text: '今日观看数最多', value: 'mv_t' }
  ]
  export import auth = _jmAuth
  export import blog = _jmBlog
  export import book = _jmBook
  export import comic = _jmComic
  export import search = _jmSearch
  export import user = _jmUser
  export import image = _jmImage
  export import comment = _jmComment
}
export namespace jm.api {
  export import blog = _jmApiBlog
  export import auth = _jmApiAuth
  export import search = _jmApiSearch
  export import comic = _jmApiComic
  export import comment = _jmApiComment
  export import user = _jmApiUser
  export import book = _jmApiBook
}

window.$api.jm = jm