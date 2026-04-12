<script setup lang="ts">
import { jm } from '@/api'
import { jmStore } from '@/store'
import type { Search } from '@delta-comic/plugin'
import { useResizeObserver, until } from '@vueuse/core'

import { isEmpty } from 'es-toolkit/compat'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useRouter } from 'vue-router'
import { DcWaterfall } from '@delta-comic/ui'
import { useTemp } from '@delta-comic/core'
import type { RStream } from '@delta-comic/model'

const $props = defineProps<{ isActive: boolean; tabbar: Search.Tabbar }>()
const $router = useRouter()

const list = shallowRef<ComponentExposed<typeof DcWaterfall>>()
const temp = useTemp()
const orderStoreSaveTemp = temp.$applyRaw(
  `orderJmStoreSave`,
  () => new Map<string, RStream<jm.comic.JmItem>>()
)
const orderScrollSaveTemp = temp.$applyRaw(`orderJmScoreSave`, () => new Map<string, number>())
const containBound = ref<DOMRectReadOnly>()
useResizeObserver(
  () => <HTMLDivElement | null>list.value?.scrollParent?.firstElementChild,
  ([b]) => (containBound.value = b.contentRect)
)
onMounted(async () => {
  if (!isEmpty(dataSource.value.data.value)) {
    await until(() => (containBound.value?.height ?? 0) > 8).toBeTruthy()
    list.value?.scrollParent?.scroll(0, orderScrollSaveTemp.get($props.tabbar.id) ?? 0)
  }
})
const stop = $router.beforeEach(() => {
  stop()
  orderScrollSaveTemp.set($props.tabbar.id, list.value?.scrollTop ?? 0)
})
const dataSource = computed(() => {
  if (!orderStoreSaveTemp.has($props.tabbar.id))
    orderStoreSaveTemp.set(
      $props.tabbar.id,
      jm.api.search
        .createPromoteStream(Number($props.tabbar.id))
        .setupData(jmStore.promotes.value?.find(v => v.id == $props.tabbar.id)?.$content ?? [])
    )
  return orderStoreSaveTemp.get($props.tabbar.id)!
})
</script>

<template>
  <DcWaterfall :source="dataSource" v-slot="{ item }" ref="list">
    <Card :item free-height type="small" />
  </DcWaterfall>
</template>