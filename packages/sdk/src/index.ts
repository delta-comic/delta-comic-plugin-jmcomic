import { Auth } from './modules/auth'
import { Blog } from './modules/blog'
import { Book } from './modules/book'
import { Comic } from './modules/comic'
import { Config } from './modules/config'
import { Fork } from './modules/fork'
import { Requester } from './modules/requester'

export class JMComic {
  public config = new Config(this)
  public requester = new Requester(this)
  public fork = new Fork(this)
  public auth = new Auth(this)
  public comic = new Comic(this)
  public blog = new Blog(this)
  public book = new Book(this)
}