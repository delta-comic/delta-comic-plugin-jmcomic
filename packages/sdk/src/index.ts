import { Auth } from './modules/auth'
import { Blog } from './modules/blog'
import { Book } from './modules/book'
import { Comic, ImageDecryptor } from './modules/comic'
import { Config } from './modules/config'
import { Fork } from './modules/fork'
import { Novel } from './modules/novel'
import { Promote } from './modules/promote'
import { Requester } from './modules/requester'
import { User } from './modules/user'

export * from './model/auth'
export * from './model/comic'
export * from './model/blog'
export * from './model/novel'
export * from './model/book'
export * from './model/comment'
export * from './model/promote'
export * from './model/user'
export * from './model/utils'

export class JMComic {
  public config = new Config(this)
  public requester = new Requester(this)
  public fork = new Fork(this)
  public auth = new Auth(this)
  public user = new User(this)
  public comic = new Comic(this)
  public image = new ImageDecryptor(this)
  public blog = new Blog(this)
  public book = new Book(this)
  public novel = new Novel(this)
  public promote = new Promote(this)
}