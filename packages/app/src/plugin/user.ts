import type { UserModel } from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'
import { BadgeOutlined, EditOutlined, SearchOutlined, TitleOutlined } from '@vicons/material'

import BadgeManager from '@/components/user/BadgeManager.vue'
import JmUserCard from '@/components/user/JmUserCard.vue'
import JmUserEditor from '@/components/user/JmUserEditor.vue'
import TitleManager from '@/components/user/TitleManager.vue'
import { pluginName, searchKeys } from '@/constants'
import { login, restoreUser, signUp } from '@/plugin/auth'
import { downloadFavorites, uploadFavorites } from '@/plugin/favourites'
import { runtime } from '@/runtime/PluginRuntime'

export const user: UserModel = {
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
}