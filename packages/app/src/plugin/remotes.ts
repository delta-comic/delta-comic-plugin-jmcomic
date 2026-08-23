import type { UniResource } from '@delta-comic/model'
import type { PluginConfigModel } from '@delta-comic/plugin'

import { runtime } from '@/runtime/PluginRuntime'

export const remotes: NonNullable<PluginConfigModel['remotes']> = [
  {
    type: 'remote',
    name: 'jmcomic.remotes.api',
    remotes: [{ name: 'jmcomic.remotes.autoSelect', url: 'auto' }],
    async test(_url, signal) {
      // The host's standard remote probe triggers SDK latency selection for API forks.
      await runtime.jm.fork.autoPickFork(undefined, signal)
    },
  },
  {
    type: 'resource',
    name: 'jmcomic.remotes.images',
    remotes: async () => (await runtime.jm.fork.getForks()).Server.map(url => ({ name: url, url })),
    async test(url, signal) {
      const response = await fetch(`${url}/media/photos/1205243/00001.webp`, {
        method: 'HEAD',
        signal,
      })
      if (!response.ok) throw new Error(`Image fork returned ${response.status}`)
    },
    processors: [
      {
        name: 'comicDecode',
        async call(nowPath: string, resource: UniResource) {
          const comicId = String(resource.$$meta?.comicId ?? '')
          const page = Number(resource.$$meta?.page ?? 1)
          if (!comicId) return [nowPath, false]
          const result = await runtime.jm.image.decryptImage(nowPath, comicId, page, runtime.signal)
          return [result.url, true]
        },
      },
    ],
  },
]