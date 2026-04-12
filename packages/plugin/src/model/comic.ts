import { uni } from '@delta-comic/model'

export class JmItem extends uni.item.Item {
  public override async like(signal?: AbortSignal): Promise<any> {
    return likeComic(this.id, signal)
  }
  public override async report(_signal?: AbortSignal): Promise<any> {
    window.$message.warning('Method not implemented.')
    throw new Error('Method not implemented.')
  }
  public override async sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sendComment(this.id, text, false, signal)
  }
  constructor(v: uni.item.RawItem) {
    super(v)
  }
}