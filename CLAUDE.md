# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile phonebook (通讯录) management system with a **client-server architecture** — React Native cross-platform mobile app + Spring Boot REST API backend + MySQL database.

The full design specification lives in `docs/手机通讯录系统 - 完整设计方案（CS架构）.md` (also available as PDF in the same directory). This is the authoritative reference for database schema, API contracts, page designs, and business flows.

**Status: design phase complete, implementation not yet started.**

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile client | React Native + JSX | 0.72+ |
| UI framework | React | 18.x |
| Navigation | React Navigation | 6.x |
| State management | Zustand (preferred) or Redux Toolkit | — |
| HTTP client | Axios | 1.x |
| UI library | React Native Elements | — |
| Backend framework | Spring Boot | 2.7.x / 3.x |
| Security | Spring Security + JJWT (JWT auth) | — |
| ORM | MyBatis-Plus | 3.5.x |
| Database | MySQL | 8.0 |
| Build tool (backend) | Maven (pom.xml) | — |

## Planned Directory Structure

```
phonebook/
├── backend-phonebook/          # Spring Boot backend (Maven project)
│   ├── src/main/java/com/phonebook/
│   │   ├── PhonebookApplication.java
│   │   ├── controller/         # AuthController, ContactController, GroupController, UserController
│   │   ├── service/            # Service interfaces + impl/ subdirectory
│   │   ├── mapper/             # MyBatis mapper interfaces + XML in resources/mapper/
│   │   ├── entity/             # User, Contact, Group, ContactGroup entities
│   │   ├── dto/request/        # LoginRequest, RegisterRequest, ContactRequest, etc.
│   │   ├── dto/response/       # LoginResponse, ContactResponse, etc.
│   │   ├── config/             # SecurityConfig, CorsConfig, SwaggerConfig
│   │   ├── filter/             # JwtAuthenticationFilter
│   │   ├── interceptor/        # LogInterceptor
│   │   ├── utils/              # JwtUtil, Result (unified response wrapper), PinyinUtil
│   │   └── exception/          # BusinessException, GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── application.yml     # Main config (active profile: dev/prod)
│   │   └── mapper/             # MyBatis XML mapper files
│   └── pom.xml
│
└── phonebook-client/           # React Native app
    ├── src/
    │   ├── api/                # Axios client config + per-module API modules (auth, contacts, groups)
    │   ├── stores/             # Zustand stores (useAuthStore, useContactStore, useGroupStore, useUIStore)
    │   ├── screens/            # Splash, Login, Register, Home, ContactDetail, ContactEdit, GroupManage, Profile, Settings
    │   ├── components/         # Reusable UI: ContactItem, GroupHeader, SearchBar, AlphabetIndex, FloatingButton, etc.
    │   ├── navigation/         # AppNavigator (root), AuthNavigator, MainNavigator, ContactStack
    │   ├── utils/              # storage, validator, phone (dial/SMS), date, pinyin, constants, permissions
    │   ├── hooks/              # useDebounce, useRefresh, useInfiniteScroll, usePermission
    │   ├── styles/             # colors, spacing, typography, globalStyles
    │   └── types/              # TypeScript type definitions for User, Contact, Group
    └── android/                # Android native project files
```

## Architecture (Layered)

### Backend (Spring Boot)
Standard three-tier architecture:

- **Controller layer** — REST endpoints exposing `/api/auth`, `/api/contacts`, `/api/groups`, `/api/users`
- **Service layer** — business logic, transactional; interfaces with `impl/` implementations
- **Mapper layer** — MyBatis-Plus data access; XML SQL mappings in `resources/mapper/`

Cross-cutting: JWT auth filter chain (Spring Security), `Result.java` wraps all responses as `{code, message, data}`, `GlobalExceptionHandler` catches unhandled exceptions.

### Frontend (React Native)
- **Screens** — one per route; connected to Zustand stores
- **Stores** — Zustand holds auth state, contact list, groups, UI state
- **API layer** — Axios instance with request interceptor (attaches JWT token) and response interceptor (handles 401 → redirect to login)
- **Navigation** — stack-based: auth flow (Login/Register) vs main flow (Home tab → detail/edit stacks)

## Database Schema (6 tables)

- **user** — credentials, profile; `password` is BCrypt-hashed
- **contact** — name, phone (required), second_phone, email, second_email, address, company, position, birthday, website, remark, avatar, is_favorite, is_deleted (soft delete)
- **group** — name, color, icon, sort_order, contact_count (denormalized), is_system flag
- **contact_group** — many-to-many join between contact and group
- **call_log** — call history (planned)
- **sms_log** — SMS history (planned)

## API Conventions

- All responses: `{code: number, message: string, data: any}`
- Auth via JWT Bearer token in `Authorization` header
- List endpoints support pagination via `page`/`size` query params
- Contact search supports `keyword` parameter (matches name, phone, email)
- Soft-delete on contacts (`is_deleted` flag), hard-delete on groups

## Key Business Flows

Detailed sequence diagrams are in the design doc for: login (BCrypt verify → JWT issue → token stored client-side), add contact (validate → insert → update group contact_count → refresh list), dial/SMS (React Native Linking API to system dialer), and group management (create group → move contacts → batch update join table).

## Development Notes

- The design document specifies this is an **internship/academic project** (~13-15 person-days total)
- Functionality scope is intentionally limited: basic CRUD, groups, search, dial/SMS; no complex features
- Chinese pinyin conversion is needed for contact name sorting and search (`PinyinUtil` on backend, `pinyin.js` on frontend)
- System pre-seeds default groups: 家人 (Family), 朋友 (Friends), 同事 (Colleagues)
