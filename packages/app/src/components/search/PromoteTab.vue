<script setup lang="ts">
import type { UniItem } from '@delta-comic/model'
import type { Search } from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'
import { computed } from 'vue'

import { mapPromoteContent } from '@/adapters/search'
import JmItemCard from '@/components/JmItemCard.vue'
import { runtime } from '@/runtime/PluginRuntime'

interface Props {
  isActive: boolean
  tabbar: Search.Tabbar
}

const props = defineProps<Props>()
const items = computed(() => {
  const promote = runtime.promotes.find(entry => String(entry.id) === props.tabbar.id)
  return promote ? mapPromoteContent(promote) : []
})

const openItem = (item: UniItem) =>
  SharedFunction.call('routeToContent', item.contentType, item.id, item.$thisEp.id, item)
</script>

<template>
  <div v-show="isActive" class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-5">
    <JmItemCard
      v-for="item in items"
      :key="`${String(item.contentType)}:${item.id}`"
      :item="item"
      @click="openItem(item)"
    />
  </div>
</template>