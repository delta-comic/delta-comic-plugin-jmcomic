import '@/index.css'
import { UniUser, type UniItem, type UniItemRaw } from '@delta-comic/model'
import {
  defineDeltaComicPlugin,
  type Content,
  type DCPluginConfig,
  type User,
} from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'
import { BadgeOutlined, EditOutlined, SearchOutlined, TitleOutlined } from '@vicons/material'
import { SortType, type Gender, type LoginUser } from 'jmcomic-sdk'

import { getLayout } from '@/adapters/layout'
import { barcode, jmcomicSubscribe, mapPromoteContent, searchMethods } from '@/adapters/search'
import JmCommentRow from '@/components/JmCommentRow.vue'
import JmItemCard from '@/components/JmItemCard.vue'
import PromoteTab from '@/components/search/PromoteTab.vue'
import WeekBestTab from '@/components/search/WeekBestTab.vue'
import BadgeManager from '@/components/user/BadgeManager.vue'
import JmUserCard from '@/components/user/JmUserCard.vue'
import JmUserEditor from '@/components/user/JmUserEditor.vue'
import TitleManager from '@/components/user/TitleManager.vue'
import { contentKeys, defaultImageForks, pluginName, searchKeys } from '@/constants'
import { jmcomicMessages, translate } from '@/i18n'
import { JmUser, fromCommonComic, translateItem } from '@/models/items'
import { contentPages } from '@/models/pages'
import { runtime } from '@/runtime/PluginRuntime'

const setCurrentUser = (login: LoginUser) => {
  const user = JmUser.fromLogin(login)
  UniUser.userBase.set(pluginName, user)
  return user
}

const restoreUser = async () => {
  const session = runtime.jm.auth.session ?? (await runtime.restoreSession())
  if (!session?.token || !session.user) return false
  setCurrentUser({ username: session.username, user: session.user })
  return true
}

const login = async (by: User.Method) => {
  const form = await by.form({
    username: { type: 'string', info: 'jmcomic.auth.username' },
    password: { type: 'string', info: 'jmcomic.auth.password' },
  })
  setCurrentUser(await runtime.login(form))
}

const signUp = async (by: User.Method) => {
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

const downloadFavorites = async (signal: AbortSignal) => {
  const items: UniItem[] = []
  for (let page = 1; ; page += 1) {
    const result = await runtime.jm.user.getFavoriteList({ page }, signal)
    items.push(...result.list.map(fromCommonComic))
    if (result.list.length === 0 || items.length >= result.total) return items
  }
}

const uploadFavorites = async (items: UniItemRaw[], signal: AbortSignal) => {
  await Promise.all(
    items
      .filter(item => {
        const type = item.contentType
        return Array.isArray(type) && type[0] === pluginName && type[1] === contentKeys.comic
      })
      .map(item => runtime.jm.comic.favorite({ id: item.id }, signal)),
  )
}

const search: Content.Search = {
  methods: Object.values(searchMethods),
  barcode: [barcode],
  async getHotSearch(signal) {
    return (await runtime.jm.promote.getHotTags(signal)).map(input => ({
      input,
      search: { method: searchKeys.keyword },
    }))
  },
}

const categories: Content.Category[] = []

const promotes: Content.Promotes = {
  categories,
  fetchRandomItems: async signal =>
    (await runtime.jm.promote.getRandomProvide(signal)).map(fromCommonComic),
  tabbar: [
    { comp: PromoteTab, id: 'promotes', title: 'jmcomic.search.comic' },
    { comp: WeekBestTab, id: 'week-best', title: 'jmcomic.search.weekly' },
  ],
  hotPageContent: {
    levelboard: [
      {
        id: 'most-viewed',
        name: 'jmcomic.sort.views',
        content: async signal =>
          (
            await runtime.jm.comic.searchByKeyword(
              { keyword: '', order: SortType.TotalViewBest, page: 1 },
              signal,
            )
          ).list.map(fromCommonComic),
      },
      {
        id: 'latest',
        name: 'jmcomic.search.comic',
        content: async signal =>
          (await runtime.jm.promote.getLatest({ page: 1 }, signal)).map(fromCommonComic),
      },
    ],
  },
}

const models: Content.Model[] = Object.entries(contentPages).map(([name, ContentPage]) => ({
  name,
  ItemCard: JmItemCard,
  CommentRow: JmCommentRow,
  get Layout() {
    return getLayout().layout.Default
  },
  ContentPage,
  ItemTranslator: translateItem,
}))

export const jmcomicPluginConfig: DCPluginConfig = {
  name: pluginName,
  i18n: jmcomicMessages,
  model: {
    content: { models, search, promotes },
    expose: { jm: runtime.jm },
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
    social: { subscribe: jmcomicSubscribe },
    special: [
      {
        name: 'jmcomic.progress.fork',
        async call(setDescription) {
          setDescription(translate('jmcomic.progress.fork'))
          await runtime.jm.fork.autoPickFork(undefined, runtime.signal)
        },
      },
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
          categories.splice(
            0,
            categories.length,
            ...(runtime.categories?.categories ?? []).flatMap(category => [
              {
                title: category.name,
                namespace: category.slug,
                search: {
                  input: `category:${category.slug}`,
                  search: { method: searchKeys.keyword, sort: SortType.Relate },
                },
              },
              ...(category.sub_categories ?? []).map(child => ({
                title: child.name,
                namespace: child.slug,
                search: {
                  input: `category:${child.slug}`,
                  search: { method: searchKeys.keyword, sort: SortType.Relate },
                },
              })),
            ]),
          )
        },
      },
    ],
    user: {
      auth: {
        selections: [
          { id: 'login', name: 'jmcomic.auth.login', call: login },
          { id: 'signup', name: 'jmcomic.auth.signup', call: signUp },
        ],
        default: async () => ((await restoreUser()) ? 'login' : false),
      },
      card: JmUserCard,
      edit: JmUserEditor,
      favourites: { download: downloadFavorites, upload: uploadFavorites },
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
      userActions: [
        {
          id: 'search',
          name: 'jmcomic.search.comic',
          icon: SearchOutlined,
          call: author =>
            SharedFunction.call('routeToSearch', author.label, [pluginName, searchKeys.keyword]),
        },
      ],
    },
  },
  hooks: {
    onSearchBarcodeSubmit(aim) {
      if (!barcode.isMatch(aim)) return
      void SharedFunction.call(
        'routeToContent',
        [pluginName, contentKeys.comic],
        aim.input.replace(/\D/g, ''),
        '',
      )
    },
    onUnload() {
      runtime.shutdown()
      UniUser.userBase.delete(pluginName)
    },
    async onUninstall() {
      UniUser.userBase.delete(pluginName)
      await runtime.uninstall()
    },
  },
}

export default defineDeltaComicPlugin(() => jmcomicPluginConfig)

export const jm = runtime.jm

export const getPromoteItems = () => runtime.promotes.flatMap(mapPromoteContent)