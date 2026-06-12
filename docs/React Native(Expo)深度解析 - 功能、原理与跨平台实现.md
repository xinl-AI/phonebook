# React Native (Expo) 深度解析 — 功能、作用、原理与跨平台实现

> 适合刚接触跨平台开发的小白阅读。从零开始讲清楚 React Native 是什么、Expo 是什么、怎么做到一套代码同时跑在 Android 和 iOS 上。

---

## 目录

1. [先搞清楚：原生开发 vs 跨平台开发](#1-先搞清楚原生开发-vs-跨平台开发)
2. [React Native 是什么](#2-react-native-是什么)
3. [Expo 是什么](#3-expo-是什么)
4. [核心架构：三线程模型](#4-核心架构三线程模型)
5. [跨平台如何实现](#5-跨平台如何实现)
6. [从 JSX 到屏幕上的像素：完整渲染流程](#6-从-jsx-到屏幕上的像素完整渲染流程)
7. [新旧架构对比：Bridge vs JSI/Fabric](#7-新旧架构对比bridge-vs-jsifabric)
8. [本项目用到的关键库解析](#8-本项目用到的关键库解析)
9. [Expo 项目的生命周期](#9-expo-项目的生命周期)
10. [一张图总结全部](#10-一张图总结全部)

---

## 1. 先搞清楚：原生开发 vs 跨平台开发

### 1.1 原生开发

要做一款手机 App，传统上需要写两套代码：

```
Android 工程师             iOS 工程师
     │                        │
     ▼                        ▼
┌──────────┐           ┌──────────┐
│ Kotlin/  │           │  Swift/  │
│  Java    │           │  Obj-C   │
└────┬─────┘           └────┬─────┘
     │                      │
     ▼                      ▼
┌──────────┐           ┌──────────┐
│ Android  │           │   iOS    │
│   APK    │           │   IPA    │
└──────────┘           └──────────┘
```

**优点**：性能最好、能调用所有系统 API、体验最原生
**缺点**：需要两个团队、两套代码、开发成本翻倍、功能可能不同步

### 1.2 跨平台开发（React Native 的方案）

```
        JavaScript/React 代码（只需写一套）
                    │
                    ▼
        ┌─────────────────────┐
        │    React Native     │
        │   （中间层/翻译官）   │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌──────────┐          ┌──────────┐
   │ Android  │          │   iOS    │
   │ 原生控件  │          │ 原生控件  │
   └──────────┘          └──────────┘
```

**优点**：一套代码两个平台、前端工程师就能写 App、热更新无需审核
**缺点**：性能略低于纯原生、某些特殊硬件功能需要写原生桥接代码

---

## 2. React Native 是什么

### 2.1 一句话定义

> **React Native = React（写 UI 的框架）+ Native（真原生控件，不是网页）**

很多人以为 React Native 就是在手机里跑一个网页（WebView），**这是错的**。React Native 渲染的是**真正的原生控件**：

| 你写的 JSX | Android 上变成 | iOS 上变成 |
|-----------|---------------|-----------|
| `<Text>你好</Text>` | `android.widget.TextView` | `UILabel` |
| `<TextInput />` | `android.widget.EditText` | `UITextField` |
| `<FlatList />` | `RecyclerView` | `UITableView` |
| `<TouchableOpacity />` | 带点击态的 `View` | 带点击态的 `UIView` |
| `<Image />` | `ImageView` | `UIImageView` |

### 2.2 React Native 不是什么

| ❌ 误解 | ✅ 真相 |
|--------|-------|
| 是网页套壳（WebView） | 渲染的是真原生控件，不是 HTML |
| 性能很差 | 新架构下接近原生，大多数场景感知不到差异 |
| 只能做简单 App | Facebook、Instagram、Shopify 等大厂都在用 |
| 一套代码完全不改就能跑 | 90% 代码共享，UI 可能需要少量平台适配 |

### 2.3 核心原理：三个关键词

```
JavaScript 代码 → 描述 UI（像写网页一样写 App）
       ↓
React 的协调算法 → 计算出哪些控件需要增/删/改
       ↓
原生渲染引擎 → 创建/更新真正的 Android/iOS 控件
```

---

## 3. Expo 是什么

### 3.1 层级关系

```
┌─────────────────────────────────────────┐
│                 Expo                    │
│  ┌─────────────────────────────────┐    │
│  │        React Native             │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │       React             │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Expo 是 React Native 的上层工具包**，就像一个"全家桶"：

| 没有 Expo | 有 Expo |
|----------|---------|
| 需要手动配置 Android Studio + Xcode | 用手机扫码就能预览 |
| 需要手动安装和管理原生模块 | `npx expo install xxx` 一条命令 |
| 需要手动处理权限（相机、相册等） | `expo-camera`、`expo-image-picker` 开箱即用 |
| 打 Release 包需要配置签名 | `eas build` 云端自动构建 |
| 不能热更新 | `expo-updates` 推送 JS 包无需重新审核 |

### 3.2 本项目中 Expo 做了哪些事

查看项目的 `package.json` 和 `app.json`：

```json
// package.json 中的 Expo 依赖
"expo": "~54.0.0",                     // Expo 核心
"expo-status-bar": "~3.0.9",           // 状态栏管理
"expo-font": "~14.0.12",               // 字体加载
"expo-asset": "~12.0.13",              // 资源加载
"expo-constants": "~18.0.13",          // 读取 app.json 配置
"expo-linking": "~8.0.12",             // 深度链接 + 系统拨号/短信

// app.json 中的配置
"name": "手机通讯录",                    // App 名称
"slug": "phonebook",                    // Expo 项目标识
"android": { "package": "com.phonebook.app" },  // Android 包名
"ios": { "bundleIdentifier": "com.phonebook.app" }  // iOS Bundle ID
```

Expo 帮我们**自动处理了原生工程的创建、签名配置、权限声明**，让我们只用 JS 就能开发 App。

---

## 4. 核心架构：三线程模型

React Native 运行时涉及**三个线程**，理解了这个就理解了 React Native 的核心：

```
┌─────────────────────────────────────────────────────────────────┐
│                        手机操作系统                               │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  JavaScript 线程 │  │   原生/UI 线程   │  │    Shadow 线程  │  │
│  │  (JS Thread)    │  │  (Main Thread)  │  │ (Shadow Thread) │  │
│  │                 │  │                 │  │                 │  │
│  │  • 你的 JS 代码  │  │  • 原生控件渲染  │  │  • 计算布局     │  │
│  │  • React 逻辑   │  │  • 屏幕绘制      │  │  • Flexbox 算法 │  │
│  │  • 状态管理     │  │  • 触摸事件      │  │  • Yoga 引擎    │  │
│  │  • 网络请求     │  │  • 动画执行      │  │                 │  │
│  │                 │  │                 │  │                 │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│                    ┌───────────┴───────────┐                    │
│                    │      Bridge / JSI     │                    │
│                    │  （线程间通信通道）     │                    │
│                    └───────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 JavaScript 线程 — "大脑"

- **干什么**：运行你写的所有 JS 代码——React 组件、Zustand 状态管理、Axios 网络请求、业务逻辑
- **特点**：这是一个独立的线程，**不直接操作 UI**。它只负责"描述 UI 应该长什么样"
- **本项目中**：LoginScreen、HomeScreen 的逻辑、useContactStore 的数据处理都跑在这个线程

### 4.2 原生/UI 线程 — "双手"

- **干什么**：真正渲染原生控件到屏幕上、处理用户触摸事件
- **特点**：这是 App 的主线程，Android 和 iOS 各自有自己的实现
- **本项目中**：`<Text>你好</Text>` 在这个线程变成真正的 `TextView`/`UILabel`

### 4.3 Shadow 线程 — "测量员"

- **干什么**：计算布局。当 JS 线程说"这个 View 应该 flex:1，那个 Text 字号 16"，Shadow 线程负责算出每个元素在屏幕上的具体位置和大小
- **特点**：使用 Facebook 开源的 **Yoga 布局引擎**，实现了 CSS Flexbox 算法，但用 C++ 写成，跨平台一致
- **本项目中**：你写的 `flex: 1, justifyContent: 'center'` 都是 Yoga 在计算

### 4.4 为什么需要三个线程？不能放在一个吗？

不能。关键原因是：

1. **JS 是单线程的**：如果 JS 执行耗时操作，它会阻塞。如果 UI 渲染也在同一条线程，App 就会卡住（这就是为什么纯原生 App 也把 UI 和业务逻辑分开）
2. **布局计算很重**：Flexbox 计算涉及复杂的测量-布局-排版，用独立的 C++ 引擎（Yoga）比 JS 算快得多
3. **隔离**：JS 线程崩了 ≠ App 崩了，原生线程可以显示降级 UI

---

## 5. 跨平台如何实现

### 5.1 核心策略：抽象 + 桥接

React Native 跨平台的核心思想是 **"Learn once, write anywhere"**，通过两层抽象实现：

```
                    ┌─────────────────────────┐
                    │     你的 JSX 代码        │
                    │  <View>                  │
                    │    <Text>你好</Text>     │
                    │  </View>                 │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴─────────────┐
                    │   React Native 核心层    │  ← 平台无关的抽象
                    │  (JavaScript 端)         │
                    │  View → requireNative('View') │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴─────────────┐
                    │        Bridge / JSI      │  ← 跨语言通信
                    └───────────┬─────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │  Android 原生实现  │              │   iOS 原生实现    │
    │                  │              │                  │
    │ RCTView.java     │              │ RCTView.m        │
    │ → android.view   │              │ → UIView         │
    │   .View          │              │                  │
    └──────────────────┘              └──────────────────┘
```

### 5.2 三层跨平台策略

#### 第一层：JavaScript 代码 — 100% 共享

这一层完全跨平台。本项目 `src/` 下的全部 36 个 JS 文件，**Android 和 iOS 共用同一份代码**：

```js
// 这份代码同时适用于 Android 和 iOS
const HomeScreen = () => {
  const { contacts, loadContacts } = useContactStore();
  // ... React 组件逻辑
};
```

#### 第二层：React Native 核心组件 — 自动映射

React Native 内置的组件会自动映射到各平台的原生控件：

```
<View>          →  Android: android.view.View     iOS: UIView
<Text>          →  Android: TextView              iOS: UILabel
<Image>         →  Android: ImageView             iOS: UIImageView
<TextInput>     →  Android: EditText              iOS: UITextField
<ScrollView>    →  Android: ScrollView            iOS: UIScrollView
<FlatList>      →  Android: RecyclerView          iOS: UITableView
<TouchableOpacity> → Android: 带 StateListDrawable 的 View  iOS: 带 highlight 的 UIView
<Modal>         →  Android: Dialog                iOS: UIViewController present
```

#### 第三层：平台特定代码 — 按需适配

有些功能每个平台不一样（比如拨号），就用 `Platform.OS` 做区分：

```js
// 本项目 phone.js 中的平台适配
import { Platform } from 'react-native';

export const makeCall = (phoneNumber) => {
  const url = Platform.OS === 'android'
    ? `tel:${cleanPhone}`       // Android 用 tel: 协议
    : `telprompt:${cleanPhone}`; // iOS 用 telprompt: 协议（拨号后会回到 App）
  Linking.openURL(url);
};
```

```js
// 本项目 constants.js 中的平台适配
export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080'   // Android 模拟器中，宿主机的 localhost 是 10.0.2.2
  : 'http://localhost:8080';  // iOS 模拟器中，直接 localhost 即可访问宿主机
```

### 5.3 跨平台的关键技术：Yoga 布局引擎

跨平台开发中最大的坑往往是**布局不一致**。React Native 用 **Yoga** 解决了这个问题：

```
CSS Flexbox (Web 标准)
       │
       ▼
Yoga 引擎（C++ 实现）
       │
   ┌───┴───┐
   ▼       ▼
Android   iOS

不管在哪个平台，Yoga 计算出的结果完全一致。
你写 justifyContent: 'center'，在 Android 和 iOS 上都是居中的。
```

Yoga 实现了 Flexbox 的一个子集（比 CSS 的 Flexbox 少一些属性），但足够覆盖移动端 95% 的布局需求。

---

## 6. 从 JSX 到屏幕上的像素：完整渲染流程

以本项目的一个具体例子追踪：**用户在首页看到"张三"这个联系人条目**。

```
第 1 步：写 JSX
─────────────────────────────────────────────
// ContactItem.js
<View style={styles.container}>
  <Avatar name="张三" size={44} />
  <View style={styles.info}>
    <Text style={styles.name}>张三</Text>
    <Text style={styles.phone}>13800001111</Text>
  </View>
</View>


第 2 步：React 协调 (JS 线程)
─────────────────────────────────────────────
React 执行 render() 函数，生成一个"虚拟 DOM 树"（JSON 对象）：

{
  type: 'View',
  props: { style: { flexDirection: 'row', ... } },
  children: [
    { type: 'Avatar', props: { name: '张三', size: 44 } },
    { type: 'View', props: { style: { flex: 1 } }, children: [
        { type: 'Text', props: { children: '张三' } },
        { type: 'Text', props: { children: '13800001111' } }
    ]}
  ]
}

React 对比新旧虚拟 DOM，算出差异（Diff）：
"之前没有张三，现在需要创建这一整条"


第 3 步：通过 Bridge/JSI 发送指令 (跨线程通信)
─────────────────────────────────────────────
JS 线程 → Shadow 线程：
  "创建 View(id=001, style={flexDirection:'row', padding:12...})"
  "创建 Text(id=002, style={fontSize:16, fontWeight:'500'})"

JS 线程 → 原生线程（在 Shadow 线程算完布局后）：
  "创建 RCTView(id=001, 位置: x=0 y=0 w=375 h=68)"
  "创建 RCTText(id=002, 位置: x=60 y=12 w=295 h=22, 文字: '张三')"


第 4 步：布局计算 (Shadow 线程)
─────────────────────────────────────────────
Yoga 引擎收到样式属性，开始计算：

容器 View(001):
  宽度 = 屏幕宽度 = 375px
  flexDirection: 'row' → 子元素横向排列
  padding: 16 → 内容区域从 x=16 开始

头像 Avatar:
  宽度 = 44, 高度 = 44
  占据 x:16 ~ x:60

信息区 View:
  flex: 1 → 占据剩余所有空间
  宽度 = 375 - 16(padding左) - 44(头像) - 12(间距) - 16(padding右) = 287

姓名 Text:
  字体大小 16, 字重 500
  Yoga 计算: 宽度=287, 高度≈22


第 5 步：原生控件渲染 (UI 线程)
─────────────────────────────────────────────
Android:                              iOS:
  创建 LinearLayout(id=001)            创建 UIStackView(id=001)
  设置方向: HORIZONTAL                 设置 axis: horizontal
  设置 padding: 16dp                   设置 layoutMargins: 16pt

  创建 ImageView(头像)                 创建 UIImageView(头像)
  设置大小 44x44                       设置 frame: {44, 44}

  创建 TextView(id=002)                创建 UILabel(id=002)
  设置文字: "张三"                      设置 text: "张三"
  设置字号: 16sp                       设置 font: 16pt
  设置位置: 基于 Yoga 计算结果          设置 frame: 基于 Yoga 计算结果


第 6 步：屏幕显示
─────────────────────────────────────────────
GPU 收到原生控件树 → 光栅化 → 像素点亮 → 用户看到 "张三"！
```

---

## 7. 新旧架构对比：Bridge vs JSI/Fabric

React Native 有两个版本架构，这个项目使用的是**旧架构（Bridge）**，但了解新架构有助于理解演进方向：

### 7.1 旧架构（Bridge）— 本项目使用的

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  JS 线程     │ ←JSON→  │   Bridge    │ ←JSON→  │  原生线程    │
│  (JavaScript)│  序列化  │  (消息队列)  │  反序列化 │  (Native)   │
└─────────────┘         └─────────────┘         └─────────────┘

通信方式：把数据序列化成 JSON → 放入队列 → 对面取出并反序列化
问题：JSON 序列化慢、异步通信有延迟、不适合高频操作（如动画）
```

就像两个人隔着一条河，把消息写在纸上装瓶子扔过去——慢但有异步缓冲。

### 7.2 新架构（JSI + Fabric + TurboModules）

```
┌─────────────┐                    ┌─────────────┐
│  JS 线程     │ ←── 直接调用 ───→  │  原生线程    │
│  (JavaScript)│    (同步/异步)     │  (Native)   │
└─────────────┘                    └─────────────┘

JSI (JavaScript Interface)：JS 可以直接持有 C++ 对象的引用
     → 不需要 JSON 序列化，直接内存访问
Fabric：新的 UI 渲染系统，Shadow 线程和 UI 线程可并发工作
TurboModules：原生模块按需加载，启动更快
```

就像造了一座桥，两个人可以直接走过去面对面说话——快且同步。

### 7.3 对开发者的影响

写代码时几乎感觉不到区别。`View` 还是 `View`，`Text` 还是 `Text`。新架构主要的提升在于性能：

- 列表滚动更流畅（特别是大列表）
- 动画不掉帧
- App 启动更快
- 内存占用更小

---

## 8. 本项目用到的关键库解析

### 8.1 @react-navigation/native + native-stack

**作用**：页面导航（路由跳转）

**原理**：用原生栈动画做页面切换（不是 JS 动画）。

```
this.props.navigation.navigate('ContactDetail', { contactId: 5 });
                                    ↓
                    ┌───────────────────────────────┐
                    │  Android: FragmentTransaction  │
                    │   + 原生滑入动画                │
                    │                               │
                    │  iOS: UINavigationController   │
                    │   + push/pop 动画               │
                    └───────────────────────────────┘
```

### 8.2 react-native-gesture-handler

**作用**：处理触摸手势（滑动、长按、拖拽等）

**为什么不用 RN 自带的手势**：RN 自带的手势在原生线程处理，JS 线程繁忙时会丢帧。这个库直接在原生线程处理手势，更流畅。

```js
// App.js 中包裹的 GestureHandlerRootView 就是为这个库服务的
<GestureHandlerRootView style={{ flex: 1 }}>
  {/* 所有子组件都可以用 gesture-handler */}
</GestureHandlerRootView>
```

### 8.3 react-native-safe-area-context

**作用**：处理刘海屏、挖孔屏、底部 Home 指示条的安全区域

```
┌───────────────────┐
│   SafeArea top    │  ← 避开状态栏/刘海
│ ┌───────────────┐ │
│ │               │ │
│ │   正常内容区   │ │
│ │               │ │
│ └───────────────┘ │
│  SafeArea bottom  │  ← 避开底部指示条
└───────────────────┘
```

```js
// HomeScreen 中使用
<SafeAreaView edges={['top']}>  {/* 只留顶部安全区域 */}
  {/* 联系人列表 */}
</SafeAreaView>
```

### 8.4 Zustand

**作用**：轻量级状态管理

**原理**：基于发布-订阅模式。Store 里的数据变了，所有用到它的组件自动重新渲染。

```js
// 创建 Store
const useContactStore = create((set, get) => ({
  contacts: [],
  loadContacts: async () => { /* ... */ set({ contacts: data }) },
}));

// 组件中使用
const contacts = useContactStore(state => state.contacts);
// contacts 变化 → 组件自动重新渲染
```

比 Redux 更简洁，不需要 Provider、action types、reducers。

### 8.5 Axios

**作用**：HTTP 网络请求

**原理**：

```js
axios.get('http://192.168.1.5:8080/api/contacts')
       │
       ▼
┌──────────────────────────┐
│  手机操作系统网络栈         │
│  Android: OkHttp         │
│  iOS: NSURLSession       │
└──────────────────────────┘
       │
       ▼
通过 TCP/IP 发送 HTTP 请求到后端服务器
```

RN 环境下的 Axios 底层使用的是各平台的**原生 HTTP 库**，不是浏览器的 `XMLHttpRequest`。

### 8.6 AsyncStorage

**作用**：本地持久化存储（类似网页的 localStorage）

```
Android 上：基于 SQLite 实现
iOS 上：基于 NSUserDefaults 或文件系统实现
```

本项目用它存储 JWT Token 和用户信息。

---

## 9. Expo 项目的生命周期

从开发到上线的完整流程：

```
开发阶段
────────────────────────────────────
npx expo start            → 启动 Metro 开发服务器
手机扫码 / 模拟器连接       → JS 代码实时推送到设备
修改代码 → 自动刷新         → 即时看到效果（Fast Refresh）


构建阶段
────────────────────────────────────
eas build --platform android  → Expo 云端服务帮你编译成 APK/AAB
eas build --platform ios      → Expo 云端服务帮你编译成 IPA

或者本地构建：
npx expo run:android          → 生成 Android 原生工程 + 编译
npx expo run:ios              → 生成 iOS 原生工程 + 编译


发布阶段
────────────────────────────────────
eas submit --platform android → 提交到 Google Play
eas submit --platform ios     → 提交到 App Store

热更新（不需要重新审核）：
eas update --branch production → 只推送 JS 代码包，用户打开 App 自动更新
```

**热更新**是 Expo 的一大杀手锏：如果只是改了 JS 逻辑（不改原生模块），可以直接推送更新，用户下次打开 App 就能看到新版本——不需要经过应用商店审核。

---

## 10. 一张图总结全部

```
                              ┌──────────────────────────────────────────────────────────┐
                              │                    你的代码世界                            │
                              │                                                          │
                              │   src/screens/   src/components/   src/stores/           │
                              │   src/api/       src/utils/        src/styles/           │
                              │                                                          │
                              │   全部是 JavaScript/JSX — Android 和 iOS 共享同一份代码    │
                              └────────────────────────┬─────────────────────────────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      Expo 工具链                                         │
│                                                                                         │
│  • expo start (开发服务器 + 扫码预览)                                                     │
│  • expo-camera / expo-image-picker 等 (原生功能封装)                                      │
│  • eas build / eas update (云端构建 + 热更新)                                             │
│  • expo-constants (读取 app.json 配置)                                                    │
└─────────────────────────────────────┬───────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   React Native 框架                                      │
│                                                                                         │
│  ┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐    │
│  │     JavaScript 线程    │    │     Shadow 线程        │    │     原生/UI 线程       │    │
│  │                       │    │                       │    │                       │    │
│  │  React 组件渲染       │    │  Yoga 布局引擎         │    │  Android: View 树     │    │
│  │  Zustand 状态管理      │    │  Flexbox 计算          │    │  iOS: UIView 树      │    │
│  │  Axios 网络请求       │    │  测量 → 布局 → 排版    │    │  触摸事件 → 手势处理   │    │
│  │  业务逻辑             │    │                       │    │  原生动画执行         │    │
│  └───────────┬───────────┘    └───────────┬───────────┘    └───────────┬───────────┘    │
│              │                            │                            │                │
│              └────────────────────────────┼────────────────────────────┘                │
│                                           │                                             │
│                                ┌──────────┴──────────┐                                  │
│                                │   Bridge / JSI      │                                  │
│                                │   线程间通信通道      │                                  │
│                                └──────────┬──────────┘                                  │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          ▼                                   ▼
               ┌──────────────────┐                ┌──────────────────┐
               │   Android 系统    │                │    iOS 系统       │
               │                  │                │                  │
               │  Android SDK     │                │  iOS SDK         │
               │  (API 30+, etc.) │                │  (UIKit, etc.)   │
               └────────┬─────────┘                └────────┬─────────┘
                        │                                   │
                        ▼                                   ▼
               ┌──────────────────┐                ┌──────────────────┐
               │   硬件层          │                │   硬件层          │
               │   CPU / GPU      │                │   CPU / GPU      │
               │   屏幕 / 触摸      │                │   屏幕 / 触摸      │
               └──────────────────┘                └──────────────────┘
```

---

## 与本项目的对应关系

| 理论知识 | 本项目中的体现 |
|---------|-------------|
| JS 线程执行业务逻辑 | `src/screens/*.js`、`src/stores/*.js` 全部在 JS 线程 |
| 原生控件渲染 | `<Text>` → `TextView`/`UILabel`，`<FlatList>` → `RecyclerView`/`UITableView` |
| Bridge 通信 | `client.js` 的 Axios 请求、`setState` 触发的 UI 更新经 Bridge 传到原生线程 |
| 平台适配 | `phone.js` 中 `Platform.OS === 'android'`、`constants.js` 中模拟器地址区分 |
| Yoga 布局 | 所有 `StyleSheet.create` 中的 `flex`、`justifyContent`、`alignItems` |
| 手势处理 | `GestureHandlerRootView` 包裹整个 App |
| 安全区域 | `SafeAreaView` 在页面顶部/底部留白 |
| 导航栈 | `AppNavigator` → `AuthNavigator`/`MainNavigator` 的 Stack 导航 |
| 热更新 | Expo 的 Fast Refresh - 修改代码后 1 秒内看到效果 |

---

## 总结

React Native (Expo) 跨平台的核心秘密就三句话：

1. **用 JavaScript 写 UI 和逻辑**（一套代码），React 负责描述界面长什么样
2. **Yoga 引擎保证布局一致**（Flexbox 算法用 C++ 实现，跨平台无差异）
3. **每个 React 组件映射到一个原生控件**（`<Text>` 不是 HTML span，是真 TextView/UILabel），靠 Bridge/JSI 做线程间通信

对于本项目（手机通讯录）这种**以 UI 展示和数据交互为主、不涉及复杂原生功能**的 App，React Native 是完美的选择——开发效率高、一套代码同时出 Android 和 iOS、维护成本低。
