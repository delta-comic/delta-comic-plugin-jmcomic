# 发布流程

本仓库使用 Conventional Commits、分支晋级与 semantic-release。只发布 Delta Comic 插件的
GitHub Release，不发布 npm SDK。

| 分支 | 用途 | 发布结果 |
| --- | --- | --- |
| `develop` | 日常开发与集成 | 只运行 CI |
| `next` | 预发布验证 | `x.y.z-next.N` prerelease |
| `main` | 稳定版本 | `x.y.z` release |

禁止手工创建版本标签或 GitHub Release。`next` 和 `main` 的 push 会触发 release workflow；
semantic-release 只上传外置 `manifest.json` 与 `plugin.zip`。

## 准备

本地需要 Vite+、GitHub CLI，以及已经配置的 Git/GitHub 凭据。CI 可选读取以下 secrets，以执行
真实账户读取测试；未配置时账户用例跳过，公开 API 仍默认访问真实服务：

- `JMCOMIC_TEST_USERNAME`
- `JMCOMIC_TEST_PASSWORD`

提交必须遵循 Angular/Conventional Commits。至少保留一个会触发版本的提交，例如
`feat(plugin): ...`。

## 完整本地验证

在干净的 `develop` 上执行：

```sh
vp install --frozen-lockfile
vp check --fix
vp fmt --check
vp lint
vp run typecheck
vp test typecheck
vp test run --coverage
vp run build
vp run artifacts
```

普通类型检查固定使用 TypeScript 7 和 `vue-tsgo`。Vitest 类型测试分别用 TypeScript checker 和
Vue checker。运行时集成测试只有在初始分流发现因网络不可用而失败时才启用 MSW 回退。

## 发布预览版

先把已验证提交推送到 `develop`，等待 CI 成功：

```sh
git push origin develop
gh run list --branch develop --limit 5
gh run watch <ci-run-id> --exit-status
```

预演不会执行任何 Git 命令：

```sh
vp run --no-cache release:preview:dry-run
```

确认工作树干净、本地 `develop` 与 `origin/develop` 完全一致后晋级。远端没有 `next` 时脚本会从
`develop` 创建；已有 `next` 时以 merge commit 合入并推送：

```sh
vp run --no-cache release:preview
```

脚本完成后会切回 `develop`。等待 `next` 上的 CI 与 release workflow：

```sh
gh run list --branch next --limit 10
gh run watch <release-run-id> --exit-status
```

## 验收远端资产

找到本次 prerelease 标签，下载且只下载两个发布资产：

```sh
gh release list --limit 10
release_dir="$(mktemp -d)"
gh release download <tag> \
  --pattern manifest.json \
  --pattern plugin.zip \
  --dir "$release_dir"
node ./script/artifacts.mts "$release_dir" --release-assets
```

验收会确认：

- 外置 manifest 与 ZIP 内 manifest 完全一致。
- ZIP 内 JavaScript/CSS 入口均存在。
- 包内没有 Vant、Sharp、Vue 或 Delta Comic 宿主运行时的重复实现。
- manifest 的版本是 semantic-release 生成的 prerelease 版本。

完成后确认仍在 `develop`，工作树干净且与远端一致：

```sh
git switch develop
git fetch --prune origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/develop
```

## 发布稳定版

预览版验证完成后，将 `next` 晋级到 `main`：

```sh
vp run --no-cache release:stable:dry-run
vp run --no-cache release:stable
```

同样等待 CI/release workflow，并用上述远端资产流程再次验收。若仓库首次只有 `main`，可先用
`branch:develop:dry-run` 与 `branch:develop` 创建标准开发分支。
