import { uni } from '@delta-comic/model'
import { require, type InferDependType } from '@delta-comic/plugin'

import { layoutModule } from '../symbol'

const { model, view } = require(layoutModule)

export class JmComicPage extends model.ContentImagePage {}

export class JmBlogPage extends uni.content.ContentPage {}

export class JmNovelPage extends uni.content.ContentPage {}