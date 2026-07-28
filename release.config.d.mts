import type { GlobalConfig } from 'semantic-release'

export const releaseBranches: NonNullable<GlobalConfig['branches']>

declare const releaseConfig: GlobalConfig
export default releaseConfig