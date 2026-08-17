# Findings: JMComic SDK 重构

## 📚 用户提供的关键信息

### 1. Layout 插件文档 ✅
- **文档地址**: https://github.com/delta-comic/delta-comic-plugin-layout/blob/develop/docs/plugin-integration.md
- **关键要点**:
  - 布局插件通过 `model.expose` 暴露 `view`/`layout`/`model`/`component`/`helper`
  - 依赖方需在 `manifest.json` 的 `require` 中声明依赖
  - 通过 module augmentation 声明契约类型
  - 运行时经 `pluginModelChannels.expose.get('layout', 'default')` 读取
  - 当前项目已正确实现（见 `src/types/layout-plugin.ts` 和 `src/adapters/layout.ts`）

### 2. Resource vs Remotes 关系 ✅
**明确答案**: 这是理念区分，非冲突关系
- **`resource`**: 专供图像/视频资源测试和处理
- **`remotes`**: 倾向于 API 相关测试
- **结论**: 两者可以共存，各司其职

### 3. 动态填充策略 ✅
**明确方案**:
- 在测试开始时获取分流列表
- 确保获取请求实例唯一（避免重复请求）
- 可以用假条目做预填充（占位符策略）

### 4. 宿主交互 API ✅
**明确方案**:
- SDK 有 `config` 字段
- 读取宿主选择的分流结构
- 直接写入 `jm.config.requestUsingFork`

---

## 当前架构分析

### SDK 层 (packages/sdk)

#### Fork 模块 (`src/modules/fork.ts`)
```typescript
class Fork {
  // 获取并解密分流列表
  async getForks(signal?: AbortSignal): Promise<Forks>
  
  // 自动选择最快的分流（插件场景将不再使用）
  async autoPickFork(forks?: string[] | Forks, signal?: AbortSignal): Promise<string>
  
  // 解密分流响应
  decryptResponse(inputBase64: string): Forks
}

interface Forks {
  Setting: string[]        // 主要分流列表
  Server: string[]         // 备用服务器
  jm3_Server: [url: string, name: string][]
}
```

**关键特性:**
- `getForks()` 使用 `Promise.any()` 从多个源并行获取加密的分流列表
- `autoPickFork()` 并行测试所有分流的延迟，选择最快的
- 测试路径硬编码为 `config.forkTestPath`
- 成功后设置 `this.sdk.config.requestUsingFork`

#### 配置对象 (`src/modules/config.ts` 推测)
```typescript
class Config {
  forkSources: string[]      // 分流列表来源
  forkPath: string           // 获取分流的路径
  forkSecret: string         // 解密密钥
  forkTestPath: string       // 测试路径
  requestTimeout: number
  requestUsingFork?: string  // ✅ 当前使用的分流（宿主写入此处）
  now: () => number
}
```

### 插件层 (packages/app)

#### 当前实现 (`src/main.ts`)

**1. Special 步骤中的分流选择 (将被移除):**
```typescript
special: [
  {
    name: 'jmcomic.progress.fork',
    async call(setDescription) {
      setDescription(translate('jmcomic.progress.fork'))
      await runtime.jm.fork.autoPickFork(undefined, runtime.signal)
    },
  },
  // ...
]
```

**2. 图片资源配置 (保持不变):**
```typescript
resource: {
  types: [
    {
      type: 'default',
      urls: [...defaultImageForks],  // 6个硬编码的 CDN URL
      async test(url, signal) {
        const response = await fetch(`${url}/media/photos/1205243/00001.webp`, {
          method: 'HEAD',
          signal,
        })
        if (!response.ok) throw new Error(`Image fork returned ${response.status}`)
      },
    },
  ],
  process: {
    async comicDecode(nowPath, resource) {
      const comicId = String(resource.$$meta?.comicId ?? '')
      const page = Number(resource.$$meta?.page ?? 1)
      if (!comicId) return [nowPath, false]
      const result = await runtime.jm.image.decryptImage(nowPath, comicId, page, runtime.signal)
      return [result.url, true]
    },
  },
}
```

### 常量定义 (`src/constants.ts`)

```typescript
export const defaultImageForks = [
  'https://cdn-msp.jmapinodeudzn.net',
  'https://cdn-msp2.jmapinodeudzn.net',
  'https://cdn-msp.jmapiproxy1.cc',
  'https://cdn-msp.jmapiproxy2.cc',
  'https://cdn-msp.jmapiproxy3.cc',
  'https://cdn-msp.jmapiproxy4.cc',
] as const
```

---

## Delta Comic 插件规范

### RemoteModel 类型

```typescript
type RemoteModel = TestGroup[]
type TestGroup = TestRemoteGroup | TestResourceGroup

interface TestGroupBase {
  name: string                    // 展示名（经 translateText）
  remotes: Definition[]
  test: TestFunction              // group 级默认探测
  allowNoConnected?: boolean
}

interface Definition {
  name: string
  url: string
  test?: TestFunction             // 覆盖 group 级 test
}

type TestFunction = (url: string, signal: AbortSignal) => Promise<void>

interface TestRemoteGroup extends TestGroupBase { 
  type: 'remote' 
}

interface TestResourceGroup extends TestGroupBase {
  type: 'resource'
  processors?: UniResourceProcessor[]
}
```

### 宿主行为（推测）
1. 宿主读取插件的 `model.remotes` 配置
2. 并行探测所有 `remotes` 中的 `Definition`
3. 用户在设置中选择可用分流
4. 宿主将选中的 URL 通过某种机制传递给插件
5. 插件读取后写入 `jm.config.requestUsingFork`

---

## 🎯 重构设计方案

### 1. API 分流组 (TestRemoteGroup)

```typescript
// 新增文件：packages/app/src/models/remotes.ts
import type { Remote } from '@delta-comic/plugin'
import { runtime } from '@/runtime/PluginRuntime'

let apiRemotes: Remote.Definition[] = []

export const getApiRemotes = () => apiRemotes

export const initializeApiRemotes = async (signal?: AbortSignal) => {
  const forks = await runtime.jm.fork.getForks(signal)
  apiRemotes = forks.Setting.map(domain => ({
    name: domain,
    url: `https://${domain}`,
  }))
}

// 在 main.ts 中
export const apiRemoteGroup: Remote.TestRemoteGroup = {
  type: 'remote',
  name: 'jmcomic.remotes.api',
  get remotes() {
    return getApiRemotes()
  },
  async test(url, signal) {
    await ky.get(runtime.jm.config.forkTestPath, {
      baseUrl: url,
      signal,
      timeout: runtime.jm.config.requestTimeout,
      retry: 0,
    })
  },
}
```

**关键点:**
- 使用 getter `get remotes()` 返回动态数组（占位符模式）
- 初始化在 `special` 第一个步骤或 `onBooted` 中调用
- 测试函数复用 SDK 的配置参数

### 2. 图片资源保持不变

```typescript
// resource 字段专供图像/视频，保持现有实现
model: {
  resource: {
    types: [
      {
        type: 'default',
        urls: [...defaultImageForks],
        async test(url, signal) {
          const response = await fetch(`${url}/media/photos/1205243/00001.webp`, {
            method: 'HEAD',
            signal,
          })
          if (!response.ok) throw new Error(`Image fork returned ${response.status}`)
        },
      },
    ],
    process: {
      async comicDecode(nowPath, resource) {
        // 保持不变
      },
    },
  },
}
```

### 3. 新增 remotes 字段

```typescript
// main.ts
import { apiRemoteGroup } from '@/models/remotes'

model: {
  remotes: [apiRemoteGroup],
  resource: { /* 保持不变 */ },
  // ...
}
```

### 4. Special 步骤重构

```typescript
special: [
  {
    name: 'jmcomic.progress.initRemotes',  // 新名称
    async call(setDescription) {
      setDescription(translate('jmcomic.progress.initRemotes'))
      await initializeApiRemotes(runtime.signal)
    },
  },
  {
    name: 'jmcomic.progress.checkIn',
    // 保持不变
  },
  {
    name: 'jmcomic.progress.preload',
    // 保持不变
  },
]
```

### 5. 读取宿主选择的分流

```typescript
// 新增：packages/app/src/runtime/PluginRuntime.ts
export class PluginRuntime {
  // ...
  
  public syncForkFromHost(): void {
    // 方案 A: 假设宿主通过某个 API 提供选中的分流
    // const selectedFork = hostApi.getSelectedRemote('jmcomic', 'api')
    // if (selectedFork) {
    //   this.jm.config.requestUsingFork = selectedFork.url
    // }
    
    // 方案 B: 如果宿主直接写入 SDK config
    // （无需额外代码，宿主已处理）
  }
}
```

**待确认**: 宿主如何传递选中的分流？
- 是否有 `hostApi.getSelectedRemote(pluginId, groupId)` 方法？
- 还是宿主直接写入 `runtime.jm.config.requestUsingFork`？
- 是否需要监听分流变更事件？

### 6. i18n 更新

```typescript
// packages/app/src/i18n/index.ts
{
  'zh-CN': {
    'jmcomic.remotes.api': 'API 分流',
    'jmcomic.progress.initRemotes': '正在获取分流列表...',
    // 移除: 'jmcomic.progress.fork'
  },
  'en-US': {
    'jmcomic.remotes.api': 'API Servers',
    'jmcomic.progress.initRemotes': 'Fetching server list...',
  },
}
```

---

## 测试策略

### SDK 测试（保持不变）
- `test/fork.test.ts`: 解密逻辑测试
- `test/integration.test.ts`: 保留 `autoPickFork` 作为独立 SDK 用法示例

### 插件测试（需更新）

**`main.test.ts` 新增测试:**
```typescript
test('exposes dynamic API remotes through model.remotes', async () => {
  vi.spyOn(runtime.jm.fork, 'getForks').mockResolvedValue({
    Setting: ['domain1.com', 'domain2.com'],
    Server: [],
    jm3_Server: [],
  })
  
  await initializeApiRemotes()
  const remotes = getApiRemotes()
  
  expect(remotes).toHaveLength(2)
  expect(remotes[0]).toEqual({ name: 'domain1.com', url: 'https://domain1.com' })
})

test('api remote group test function validates fork connectivity', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
  vi.stubGlobal('fetch', fetch)
  
  await apiRemoteGroup.test('https://test.com', new AbortController().signal)
  
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining(runtime.jm.config.forkTestPath),
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  )
})
```

**移除测试:**
```typescript
// 移除 special fork 步骤的测试
// test('runs initial fork discovery in special steps', ...)
```

---

## 📋 实施清单

### SDK 层（最小改动）
- [ ] 保留所有现有接口（向后兼容）
- [ ] 在 `Fork` 类文档注释中说明：`autoPickFork` 用于独立 SDK 场景，插件应依赖宿主分流管理
- [ ] 确保 `config.requestUsingFork` 字段可被外部写入

### 插件层（核心改动）
- [ ] 新增 `src/models/remotes.ts`：
  - `getApiRemotes()` - 返回当前分流列表
  - `initializeApiRemotes()` - 从 SDK 获取并初始化
  - `apiRemoteGroup` - TestRemoteGroup 配置
- [ ] 更新 `src/main.ts`：
  - 新增 `model.remotes: [apiRemoteGroup]`
  - 保持 `model.resource` 不变
  - 重构 `special[0]` 为初始化分流列表
  - 移除原 fork 步骤
- [ ] 更新 `src/i18n/index.ts`：
  - 新增 `jmcomic.remotes.api`
  - 新增 `jmcomic.progress.initRemotes`
  - 移除 `jmcomic.progress.fork`
- [ ] （可选）更新 `src/runtime/PluginRuntime.ts`：
  - 如需主动读取宿主选择，添加 `syncForkFromHost()`
  - 如宿主自动写入 `config`，无需改动

### 测试更新
- [ ] `src/main.test.ts`：
  - 新增 remotes 字段测试
  - 新增 `initializeApiRemotes` 测试
  - 新增 `apiRemoteGroup.test` 测试
  - 移除 special fork 步骤测试
  - 更新 resource 测试（如有影响）
- [ ] `src/models/remotes.test.ts`（新建）：
  - 测试动态分流列表管理
  - 测试占位符模式

### 文档更新
- [ ] 更新根 `README.md` 描述
- [ ] 在代码中添加注释说明新架构
- [ ] 提交信息：`refactor(app): 将 API 分流测试迁移到 model.remotes 字段`

---

## 🚨 待确认的细节

### 1. 宿主分流传递机制
**问题**: 宿主如何将用户选择的分流传递给插件？

**可能方案**:
- **方案 A**: 宿主提供 API，插件主动查询
  ```typescript
  const selected = pluginHost.getSelectedRemote('jmcomic', 'api')
  runtime.jm.config.requestUsingFork = selected.url
  ```
- **方案 B**: 宿主直接写入插件的 config 对象
  ```typescript
  // 宿主执行：
  runtime.jm.config.requestUsingFork = userSelectedUrl
  // 插件无需额外代码
  ```
- **方案 C**: 通过事件监听
  ```typescript
  onRemoteChanged((pluginId, groupId, url) => {
    if (pluginId === 'jmcomic' && groupId === 'api') {
      runtime.jm.config.requestUsingFork = url
    }
  })
  ```

**用户回答**: SDK 有 config 字段，读取结构并直接写入其中

**推测**: 宿主直接写入 `runtime.jm.config.requestUsingFork`，插件无需主动读取

### 2. 初始化时序
**问题**: 在分流列表就绪前，插件的 `remotes` 数组为空，宿主是否支持？

**方案**: 使用 getter 返回动态数组（占位符模式）
```typescript
get remotes() {
  return getApiRemotes() // 可能为空数组，测试开始时才填充
}
```

**优点**: 符合用户要求"用假条目做预填充"

### 3. 测试覆盖率影响
**当前覆盖率**: statements 80%, branches 75%, functions 80%, lines 80%

**变更影响评估**:
- SDK 层无改动 → 覆盖率不变
- 插件层：
  - 移除 special fork 步骤 → 减少部分测试
  - 新增 remotes 相关代码 → 需补充新测试
  - 总体应能维持或提升覆盖率

---

## 总结

### 架构变更对比

| 维度 | 变更前 | 变更后 |
|------|--------|--------|
| 分流发现 | SDK `autoPickFork` 自动选择 | 宿主探测并管理 |
| 插件配置 | `special` 步骤中调用 | `model.remotes` 声明式配置 |
| 分流传递 | SDK 自行决定 | 宿主写入 `config.requestUsingFork` |
| 图片资源 | `resource.types` | 保持不变（专职图像/视频） |
| API 测试 | 无独立配置 | `remotes` TestRemoteGroup |

### 核心优势
1. **符合规范**: 遵循 Delta Comic 插件架构
2. **职责清晰**: 宿主管理分流，插件声明需求
3. **解耦合**: SDK 可独立使用，插件依赖宿主
4. **可扩展**: 未来可添加更多 TestGroup

### 风险与缓解
| 风险 | 缓解措施 |
|------|----------|
| 宿主 API 不确定 | 采用最简方案，宿主直接写入 config |
| 测试覆盖率下降 | 补充完整的 remotes 测试用例 |
| 向后兼容性 | SDK 保留所有接口不变 |
| 初始化失败 | 占位符模式，允许空数组 |
