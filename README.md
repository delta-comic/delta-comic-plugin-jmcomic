# 禁漫天堂SDK

## 介绍

- 该项目共分为两个部分
  - 一为封装的禁漫天堂的移动端[接口](#sdk介绍)
  - 二为[**Delta Comic**](https://github.com/delta-comic/delta-comic)的禁漫天堂[插件](#插件介绍)

<!-- SDK begin -->

## SDK介绍

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

<!-- SDK end -->
<!-- Plugin begin -->

## 插件介绍

### Delta Comic Plugin Jmcomic - _<span style="font-weight: lighter;font-size:16px">何以哀怮</span>_

[![GitHub](https://img.shields.io/github/license/delta-comic/jmcomic-sdk)](https://raw.githubusercontent.com/delta-comic/jmcomic-sdk/main/LICENSE)
![Download](https://img.shields.io/github/downloads/delta-comic/jmcomic-sdk/total)

#### 功能

- 完全封装了SDK
- 提供有关 _Jmcomic **/** 禁漫天堂_ 的相关功能

#### 如何使用

- 将release的latest的js源码链接填入"添加插件"的地址栏

#### 源项目

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=delta-comic&repo=delta-comic&user&theme=transparent)](https://github.com/delta-comic/delta-comic)

<!-- Plugin end -->

## 星图

[![Star History Chart](https://api.star-history.com/svg?repos=delta-comic/jmcomic-sdk&type=Date)](https://www.star-history.com/#delta-comic/jmcomic-sdk&Date)
