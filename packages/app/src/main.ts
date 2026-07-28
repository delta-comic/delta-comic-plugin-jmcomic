import '@/index.css'
import { UniUser, type UniItem, type UniItemRaw } from '@delta-comic/model'
import { definePlugin, Global, type PluginConfig, type Search } from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'
import {
  BadgeOutlined,
  BrushOutlined,
  EditOutlined,
  PersonOutlined,
  SearchOutlined,
  TitleOutlined,
} from '@vicons/material'
import { SortType, type Gender, type LoginUser } from 'jmcomic-sdk'

import {
  barcode,
  comicSearch,
  createSubscribe,
  creatorSearch,
  mapPromoteContent,
  novelSearch,
  searchMethods,
} from '@/adapters/search'
import JmContentLayout from '@/components/content/JmContentLayout.vue'
import JmCommentRow from '@/components/JmCommentRow.vue'
import JmItemCard from '@/components/JmItemCard.vue'
import PromoteTab from '@/components/search/PromoteTab.vue'
import WeekBestTab from '@/components/search/WeekBestTab.vue'
import BadgeManager from '@/components/user/BadgeManager.vue'
import JmUserCard from '@/components/user/JmUserCard.vue'
import JmUserEditor from '@/components/user/JmUserEditor.vue'
import TitleManager from '@/components/user/TitleManager.vue'
import { contentKeys, defaultImageForks, pluginName, searchKeys, subscribeKeys } from '@/constants'
import { jmcomicMessages, translate } from '@/i18n'
import { JmUser, fromCommonComic, translateItem } from '@/models/items'
import { contentPages } from '@/models/pages'
import { runtime } from '@/runtime/PluginRuntime'

const setCurrentUser = (login: LoginUser) => {
  const user = JmUser.fromLogin(login)
  UniUser.userBase.set(pluginName, user)
  return user
}

const restoreOrLogin = async (by: Parameters<NonNullable<PluginConfig['auth']>['logIn']>[0]) => {
  const restored = await runtime.validateSession()
  if (restored) return setCurrentUser(restored)
  const form = await by.form({
    username: { type: 'string', info: 'jmcomic.auth.username' },
    password: { type: 'string', info: 'jmcomic.auth.password' },
  })
  return setCurrentUser(await runtime.login(form))
}

const downloadFavorites = async () => {
  const items: UniItem[] = []
  for (let page = 1; ; page += 1) {
    const result = await runtime.jm.user.getFavoriteList({ page })
    items.push(...result.list.map(fromCommonComic))
    if (result.list.length === 0 || items.length >= result.total) return items
  }
}

const uploadFavorites = (items: UniItemRaw[]) =>
  Promise.all(
    items
      .filter(item => {
        const type = item.contentType
        return Array.isArray(type) && type[0] === pluginName && type[1] === contentKeys.comic
      })
      .map(item => runtime.jm.comic.favorite({ id: item.id })),
  )

const searchConfig: Search.Config = {
  methods: searchMethods,
  barcode: [barcode],
  fetchRandomItems: async signal =>
    (await runtime.jm.promote.getRandomProvide(signal)).map(fromCommonComic),
  hotSearch: [
    {
      title: 'jmcomic.item.tag',
      target: { method: searchKeys.keyword },
      async fetchItems(signal) {
        return (await runtime.jm.promote.getHotTags(signal)).map(tag => ({ text: tag }))
      },
    },
  ],
  hotPage: {
    levelBoard: [
      {
        name: 'jmcomic.sort.views',
        content: async signal =>
          (
            await runtime.jm.comic.searchByKeyword(
              { keyword: '', order: SortType.TotalViewBest, page: 1 },
              signal,
            )
          ).list.map(fromCommonComic),
      },
    ],
    mainListCard: [
      {
        name: 'jmcomic.search.comic',
        content: async signal =>
          (await runtime.jm.promote.getLatest({ page: 1 }, signal)).map(fromCommonComic),
      },
    ],
  },
}

const registerPreloadedNavigation = () => {
  const categories = runtime.categories?.categories ?? []
  Global.addCategories(
    pluginName,
    ...categories.flatMap(category => [
      {
        title: category.name,
        namespace: category.slug,
        search: {
          methodId: searchKeys.keyword,
          input: `category:${category.slug}`,
          sort: SortType.Relate,
        },
      },
      ...(category.sub_categories ?? []).map(child => ({
        title: child.name,
        namespace: child.slug,
        search: {
          methodId: searchKeys.keyword,
          input: `category:${child.slug}`,
          sort: SortType.Relate,
        },
      })),
    ]),
  )

  const tabbar: Search.Tabbar[] = runtime.promotes.map(promote => ({
    comp: PromoteTab,
    id: String(promote.id),
    title: promote.title,
  }))
  if (runtime.weekBest) {
    tabbar.push({ comp: WeekBestTab, id: 'week-best', title: 'jmcomic.search.weekly' })
  }
  Global.addTabbar(pluginName, ...tabbar)
}

export const jmcomicPluginConfig: PluginConfig = {
  name: pluginName,
  i18n: jmcomicMessages,
  api: {
    api: {
      async forks() {
        const forks = await runtime.jm.fork.getForks(runtime.signal)
        return forks.Setting.map(value => (URL.canParse(value) ? value : `https://${value}`))
      },
      test: (fork, signal) => runtime.testFork(fork, signal),
    },
  },
  resource: {
    types: [
      {
        type: 'default',
        urls: [...defaultImageForks],
        async test(url, signal) {
          const response = await fetch(`${url}/media/photos/1205243/00001.webp`, {
            method: 'HEAD',
            signal,
          })
          if (!response.ok) throw new Error(`Image fork returned ${response.status}`)
        },
      },
    ],
    process: {
      async comicDecode(nowPath, resource) {
        const comicId = String(resource.$$meta?.comicId ?? '')
        const page = Number(resource.$$meta?.page ?? 1)
        if (!comicId) return [nowPath, false]
        const result = await runtime.jm.image.decryptImage(nowPath, comicId, page, runtime.signal)
        return [result.url, true]
      },
    },
  },
  content: Object.fromEntries(
    Object.entries(contentPages).map(([key, contentPage]) => [
      key,
      {
        itemCard: JmItemCard,
        commentRow: JmCommentRow,
        layout: JmContentLayout,
        contentPage,
        itemTranslator: translateItem,
      },
    ]),
  ),
  auth: {
    async passSelect() {
      const session = runtime.jm.auth.session ?? (await runtime.restoreSession())
      return session?.token && session.user ? 'logIn' : false
    },
    logIn: restoreOrLogin,
    async signUp(by) {
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
      return setCurrentUser(
        await runtime.login({ username: form.username, password: form.password }, runtime.signal),
      )
    },
  },
  search: searchConfig,
  subscribe: {
    [subscribeKeys.comicAuthor]: createSubscribe(comicSearch),
    [subscribeKeys.novelAuthor]: createSubscribe(novelSearch),
    [subscribeKeys.creator]: createSubscribe(creatorSearch),
  },
  user: {
    card: JmUserCard,
    edit: JmUserEditor,
    authorIcon: { coser: PersonOutlined, draw: BrushOutlined },
    syncFavourite: { download: downloadFavorites, upload: uploadFavorites },
    userActionPages: [
      {
        title: 'jmcomic.user.achievements',
        items: [
          {
            type: 'button',
            icon: EditOutlined,
            key: 'profile',
            name: 'jmcomic.user.edit',
            page: JmUserEditor,
          },
          {
            type: 'button',
            icon: BadgeOutlined,
            key: 'badges',
            name: 'jmcomic.user.badges',
            page: BadgeManager,
          },
          {
            type: 'button',
            icon: TitleOutlined,
            key: 'titles',
            name: 'jmcomic.user.titles',
            page: TitleManager,
          },
          {
            type: 'statistic',
            key: 'coin',
            name: 'jmcomic.user.coin',
            value: () => Number(runtime.jm.auth.session?.user?.coin ?? 0),
          },
          {
            type: 'statistic',
            key: 'charge',
            name: 'jmcomic.user.charge',
            value: () => String(runtime.jm.auth.session?.user?.charge ?? ''),
          },
        ],
      },
    ],
    userActions: {
      search: {
        name: 'jmcomic.search.comic',
        icon: SearchOutlined,
        call: author =>
          SharedFunction.call('routeToSearch', author.label, [pluginName, searchKeys.keyword]),
      },
    },
  },
  otherProgress: [
    {
      name: 'jmcomic.progress.checkIn',
      async call(setDescription) {
        if (!runtime.jm.auth.session?.user) return
        setDescription(translate('jmcomic.progress.checkIn'))
        try {
          await runtime.jm.user.dailyCheck(runtime.signal)
          setDescription(translate('jmcomic.progress.checkInDone'))
        } catch {
          // Repeated check-ins are expected and must not prevent the plugin from loading.
        }
      },
    },
    {
      name: 'jmcomic.progress.preload',
      async call(setDescription) {
        setDescription(translate('jmcomic.progress.categories'))
        await runtime.preload()
        registerPreloadedNavigation()
      },
    },
  ],
  async onBooted(ins) {
    runtime.start(ins.api?.api)
    await runtime.restoreSession()
    const session = runtime.jm.auth.session
    if (session?.user) setCurrentUser({ username: session.username, user: session.user })
    return { jm: runtime.jm }
  },
  onUnload() {
    runtime.shutdown()
    UniUser.userBase.delete(pluginName)
    Global.removeOwnedRegistrations(pluginName)
  },
  async onUninstall() {
    UniUser.userBase.delete(pluginName)
    Global.removeOwnedRegistrations(pluginName)
    await runtime.uninstall()
  },
} satisfies PluginConfig

export default definePlugin(jmcomicPluginConfig)

export const jm = runtime.jm

export const getPromoteItems = () => runtime.promotes.flatMap(mapPromoteContent)