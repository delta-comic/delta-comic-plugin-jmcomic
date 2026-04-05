import type { JMComic } from '..'

enum ApiPath {
  login = 'login',
  signup = 'register',
  logout = 'logout'
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