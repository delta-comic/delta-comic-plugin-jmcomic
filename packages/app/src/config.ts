import { ConfigPointer } from '@delta-comic/plugin'

export const templateConfig = new ConfigPointer(
  'template',
  { enabled: { type: 'switch', defaultValue: true, info: 'template.config.enabled' } },
  'template.config.title',
)