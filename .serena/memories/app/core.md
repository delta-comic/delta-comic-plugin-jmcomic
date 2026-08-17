# App plugin module
- `packages/app/src/main.ts` owns the complete JMComic Delta Comic plugin declaration and composes adapters, Vue components, i18n, models, and runtime hooks.
- `PluginRuntime` owns one `JMComic` instance, abort signal lifecycle, session persistence, preload data, and SDK access.
- `model.remotes` is for API endpoint testing/selection; `model.resource` remains for image resource probing and decoding.
- Current P4 plan direction: use one remote trigger `{ name: 'jmcomic.remotes.autoSelect', url: 'auto' }` whose group `test` calls `runtime.jm.fork.autoPickFork(undefined, signal)`, and remove fork selection from `special` steps.
- Keep tests aligned with the declarative model and lifecycle behavior.