import { PromiseContent } from '@delta-comic/model'

import { jmStore } from '@/store'

import type { jm as JmType } from '..'
import { _jmUser } from '../user'
export namespace _jmApiAuth {
  export const login = PromiseContent.fromAsyncFunction(
    (data: JmType.auth.LoginData, signal?: AbortSignal) =>
      jmStore.api
        .value!.postForm<JmType.user.RawUserMe>('/login', data, { signal })
        .then<JmType.user.UserMe>(v => new _jmUser.UserMe(v))
  )
  export const signUp = PromiseContent.fromAsyncFunction(
    (data: JmType.auth.SignupData, signal?: AbortSignal) =>
      jmStore.api.value!.post<void>('/register', data, { signal, params: data })
  )
  export const logout = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    jmStore.api.value!.postForm<void>('/logout', undefined, { signal })
  )
}