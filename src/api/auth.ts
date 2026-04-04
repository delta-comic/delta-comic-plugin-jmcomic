import type { LoginData, SignupData } from '@/model/auth'
import { UserMe, type RawUserMe } from '@/model/user'
import { jmStore } from '@/store'

export const login = (data: LoginData, signal?: AbortSignal) =>
  jmStore.api.value!.postForm<RawUserMe>('/login', data, { signal }).then(v => new UserMe(v))

export const signUp = (data: SignupData, signal?: AbortSignal) =>
  jmStore.api.value!.post<void>('/register', data, { signal, params: data })

export const logout = (signal?: AbortSignal) =>
  jmStore.api.value!.postForm<void>('/logout', undefined, { signal })