import type { UniContentLayoutComponent, UniContentViewComponent } from '@delta-comic/model'
import type { ExposeModel } from '@delta-comic/plugin'

export interface LibLayout extends ExposeModel {
  readonly layout: { readonly Default: UniContentLayoutComponent }
  readonly view: {
    readonly Image: UniContentViewComponent
    readonly Video: UniContentViewComponent
  }
}

declare module '@delta-comic/plugin' {
  interface PluginExposeRegistry {
    layout: LibLayout
  }
}