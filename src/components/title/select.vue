<script setup lang="ts">
import { jm } from '@/api'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import { until } from '@vueuse/core'
import { computed, triggerRef } from 'vue'
import { shallowRef } from 'vue'
import { jmStore } from '@/store'
import { pluginName } from '@/symbol'
await until(jmStore.user).toBeTruthy()
const temp = Store.useTemp().$apply('jm:change-title', () => ({ all: jm.api.user.title.getAll() }))
const isChanging = shallowRef(false)
const change = (item: string) =>
  Utils.message
    .createLoadingMessage('更换中')
    .bind(
      Promise.try(async () => {
        if (isChanging.value || !temp.all.data.value) throw '更换中'
        isChanging.value = true

        await jm.api.user.title.set(temp.all.data.value.find(v => v.content == item)?.id ?? '')

        jmStore.user.value!.customUser.user.level_name = item
        uni.user.User.userBase.set(pluginName, jmStore.user.value!)
        triggerRef(jmStore.user)

        const all = jm.api.user.title.getAll()
        await all
        temp.all = all

        isChanging.value = false
      })
    )
    .catch(() => {
      isChanging.value = false
    })

const selectTitle = shallowRef(jmStore.user.value?.customUser.user.level_name ?? '')
const previewUser = computed(
  () =>
    new jm.user.UserMe({ ...jmStore.user.value!.customUser.user, level_name: selectTitle.value })
)
</script>

<template>
  <NSpin :show="isChanging" class="!size-full *:!size-full">
    <Comp.Content :source="temp.all" class="flex h-full flex-col" v-if="jmStore.user">
      <div class="flex h-[calc(100%-40px)] w-full flex-col">
        <NCard title="预览" size="small">
          <User :user="previewUser" isSmall />
        </NCard>
        <NScrollbar class="flex min-h-0 flex-1 justify-around">
          <NGrid :cols="3" v-if="temp.all.data.value">
            <NGi
              v-for="item of temp.all.data.value"
              class="van-hairline--surround relative h-16 w-full !bg-(--van-background-2) pl-2 before:bg-transparent before:transition-all"
              @click="item.done && (selectTitle = item.content)"
              :class="[
                !item.done &&
                  'before:absolute before:top-0 before:left-0 before:size-full before:!bg-(--van-background-2)/50',
                selectTitle == item.content &&
                  'before:absolute before:top-0 before:left-0 before:size-full before:!bg-(--p-color)/20'
              ]"
            >
              <div class="flex size-full flex-col items-start justify-around">
                <div class="text-[16px]">{{ item.content }}</div>
                <div class="text-xs text-(--van-text-color-2)">{{ item.name }}</div>
              </div>
              <div
                class="absolute right-1 bottom-1 rounded-full bg-(--van-background-2) px-1 py-0.5 text-xs text-(--p-color) shadow"
                v-if="item.content == jmStore.user.value?.customUser.user.level_name"
              >
                正式使用
              </div>
            </NGi>
          </NGrid>
        </NScrollbar>
      </div>
      <VanButton
        @click="change(selectTitle)"
        block
        class="!h-10 !rounded-none"
        size="large"
        type="primary"
        >确认更新
      </VanButton>
    </Comp.Content>
  </NSpin>
</template>