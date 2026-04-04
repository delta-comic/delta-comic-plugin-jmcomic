import { Auth } from './modules/auth'
import { Config } from './modules/config'
import { Requester } from './modules/requester'

export class JMComic {
  public config = new Config(this)
  public requester = new Requester(this)
  public auth = new Auth(this)
}