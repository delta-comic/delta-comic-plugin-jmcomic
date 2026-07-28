# 贡献指南

提交问题前请确认问题来自本插件，并提供 Delta Comic 核心版本、布局插件版本、内容源插件及可复现步骤。

## 开发环境

- 使用仓库 `.node-version` 指定的 Node.js；
- 使用 `package.json` 固定的 pnpm 版本；
- 本地命令统一通过 Vite+ 的 `vp` 执行。

```sh
git clone https://github.com/delta-comic/delta-comic-plugin-layout.git
cd delta-comic-plugin-layout
vp install
vp run dev
```

最新宿主 API 可参考同级 `delta-comic` 仓库。新增界面文字必须进入插件 i18n；组件样式使用 Tailwind CSS，不添加 Vant 或独立 CSS 组件库。

## 提交前检查

```sh
vp check
vp run typecheck
vp test run --coverage
vp run build
vp run artifacts
```

测试应聚焦边界条件、状态回滚、缓存隔离和发布契约，避免只为提高数字而复制低价值断言。提交信息遵循 Conventional Commits，例如：

```text
fix(reader): 修复切换章节后复用旧图片缓存
```

请在 Pull Request 中说明行为变化、验证命令和必要的截图。所有 AI 辅助生成内容均须由提交者亲自审查并承担责任。
