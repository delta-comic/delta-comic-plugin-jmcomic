import '@/index.css'
import { UserOutlined } from '@vicons/antd'
import {
  BadgeOutlined,
  CategoryOutlined,
  CategoryRound,
  DrawOutlined,
  SearchOutlined
} from '@vicons/material'
import axios, { formToJSON } from 'axios'
import { AES, MD5, enc, mode } from 'crypto-js'
import {
  coreModule,
  definePlugin,
  requireDepend,
  uni,
  Utils,
  type PluginConfigSubscribe
} from 'delta-comic-core'
import { first, inRange, isArray, isEmpty, isString } from 'es-toolkit/compat'

import { jm } from './api'
import { getApiFork, image } from './api/forks'
import { JmBlogPage, JmComicPage } from './api/page'
import Buy from './components/badge/buy.vue'
import BadgeEdit from './components/badge/edit.vue'
import BlogLayout from './components/blogLayout.vue'
import Card from './components/card.vue'
import CommentRow from './components/comment/commentRow.vue'
import Edit from './components/edit.vue'
import Tabbar from './components/tabbar.vue'
import TabbarBlog from './components/tabbarBlog.vue'
import Select from './components/title/select.vue'
import User from './components/user.vue'
import WeekPromote from './components/weekPromote.vue'
import { jmStore } from './store'
import { pluginName } from './symbol'
const testAxios = axios.create({
  timeout: 10000,
  method: 'GET',
  validateStatus(status) {
    return inRange(status, 199, 499)
  }
})
testAxios.interceptors.response.use(
  undefined,
  Utils.request.utilInterceptors.createAutoRetry(testAxios, 2)
)

const { layout } = requireDepend(coreModule)

void definePlugin({
  name: pluginName,
  api: {
    api: {
      forks: getApiFork,
      test: (fork, signal) => testAxios.get(`${fork}/promote_list`, { signal })
    }
  },
  resource: {
    types: [
      {
        test: (url, signal) => axios.get(`${url}/media/photos/1205243/00001.webp`, { signal }),
        urls: image,
        type: 'default'
      }
    ],
    process: { comicDecode: jm.image.decoder }
  },
  onBooted: ins => {
    console.log('setup...', ins, ins.api?.api)
    if (ins.api?.api) {
      const f = ins.api.api
      const api = Utils.request.createAxios(
        () => f,
        {},
        ins => {
          ins.interceptors.request.use(requestConfig => {
            const authorization = jmStore.loginToken.value ?? ''
            const key = Date.now().toString()
            const token = MD5(`${key}185Hcomic3PAPP7R`).toString()
            const tokenParam = `${key},1.7.9`
            requestConfig.jm_key = key
            requestConfig.headers.set('Token', token)
            requestConfig.headers.set('Tokenparam', tokenParam)
            if (authorization) requestConfig.headers.set('Authorization', `Bearer ${authorization}`)
            const baseHeader = { Version: 'v1.2.9' }
            document.cookie += `;AVS=${jmStore.loginAvs.value}`
            for (const key in baseHeader) {
              if (Object.prototype.hasOwnProperty.call(baseHeader, key)) {
                const element = baseHeader[<keyof typeof baseHeader>key]
                requestConfig.headers.set(key, element)
              }
            }
            return requestConfig
          })
          ins.interceptors.response.use(res => {
            const keyTemplates: string[] = ['185Hcomic3PAPP7R', '18comicAPPContent'] // 预定义的密钥模板
            const decrypt = (cipherText: string) => {
              for (const template of keyTemplates) {
                try {
                  const dynamicKey = MD5(`${res.config.jm_key}${template}`).toString()
                  const decrypted = AES.decrypt(cipherText, enc.Utf8.parse(dynamicKey), {
                    mode: mode.ECB
                  })
                  return JSON.parse(decrypted.toString(enc.Utf8))
                } catch {
                  continue
                }
              }
              console.error('[Decryption failed]', res.data, cipherText)
              throw new Error('Decryption failed')
            }
            if (
              isString(res.data) &&
              res.data.startsWith(
                'Could not connect to mysql! Please check your database settings!'
              )
            ) {
              return ins(res.config)
            }
            if (isArray(res.data.data) && res.data.data.length == 0) {
              throw new Error(JSON.stringify(res.data))
            }
            if (!res.data.data) return res
            if (isString(res.data)) {
              res.data = JSON.parse(res.data.replace(/}\[.+/gims, '}'))
            }
            if (isString(res.data.data)) res.data = decrypt(res.data.data)
            const data =
              res.config.data instanceof FormData ? formToJSON(res.config.data) : res.config.data
            console.log('response', res.config.url, data ?? res.config.params ?? {}, '->', res.data)
            return res
          })
          return ins
        }
      )
      jmStore.api.value = api
      Utils.eventBus.SharedFunction.define(
        s => jm.api.search.getRandomComics(s).then(v => v.list),
        pluginName,
        'getRandomProvide'
      )
    }
    return { jm }
  },
  auth: {
    passSelect: async () => {
      console.log(jmStore.loginData)
      return jmStore.loginData.value.password !== '' ? 'logIn' : false
    },
    async logIn(by) {
      if (jmStore.loginData.value.password !== '') var form = jmStore.loginData.value
      else
        var form = (jmStore.loginData.value = await by.form({
          username: { type: 'string', info: '用户名' },
          password: { type: 'string', info: '密码' }
        }))
      const res = await jm.api.auth.login(form)
      jmStore.loginToken.value = res.customUser.user.jwttoken
      jmStore.loginAvs.value = res.customUser.user.s
      jmStore.user.value = res
      console.log('login:', res, jmStore.user.value)
      uni.user.User.userBase.set(pluginName, jmStore.user.value!)
    },
    async signUp(by) {
      const form = await by.form({
        username: { type: 'string', info: '用户名' },
        email: { type: 'string', info: '用户名' },
        password: { type: 'string', info: '密码' },
        password_confirm: { type: 'string', info: '密码' },
        gender: {
          type: 'radio',
          comp: 'radio',
          info: '性别',
          selects: [
            { label: '男', value: 'Male' },
            { label: '女', value: 'Female' }
          ]
        }
      })
      await jm.api.auth.signUp({ ...form, gender: <jm.user.Gender>form.gender })
      jmStore.loginData.value = { password: form.password, username: form.username }
      return await this.logIn(by)
    }
  },
  content: {
    [JmComicPage.contentType]: {
      commentRow: CommentRow,
      contentPage: JmComicPage,
      layout: layout.Default,
      itemCard: Card,
      itemTranslator: raw => new jm.comic.JmItem(raw)
    },
    [JmBlogPage.contentType]: {
      commentRow: CommentRow,
      contentPage: JmBlogPage,
      layout: BlogLayout,
      itemCard: Card,
      itemTranslator: raw => new jm.blog.JmBlog(raw)
    }
  },
  user: {
    card: User,
    edit: Edit,
    syncFavourite: {
      download() {
        return jm.api.user.createFavouriteStream().nextToDone()
      },
      upload(items) {
        return Promise.all(items.map(item => jm.api.user.favouriteComic(item.id)))
      }
    },
    authorIcon: { coser: UserOutlined, draw: DrawOutlined },
    userActionPages: [
      {
        title: '成就',
        items: [
          {
            type: 'button',
            icon: CategoryOutlined,
            key: 'change-badge',
            name: '更改勋章',
            page: BadgeEdit
          },
          { type: 'button', icon: CategoryRound, key: 'all-badge', name: '购买勋章', page: Buy },
          {
            type: 'statistic',
            key: 'coin',
            name: 'coin',
            value: () => jmStore.user.value?.customUser.user.coin ?? NaN
          },
          {
            type: 'statistic',
            key: 'charge',
            name: '充能',
            value: () => jmStore.user.value?.customUser.user.charge ?? ''
          },
          {
            type: 'button',
            icon: BadgeOutlined,
            key: 'change-title',
            name: '更改称号',
            page: Select
          }
        ]
      }
    ],
    authorActions: {
      search: {
        name: '搜索',
        call(author) {
          return Utils.eventBus.SharedFunction.call('routeToSearch', author.label, [
            pluginName,
            'keyword'
          ])
        },
        icon: SearchOutlined
      }
    }
  },
  otherProgress: [
    {
      name: '签到',
      async call(setDescription) {
        setDescription('签到中')
        try {
          await jm.api.user.dailyCheck()
          setDescription('签到成功')
        } catch (error) {
          setDescription('签到失败')
          throw error
        }
      }
    },
    {
      name: '预加载数据',
      async call(setDescription) {
        setDescription('获取分类 & 推荐等...')
        try {
          const [cate, promote, wb, useredit] = await Promise.all([
            jm.api.search.getCategories(),
            jm.api.search.getPromote(),
            jm.api.search.getWeekBestList(),
            jm.api.user.getUser(jmStore.user.value?.id!)
          ])

          console.log('useredit', useredit)
          jmStore.useredit.value = useredit

          console.log('cate', cate)
          uni.content.ContentPage.addCategories(
            pluginName,
            ...cate.categories
              .filter(v => !!v.sub_categories)
              .flatMap(v =>
                v.sub_categories!.map(c => ({
                  title: c.name,
                  namespace: v.name,
                  search: { methodId: 'keyword', input: c.name, sort: '' }
                }))
              ),
            ...cate.blocks.flatMap(v =>
              v.content.map(c => ({
                title: c,
                namespace: v.title,
                search: { methodId: 'keyword', input: c, sort: '' }
              }))
            )
          )

          console.log('wb', wb)
          jmStore.wb.value = wb
          uni.content.ContentPage.addTabbar(pluginName, {
            comp: WeekPromote,
            id: 'weekPromote',
            title: '每周推荐'
          })

          console.log('promote', promote)
          jmStore.promotes.value = promote
          uni.content.ContentPage.addTabbar(
            pluginName,
            ...promote.map(v => ({ title: v.title, id: v.id, comp: Tabbar }))
          )
          setDescription('成功')
        } catch (error) {
          setDescription('失败')
          throw error
        }
      }
    }
  ],
  search: {
    methods: {
      keyword: {
        name: '漫画',
        getStream(input, sort) {
          return jm.api.search.utils.createKeywordStream(input, <jm.SortType>sort)
        },
        sorts: jm.sortMap,
        defaultSort: '',
        async getAutoComplete(_input, _signal) {
          return []
        }
      }
      // category: {
      //   name: '分类',
      //   getStream(input, sort) {
      //     return jm.api.search.utils.createCategoryStream(input, <jm.SortType>sort)
      //   },
      //   sorts: jm.sortMap,
      //   defaultSort: '',
      //   async getAutoComplete(_input, _signal) {
      //     return []
      //   },
      // }
    },
    tabbar: Object.entries(jm.api.blog.blogType).map(v => ({
      comp: TabbarBlog,
      id: v[0],
      title: v[1]
    })),
    hotPage: { levelBoard: jm.api.search.getLevelboard() },
    barcode: [
      {
        name: '漫画',
        match(searchText) {
          return /jm\d+/i.test(searchText)
        },
        async getContent(searchText, signal) {
          const code = searchText.match(/\d+/)?.[0] ?? '350234'
          const info = await jm.api.comic.getComic(code, signal)
          return [info.contentType, info.id, info.thisEp.index, info]
        }
      }
    ]
  },
  subscribe: {
    keyword: {
      getListStream: author => jm.api.search.utils.createKeywordStream(author.label, ''),
      getUpdateList(olds, signal) {
        return diff(this, olds, signal)
      }
    }
  }
})

const diff = async (
  that: PluginConfigSubscribe,
  olds: Parameters<PluginConfigSubscribe['getUpdateList']>[0],
  signal?: AbortSignal
) => {
  const allList = await Promise.all(
    olds.map(async v => {
      const stream = that.getListStream(v.author)
      signal?.addEventListener('abort', () => stream.stop())
      const news = (await stream.next()).value
      if (!news) throw new Error(`[subscribe] ${v.author.label} is void!`)
      return { author: v.author, list: news }
    })
  )
  const changedAuthors = new Array<uni.item.Author>()
  for (const item of allList) {
    const key = item.author.label
    const old = olds.find(o => o.author.label === key)

    const newFirst = first(item.list)
    const oldFirst = first(old?.list)

    let changed = false
    if (oldFirst && newFirst) changed = newFirst.id !== oldFirst.id
    else changed = true
    if (changed) changedAuthors.push(item.author)
  }

  return { isUpdated: isEmpty(changedAuthors), whichUpdated: changedAuthors }
}