import { jmStore } from '@/store'

export const likeComment = (id: string, cid: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm('/comment_vote', { aid: id, cid }, { signal })