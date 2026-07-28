import type { JMComicOptions } from '../types'

export const apiPath = {
  auth: { login: '/login', signUp: '/register', logout: '/logout', forgetPassword: '/forget' },
  book: {
    search: '/creator_author',
    authorDetail: '/creator_author_work',
    detail: '/creator_work_info',
    pages: '/creator_work_info_detail',
  },
  comic: { search: '/search', category: '/categories/filter', detail: '/album', pages: '/chapter' },
  blog: { search: '/blogs', detail: '/blog' },
  forum: { comments: '/forum', comment: '/comment', like: '/like', favorite: '/favorite' },
  user: {
    daily: '/daily',
    dailyCheck: '/daily_chk',
    edit: '/useredit',
    badge: '/coin',
    task: '/tasks',
    history: '/watch_list',
  },
  promote: {
    categories: '/categories',
    list: '/promote',
    item: '/promote_list',
    hotTags: '/hot_tags',
    random: '/random_recommend',
    latest: '/latest',
    weekCategories: '/week',
    weekList: '/week/filter',
  },
  novel: {
    list: '/novels',
    detail: '/novel',
    chapters: '/novelchapters',
    search: '/search_novels',
    favorites: '/novel_favorites',
    favoriteFolders: '/novel_favorites_folder',
  },
} as const

export class Config {
  public readonly forkSources = [
    'https://rup4a04-c01.tos-ap-southeast-1.bytepluses.com',
    'https://rup4a04-c02.tos-cn-hongkong.bytepluses.com',
  ]
  public readonly forkSecret = 'diosfjckwpqpdfjkvnqQjsik'
  public readonly forkPath = 'newsvr-2025.txt'
  public readonly forkTestPath = '/promote_list'
  public readonly apiPath = apiPath
  public readonly now: () => number
  public requestTimeout: number
  public requestRetry: number
  public requestUsingFork: string

  public constructor(options: JMComicOptions = {}) {
    this.requestTimeout = options.timeout ?? 10_000
    this.requestRetry = options.retry ?? 2
    this.requestUsingFork = options.baseUrl ?? ''
    this.now = options.now ?? Date.now
  }
}