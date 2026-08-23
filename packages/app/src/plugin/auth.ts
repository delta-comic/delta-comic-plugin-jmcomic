import { UniUser } from '@delta-comic/model'
import type { User } from '@delta-comic/plugin'
import { type Gender, type LoginUser } from 'jmcomic-sdk'

import { pluginName } from '@/constants'
import { JmUser } from '@/models/items'
import { runtime } from '@/runtime/PluginRuntime'

const setCurrentUser = (login: LoginUser) => {
  const user = JmUser.fromLogin(login)
  UniUser.userBase.set(pluginName, user)
  return user
}

export const restoreUser = async () => {
  const session = runtime.jm.auth.session ?? (await runtime.restoreSession())
  if (!session?.token || !session.user) return false
  setCurrentUser({ username: session.username, user: session.user })
  return true
}

export const login = async (by: User.Method) => {
  const form = await by.form({
    username: { type: 'string', info: 'jmcomic.auth.username' },
    password: { type: 'string', info: 'jmcomic.auth.password' },
  })
  setCurrentUser(await runtime.login(form))
}

export const signUp = async (by: User.Method) => {
  const form = await by.form({
    username: { type: 'string', info: 'jmcomic.auth.username' },
    email: { type: 'string', info: 'jmcomic.auth.email' },
    password: { type: 'string', info: 'jmcomic.auth.password' },
    password_confirm: { type: 'string', info: 'jmcomic.auth.passwordConfirm' },
    gender: {
      type: 'radio',
      comp: 'radio',
      info: 'jmcomic.auth.gender',
      selects: [
        { label: 'jmcomic.gender.male', value: 'Male' },
        { label: 'jmcomic.gender.female', value: 'Female' },
      ],
    },
  })
  await runtime.jm.auth.signUp({ ...form, gender: form.gender as Gender }, runtime.signal)
  setCurrentUser(
    await runtime.login({ username: form.username, password: form.password }, runtime.signal),
  )
}