declare module '@delta-comic/delta-comic-plugin-layout' {
  import type { UniContentLayoutComponent, UniContentViewComponent } from '@delta-comic/model'

  export interface LibLayout {
    layout: { Default: UniContentLayoutComponent }
    view: { Image: UniContentViewComponent; Video: UniContentViewComponent }
  }
}