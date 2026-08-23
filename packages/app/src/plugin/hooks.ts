import { UniUser } from '@delta-comic/model'
import type { Content } from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'

import { barcode } from '@/adapters/search'
import { contentKeys, pluginName } from '@/constants'
import { runtime } from '@/runtime/PluginRuntime'

export const hooks = {
  onSearchBarcodeSubmit(aim: Content.SearchAim) {
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
}