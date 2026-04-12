import { uni } from '@delta-comic/model'

export class JmBook extends uni.item.Item {
  override $$meta: { raw: CommonBook; background?: uni.image.RawImage }
  override async like(_signal?: AbortSignal): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  override async report(_signal?: AbortSignal): Promise<any> {
    throw new Error('Method not implemented.')
  }
  override async sendComment(_text: string, _signal?: AbortSignal): Promise<any> {
    window.$message.warning('不支持发送评论')
    throw new Error('Method not implemented.')
  }
  constructor(v: uni.item.RawItem) {
    super(v)
    this.$$meta = <any>v.$$meta
  }
}