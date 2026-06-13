# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile phonebook (通讯录) management system — **React Native (Expo) + Spring Boot + MySQL**. Fully implemented and functional.

Design spec: `docs/手机通讯录系统 - 完整设计方案（CS架构）.md`

**Status: implemented, running on Expo SDK 54 + Spring Boot 2.7.18.**

## Tech Stack (actual)

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile client | React Native (Expo managed) | 0.81.5 |
| Expo SDK | expo | ~54.0.0 |
| UI framework | React | 19.1 |
| Navigation | React Navigation | 6.x |
| State management | Zustand | 4.5 |
| HTTP client | Axios | 1.6 |
| Icons | @expo/vector-icons (Ionicons) | built-in |
| Backend framework | Spring Boot | 2.7.18 |
| Security | Spring Security + JJWT 0.9.1 | — |
| ORM | MyBatis-Plus | 3.5.5 |
| Database | MySQL | 8.0+ |
| Build tool (backend) | Maven | — |
| Java | JDK | 11+ (running on 22) |

## Project Structure (actual)

```
phonebook/
├── schema.sql                        # 6 tables + indexes
├── CLAUDE.md
├── README.md
├── .gitignore
├── backend-phonebook/                # Spring Boot (Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/phonebook/
│       │   ├── PhonebookApplication.java
│       │   ├── controller/           # Auth, Contact, Group, User
│       │   ├── service/              # interfaces
│       │   ├── service/impl/         # Auth, Contact, Group, User impls
│       │   ├── mapper/               # User, Contact, Group, ContactGroup
│       │   ├── entity/               # User, Contact, Group, ContactGroup
│       │   ├── dto/request/          # Login, Register, Contact, Group, ChangePassword
│       │   ├── dto/response/         # Login, Contact, Group, User
│       │   ├── config/               # SecurityConfig, CorsConfig, MybatisPlusConfig, MetaObjectHandler
│       │   ├── filter/               # JwtAuthenticationFilter
│       │   ├── utils/                # JwtUtil, Result
│       │   └── exception/            # BusinessException, GlobalExceptionHandler
│       └── resources/
│           ├── application.yml       # ⚠️ 需要修改 DB 密码和 JWT secret
│           └── mapper/               # ContactMapper.xml, GroupMapper.xml, UserMapper.xml
└── phonebook-client/                 # Expo managed workflow
    ├── package.json
    ├── app.json
    ├── App.js                        # GestureHandlerRootView > SafeAreaProvider > NavigationContainer
    ├── index.js                      # registerRootComponent
    └── src/
        ├── api/           # client.js (Axios), auth.js, contacts.js (含 recycle/restore/permanentDelete), groups.js
        ├── stores/        # useAuthStore, useContactStore, useGroupStore
        ├── screens/       # Splash, Login, Register, Home, ContactDetail, ContactEdit, GroupManage, Profile, Settings, RecycleBin
        ├── components/    # Avatar, ContactItem, SearchBar, GroupHeader, EmptyView, LoadingView, FloatingButton, CustomModal, CustomToast
        ├── navigation/    # AppNavigator, AuthNavigator, MainNavigator
        ├── hooks/         # useDebounce, useToast
        ├── utils/         # storage (AsyncStorage), validator, phone (Linking), date, constants
        └── styles/        # colors (14 groupColors), spacing, typography, globalStyles
```

## API Endpoints

All return `{code, message, data}`. Auth via `Authorization: Bearer <token>`.

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /api/auth/register | No | New user gets 3 preset groups |
| POST | /api/auth/login | No | Returns JWT token |
| GET | /api/auth/me | Yes | Current user info |
| PUT | /api/auth/password | Yes | Change password |
| POST | /api/auth/logout | Yes | Client-side token removal |
| GET | /api/contacts?page&size&groupId&keyword | Yes | Paginated list |
| POST | /api/contacts | Yes | Add contact |
| PUT | /api/contacts/{id} | Yes | Edit contact |
| DELETE | /api/contacts/{id} | Yes | Soft delete (is_deleted=1) |
| DELETE | /api/contacts/batch | Yes | Batch soft delete |
| GET | /api/contacts/search?keyword&groupId | Yes | Search |
| PUT | /api/contacts/{id}/favorite | Yes | Toggle favorite |
| GET | /api/contacts/favorite | Yes | Favorites list |
| GET | /api/contacts/recycle | Yes | Recycle bin list |
| PUT | /api/contacts/{id}/restore | Yes | Restore from recycle bin |
| DELETE | /api/contacts/{id}/permanent | Yes | Physical delete |
| GET | /api/groups | Yes | All groups |
| POST | /api/groups | Yes | Create group |
| PUT | /api/groups/{id} | Yes | Edit group |
| DELETE | /api/groups/{id} | Yes | Delete group |
| PUT | /api/groups/sort | Yes | Reorder groups |
| POST | /api/groups/move | Yes | Move contacts to groups |
| GET | /api/users/{id} | Yes | Self-only (enforced) |
| PUT | /api/users/profile | Yes | Update profile |

## Key Architecture Decisions & Gotchas

### @TableLogic bypass for physical deletes
MyBatis-Plus `@TableLogic` adds `WHERE is_deleted=0` to ALL queries including `deleteById`. For physical deletes (permanent delete) and restores, use custom SQL methods:
- `ContactMapper.physicalDeleteById(id)` → `DELETE FROM contact WHERE id = ?`
- `ContactMapper.restoreById(id)` → `UPDATE contact SET is_deleted = 0 WHERE id = ?`
- `ContactMapper.selectByIdIgnoreDeleted(id)` → `SELECT * FROM contact WHERE id = ?`

### N+1 query prevention
`ContactServiceImpl.batchLoadGroups()` loads group info for all contacts on a page in 2 queries (not 2×N). Always use this pattern when adding new list endpoints.

### Group contact_count sync
`ContactGroupMapper.selectContactIdsByGroupId` JOINs `contact` and filters `is_deleted=0`. After any contact CRUD, call `updateGroupContactCount()` to sync the denormalized count.

### Empty string → null for unique columns
`user.phone` and `user.email` have UNIQUE constraints. Empty strings from forms are converted to null in both `UserServiceImpl.updateUser()` and `AuthServiceImpl.register()` to avoid constraint violations.

### Expo API URL detection
`constants.js` uses `Constants.expoConfig.hostUri` to auto-detect the dev server IP, changing port to 8080 for the API. Works on emulator (10.0.2.2) and real device (LAN IP) automatically.

### 401 handling
`client.js` uses an `isLoggingOut` flag to prevent concurrent 401 responses from triggering multiple logout calls.

### GestureHandlerRootView
**Required** in App.js, otherwise all TouchableOpacity components silently fail to respond to taps.

### Frontend useToast hook
`src/hooks/useToast.js` is the standard pattern for toast feedback. Use `const { toastProps, showToast } = useToast()` then `<CustomToast {...toastProps} />` in every screen.

## Development Commands

```bash
# Backend
cd backend-phonebook
mvn spring-boot:run -o       # start (offline mode, port 8080)

# Frontend
cd phonebook-client
npm install                   # first time
npx expo start                # start dev server (port 8081)

# Database
mysql -u root -p < schema.sql # initialize
```

## Configuration Points

- `backend-phonebook/src/main/resources/application.yml` — DB username/password, JWT secret
- `phonebook-client/src/utils/constants.js` — API base URL (auto-detected in dev)
