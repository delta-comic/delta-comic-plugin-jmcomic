export const pluginName = 'jmcomic'

import { declareDepType } from '@delta-comic/plugin'
import type { LayoutLib } from 'delta-comic-plugin-layout'

export const layoutModule = declareDepType<LayoutLib>('layout') as any