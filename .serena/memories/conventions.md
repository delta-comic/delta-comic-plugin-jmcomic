# Project conventions
- User-visible plugin strings must be i18n keys, generally under `jmcomic.*`; runtime callbacks use `translate()` from `packages/app/src/i18n`.
- This plugin currently exposes only `zh-CN`; keep `PluginLocaleMessages` locale map Simplified Chinese only unless explicitly requested otherwise.
- Delta Comic plugin code imports only top-level `@delta-comic/*` package exports; avoid package self-imports and subpaths.
- Plugin config is assembled in `main.ts` and exported through `defineDeltaComicPlugin`; model fields use the Delta Comic contract (`content`, `remotes`, `resource`, `social`, `special`, `user`, `expose`).
- SDK fork behavior is intentionally reusable: `runtime.jm.fork.autoPickFork(undefined, signal)` is the established call shape.
- Keep `resource` image CDN probing/decoding separate from API `remotes` probing.
- Tests commonly bind `jmcomicPluginConfig.model!` and use `vi.spyOn` with cleanup in `afterEach`.