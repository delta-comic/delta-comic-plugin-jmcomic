# jmcomic-sdk source map
- pnpm monorepo with `packages/sdk` (jmcomic-sdk core client) and `packages/app` (@delta-comic/plugin-jmcomic).
- Plugin entry/config: `packages/app/src/main.ts`; runtime wrapper: `packages/app/src/runtime/PluginRuntime.ts`.
- App i18n: `packages/app/src/i18n/index.ts` and `packages/app/src/i18n/locales/zh-CN.ts`; plugin messages are registered as a `PluginLocaleMessages` object.
- SDK fork selection lives in `packages/sdk/src/modules/fork.ts`; successful `autoPickFork()` sets `config.requestUsingFork`.
- Planning artifacts are isolated under `.planning/<id>/`; active plan pointer is `.planning/.active_plan`.
- Related notes: `mem:tech_stack`, `mem:suggested_commands`, `mem:conventions`, `mem:task_completion`.