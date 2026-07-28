# 发布流程

模板使用 Conventional Commits 与 semantic-release，只发布 GitHub Release，不发布 npm 包。

| 分支 | 用途 | 发布结果 |
| --- | --- | --- |
| `develop` | 日常开发与集成 | 不发布 |
| `next` | 预发布验证 | `x.y.z-next.N` prerelease |
| `main` | 稳定版本 | `x.y.z` release |

发布只能由分支晋级触发，禁止手工创建标签或 GitHub Release。第一次预发布会自动从 `develop`
创建 `next`：

```sh
vp run --no-cache release:preview:dry-run
vp run --no-cache release:preview
```

稳定发布把 `next` 晋级到 `main`：

```sh
vp run --no-cache release:stable:dry-run
vp run --no-cache release:stable
```

如果仓库只有 `main`，先创建开发分支：

```sh
vp run --no-cache branch:develop:dry-run
vp run --no-cache branch:develop
```

工作流会安装锁定依赖、执行检查和覆盖率测试，再由 semantic-release 注入版本并构建。每个
Release 只上传外置 `manifest.json` 和包含 manifest、JavaScript、CSS 的 `plugin.zip`。

本地完整验证：

```sh
vp check
vp run typecheck
vp test run --coverage
vp run build
vp run artifacts
```
