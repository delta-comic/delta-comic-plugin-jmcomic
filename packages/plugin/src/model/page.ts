import { uni } from '@delta-comic/model'
import { require } from '@delta-comic/plugin'
import { defineComponent, h } from 'vue'

import { layoutModule, pluginName } from '../symbol'
const { model, view } = require(layoutModule)

export class JmComicPage extends model.ContentImagePage {
  public static contentType = uni.content.ContentPage.contentPages.key.toString([
    pluginName,
    'comic'
  ])
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.contentPages.key.toJSON(
    JmComicPage.contentType
  )
}

export class JmBlogPage extends uni.content.ContentPage {
  public static contentType = uni.content.ContentPage.contentPage.toString([pluginName, 'blog'])
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.contentPage.toJSON(JmBlogPage.contentType)
  public content = PromiseContent.withResolvers<string>()
  public override loadAll() {
    return Promise.resolve(
      this.detail.content.isLoading.value ||
        this.detail.content.loadPromise(
          jm.api.blog.getInfo(this.ep).then(v => {
            const blog = createFullBlogToUniItem(v.info)
            this.eps.resolve([])
            this.recommends.resolve(v.related_blogs?.map(v => createCommonBlogToUniItem(v)) ?? [])
            this.recommendComics.resolve(
              v.related_comics?.map(v => createRecommendToUniItem(v)) ?? []
            )
            this.pid.resolve(`jb${blog.id}`)
            this.detail.resolve(blog)
            this.images.resolve([blog.$cover])
            this.uploader.resolve(new jm.user.BlogUser(blog.$$meta.raw))
            return blog
          })
        )
    )
  }
  public uploader = PromiseContent.withResolvers<uni.user.User>()
  public recommendComics = PromiseContent.withResolvers<uni.item.Item[]>()
  public images = PromiseContent.withResolvers<uni.image.Image[]>()
  public override comments = jm.api.blog.createCommentsStream(this.id)
  public override reloadAll(): any {
    throw new Error('Method not implemented.')
  }
  public override loadAllOffline(_save: any): never {
    throw new Error('Method not implemented.')
  }
  public override exportOffline(): never {
    throw new Error('Method not implemented.')
  }
  public ViewComp = defineComponent<any>(() => {
    return () => h('div')
  })
  constructor(preload: uni.content.PreloadValue, id: string, ep: string) {
    super(preload, id, ep)
  }
}

export class JmBookPage extends uni.content.ContentPage {
  public static contentType = uni.content.ContentPage.contentPage.toString([pluginName, 'book'])
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.contentPage.toJSON(JmComicPage.contentType)
  public override loadAll() {
    return Promise.all([
      this.detail.content.isLoading.value ||
        this.detail.content.loadPromise(
          jm.api.book.get(this.ep).then(v => {
            const blog = createFullBlogToUniItem(v.info)
            this.eps.resolve([])
            this.recommends.resolve(v.related_blogs?.map(v => createCommonBlogToUniItem(v)) ?? [])
            this.recommendComics.resolve(
              v.related_comics?.map(v => createRecommendToUniItem(v)) ?? []
            )
            this.pid.resolve(blog.id)
            this.detail.resolve(blog)
            this.images.resolve([blog.$cover])
            this.uploader.resolve(new jm.user.BlogUser(blog.$$meta.raw))
            return blog
          })
        )
    ])
  }
  public override comments = Stream.create<uni.comment.Comment>(function* () {})
  public override reloadAll(): any {
    throw new Error('Method not implemented.')
  }
  public override loadAllOffline(_save: any): never {
    throw new Error('Method not implemented.')
  }
  public override exportOffline(): never {
    throw new Error('Method not implemented.')
  }
  public ViewComp = defineComponent<any>(() => {
    return () => h('div')
  })
  constructor(preload: uni.content.PreloadValue, id: string, ep: string) {
    super(preload, id, ep)
  }
}

export class JmNovelPage extends uni.content.ContentPage {
  public static contentType = uni.content.ContentPage.contentPage.toString([pluginName, 'novel'])
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.contentPage.toJSON(JmComicPage.contentType)
  public override loadAll() {
    return Promise.all([
      this.detail.content.isLoading.value ||
        this.detail.content.loadPromise(
          jm.api.book.get(this.ep).then(v => {
            const blog = createFullBlogToUniItem(v.info)
            this.eps.resolve([])
            this.recommends.resolve(v.related_blogs?.map(v => createCommonBlogToUniItem(v)) ?? [])
            this.recommendComics.resolve(
              v.related_comics?.map(v => createRecommendToUniItem(v)) ?? []
            )
            this.pid.resolve(blog.id)
            this.detail.resolve(blog)
            this.images.resolve([blog.$cover])
            this.uploader.resolve(new jm.user.BlogUser(blog.$$meta.raw))
            return blog
          })
        )
    ])
  }
  public override comments = Stream.create<uni.comment.Comment>(function* () {})
  public override reloadAll(): any {
    throw new Error('Method not implemented.')
  }
  public override loadAllOffline(_save: any): never {
    throw new Error('Method not implemented.')
  }
  public override exportOffline(): never {
    throw new Error('Method not implemented.')
  }
  public ViewComp = defineComponent<any>(() => {
    return () => h('div')
  })
  constructor(preload: uni.content.PreloadValue, id: string, ep: string) {
    super(preload, id, ep)
  }
}