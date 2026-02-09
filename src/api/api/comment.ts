import { Utils } from 'delta-comic-core'

import { jmStore } from '@/store'

import { _jmComment } from '../comment'

export namespace _jmApiComment {
  const { PromiseContent } = Utils.data

  export const likeComment = PromiseContent.fromAsyncFunction(
    (id: string, cid: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm('/comment_vote', { aid: id, cid }, { signal })
  )
}