# jmcomic-sdk

禁漫天堂移动端接口的 TypeScript 封装。接口没有官方文档，当前实现通过真实服务响应持续校正。

## 初始化

```ts
import { JMComic, SortType } from 'jmcomic-sdk'

const jm = new JMComic({ timeout: 15_000, retry: 1 })
await jm.fork.autoPickFork()

const comic = await jm.comic.getInfo({ id: 350234 })
```

所有异步业务 API 都接受可选 `AbortSignal`：

```ts
const controller = new AbortController()
const result = jm.comic.searchByKeyword(
  { keyword: '作者', order: SortType.Relate, page: 1 },
  controller.signal,
)
controller.abort()
```

## 模块

`JMComic` 保留稳定入口：

- `auth`：登录、注册、登出、找回密码和令牌会话。
- `comic`：搜索、详情、图片、收藏和评论。
- `blog`：图文搜索、详情和评论。
- `novel`：小说列表、搜索、章节、收藏和评论。
- `book`：创作者与画册。
- `promote`：分类、推荐、周榜、标签、随机与最新内容。
- `user`：签到、资料、收藏、历史、徽章和称号。

公共错误使用 `JmApiError`，分页统一为 `PageResult<T>`。令牌会话可通过 `JmSession` 注入；调用方应
持久化令牌和用户信息，不应保存密码。

## 图片解码

插件或浏览器应用显式注入浏览器适配器：

```ts
import { JMComic } from 'jmcomic-sdk'
import { BrowserImageDecoder } from 'jmcomic-sdk/browser'

const jm = new JMComic({ imageDecoder: new BrowserImageDecoder() })
```

Node 环境从独立子路径加载 Sharp，避免 Sharp 进入浏览器插件包：

```ts
import { JMComic } from 'jmcomic-sdk'
import { NodeImageDecoder } from 'jmcomic-sdk/node'

const jm = new JMComic({ imageDecoder: new NodeImageDecoder() })
```

## 会话

```ts
const login = await jm.auth.login({ username, password })
const session = jm.auth.session

const restored = new JMComic({ session })
```

生产服务使用一套固定的时间戳、摘要和版本请求头验证协议。它属于服务兼容性契约，不能按普通
REST 客户端习惯随意删改。

## 构建

```sh
vp run -t jmcomic-sdk#typecheck
vp run -t jmcomic-sdk#build
```

本仓库的 semantic-release 只发布 Delta Comic 插件；SDK 构建保持可独立消费，但本次流程不会
发布 npm 版本。
