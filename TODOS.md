# Delta Comic v3 迁移清单

本轮迁移已完成。发布验收记录以 Git 提交、GitHub Actions 与 prerelease 资产为准。

- [x] 以 `packages/app` 为唯一插件入口，删除不可运行的旧 `packages/plugin`。
- [x] 保留并重构 `packages/sdk`；统一请求、分流、会话、分页、错误和响应边界。
- [x] 保留生产验证请求头协议，不写入内置测试账号或持久化密码。
- [x] 拆分纯图片分段逻辑、浏览器适配器与独立 Node/Sharp 子路径。
- [x] 对齐 Delta Comic `3.0.0-next.6` 插件协议和五个内容路由。
- [x] 实现漫画、图文、小说、创作者与画册内容映射和结构化阅读。
- [x] 实现搜索、分类、榜单、标签、推荐、JM 编号和作者订阅。
- [x] 实现登录注册、令牌恢复、收藏同步、签到、用户编辑、徽章和称号。
- [x] 以 Delta Comic UI、Naive UI 和 Tailwind CSS 替换 Vant 与旧 layout/core API。
- [x] 所有界面文本接入 i18n，组件名使用 PascalCase。
- [x] 使用 Vitest 原生类型测试；测试不导入 Zod 或使用 `z.infer`。
- [x] 集成测试默认访问真实服务，仅在网络不可用时启用 MSW 回退。
- [x] V8 覆盖率达到 statements 80%、branches 75%、functions 80%、lines 80% 门槛。
- [x] CI 覆盖冻结安装、格式、Lint、TS7/`vue-tsgo`、类型测试、覆盖率、构建和产物验证。
- [x] semantic-release 只发布 `manifest.json` 和 `plugin.zip`，并验证入口与禁止依赖。
- [x] 按 `docs/release-workflow.md` 推送 `develop`、晋级 `next` 并完成远端 prerelease 验收。
