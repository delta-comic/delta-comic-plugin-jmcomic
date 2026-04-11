# 禁漫天堂 SDK

![NPM Downloads](https://img.shields.io/npm/dw/jmcomic-sdk)


## 简介

- 从[官方源码](https://github.com/wenxig/jmcomic-source-code)分析优化而来。
- **nodejs/浏览器**全通用。

## 食用方法

### 安装

```sh
pnpm add jmcomic-sdk
```

### 初始化sdk

```typescript
import { JMComic } from "jmcomic-sdk"
const sdk = new JMComic()

// 自动选择分流
await sdk.fork.autoPickFork()

// 或者手动操作
const forks = await this.getForks() // 返回分流
// 中间是你的测试流程
sdk.config.requestUsingFork = forks.Setting[0] // 手动设置分流使用

// 登录(可选的)
const user = await sdk.auth.login({
  username: 'LiMing',
  password: '123456'
}) 
// 账号会自动保存在内部，如果你想管理多个账号，请初始化多个sdk实例
// `new`本身不会触发任何代码，十分轻量
```

### 实际使用

```typescript
// 愉快的获取漫画
const comic = await sdk.comic.getInfo({ id: 350234 })
```

### 内部设计

内部采用多个modules设计，`JMComic`仅做聚合与数据隔离。

网络部分使用`ky`对`fetch`封装，要求需要你所在的平台支持跨越CORS，或者通过主动修改分流为你的代理节点。

## 路线图
<!-- Insert -->
<!-- SDK begin -->

- sdk内置了解密与网络请求，账户管理
- 接口推断来自[禁漫天堂解包源码(Github)](https://github.com/wenxig/jmcomic-source-code)
- 该sdk封装了几乎所有的接口，如下
- [x] 鉴权
  - [x] 登录
  - [x] 注册
  - [x] 登出
  - [x] 忘记密码
- [x] 漫画
  - [x] 搜索漫画
  - [x] 获取详细信息
  - [x] 获取所有图片
  - [x] 点赞
  - [x] 收藏
  - [x] 获取评论
  - [x] 发送评论
  - [x] 回复评论
  - [x] -购买付费漫画-不会实现, ps: 因为api无视付费与否均可返回正确结果
- [x] 博客
  - [x] 搜索博客
  - [x] 获取博客详细信息
  - [x] 点赞
  - [x] 获取评论
  - [x] 发送评论
  - [x] 回复评论
- [x] 书库
  - [x] 搜索书库
  - [x] 获取作者详细信息
  - [x] 获取书库详细信息
  - [x] 获取书库的内容
- [x] 小说
  - [x] 搜索小说
  - [x] 获取推荐列表
  - [x] 获取详细信息
  - [x] 获取正文
  - [x] 点赞
  - [x] 小说收藏
  - [x] 获取小说收藏
  - [x] 发送评论
  - [x] 回复评论
  - [x] -小说收藏操作-不会实现
  - [x] -购买付费小说-不会实现
- [x] 推送
  - [x] 最新漫画获取
  - [x] 热门标签
  - [x] 随机推荐
  - [x] 每周推荐
  - [x] 首页分类
  - [x] 首页分析详细信息
- [x] 用户
  - [x] 签到
  - [x] 历史记录
  - [x] 获取信息
  - [x] 修改信息
  - [x] 勋章购买
  - [x] 勋章调整
  - [x] 称号搜索
  - [x] 称号调整
  - [x] -修改头像-无法实现
- [ ] 视频
- [ ] 通知
- [ ] 其他
  - [ ] 购买去广告
  - [ ] 游戏
  - [x] -Setting信息-不会实现, ps: 没什么有用东西

<!-- End -->

## 星图

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/jmcomic-sdk&type=Date)](https://www.star-history.com/#delta-comic/jmcomic-sdk&Date)
