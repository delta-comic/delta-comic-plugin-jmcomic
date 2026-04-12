<script setup lang="ts">
import { computed } from 'vue'
import { jm } from '@/api'
import { require } from '@delta-comic/plugin'
import { layoutModule } from '@/symbol'
import type { uni } from '@delta-comic/model'
const $props = defineProps<{
  comment: jm.comment.Comment
  item?: uni.item.Item
  parentComment?: uni.comment.Comment
}>()
const raw = computed(() => $props.comment.sender.customUser)
const $emit = defineEmits<{ click: [c: uni.comment.Comment]; clickUser: [u: uni.user.User] }>()
defineSlots<{ default(): void }>()

const {
  component: {
    comment: { CommentRow }
  }
} = require(layoutModule)
</script>

<template>
  <CommentRow
    :item
    :comment
    :parentComment
    @click="$emit('click', $event)"
    @clickUser="$emit('clickUser', $event)"
  >
    <template #userExtra>
      <span class="mr-1 text-[11px] font-normal text-(--nui-primary-color)">
        Lv{{ raw.expInfo.level }}
      </span>
    </template>
  </CommentRow>
</template>