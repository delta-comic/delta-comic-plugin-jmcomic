import type { JMComic } from '..'

enum ApiPath {
  // auth接口
  auth_login = '/login',
  auth_signup = '/register',
  auth_logout = '/logout',
  auth_forgetPassword = '/forget',
  // book接口
  book_search = '/creator_author',
  book_getAuthorDetail = '/creator_author_work',
  book_getBookDetail = '/creator_work_info',
  book_getBookFullDetail = '/creator_work_info_detail',
  // comic接口
  comic_searchByKeyword = '/search',
  comic_searchByCategory = '/categories/filter',
  comic_getInfo = '/album',
  comic_getPages = '/chapter',
  // blog接口
  blog_search = '/blogs',
  blog_getInfo = '/blog',
  // forum接口
  forum_getComments = '/forum',
  forum_sendComment = '/comment',
  forum_like = '/like',
  forum_favorite = '/favorite',
  // user接口
  user_daily = '/daily',
  user_dailyCheck = '/daily_chk',
  user_edit = '/useredit/',
  user_buyBadge = '/coin',
  user_task = '/tasks',
  // search接口
  promote_get = '/promote',
  promote_list = '/promote_list',
  // weekBest接口
  weekBest_cate = '/week',
  weekBest_list = '/week/filter'
}

export class Config {
  constructor(protected sdk: JMComic) {}

  // fork配置
  public forkGetSource = [
    'https://rup4a04-c01.tos-ap-southeast-1.bytepluses.com',
    'https://rup4a04-c02.tos-cn-hongkong.bytepluses.com'
  ]
  public forkFetchSecret = 'diosfjckwpqpdfjkvnqQjsik'
  public forkGetPath = 'newsvr-2025.txt'
  public forkTestPath = 'promote_list'

  // 通用request配置
  public requestTimeout = 10000
  public requestRetry = 2
  public requestUsingFork = ''

  // api路径
  public apiPath = ApiPath
}