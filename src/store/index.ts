import { useNativeStore } from '@delta-comic/db'
import type { Requester } from '@delta-comic/request'
import { ref, shallowRef } from 'vue'

import type { jm } from '@/api'
import { pluginName } from '@/symbol'
export namespace jmStore {
  export const api = shallowRef<Requester>()
  export const loginToken = shallowRef<string | undefined>()
  export const loginAvs = shallowRef<string | undefined>()
  export const loginData = useNativeStore<jm.auth.LoginData>(pluginName, 'auth', {
    username: '',
    password: ''
  })
  export const user = shallowRef<jm.user.UserMe>()
  export const useredit = ref<jm.user.UserEdit>()

  export const promotes = shallowRef<jm.search.Promote[]>()
  export const wb = shallowRef<jm.search.WeekBestList>()
}
window.$api.jmStore = jmStore