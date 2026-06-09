# 📇 手机通讯录系统

基于 **React Native (Expo) + Spring Boot** 的 C/S 架构手机通讯录管理系统，支持联系人管理、分组筛选、JWT认证、软删除等功能。

## 项目结构

```
phonebook/
├── schema.sql                        # 数据库建表脚本
├── README.md
├── CLAUDE.md                         # Claude Code 辅助文档
├── backend-phonebook/                # Spring Boot 后端
│   ├── pom.xml                       # Maven 依赖
│   └── src/main/
│       ├── java/com/phonebook/        # Java 源码
│       │   ├── controller/           # REST 控制器
│       │   ├── service/impl/         # 业务逻辑
│       │   ├── mapper/               # MyBatis 数据访问
│       │   ├── entity/               # 数据库实体
│       │   ├── dto/request,response/ # 数据传输对象
│       │   ├── config/               # Spring Security / CORS / MyBatis 配置
│       │   ├── filter/               # JWT 认证过滤器
│       │   ├── utils/                # JwtUtil, Result 统一响应
│       │   └── exception/            # 全局异常处理
│       └── resources/
│           ├── application.yml       # ⚙️ 配置文件（需修改）
│           └── mapper/               # MyBatis XML
└── phonebook-client/                 # Expo 移动客户端
    ├── package.json
    ├── App.js                        # 根组件
    └── src/
        ├── api/                      # Axios 封装 + API 模块
        ├── stores/                   # Zustand 状态管理
        ├── screens/                  # 9 个页面组件
        ├── components/               # 通用 UI 组件
        ├── navigation/               # React Navigation 路由
        ├── utils/                    # 工具函数
        ├── hooks/                    # 自定义 Hook
        └── styles/                   # 颜色/间距/字体常量
```

## 环境要求

| 依赖 | 最低版本 | 说明 |
|------|---------|------|
| JDK | 11 | 推荐 17 |
| Maven | 3.6+ | 后端构建 |
| MySQL | 8.0 | 数据库（5.7 也可） |
| Node.js | 18+ | 前端运行 |
| Expo CLI | SDK 54 | `npm install -g expo-cli`（可选） |

## 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:xinl-AI/phonebook.git
cd phonebook
```

### 2. 创建数据库

确保 MySQL 已启动，然后执行建表脚本：

```bash
mysql -u root -p < schema.sql
```

执行完毕后会创建 `phonebook` 数据库及 6 张表。

### 3. 配置后端

编辑 **`backend-phonebook/src/main/resources/application.yml`**，修改以下 3 项：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/phonebook?...    # 数据库地址（本地开发无需改动）
    username: your_db_username                       # 👈 改为你的 MySQL 用户名
    password: your_db_password                       # 👈 改为你的 MySQL 密码

jwt:
  secret: your_jwt_secret_key_change_in_production   # 👈 改为随机字符串（生产环境必须）
  expiration: 86400000                               # Token 有效期（毫秒），24小时
```

### 4. 启动后端

```bash
cd backend-phonebook
mvn spring-boot:run
```

看到 `Started PhonebookApplication` 即启动成功，默认监听 `http://localhost:8080`。

### 5. 配置并启动前端

```bash
cd phonebook-client
npm install
npx expo start
```

API 地址自动适配（无需手动修改）：
- **Android 模拟器** → 自动使用 `10.0.2.2:8080`
- **iOS 模拟器** → 自动使用 `localhost:8080`
- **真机调试** → 自动从 Expo 连接地址推断电脑局域网 IP（需手机和电脑在同一 WiFi）

> 如需手动指定 API 地址，编辑 `src/utils/constants.js` 中的 `getBaseUrl()` 函数。

### 6. 预览

- 手机上安装 **Expo Go**，扫描终端输出的二维码即可
- 或在模拟器中按 `a`（Android）/ `i`（iOS）

## 功能特性

| 功能 | 说明 |
|------|------|
| 用户认证 | 注册 / 登录 / JWT Token / 401 自动跳转登录页 |
| 联系人 CRUD | 新增、编辑、软删除（is_deleted=1）、批量删除 |
| 分组管理 | 新建、编辑、删除分组，联系人可属于多个分组 |
| 分组筛选 | 点击分组标签实时过滤联系人列表 |
| 搜索 | 按姓名、电话、邮箱搜索（支持中文拼音） |
| 收藏 | 标记常用联系人 |
| 快捷操作 | 拨打电话、发送短信、发送邮件（调用系统应用） |
| 预设分组 | 新用户注册自动创建「家人」「朋友」「同事」 |

## API 接口

所有接口返回统一格式：`{ code: number, message: string, data: any }`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录，返回 JWT | 否 |
| GET | `/api/auth/me` | 获取当前用户信息 | 是 |
| PUT | `/api/auth/password` | 修改密码 | 是 |
| POST | `/api/auth/logout` | 退出登录 | 是 |
| GET | `/api/contacts?page=&size=&groupId=&keyword=` | 联系人列表（分页+筛选+搜索） | 是 |
| POST | `/api/contacts` | 添加联系人 | 是 |
| PUT | `/api/contacts/{id}` | 编辑联系人 | 是 |
| DELETE | `/api/contacts/{id}` | 删除联系人（软删除） | 是 |
| DELETE | `/api/contacts/batch` | 批量删除 | 是 |
| GET | `/api/contacts/search?keyword=` | 搜索联系人 | 是 |
| PUT | `/api/contacts/{id}/favorite` | 切换收藏 | 是 |
| GET | `/api/contacts/favorite` | 获取收藏列表 | 是 |
| GET | `/api/groups` | 获取所有分组 | 是 |
| POST | `/api/groups` | 创建分组 | 是 |
| PUT | `/api/groups/{id}` | 编辑分组 | 是 |
| DELETE | `/api/groups/{id}` | 删除分组 | 是 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 2.7.18 |
| 安全认证 | Spring Security + JJWT 0.9.1 + BCrypt |
| ORM | MyBatis-Plus 3.5.5 |
| 数据库 | MySQL 8.0 |
| 前端框架 | React Native 0.81 (Expo SDK 54) |
| 导航 | React Navigation 6 |
| 状态管理 | Zustand 4 |
| HTTP 客户端 | Axios 1 |

## 常见问题

**Q: 启动报 "port 8080 already in use"？**

```bash
# Windows
netstat -ano | findstr 8080
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :8080
kill -9 <PID>
```

**Q: 真机无法连接后端？**

确保手机和电脑在同一局域网，Expo 会自动获取电脑 IP。如仍不行，手动修改 `src/utils/constants.js` 中 `getBaseUrl()` 返回值为你的电脑 IP（如 `http://192.168.1.100:8080`）。

**Q: MySQL 报 "Unknown character set: utf8mb4"？**

将 JDBC URL 中的 `characterEncoding=utf8mb4` 改为 `characterEncoding=UTF-8`（当前已默认使用 UTF-8）。
