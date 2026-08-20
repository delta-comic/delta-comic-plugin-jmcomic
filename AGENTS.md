# Delta Comic Agent 指南

## 工具链

- 使用 Vite+（`vp`），不要直接运行 `pnpm`、`vite`、`vitest`、`oxlint` 或 `oxfmt`
  命令。仓库固定使用 Node `25.9.0`、pnpm `12.0.0-rc.3`。
- 拉取依赖变更后运行 `vp install`。CI 使用 `vp install --frozen-lockfile`。
- Vite+ 并非 Vite：工作区脚本通过 `vp run` 运行，例如
  `vp run --filter app dev:web`。本地 Vite+ 文档位于 `node_modules/vite-plus/docs`。
- 本地会话中使用全局 `vp`；仅在没有全局 CLI 时使用 `pnpm exec vp`。

## 验证

- 执行 Web 检查或测试前，先构建应用依赖：`vp run lib-build`。多个包导出构建后的
  `dist` 文件，否则全新检出的仓库可能无法解析这些依赖。
- 完整的 Web 验证流程：依次运行 `vp run lib-build`、`vp check`、
  `vp run -r typecheck`，然后运行 `vp test run`。由于根目录 lint 的类型检查已禁用，
  `vp check` 不能替代显式的工作区类型检查。
- 使用 `vp test run packages/app/test/src/path/file.test.ts` 运行单个测试文件；添加
  `-t 'test name'` 可聚焦单个测试用例。测试监听模式为 `vp test watch <path>`。
- 覆盖率检查命令为 `vp test run --coverage`；根目录阈值为行、函数和语句 75%，分支 70%。

## 架构约束

- 不要手动编辑生成的 `components.d.ts`、`typed-router.d.ts` 组件/路由声明由 Vite 插件生成。

## 仓库约定

- UI 样式使用 Tailwind CSS。普通 CSS 仅用于无法枚举的动态值、`@apply` 或轻量启动画面。
  Vue/组件标签使用 PascalCase。
- 每个新增的应用内用户可见字符串都必须使用 i18n，使用`@delta-comic/plugin`的i18n部分实现。
- 测试应放在生产目录之外，并与源文件路径对应：
  `packages/x/lib/a.ts` -> `packages/x/test/lib/a.test.ts`；根目录脚本使用 `script/test`。
- 格式规范为 2 空格缩进、不使用分号、使用单引号、每行 100 列；运行 `vp fmt`/`vp lint`，
  不要手动重新格式化。Markdown 和生成的声明文件有意排除在格式化范围之外。
- 提交使用 Conventional/Angular 语法和中文描述，例如 `feat(ui): 实现列表组件`；提交必须签名。
  pre-commit 会运行 `vp staged`，对已暂存文件执行 `vp check --fix` 和 cspell。
- 公共包版本统一发布，并从 `packages/*/package.json` 中发现。使用
  `vp run set-ver -- <version>`，不要分别编辑包含版本号的清单文件。分支/发布操作记录在
  `docs/release-workflow.md` 中，并且必须先进行 dry run。
- 在做完任何的任务后都必须立刻提交保存进度，不是等多个任务完成后集中提交。
- 当一项任务可能有库能实现时，最好由库实现，比如日期格式化由`dayjs`实现，这也要求了你在做事前应当从网络搜索已有实现，而不是重复造轮子。
- 如果不是极端情况，绝对！绝对！不要使用强制类型转换，比如`xxx as unknown as ttt`，除非经过验证确实会报错且无法修复且逻辑正常！
- 结合上一点，项目看中的就是"类型安全"，避免滥用`any`，
  但是如果为了省下一个语义正确逻辑无误的`any`就写很多的重复代码/使用很多`as`断言/机械的换为`unknown`，本质是过度设计，也应当避免。
  全部类型约束也是很重要的，最好实现端到端类型类型覆盖，
  比如`createForm(form: FormRuls[]): FormInst`可以优化为`createForm<T extends FormRuls[]>(form: T): FormInst<T>`，
  这对于接下来的比如`FormResult<T>`就很有用，可以给出到字段级别的类型覆盖，而旧的方案很难做到。
  但是，不代表任何情况下泛型都是有用的，比如:
  ```ts
  async function countDb<TB extends keyof DB, O extends object>(
    sql: SelectQueryBuilder<DB, TB, O>,
  ) {
    const v = await sql.select(db => db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow()
    return v.count
  }
  ```
  很明显，`TB`和`O`都没有在后续和返回中起到任何必要的作用，所以这是过度设计，所以应当改为:
  ```ts
  async function countDb(
    sql: SelectQueryBuilder<DB, keyof DB, object>,
  ) {
    const v = await sql.select(db => db.fn.countAll<number>().as('count')).executeTakeFirstOrThrow()
    return v.count
  }
  ```
- 对于上一点的补充，对于一些全局类型，将来会由外部注册之类的情况，可以预先暴露`interface`，结合ts的Module Augmentation功能实现类型安全。
- 不要滥用`as`断言，
  假设对于`<T extends object>(arg: T): number`的函数签名，内部使用了断言`(arg as Struct<object>).toJSON()`，
  这就导致了，若`arg`不是`Struct`，则代码会在运行时报错，所以，函数签名应当改为:
  `<T extends Struct<object>>(arg: T): number`。
- `as`断言不止`as any`，比如`(keys: readonly unknown[])=> [...static, ...keys] as EntryKey`，此时这种类型转换也不能保证正确，
  应当改为`(keys: EntryKey[])=> [...foo, ...keys]`