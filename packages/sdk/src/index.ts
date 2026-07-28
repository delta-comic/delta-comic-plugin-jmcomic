import { ImageDecryptor } from './image'
import { Auth } from './modules/auth'
import { Blog } from './modules/blog'
import { Book } from './modules/book'
import { Comic } from './modules/comic'
import { Config } from './modules/config'
import { Fork } from './modules/fork'
import { Novel } from './modules/novel'
import { Promote } from './modules/promote'
import { Requester } from './modules/requester'
import { User } from './modules/user'
import type { JMComicOptions } from './types'

export * from './image'
export * from './model/auth'
export * from './model/blog'
export * from './model/book'
export * from './model/comic'
export * from './model/comment'
export * from './model/novel'
export * from './model/promote'
export * from './model/user'
export * from './model/utils'
export * from './types'

export class JMComic {
  public readonly config: Config
  public readonly requester: Requester
  public readonly fork: Fork
  public readonly auth: Auth
  public readonly user: User
  public readonly comic: Comic
  public readonly image: ImageDecryptor
  public readonly blog: Blog
  public readonly book: Book
  public readonly novel: Novel
  public readonly promote: Promote

  public constructor(options: JMComicOptions = {}) {
    this.config = new Config(options)
    this.requester = new Requester(this)
    this.fork = new Fork(this)
    this.auth = new Auth(this, options.session)
    this.user = new User(this)
    this.comic = new Comic(this)
    this.image = new ImageDecryptor(this, options.imageDecoder)
    this.blog = new Blog(this)
    this.book = new Book(this)
    this.novel = new Novel(this)
    this.promote = new Promote(this)
  }
}