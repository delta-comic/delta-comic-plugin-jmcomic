<script setup lang="ts">
import { jm } from '@/api'
import { jmStore } from '@/store'
import { pluginName } from '@/symbol'
import { CheckCircleOutlineOutlined } from '@vicons/material'
import { until } from '@vueuse/core'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import { isEmpty } from 'es-toolkit/compat'
import { computed } from 'vue'
import { shallowRef } from 'vue'
await until(jmStore.user).toBeTruthy()
const temp = Store.useTemp().$apply('jm:badge', () => ({ badges: jm.api.user.badge.getAll() }))
const inputModel = shallowRef('')
const inputFilter = shallowRef('')

const latestDate = computed(() => temp.badges.data.value?.at(-1)?.begin_time)

const isBuying = shallowRef(false)
const buyBadge = (item: jm.user.BadgeItem) =>
  Utils.message
    .createLoadingMessage('购买中')
    .bind(
      Promise.try(async () => {
        if (isBuying.value) throw '购买中'
        isBuying.value = true
        if (item.done) throw '已被购买'
        if (Number(item.coin) > (jmStore.user.value?.customUser.user.coin ?? 0)) throw 'coin不足'

        await Utils.message.createDialog({
          title: '再次确认',
          content: `你确定花费${item.coin}购买"${item.name}"吗?`,
          positiveText: '确定',
          negativeText: '算了'
        })

        await jm.api.user.badge.buy(item.id)

        jmStore.loginToken.value = undefined
        const user = await jm.api.auth.login(jmStore.loginData.value!)
        jmStore.loginToken.value = user.customUser.user.jwttoken
        jmStore.loginAvs.value = user.customUser.user.s
        jmStore.user.value = user

        const all = jm.api.user.badge.getAll()
        await all
        temp.badges = all

        isBuying.value = false
      })
    )
    .catch(() => {
      isBuying.value = false
    })
</script>

<template>
  <NSpin :show="isBuying" class="!size-full *:!size-full">
    <div
      class="mb-[3px] flex h-[calc(10%-3px)] w-full flex-col items-center rounded-b-lg bg-(--van-background-2)"
    >
      <NInput
        placeholder="输入内容以过滤..."
        v-model:value="inputModel"
        @blur="inputFilter = inputModel"
        class="!w-[calc(100%-8px)]"
      />
      <div class="h-fit w-full pl-2">
        <div class="flex flex-nowrap items-center text-nowrap">
          <NIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path
                  d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"
                ></path>
                <path d="M12 6v2m0 8v2"></path>
              </g>
            </svg>
          </NIcon>
          coin:
          <span class="pl-1 text-(--p-color)">{{ jmStore.user.value?.customUser.user.coin }}</span>
        </div>
      </div>
    </div>
    <Comp.Waterfall
      :col="1"
      :source="{ data: temp.badges, isEnd: true }"
      :data-processor="
        v => v.toReversed().filter(v => isEmpty(inputFilter) || v.name.includes(inputFilter))
      "
      v-slot="{ item }"
      class="!h-9/10 !w-full"
    >
      <button
        class="relative flex h-20 w-full items-center overflow-hidden rounded-lg bg-(--van-background-2)"
        :class="[
          item.done || 'van-haptics-feedback',
          item.done &&
            'opacity-80 after:absolute after:top-0 after:left-0 after:size-full after:bg-(--p-color)/10'
        ]"
        @click="item.done || buyBadge(item)"
        :disabled="item.done"
      >
        <NIcon
          color="var(--p-color)"
          size="130px"
          v-if="item.done"
          class="!absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 text-lg font-bold text-nowrap text-(--p-color) opacity-30"
        >
          <CheckCircleOutlineOutlined />
        </NIcon>
        <div class="h-[calc(100%-10px)] pl-2">
          <Comp.Image
            :src="
              uni.image.Image.create(
                { $$plugin: pluginName, forkNamespace: 'default', path: item.content },
                { width: 1, height: 1 }
              )
            "
            class="aspect-square !size-full"
          />
        </div>
        <div class="relative flex h-full flex-col py-1 pl-1">
          <div
            class="flex flex-nowrap items-center text-[16px] text-nowrap"
            :class="[item.done && '!text-xl font-semibold text-(--p-color)']"
          >
            <NTag
              v-if="!item.done && latestDate == item.begin_time"
              type="primary"
              class="mr-1"
              size="small"
              >新品</NTag
            >
            {{ item.name }}
          </div>
          <div
            class="absolute bottom-0 flex flex-nowrap items-center text-nowrap"
            v-if="!item.done"
          >
            <NIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                  <path
                    d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"
                  ></path>
                  <path d="M12 6v2m0 8v2"></path>
                </g>
              </svg>
            </NIcon>
            coin:
            <span class="pl-1 text-(--p-color)">{{ item.coin }}</span>
          </div>
        </div>
      </button>
    </Comp.Waterfall>
  </NSpin>
</template>