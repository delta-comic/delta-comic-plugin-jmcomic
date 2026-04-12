import { uni } from '@delta-comic/model'
import type { CommonBlog, FullBlog } from 'jmcomic-sdk'

import { sdk } from '../sdk'

export class JmBlog extends uni.item.Item {
  override $$meta: { raw: CommonBlog | FullBlog }
  override like(signal?: AbortSignal): Promise<any> {
    return sdk.blog.like({ id: this.id }, signal)
  }
  override report(_signal?: AbortSignal): Promise<any> {
    throw new Error('Method not implemented.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sdk.blog.sendComment({ id: this.id, content: text }, signal)
  }
  constructor(v: uni.item.RawItem) {
    super(v)
    this.$$meta = <any>v.$$meta
  }
}