export const pluginName = 'jmcomic'

import type { LayoutPlugin } from 'delta-comic-plugin-layout'

import { declareDependType } from 'delta-comic-core'

export const layoutModule = declareDependType<LayoutPlugin>('layout')