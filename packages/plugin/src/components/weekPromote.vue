<script setup lang="ts">
import { jm } from '@/api'
import { jmStore } from '@/store'
import { useTemp } from '@delta-comic/core'
import type { RPromiseContent } from '@delta-comic/model'
import { SmartAbortController } from '@delta-comic/request'

import { first, isUndefined, last } from 'es-toolkit/compat'
import { watch } from 'vue'
defineProps<{ isActive: boolean; tabbar: any }>()
const temp = useTemp().$apply(
  'weekBest',
  () =>
    [Number(first(jmStore.wb.value?.categories)?.id), last(jmStore.wb.value?.type)?.id] as [
      select?: number,
      selectType?: string,
      source?: RPromiseContent<any, jm.comic.JmItem[]>
    ]
)
const stopper = new SmartAbortController()
watch(
  () => [temp[0], temp[1]] as const,
  ([t0, t1], __, onCancel) => {
    onCancel(() => {
      stopper.abort()
    })
    if (isUndefined(t0) || isUndefined(t1)) return
    temp[2] = jm.api.search.getWeekBestComic(t0, t1, stopper.signal).setProcessor(v => v.list)
    console.log('wb list', temp[2])
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex size-full flex-col overflow-hidden">
    <div class="z-1 flex bg-(--van-background-2) shadow-lg">
      <NSelect
        filterable
        clearable
        v-model:value="temp[0]"
        :options="
          jmStore.wb.value?.categories.map(v => ({
            key: Number(v.id),
            value: Number(v.id),
            label: v.title || v.time
          }))
        "
      />
      <NSelect
        filterable
        clearable
        v-model:value="temp[1]"
        class="w-30!"
        :options="
          jmStore.wb.value?.type.map(v => ({ key: v.id, value: v.id, label: v.title })).toReversed()
        "
      />
    </div>
    <DcWaterfall
      ref="list"
      :source="{ data: temp[2], isEnd: true }"
      v-if="temp[2]"
      class="size-full"
      v-slot="{ item }"
    >
      <Card :item type="small" free-height />
    </DcWaterfall>
  </div>
</template>