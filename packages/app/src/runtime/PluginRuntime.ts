import { db } from '@delta-comic/db'
import {
  JMComic,
  type CategoriesResult,
  type JmSession,
  type LoginData,
  type LoginUser,
  type PromoteItem,
  type WeekBest,
} from 'jmcomic-sdk'
import { BrowserImageDecoder } from 'jmcomic-sdk/browser'

import { pluginName } from '@/constants'

const sessionKey = 'session'

const parseSession = (value: string): JmSession | undefined => {
  try {
    const session = JSON.parse(value) as Partial<JmSession>
    if (typeof session.username !== 'string') return undefined
    if (session.token !== undefined && typeof session.token !== 'string') return undefined
    return session as JmSession
  } catch {
    return undefined
  }
}

export class PluginRuntime {
  public readonly jm = new JMComic({ imageDecoder: new BrowserImageDecoder() })
  public categories?: CategoriesResult
  public promotes: PromoteItem[] = []
  public weekBest?: WeekBest
  private controller = new AbortController()

  public get signal() {
    return this.controller.signal
  }

  public start(baseUrl?: string | false): void {
    if (this.controller.signal.aborted) this.controller = new AbortController()
    if (baseUrl) this.jm.config.requestUsingFork = baseUrl
  }

  public async restoreSession(): Promise<JmSession | undefined> {
    const saved = await db
      .selectFrom('nativeStore')
      .select('value')
      .where('namespace', '=', pluginName)
      .where('key', '=', sessionKey)
      .executeTakeFirst()
    if (!saved) return undefined
    const session = parseSession(saved.value)
    if (!session) {
      await this.clearSession()
      return undefined
    }
    this.jm.auth.restoreSession(session)
    return session
  }

  public async validateSession(signal = this.signal): Promise<LoginUser | undefined> {
    const session = this.jm.auth.session
    const user = session?.user
    if (!session?.token || !user) return undefined
    try {
      await this.jm.user.getUser({ uid: user.uid }, signal)
      return { username: session.username, user }
    } catch {
      await this.clearSession()
      return undefined
    }
  }

  public async login(data: LoginData, signal = this.signal): Promise<LoginUser> {
    const login = await this.jm.auth.login(data, signal)
    await this.persistSession()
    return login
  }

  public async persistSession(): Promise<void> {
    const session = this.jm.auth.session
    if (!session) return
    const stored: JmSession = {
      username: session.username,
      token: session.token,
      avs: session.avs,
      user: session.user,
    }
    await db
      .replaceInto('nativeStore')
      .values({ namespace: pluginName, key: sessionKey, value: JSON.stringify(stored) })
      .execute()
  }

  public async clearSession(): Promise<void> {
    this.jm.auth.clearSession()
    await db
      .deleteFrom('nativeStore')
      .where('namespace', '=', pluginName)
      .where('key', '=', sessionKey)
      .execute()
  }

  public async preload(signal = this.signal): Promise<void> {
    const [categories, promotes, weekBest] = await Promise.all([
      this.jm.promote.getCategories(signal),
      this.jm.promote.getPromotes(signal),
      this.jm.promote.getWeekBestCate(signal),
    ])
    this.categories = categories
    this.promotes = promotes
    this.weekBest = weekBest
  }

  public async testFork(fork: string, signal: AbortSignal): Promise<void> {
    await this.jm.requester
      .create({ baseUrl: fork, retry: 0, timeout: 8_000 })
      .get(this.jm.config.forkTestPath, { signal })
      .text()
  }

  public shutdown(): void {
    this.controller.abort()
  }

  public async uninstall(): Promise<void> {
    this.shutdown()
    await this.clearSession()
  }
}

export const runtime = new PluginRuntime()