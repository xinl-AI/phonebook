# 手机通讯录 - React Native 客户端完整梳理

> 写给小白看的项目全景解析：每一个 JS 文件是干什么的、它们之间怎么关联、API 请求如何从用户操作一路发到后端再返回。

---

## 目录

1. [项目是什么](#1-项目是什么)
2. [文件目录树 + 每个文件一句话解释](#2-文件目录树)
3. [核心概念速成](#3-核心概念速成)
4. [启动流程：从开机到看到页面](#4-启动流程)
5. [API 请求全链路：从按钮点击到数据返回](#5-api请求全链路)
6. [四大层级详解](#6-四大层级详解)
   - [入口层 (index.js / App.js)](#61-入口层)
   - [导航层 (Navigation)](#62-导航层)
   - [页面层 (Screens)](#63-页面层)
   - [数据层 (Stores + API + Utils)](#64-数据层)
7. [每个页面做了什么](#7-每个页面做了什么)
8. [组件库一览](#8-组件库一览)
9. [工具函数一览](#9-工具函数一览)
10. [样式系统](#10-样式系统)
11. [完整数据流向图](#11-完整数据流向图)

---

## 1. 项目是什么

这是一个**手机通讯录 App**，使用 React Native（Expo 框架）开发。功能包括：

- 注册 / 登录 / 退出
- 查看联系人列表（支持分组筛选、关键词搜索、分页加载）
- 添加 / 编辑 / 删除联系人
- 联系人详情（拨号、发短信、发邮件）
- 分组管理（创建、编辑、删除分组）
- 个人中心（修改个人信息）
- 设置（修改密码、清除缓存）

**后端**是 Spring Boot，数据库 MySQL。前端通过 HTTP 请求和后端通信，所有数据都是 JSON 格式。

---

## 2. 文件目录树

下面列出 `src/` 下每个文件的**一句话作用**：

```
phonebook-client/
├── index.js                          ← Expo 入口：注册 App 组件到原生应用
├── App.js                            ← 根组件：包裹导航容器、安全区域、手势处理
├── package.json                      ← 项目配置：包名、依赖列表、启动脚本
├── app.json                          ← Expo 配置：应用名、图标、bundle ID
├── babel.config.js                   ← Babel 编译配置
│
└── src/
    ├── api/                          ← API 请求层（发 HTTP 请求的代码）
    │   ├── client.js                 ← Axios 实例：配置 baseURL + 自动带 Token + 处理 401
    │   ├── auth.js                   ← 认证接口：登录、注册、退出、获取用户信息、改密码
    │   ├── contacts.js               ← 联系人接口：增删改查、搜索、收藏、批量删除
    │   └── groups.js                 ← 分组接口：增删改查、移动联系人、调整排序
    │
    ├── stores/                       ← 状态管理层（Zustand，管理全局数据）
    │   ├── useAuthStore.js           ← 认证状态：登录/注册/退出/检查登录
    │   ├── useContactStore.js        ← 联系人状态：列表、分页、搜索、筛选、收藏
    │   └── useGroupStore.js          ← 分组状态：分组列表、增删改
    │
    ├── navigation/                   ← 导航层（页面之间的跳转路由）
    │   ├── AppNavigator.js           ← 根导航器：检查登录状态 → 决定显示认证页还是主页
    │   ├── AuthNavigator.js          ← 认证流程：登录页 → 注册页
    │   └── MainNavigator.js          ← 主流程：首页/详情/编辑/分组管理/个人中心/设置
    │
    ├── screens/                      ← 页面层（用户看到的每一个完整页面）
    │   ├── SplashScreen.js           ← 启动页：显示 Logo + 加载动画
    │   ├── LoginScreen.js            ← 登录页：用户名 + 密码 → 登录
    │   ├── RegisterScreen.js         ← 注册页：用户名 + 密码 + 手机 + 邮箱 → 注册
    │   ├── HomeScreen.js             ← 首页：联系人列表 + 分组筛选 + 搜索 + 添加按钮
    │   ├── ContactDetailScreen.js    ← 详情页：完整信息 + 拨号/短信/邮件 + 编辑入口
    │   ├── ContactEditScreen.js      ← 编辑/添加页：表单（姓名/电话/邮箱/分组等）
    │   ├── GroupManageScreen.js      ← 分组管理页：分组列表 + 新建/编辑/删除
    │   ├── ProfileScreen.js          ← 个人中心：查看修改昵称/手机/邮箱/性别
    │   └── SettingsScreen.js         ← 设置页：修改密码/清除缓存/关于/退出
    │
    ├── components/                   ← 组件层（可复用的 UI 零件）
    │   ├── Avatar.js                 ← 头像：有图显示图，没图显示名字首字母
    │   ├── ContactItem.js            ← 联系人行：头像 + 姓名 + 电话 + 分组标签
    │   ├── SearchBar.js              ← 搜索框：输入框 + 搜索图标 + 清除按钮
    │   ├── GroupHeader.js            ← 分组标签栏：横向滚动的分组筛选按钮
    │   ├── EmptyView.js              ← 空状态：列表为空时显示的占位图
    │   ├── LoadingView.js            ← 加载中：转圈动画
    │   ├── FloatingButton.js         ← 悬浮按钮：右下角的 + 号
    │   ├── CustomModal.js            ← 确认弹窗：标题 + 内容 + 确定/取消
    │   └── CustomToast.js            ← 轻提示：顶部自动消失的消息条
    │
    ├── hooks/                        ← 自定义 Hook
    │   └── useDebounce.js            ← 防抖 Hook：用户输入后等 300ms 再触发搜索
    │
    ├── utils/                        ← 工具函数（纯逻辑，不涉及 UI）
    │   ├── constants.js              ← 常量：API 地址（自动识别开发/生产）、存储 Key、分页大小
    │   ├── storage.js                ← 本地存储：封装 AsyncStorage 读写 Token/用户信息
    │   ├── validator.js              ← 表单验证：手机号格式/邮箱格式/密码长度/用户名长度
    │   ├── phone.js                  ← 系统调用：拨号/发短信/发邮件（调用手机原生功能）
    │   └── date.js                   ← 日期格式化：时间戳 → "2025-01-15" 或 "2025-01-15 14:30"
    │
    └── styles/                       ← 样式系统
        ├── colors.js                 ← 颜色表：主色/背景/文字/边框/状态色/分组色
        ├── spacing.js                ← 间距表：xs(4) / sm(8) / md(12) / base(16) / lg(20) / xl(24) / xxl(32)
        ├── typography.js             ← 字体样式：h1 / h2 / h3 / body / caption / small
        └── globalStyles.js           ← 通用样式：卡片 / 输入框 / 主按钮 / 分割线 / 空状态
```

---

## 3. 核心概念速成

如果你是小白，先理解这几个概念：

### 3.1 什么是"组件"？

React Native 中，每个页面都是由**组件（Component）**拼成的。组件就是一个返回 UI 的 JavaScript 函数。

```js
// 一个最简单的组件
const Hello = () => {
  return <Text>你好，世界！</Text>;
};
```

项目里 `components/` 下的文件都是**可复用的组件**（比如头像 `Avatar`、搜索框 `SearchBar`），而 `screens/` 下的文件是**完整页面组件**。

### 3.2 什么是"状态管理"（Zustand Store）？

App 运行时会有很多数据（比如联系人列表、当前用户信息）。这些数据需要存在某个地方，让多个页面都能读取和修改。

Zustand 就是一个**全局数据仓库**（Store）。它像一个超市仓库：
- **存数据**（state）：`contacts` 数组、`isLoggedIn` 布尔值
- **提供操作方法**（actions）：`loadContacts()`、`login()`

任何页面都可以 `import` Store 来读取数据或调用操作方法。

### 3.3 什么是"导航"（Navigation）？

手机 App 有多个页面，用户需要在页面之间跳转（比如列表页 → 详情页）。React Navigation 负责管理这个跳转。

可以把它理解为一个**页面栈**：从首页点进详情页 = 把详情页"压入"栈顶；按返回键 = 从栈顶"弹出"当前页。

### 3.4 什么是"API 请求"？

前端显示的数据都来自后端服务器。前端通过 **HTTP 请求**向后端要数据（GET）或提交数据（POST/PUT/DELETE）。

这个项目用 **Axios** 发请求。后端返回的数据格式统一为：

```json
{
  "code": 200,        // 200=成功, 401=未登录, 500=服务器错误
  "message": "操作成功",
  "data": { ... }     // 真正的数据放这里
}
```

---

## 4. 启动流程：从开机到看到页面

这是 App 从你打开它到看到界面的完整过程：

```
┌──────────────────────────────────────────────────────────────┐
│ 1. index.js                                                  │
│    registerRootComponent(App) → 把 App 注册为根组件           │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. App.js                                                    │
│    包裹三层容器：                                              │
│    GestureHandlerRootView → SafeAreaProvider → NavigationContainer │
│    然后渲染 <AppNavigator />                                  │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. AppNavigator.js                                           │
│    页面一加载就调用 checkLoginStatus()                         │
│    ↓                                                         │
│    useAuthStore.checkLoginStatus() 做了这些事：                │
│      a. 从手机本地存储读取之前保存的 Token                     │
│      b. 用这个 Token 发 GET /api/auth/me 验证是否有效          │
│      c. Token 有效 → isLoggedIn = true                       │
│      d. Token 无效/过期 → isLoggedIn = false                  │
│    ↓                                                         │
│    检查期间：显示 SplashScreen（启动页）                       │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
          ┌─────────┴─────────┐
          ↓                   ↓
   Token 有效             Token 无效
   isLoggedIn = true      isLoggedIn = false
          ↓                   ↓
  显示 MainNavigator      显示 AuthNavigator
  （主页）                 （登录页）
```

### 关键代码对应

**AppNavigator.js** 中的这段代码是核心决策点：

```js
// 1. 启动时检查登录状态
useEffect(() => {
  checkLoginStatus();  // 发请求验证 Token
}, []);

// 2. 根据 isLoggedIn 决定显示什么
if (isLoading) return <SplashScreen />;

return (
  <Stack.Navigator>
    {isLoggedIn ? (
      <Stack.Screen name="Main" component={MainNavigator} />  // 进主应用
    ) : (
      <Stack.Screen name="Auth" component={AuthNavigator} />  // 去登录页
    )}
  </Stack.Navigator>
);
```

---

## 5. API 请求全链路：从按钮点击到数据返回

这是全文最重要的部分。我们以**用户在首页下拉刷新联系人列表**为例，追踪一次完整的 API 请求。

### 5.1 链路总览

```
用户下拉 FlatList
    ↓
HomeScreen 调用 refresh()
    ↓
useContactStore.refresh() → loadContacts(1, true)
    ↓
useContactStore.loadContacts()
    ├── 从 state 中读取 selectedGroupId 和 keyword
    ├── 拼装参数: { page: 1, size: 20, groupId: ?, keyword: ? }
    └── 调用 contactAPI.getList(params)
            ↓
        contactAPI.getList()
            └── client.get('/api/contacts', { params })
                    ↓
                client.js - Axios 实例
                    ├── 请求拦截器: 从 AsyncStorage 读 Token → 加到 Authorization 头
                    ├── 发送 HTTP GET 请求到 http://192.168.x.x:8080/api/contacts?page=1&size=20
                    └── 收到响应
                            ├── 响应拦截器: 提取 response.data
                            ├── 如果 code=200 → 返回 { code, message, data }
                            └── 如果 code=401 → 清除 Token → 触发 global.onUnauthorized → 跳回登录
            ↓
        返回 result = { code: 200, data: { records: [...], total: 25, current: 1 } }
            ↓
        useContactStore 更新 state:
            set({ contacts: records, total: 25, currentPage: 1 })
            ↓
        HomeScreen 的 contacts 变量自动更新（Zustand 响应式）
            ↓
        FlatList 重新渲染，显示最新联系人列表
```

### 5.2 每一步对应的文件

| 步骤 | 文件 | 代码位置 |
|------|------|---------|
| 用户下拉 | `screens/HomeScreen.js:176` | `onRefresh={refresh}` |
| Store 调用 | `stores/useContactStore.js:56` | `refresh: () => get().loadContacts(1, true)` |
| 拼参数 | `stores/useContactStore.js:31-37` | 读 `selectedGroupId` + `keyword` |
| API 调用 | `api/contacts.js:8` | `getList: (params) => client.get('/api/contacts', { params })` |
| 请求拦截 | `api/client.js:19-28` | 加 `Authorization: Bearer <token>` 头 |
| 响应处理 | `api/client.js:32-34` | `return response.data` |
| 401 处理 | `api/client.js:35-46` | 清除 Token + `global.onUnauthorized()` |
| 更新 UI | `stores/useContactStore.js:39-40` | `set({ contacts: records, ... })` |

### 5.3 client.js 的拦截器机制（重点理解）

这是整个 API 层的**心脏**。看下面这张图：

```
                     请求拦截器                        响应拦截器
                     （发请求前）                       （收到响应后）
                         │                                  │
     axios.get()  ──→  读取 Token              提取 response.data  ──→ 返回给调用者
                        加到 Authorization 头       │
                                                  如果 401：
                                                    清除 Token
                                                    触发 onUnauthorized
```

**请求拦截器代码解读：**

```js
client.interceptors.request.use(
  async (config) => {
    const token = await getToken();          // ① 从手机存储读 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // ② 塞进请求头
    }
    return config;                           // ③ 继续发送
  },
  (error) => Promise.reject(error),
);
```

**响应拦截器代码解读：**

```js
client.interceptors.response.use(
  (response) => {
    return response.data;  // ① 正常情况下，直接返回 body 里的数据
  },
  async (error) => {
    if (error.response?.status === 401) {   // ② Token 过期/无效
      await removeToken();                  // ③ 清除本地 Token
      if (global.onUnauthorized) {          // ④ 通知 AppNavigator
        global.onUnauthorized();            //     → 执行 logout() → 跳回登录页
      }
    }
    return { code: 500, message: '网络错误', data: null };
  },
);
```

### 5.4 三个 API 模块的函数清单

#### auth.js - 认证接口

| 函数 | HTTP 方法 | 后端地址 | 用途 |
|------|----------|---------|------|
| `register(data)` | POST | `/api/auth/register` | 注册新账号 |
| `login(data)` | POST | `/api/auth/login` | 登录，返回 Token |
| `logout()` | POST | `/api/auth/logout` | 退出登录 |
| `getCurrentUser()` | GET | `/api/auth/me` | 获取当前用户信息 |
| `changePassword(data)` | PUT | `/api/auth/password` | 修改密码 |

#### contacts.js - 联系人接口

| 函数 | HTTP 方法 | 后端地址 | 用途 |
|------|----------|---------|------|
| `getList(params)` | GET | `/api/contacts` | 分页列表（支持 groupId、keyword） |
| `getFavorites()` | GET | `/api/contacts/favorite` | 收藏列表 |
| `getDetail(id)` | GET | `/api/contacts/{id}` | 联系人详情 |
| `add(data)` | POST | `/api/contacts` | 添加联系人 |
| `update(id, data)` | PUT | `/api/contacts/{id}` | 编辑联系人 |
| `delete(id)` | DELETE | `/api/contacts/{id}` | 删除联系人 |
| `batchDelete(ids)` | DELETE | `/api/contacts/batch` | 批量删除 |
| `search(params)` | GET | `/api/contacts/search` | 搜索联系人 |
| `toggleFavorite(id, fav)` | PUT | `/api/contacts/{id}/favorite` | 切换收藏状态 |

#### groups.js - 分组接口

| 函数 | HTTP 方法 | 后端地址 | 用途 |
|------|----------|---------|------|
| `getList()` | GET | `/api/groups` | 获取所有分组 |
| `create(data)` | POST | `/api/groups` | 创建分组 |
| `update(id, data)` | PUT | `/api/groups/{id}` | 编辑分组 |
| `delete(id, moveToId)` | DELETE | `/api/groups/{id}?moveToId=` | 删除分组（联系人移到指定分组） |
| `getContacts(id, params)` | GET | `/api/groups/{id}/contacts` | 分组下的联系人 |
| `moveContacts(data)` | POST | `/api/groups/move` | 移动联系人到分组 |
| `sort(groupIds)` | PUT | `/api/groups/sort` | 调整分组排序 |

---

## 6. 四大层级详解

### 6.1 入口层

**index.js** 只有一行代码，作用是告诉 Expo："把这个组件作为 App 的起点"。

**App.js** 搭了一个**三层容器**结构：

```
<GestureHandlerRootView>    ← ① 处理手势（滑动、长按等），必须放最外层
  <SafeAreaProvider>         ← ② 处理刘海屏/底部指示条的安全区域
    <NavigationContainer>    ← ③ 导航的根容器，管理所有页面跳转
      <StatusBar />          ←    状态栏样式（黑色文字）
      <AppNavigator />       ←    核心：根据登录状态路由页面
    </NavigationContainer>
  </SafeAreaProvider>
</GestureHandlerRootView>
```

### 6.2 导航层

导航层级结构：

```
AppNavigator (根，headerShown: false — 不显示顶部导航栏)
├── SplashScreen            ← 检查登录时显示
├── Auth (AuthNavigator)    ← 未登录时显示
│   ├── Login               ← headerShown: false（登录页不显示导航栏）
│   └── Register            ← title: "注册账号"，有返回按钮
└── Main (MainNavigator)    ← 已登录时显示
    ├── Home                ← headerShown: false（首页自定义头部）
    ├── ContactDetail       ← title: "联系人详情"
    ├── ContactEdit         ← title: "编辑联系人"
    ├── GroupManage         ← title: "分组管理"
    ├── Profile             ← title: "个人中心"
    └── Settings            ← title: "设置"
```

**页面跳转关系图：**

```
                      LoginScreen ──→ RegisterScreen
                           ↑  (注册成功自动返回)
                           │
    HomeScreen ──→ ContactDetailScreen ──→ ContactEditScreen
       │                 (点击联系人)         (点编辑按钮)
       │
       ├──→ GroupManageScreen  (点"管理"按钮)
       ├──→ ProfileScreen      (点头像区域)
       └──→ SettingsScreen     (点齿轮图标)
```

### 6.3 页面层

每个页面的数据来源有两种方式：

| 方式 | 说明 | 例子 |
|------|------|------|
| **通过 Store** | 从 Zustand 拿数据，Store 内部封装了 API 调用 | HomeScreen 从 useContactStore 拿联系人列表 |
| **直接调 API** | 页面内直接 `import` API 模块发请求 | ContactDetailScreen 直接调 `contactAPI.getDetail()` |

#### 各页面的数据来源一览：

| 页面 | 用到的 Store | 直接调用的 API | 用到的 Utils |
|------|-------------|---------------|-------------|
| SplashScreen | useAuthStore (isLoading) | — | — |
| LoginScreen | useAuthStore (login) | — | — |
| RegisterScreen | useAuthStore (register) | — | validator |
| HomeScreen | useAuthStore (user, logout) + useContactStore (全部) + useGroupStore (groups, loadGroups) | — | useDebounce |
| ContactDetailScreen | — | contactAPI.getDetail | phone (makeCall/sendSMS/sendEmail), date |
| ContactEditScreen | useGroupStore (groups, loadGroups) | contactAPI (getDetail/add/update) | validator |
| GroupManageScreen | useGroupStore (全部) | — | — |
| ProfileScreen | useAuthStore (user) | authAPI.getCurrentUser, client.put | validator |
| SettingsScreen | useAuthStore (logout) | authAPI.changePassword | — |

### 6.4 数据层

#### 6.4.1 useAuthStore（认证仓库）

```
状态（state）：
  isLoggedIn: false/true    ← 是否已登录
  user: { id, username, nickname, avatar }  ← 当前用户信息
  isLoading: true/false     ← 启动时是否还在检查 Token

操作（actions）：
  checkLoginStatus()  →  发 GET /api/auth/me 验证 Token
  login(user, pass)   →  发 POST /api/auth/login → 保存 Token 和用户信息到本地
  register(data)      →  发 POST /api/auth/register
  logout()            →  清除本地 Token + 清除状态
```

**登录的完整数据流：**

```
用户输入用户名密码 → 点击登录
  → LoginScreen.handleLogin()
    → useAuthStore.login(username, password)
      → authAPI.login({ username, password })
        → client.post('/api/auth/login', data)
          → [请求拦截器加 Token 头（此时还没有 Token）]
          → 后端返回 { code: 200, data: { token, userId, username, nickname, avatar } }
        → 拿到 result
      → result.code === 200 ✓
      → saveToken(token)                ← 把 Token 存到手机本地
      → saveUserInfo({ id, username, ... })  ← 把用户信息也存本地
      → set({ isLoggedIn: true, user })  ← 更新状态
    → 返回 { success: true }
  → AppNavigator 检测到 isLoggedIn 变为 true
  → 自动从 AuthNavigator 切换到 MainNavigator
  → 用户看到首页！
```

#### 6.4.2 useContactStore（联系人仓库）

```
状态（state）：
  contacts: []           ← 联系人列表
  total: 0               ← 总数量
  currentPage: 1         ← 当前页码
  hasMore: true          ← 是否还有更多数据
  isLoading: false       ← 是否正在加载
  isRefreshing: false    ← 是否正在下拉刷新
  selectedGroupId: null  ← 当前筛选的分组（null = 全部）
  keyword: ''            ← 搜索关键词
  favorites: []          ← 收藏列表

操作（actions）：
  loadContacts(page, refresh)  ← 核心：加载联系人（自动带分组和搜索参数）
  refresh()                    ← 下拉刷新（= loadContacts(1, true)）
  loadMore()                   ← 上拉加载更多（= loadContacts(currentPage+1)）
  setGroupFilter(groupId)     ← 切换分组筛选
  setKeyword(keyword)         ← 设置搜索词
  loadFavorites()             ← 加载收藏列表
  toggleFavorite(id, fav)     ← 切换收藏
  removeContact(id)           ← 删除联系人
```

**搜索的防抖机制：**

```
用户在搜索框打字 "张"
  → searchText = "张"
    ↓ (等待 300ms，如果期间用户继续打字，重新计时)
  → debouncedSearch = "张"
    ↓
  → useContactStore.setKeyword("张")
    → 自动调用 loadContacts(1, true)（带 keyword="张"）
      → contactAPI.getList({ page: 1, size: 20, keyword: "张" })
```

#### 6.4.3 useGroupStore（分组仓库）

```
状态（state）：
  groups: []       ← 分组列表
  isLoading: false ← 是否加载中

操作（actions）：
  loadGroups()                       ← 加载所有分组
  createGroup(data)                  ← 创建分组
  updateGroup(id, data)             ← 编辑分组
  deleteGroup(id, moveToId)         ← 删除分组（联系人移到默认分组）
  moveContacts(contactIds, groupIds) ← 移动联系人
```

---

## 7. 每个页面做了什么

### 7.1 SplashScreen（启动页）

- **什么时候出现**：App 刚打开，还在检查登录状态时
- **显示内容**：Logo + "手机通讯录" + 加载转圈
- **不调用任何 API**，纯展示

### 7.2 LoginScreen（登录页）

- **输入**：用户名 + 密码
- **点击登录**：
  1. 前端验证：用户名和密码不能为空
  2. 调用 `useAuthStore.login()` → 发 POST 请求
  3. 成功 → Store 更新 `isLoggedIn = true` → 导航自动切到主页
  4. 失败 → 弹出红色 Toast 提示错误信息
- **点击"立即注册"**：跳转到 RegisterScreen

### 7.3 RegisterScreen（注册页）

- **输入**：用户名、密码、确认密码、手机号（选填）、邮箱（选填）
- **前端验证**：
  - 用户名 3-50 字符
  - 密码至少 6 位
  - 两次密码一致
  - 邮箱格式正确（如果填了）
- **点击注册**：调用 `useAuthStore.register()`
- **成功**：弹出绿色 Toast "注册成功，请登录" → 1.5 秒后自动返回登录页

### 7.4 HomeScreen（首页 — 最复杂的页面）

布局从上到下：

```
┌──────────────────────────┐
│ 顶部栏：头像+用户名 | 设置⚙️ 退出  │  ← 自定义 headerBar
├──────────────────────────┤
│ 搜索框：🔍 搜索姓名、电话、邮箱    │  ← SearchBar 组件
├──────────────────────────┤
│ 分组标签：全部 | 家人 | 朋友 | 同事 | +管理 │  ← GroupHeader 组件（横向滚动）
├──────────────────────────┤
│ 联系人1: 🧑 张三       › │
│          138xxxx  ★      │  ← ContactItem 组件
├──────────────────────────┤
│ 联系人2: 🧑 李四       › │
│          139xxxx          │
├──────────────────────────┤
│ 联系人3: ...              │
│       ...（支持下拉刷新、上拉加载更多）  │
│                          │
│                  [+]     │  ← FloatingButton（悬浮按钮）
└──────────────────────────┘
```

**交互动作：**

| 动作 | 触发方式 | 效果 |
|------|---------|------|
| 下拉刷新 | 手指下拉 | `refresh()` → 重新加载第 1 页 |
| 上拉加载更多 | 滑到底部 | `loadMore()` → 加载下一页 |
| 点击联系人 | 点击行 | 跳转 ContactDetailScreen |
| 长按联系人 | 长按行 | 弹出删除确认弹窗 |
| 点击分组标签 | 点击标签 | 切换筛选，刷新列表 |
| 搜索 | 输入文字 | 300ms 防抖后自动搜索 |
| 点击 + 号 | 点击 FAB | 跳转 ContactEditScreen（添加模式） |
| 点击头像 | 点击头像 | 跳转 ProfileScreen |
| 点击设置 | 点击齿轮 | 跳转 SettingsScreen |
| 点击退出 | 点击退出 | 弹窗确认 → 退出登录 |

### 7.5 ContactDetailScreen（联系人详情页）

- **加载时机**：进入页面时 + 每次页面聚焦时（从编辑页返回会自动刷新）
- **直接调 API**：`contactAPI.getDetail(contactId)`
- **显示内容**：头像、姓名、公司/职位、收藏标记、快捷操作按钮（拨号/短信/邮件/编辑）、详细信息卡片、分组标签
- **拨号**：调 `makeCall(phone)` → 调用系统拨号器
- **短信**：调 `sendSMS(phone)` → 打开系统短信 App
- **邮件**：调 `sendEmail(email)` → 打开系统邮件 App

### 7.6 ContactEditScreen（添加/编辑联系人页）

- **模式**：通过 `route.params.mode` 区分
  - `mode: 'add'` → 空白表单
  - `mode: 'edit'` → 先调 `contactAPI.getDetail(id)` 加载现有数据
- **表单字段**：
  - 基本信息：姓名*、手机号*、备用电话、邮箱、备用邮箱
  - 其他信息：地址、生日、公司、职位、网站、备注
  - 分组选择：显示所有分组标签，点击切换选中状态
- **前端验证**：姓名必填、手机号必填且格式正确、邮箱格式（如果填了）
- **提交**：`add` 模式调 `contactAPI.add()`，`edit` 模式调 `contactAPI.update()`
- **成功**：弹 Toast → 1 秒后返回上一页

### 7.7 GroupManageScreen（分组管理页）

- **加载**：进入时 `loadGroups()` 获取所有分组
- **显示**：分组列表（颜色圆点 + 分组名 + 联系人数 + 编辑/删除按钮）
- **新建**：底部"新建分组"按钮 → 弹窗（输名称 + 选颜色）
- **编辑**：点"编辑"按钮 → 弹窗（预设现有值）
- **删除**：点"删除" → Alert 确认 → `deleteGroup(id)`
- **所有分组都可以编辑删除**（没有"系统分组"限制）

### 7.8 ProfileScreen（个人中心）

- **加载**：`authAPI.getCurrentUser()` 获取最新信息
- **显示**：头像（首字母）+ 用户名 + 表单（昵称/手机/邮箱/性别）
- **保存**：直接调 `client.put('/api/users/profile', data)`，成功后重新加载显示
- **注意**：这里用了 `client` 直接发请求，没有通过单独的 API 模块，因为设计中没有专门的 user.js 模块

### 7.9 SettingsScreen（设置页）

- **修改密码**：弹窗 → 输入原密码 + 新密码 + 确认 → `authAPI.changePassword()` → 成功后自动退出登录
- **清除缓存**：显示 Alert "缓存已清除"（实际没有清除操作，占位功能）
- **关于我们**：显示版本信息 Alert
- **退出登录**：Alert 确认 → `logout()`

---

## 8. 组件库一览

### 8.1 Avatar（头像）

```
Props: uri（图片URL）, name（姓名）, size（尺寸默认48）, color（背景色）
逻辑：有 uri → 显示图片圆形头像
     无 uri → 显示名字首字母 + 绿色背景
```

### 8.2 ContactItem（联系人行）

```
Props: contact（联系人对象）, onPress（点击回调）, onLongPress（长按回调）
布局：[头像 44px] [姓名 + 收藏星标 / 电话 / 分组标签...] [› 箭头]
```

### 8.3 SearchBar（搜索框）

```
Props: value（输入值）, onChangeText（输入回调）, onClear（清除回调）
布局：[🔍] [输入框...] [✕ 清除按钮]
```

### 8.4 GroupHeader（分组标签栏）

```
Props: groups（分组数组）, selectedId（选中分组ID）, onSelect（选择回调）, onManage（管理回调）
布局：[全部] [家人 3] [朋友 5] [同事 8] ... [+ 管理]
     横向滚动，选中的标签变为对应颜色实心
```

### 8.5 EmptyView（空状态）

```
Props: message（提示文字）, icon（emoji图标）
显示居中的大图标 + 文字
```

### 8.6 LoadingView（加载中）

```
Props: message（默认"加载中..."）
显示转圈动画 + 文字
```

### 8.7 FloatingButton（悬浮按钮）

```
Props: onPress（点击回调）
固定在右下角的绿色圆形 + 号按钮
```

### 8.8 CustomModal（确认弹窗）

```
Props: visible, title, message, confirmText, cancelText, onConfirm, onCancel, danger
danger=true → 确认按钮变红色（用于删除操作）
```

### 8.9 CustomToast（轻提示）

```
Props: visible, message, type（success/error/info）, duration（默认2000ms）, onHide
顶部滑入 → 停留 → 自动消失
颜色：success=绿色, error=红色, info=深色
```

---

## 9. 工具函数一览

### 9.1 constants.js（常量）

```js
API_BASE_URL  →  自动判断开发/生产环境
  - 开发环境: 从 Expo hostUri 推断 → http://192.168.x.x:8080
  - Android 模拟器降级: http://10.0.2.2:8080
  - iOS 模拟器降级: http://localhost:8080

STORAGE_KEYS  →  AsyncStorage 的 key 名
  TOKEN: '@phonebook_token'
  USER_INFO: '@phonebook_user_info'

PAGE_SIZE = 20  →  联系人列表每页 20 条
```

### 9.2 storage.js（本地存储）

封装了 AsyncStorage 的读写操作：

| 函数 | 作用 | 被谁调用 |
|------|------|---------|
| `saveToken(token)` | 保存 JWT Token | useAuthStore.login() |
| `getToken()` | 读取 Token | client.js 请求拦截器 |
| `removeToken()` | 删除 Token | client.js 401 拦截器 / useAuthStore.logout() |
| `saveUserInfo(info)` | 保存用户信息 | useAuthStore.login() |
| `getUserInfo()` | 读取用户信息 | — （暂未使用，预留） |
| `clearAll()` | 清除所有数据 | useAuthStore.logout() |

### 9.3 validator.js（表单验证）

| 函数 | 规则 | 被谁调用 |
|------|------|---------|
| `isValidPhone(phone)` | 中国手机号：`1[3-9]xxxxxxxxx`（11位） | ContactEditScreen |
| `isValidEmail(email)` | 包含 @ 和 . 的基本格式 | RegisterScreen, ContactEditScreen, ProfileScreen |
| `isValidPassword(pwd)` | 长度 ≥ 6 | RegisterScreen |
| `isValidUsername(name)` | 长度 3-50 | RegisterScreen |

### 9.4 phone.js（系统调用）

| 函数 | 做的事 | 调用方式 |
|------|-------|---------|
| `makeCall(phone)` | 调系统拨号器 | `Linking.openURL('tel:138xxxx')` |
| `sendSMS(phone)` | 打开系统短信 App | `Linking.openURL('sms:138xxxx')` |
| `sendEmail(email)` | 打开系统邮件 App | `Linking.openURL('mailto:xx@xx.com')` |

### 9.5 date.js（日期格式化）

| 函数 | 输入 | 输出 |
|------|------|------|
| `formatDate(date)` | 时间戳/Date | `"2025-06-12"` |
| `formatDateTime(date)` | 时间戳/Date | `"2025-06-12 14:30"` |

### 9.6 useDebounce.js（防抖 Hook）

```
场景：用户搜索时，不要在每打一个字时就发请求
     而是等用户停止打字 300ms 后再发

工作原理：
  输入 "张" → 启动 300ms 计时器
  输入 "张三" → 取消上一个计时器，重新启动 300ms 计时器
  输入 "张三丰" → 取消上一个计时器，重新启动 300ms 计时器
  （用户停止打字 300ms 后）
  → debouncedSearch = "张三丰" → 触发搜索请求
```

---

## 10. 样式系统

项目使用四个样式文件，形成了简单的**设计系统**：

### colors.js（颜色表）

```
主色：primary (#07C160 微信绿)  ← 按钮、选中态
背景：background (#F5F6FA 浅灰)  ← 页面背景
      surface (#FFFFFF 白色)     ← 卡片/列表背景
文字：textPrimary (#1A1A2E 深灰黑) ← 标题、正文
      textSecondary (#8E8E93 灰)   ← 次要信息
      textHint (#C7C7CC 浅灰)      ← 占位符
状态：success=绿色, warning=橙色, error=红色, info=蓝色
分组色：7种颜色供分组选择
```

### spacing.js（间距表）

```
xs:4  sm:8  md:12  base:16  lg:20  xl:24  xxl:32
```

### typography.js（字体）

```
h1: 24px/粗体  h2: 20px/粗体  h3: 17px/粗体
body: 15px/常规  caption: 13px/常规  small: 11px/常规
```

### globalStyles.js（通用样式）

预定义了 `card`、`input`、`primaryButton`、`separator` 等可复用样式，但实际页面大多还是写了内联的 `StyleSheet.create`，全局样式用得不多。

---

## 11. 完整数据流向图

### 11.1 整体架构分层

```
┌──────────────────────────────────────────────────────────────────┐
│                        用户界面 (UI)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │SplashScreen│ │LoginScreen│ │HomeScreen│ │DetailScreen│  ...    │
│  └─────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘            │
│        │             │            │              │                 │
│        │    使用      │    使用    │    使用      │   直接调API     │
│        ▼             ▼            ▼              │                 │
│  ┌──────────────────────────────────────┐        │                 │
│  │         Zustand Stores (状态仓库)     │        │                 │
│  │  ┌───────────┐ ┌───────────┐ ┌───────┐       │                 │
│  │  │useAuthStore│ │useContact │ │useGroup│      │                 │
│  │  │           │ │  Store    │ │ Store  │       │                 │
│  │  └─────┬─────┘ └─────┬─────┘ └───┬───┘       │                 │
│  └────────┼─────────────┼───────────┼───────────┼─────────────────┘
│           │             │           │           │
│           │    调用     │    调用    │   调用    │    调用
│           ▼             ▼           ▼           ▼
│  ┌──────────────────────────────────────────────────┐            │
│  │              API 模块 (api/*.js)                  │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │            │
│  │  │ auth.js  │ │contacts.js│ │ groups.js│          │            │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘          │            │
│  └───────┼────────────┼───────────┼────────────────┘            │
│          │            │           │                              │
│          │   都使用    │   都使用   │   都使用                     │
│          ▼            ▼           ▼                              │
│  ┌──────────────────────────────────────────────────┐            │
│  │           client.js (Axios 实例)                  │            │
│  │  ┌──────────────────────────────────────────┐    │            │
│  │  │ 请求拦截器：自动加 Authorization: Bearer   │    │            │
│  │  │ 响应拦截器：提取 data / 处理 401 / 错误   │    │            │
│  │  └──────────────────────────────────────────┘    │            │
│  └──────────────────────┬───────────────────────────┘            │
│                         │ HTTP 请求                               │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────┐            │
│  │          Spring Boot 后端 (Java)                  │            │
│  │          http://xxx:8080/api/...                  │            │
│  └──────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 登录成功后的全局 401 监听机制

这是一个**事件驱动的退登机制**：

```
设置阶段（AppNavigator 加载时）：
  useEffect(() => {
    global.onUnauthorized = () => {
      useAuthStore.getState().logout();  // ← 在全局挂一个函数
    };
  }, []);

触发阶段（任何一个 API 返回 401 时）：
  client.js 响应拦截器
    → removeToken()
    → if (global.onUnauthorized) global.onUnauthorized();
      → 执行上面挂的那个函数
        → useAuthStore.logout()
          → clearAll() 清除本地 Token
          → set({ isLoggedIn: false, user: null })
            → AppNavigator 重新渲染
              → isLoggedIn = false
                → 显示 AuthNavigator（登录页）
```

### 11.3 各页面与数据层的关系速查表

```
                    useAuthStore    useContactStore    useGroupStore    直接调API
SplashScreen            ✓                -                 -               -
LoginScreen             ✓                -                 -               -
RegisterScreen          ✓                -                 -               -
HomeScreen              ✓                ✓                 ✓               -
ContactDetailScreen     -                -                 -          contactAPI.getDetail
ContactEditScreen       -                -                 ✓          contactAPI.*
GroupManageScreen       -                -                 ✓               -
ProfileScreen           ✓                -                 -          authAPI.getCurrentUser
                                                                     client.put
SettingsScreen          ✓                -                 -          authAPI.changePassword
```

---

## 总结

这个项目虽然文件不少（36 个 JS 文件），但结构非常清晰，遵循了**分层架构**：

```
入口层 (index.js, App.js)
  └→ 导航层 (AppNavigator → Auth/Main)
       └→ 页面层 (9 个 Screen)
            ├─→ 状态层 (3 个 Zustand Store)
            │    └→ API 层 (4 个 API 模块)
            │         └→ Axios 核心 (client.js)
            ├─→ 组件层 (9 个可复用组件)
            └─→ 工具层 (6 个工具模块)
```

**记住三个核心链条：**

1. **登录链**：LoginScreen → useAuthStore.login() → authAPI.login() → client.post → 后端返回 Token → saveToken 存本地 → isLoggedIn 变 true → 自动跳到主页

2. **数据加载链**：HomeScreen → useContactStore.loadContacts() → contactAPI.getList() → client.get → 后端返回联系人列表 → set({ contacts }) → FlatList 自动刷新

3. **安全链**：任何 API 返回 401 → client.js 拦截器 → removeToken → global.onUnauthorized() → logout → isLoggedIn 变 false → 自动跳到登录页

这三个链条覆盖了 App 90% 的运行逻辑。理解了它们，就理解了这个项目的核心。
