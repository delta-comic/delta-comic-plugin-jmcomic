import { MD5 } from 'crypto-es'

import type {
  ComicComment,
  CommonComic,
  FullComic,
  JMComic,
  LessComic,
  List,
  Numeric,
  PaginationQuery,
  SortType
} from '..'
import { jsonToFormData } from '../helpers'

type ComicList<T> = { list: T[]; total: string }

type SearchList<T> = { search_query: string; total: string; content: T[] }

export class Comic {
  constructor(protected sdk: JMComic) {}

  public async searchByKeyword(
    data: PaginationQuery<{ keyword: string; order: SortType }>,
    signal?: AbortSignal
  ): Promise<List<CommonComic>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<SearchList<CommonComic>>(this.sdk.config.apiPath.comic_searchByKeyword, {
        searchParams: { search_query: data.keyword, o: data.order, page: data.page },
        signal
      })
      .json()
    return { list: result.content, total: Number(result.total) }
  }

  public async searchByCategory(
    data: PaginationQuery<{ category: string; order: SortType }>,
    signal?: AbortSignal
  ): Promise<List<CommonComic>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<SearchList<CommonComic> & { tags: string[] }>(
        this.sdk.config.apiPath.comic_searchByCategory,
        { searchParams: { c: data.category, o: data.order, page: data.page }, signal }
      )
      .json()
    return { list: result.content, total: Number(result.total) }
  }

  public async getInfo(data: { id: Numeric }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<FullComic>(this.sdk.config.apiPath.comic_getInfo, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }

  /**
   * @returns 形如`["/media/photos/350234/00001.webp"]`的数组，本质`/media/photos/${data.id}/${img}`
   */
  public getPages = async (data: { id: Numeric }, signal?: AbortSignal) => {
    const ky = this.sdk.requester.create()
    const comic = await ky
      .get<LessComic>(this.sdk.config.apiPath.comic_getPages, {
        searchParams: { id: data.id },
        signal
      })
      .json()
    return comic.images.map(img => `/media/photos/${data.id}/${img}`)
  }

  public async like(data: { id: Numeric }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ msg: string; status: string; code: number }>(this.sdk.config.apiPath.forum_like, {
        body: jsonToFormData({ id: data.id }),
        signal
      })
      .json()
  }

  public async favorite(data: { id: Numeric }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ status: string; msg: string; type: 'add' | 'remove' }>(
        this.sdk.config.apiPath.forum_favorite,
        { body: jsonToFormData({ aid: data.id }), signal }
      )
      .json()
  }

  public async getComments(
    data: PaginationQuery<{ id: Numeric }>,
    signal?: AbortSignal
  ): Promise<List<ComicComment>> {
    const ky = this.sdk.requester.create()
    const list = await ky
      .get<ComicList<ComicComment>>(this.sdk.config.apiPath.forum_getComments, {
        searchParams: { mode: 'manhua', page: data.page, aid: data.id },
        signal
      })
      .json()
    return { list: list.list, total: Number(list.total) }
  }

  public async sendComment(
    data: { comicId: Numeric; parentCommentId?: Numeric; content: string; isSpoiled: boolean },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        body: jsonToFormData({
          aid: data.comicId,
          content: data.content,
          comment_id: data.parentCommentId,
          isSpoiler: data.isSpoiled,
          is_spoiler: data.isSpoiled
        }),
        signal
      })
      .json()
  }
}

// 图片解密由claude编写

// ─── 工具：仅取 MD5 末位 hex 字符，结果缓存 ───────────────────────────────
const md5LastCharCache = new Map<string, number>()
function md5LastCharCode(input: string): number {
  let code = md5LastCharCache.get(input)
  if (code !== undefined) return code
  const hash = MD5(input).toString()
  code = hash.charCodeAt(hash.length - 1)
  md5LastCharCache.set(input, code)
  return code
}

// ─── 公共段绘制（浏览器 / Node canvas 两端共用） ─────────────────────────
function drawSegments(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  segCount: number
): void {
  const segH = Math.floor(height / segCount)
  const rem = height % segCount

  // 最后一段（含余数）→ 放到最顶
  let srcY = height - segH - rem
  let srcH = segH + rem
  let dstY = 0
  ctx.drawImage(source, 0, srcY, width, srcH, 0, dstY, width, srcH)
  dstY += srcH

  // 其余段从后往前依次填充
  for (let i = 1; i < segCount; i++) {
    srcY -= segH
    ctx.drawImage(source, 0, srcY, width, segH, 0, dstY, width, segH)
    dstY += segH
  }
}

// ─── 主类 ────────────────────────────────────────────────────────────────
export class ImageDecryptor {
  constructor(protected sdk: JMComic) {}
  /** path → resolved URL（去重并发请求） */
  private readonly urlCache = new Map<string, Promise<string>>()
  /** comicId → (page → segCount) */
  private readonly segCache = new Map<number, Map<number, number>>()

  private getChunkNumber(page: Numeric, id: Numeric): number {
    const _id = Number(id)
    const _page = Number(page)

    let byId = this.segCache.get(_id)
    if (!byId) {
      byId = new Map()
      this.segCache.set(_id, byId)
    }

    let cached = byId.get(_page)
    if (cached !== undefined) return cached

    const paddedPage = String(_page).padStart(5, '0')
    let key = md5LastCharCode(`${_id}${paddedPage}`)
    key = key % (268850 <= _id && _id <= 421925 ? 10 : 8)
    cached = key <= 9 ? key * 2 + 2 : 10
    byId.set(_page, cached)
    return cached
  }

  public async decryptImage(
    path: string,
    comicId: Numeric,
    pageIndex: Numeric
  ): Promise<{ url: string }> {
    const _id = Number(comicId)
    const _page = Number(pageIndex)

    // GIF 或旧漫画直接返回
    if (path.includes('.gif') || _id < 220980) return { url: path }

    // 并发去重
    const hit = this.urlCache.get(path)
    if (hit) return { url: await hit }

    const { promise, resolve, reject } = Promise.withResolvers<string>()
    this.urlCache.set(path, promise)

    try {
      const blob = await this.sdk.requester.create().get(path).blob()
      const segCount = this.getChunkNumber(_page, _id)
      const url =
        typeof process !== 'undefined' && process.versions?.node
          ? await this.decryptNode(blob, segCount)
          : await this.decryptBrowser(blob, segCount)
      resolve(url)
      return { url }
    } catch (e) {
      this.urlCache.delete(path) // 失败时清除，允许重试
      reject(e)
      throw e
    }
  }

  // ── Node.js：用 sharp 做纯 Buffer 级别的区域裁剪 + 合并 ─────────────────
  private async decryptNode(blob: Blob, segCount: number): Promise<string> {
    const { default: sharp } = await import('sharp')

    const buffer = Buffer.from(await blob.arrayBuffer())
    const img = sharp(buffer)
    const { width, height } = (await img.metadata()) as { width: number; height: number }

    const segH = Math.floor(height / segCount)
    const rem = height % segCount

    // 按重组顺序提取各段（避免多次 decode，用 raw pixel 操作）
    const raw = await img.raw().toBuffer({ resolveWithObject: true })
    const { channels } = raw.info
    const rowBytes = width * channels

    // 预分配目标 Buffer
    const out = Buffer.allocUnsafe(raw.data.length)

    let srcRow = height - segH - rem // 第一段起始行
    let dstRow = 0

    // 第一段（含余数行）
    raw.data.copy(out, dstRow * rowBytes, srcRow * rowBytes, height * rowBytes)
    dstRow += segH + rem

    for (let i = 1; i < segCount; i++) {
      srcRow -= segH
      raw.data.copy(out, dstRow * rowBytes, srcRow * rowBytes, (srcRow + segH) * rowBytes)
      dstRow += segH
    }

    // 重新编码为原格式（PNG/JPEG 自动检测）
    const outBuf = await sharp(out, { raw: { width, height, channels: channels as 1 | 2 | 3 | 4 } })
      .toFormat(raw.info.format as any)
      .toBuffer()

    return `data:image/${raw.info.format};base64,${outBuf.toString('base64')}`
  }

  // ── 浏览器：OffscreenCanvas ────────
  private async decryptBrowser(blob: Blob, segCount: number): Promise<string> {
    const bitmap = await createImageBitmap(blob)
    const { width, height } = bitmap

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!
    drawSegments(ctx, bitmap, width, height, segCount)
    bitmap.close() // 立即释放 GPU 纹理

    const outBlob = await canvas.convertToBlob({ type: blob.type || 'image/png' })
    return this.blobToDataURL(outBlob)
  }
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }
}