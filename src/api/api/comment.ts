import { PromiseContent } from '@delta-comic/model'

import { jmStore } from '@/store'

import { _jmComment } from '../comment'

export namespace _jmApiComment {
  export const likeComment = PromiseContent.fromAsyncFunction(
    (id: string, cid: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm('/comment_vote', { aid: id, cid }, { signal })
  )
}