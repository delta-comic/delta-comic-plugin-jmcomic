import { Auth } from './modules/auth'
import { Blog } from './modules/blog'
import { Book } from './modules/book'
import { Comic } from './modules/comic'
import { Config } from './modules/config'
import { Fork } from './modules/fork'
import { Requester } from './modules/requester'
import { User } from './modules/user'

export * from './model/auth'
export * from './model/blog'
export * from './model/book'
export * from './model/comic'
export * from './model/comment'
export * from './model/search'
export * from './model/user'
export * from './model/utils'

export class JMComic {
  public config = new Config(this)
  public requester = new Requester(this)
  public fork = new Fork(this)
  public auth = new Auth(this)
  public user = new User(this)
  public comic = new Comic(this)
  public blog = new Blog(this)
  public book = new Book(this)
}