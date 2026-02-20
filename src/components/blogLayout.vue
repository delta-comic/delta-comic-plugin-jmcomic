<script setup lang="ts">
import { jm } from '@/api'
import { JmBlogPage } from '@/api/page'
import { layoutModule, pluginName } from '@/symbol'
import { parseBlog } from '@/utils/blog'
import { SharedFunction } from '@delta-comic/core'
import { PromiseContent, uni } from '@delta-comic/model'
import { require } from '@delta-comic/plugin'
import { LikeFilled } from '@vicons/antd'
import { ArrowBackIosRound, ChatBubbleOutlineOutlined, PlusRound } from '@vicons/material'
import { isEmpty } from 'es-toolkit/compat'
import { NScrollbar } from 'naive-ui'
import { computed, shallowRef } from 'vue'

const $props = defineProps<{ page: JmBlogPage }>()
const union = computed(() => <jm.blog.JmBlog>$props.page.union.value)
const raw = computed(() => union.value.$$meta.raw)
const parser = new DOMParser()
const content = computed(() =>
  parseBlog(parser.parseFromString(`<div>${raw.value.content}</div>`, 'text/html'))
)
const user = computed(() => new jm.user.BlogUser(raw.value))
const createURL = (url: string) => new URL(url)

const isLiked = shallowRef(union.value.isLiked ?? false)
const handleLike = PromiseContent.fromAsyncFunction(() => jm.api.blog.likeBlog(union.value.id))

const showComment = shallowRef(union.value.isLiked ?? false)

const {
  component: {
    comment: { Comment },
    FavouriteSelect
  },
  helper: { createDateString }
} = require(layoutModule)
</script>

<template>
  <NScrollbar class="relative h-screen! w-full overflow-x-hidden bg-(--van-background-2) pb-13">
    <div class="relative flex h-15 w-full items-center">
      <NButton text type="tertiary" @click="$router.back()" class="absolute! left-4">
        <template #icon>
          <NIcon size="30px">
            <ArrowBackIosRound />
          </NIcon>
        </template>
      </NButton>
    </div>
    <div class="w-full px-4 text-xl font-semibold">
      {{ union.title }}
    </div>
    <div class="relative flex h-15 w-full items-center px-4">
      <DcImage :src="user.avatar" class="aspect-square! size-12!" round />
      <div class="ml-1 flex h-full w-full flex-col gap-0.5 py-3">
        <div class="text-sm font-semibold">{{ user.name }}</div>
        <div class="text-xs text-(--van-text-color-2)">
          {{ createDateString(union.$updateTime) }}
        </div>
      </div>
      <NButton size="tiny" ghost type="primary" class="absolute! right-4">
        <template #icon>
          <NIcon>
            <PlusRound />
          </NIcon>
        </template>
        关注
      </NButton>
    </div>
    <div v-for="p of content" class="w-full px-4 text-lg!" ref="content">
      <template v-if="p.type == 'textSet'">
        <span v-for="t in p.text" :class="[t.style == 'bold' && 'font-bold']">
          <NButton
            text
            size="large"
            @click="SharedFunction.call('routeToContent', t.link.content, t.link.id, t.link.ep)"
            v-if="t.link"
            type="primary"
          >
            {{ t.text }}
          </NButton>
          <template v-else>{{ t.text }}</template>
        </span>
      </template>
      <template v-else-if="p.type == 'img'">
        <DcImage
          :src="
            uni.image.Image.create(
              { $$plugin: pluginName, forkNamespace: 'default', path: createURL(p.src).pathname },
              p.aspect
            )
          "
          previewable
          class="w-full! bg-(--van-background)!"
        />
      </template>
      <template v-else-if="p.type == 'empty'">
        <NDivider />
      </template>
    </div>
    <div class="mb-2 flex w-full flex-wrap gap-1 px-4 text-lg!">
      <NButton
        text
        size="large"
        v-for="tag of union.categories"
        type="primary"
        @click="
          SharedFunction.call(
            'routeToSearch',
            tag.search.keyword,
            [pluginName, tag.search.source],
            tag.search.sort
          )
        "
      >
        #{{ tag.name }}
      </NButton>
    </div>
    <div
      class="van-hairline--top mb-2 flex w-full flex-wrap gap-1 px-4"
      v-if="!isEmpty(page.recommends.content.data.value)"
    >
      <div class="text-lg text-(--p-color)">相关文章</div>
      <Card free-height :item v-for="item in page.recommends.content.data.value" />
    </div>
    <div
      class="van-hairline--top mb-2 flex w-full flex-wrap gap-1 px-4"
      v-if="!isEmpty(page.recommendComics.content.data.value)"
    >
      <div class="text-lg text-(--p-color)">相关漫画</div>
      <Card free-height :item v-for="item in page.recommendComics.content.data.value" />
    </div>
  </NScrollbar>
  <div
    class="van-hairline--top fixed! bottom-0 flex h-13 w-full items-center justify-around bg-(--van-background-2)"
  >
    <Sender :item="union" :aim="union" />
    <DcToggleIcon
      padding
      size="27px"
      :icon="ChatBubbleOutlineOutlined"
      dis-changed
      @click="showComment = true"
    >
      {{ union.commentNumber || '评论' }}
    </DcToggleIcon>
    <DcToggleIcon padding size="27px" v-model="isLiked" @click="handleLike" :icon="LikeFilled">
      {{ union.likeNumber ?? '喜欢' }}
    </DcToggleIcon>
    <FavouriteSelect :item="union" />
  </div>
  <DcPopup v-model:show="showComment" class="h-[90vh] w-full" round position="bottom">
    <Comment :item="union" :comments="$props.page.comments" class="h-full" />
  </DcPopup>
</template>