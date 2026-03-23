# NewsFlash App

Technical README for engineers working on the NewsFlash mobile client.

## Overview

NewsFlash is an Expo + React Native application for monitoring news, sentiment, watchlists, dashboards, alerts, companies, and AI-assisted analysis in a multi-tenant workflow.

The codebase is currently in a hybrid state:

- The app shell, navigation, theme system, storage, and service layer are implemented as production-oriented infrastructure.
- A large part of the UI is still driven by local `MOCK_*` datasets in `src/constants/mockData.ts`.
- Authentication is intentionally mocked in `src/services/auth.ts` with `USE_MOCK_AUTH = true`, even though the real API contracts already exist.

This distinction matters when debugging: many screens render realistic data shapes without making network calls.

## Stack

- Expo SDK 54
- React 19
- React Native 0.81
- TypeScript with `strict: true`
- React Navigation 7
- Zustand for auth/session state
- Axios for API access
- Reanimated 4 + Gesture Handler for motion and interactions
- FlashList for virtualized lists
- Expo Secure Store + AsyncStorage for persisted session state

## Getting Started

### Prerequisites

- Node.js compatible with Expo SDK 54
- npm
- Expo CLI tooling via `npx expo`
- Android Studio and/or Xcode if running native simulators

### Install

```bash
npm install
```

### Run

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Validate

```bash
npx tsc --noEmit
```

There is currently no lint or test script defined in `package.json`.

## App Boot Flow

Application entry is:

- `index.ts` -> registers `App`
- `App.tsx` -> mounts global providers and blocks rendering until fonts are loaded

Provider order:

1. `GestureHandlerRootView`
2. `SafeAreaProvider`
3. `ThemeProvider`
4. `ToastProvider`
5. `NavigationRoot`

`AppContent` calls `useAuthStore((state) => state.bootstrap)` on mount. The bootstrap flow:

- reads the token from Expo Secure Store
- reads tenant ID from AsyncStorage
- if both exist, fetches a profile and marks the user authenticated
- if only token exists, fetches tenant memberships
- if neither exists, falls back to the auth stack

## Navigation Architecture

Navigation is split into three layers.

### Root stack

Defined in `src/navigation/NavigationRoot.tsx`.

- `Auth`
- `Main`
- modal screens:
  - `Settings`
  - `Sources`
  - `Users`
  - `Companies`
  - `CompanyDetail`
  - `CompetitorAnalysis`

The root also owns:

- the custom navigation theme
- chat FAB visibility
- the full-screen chat overlay
- route tracking for FAB suppression on `ArticleDetail`

### Auth stack

Defined in `src/navigation/AuthStack.tsx`.

- `Login`
- `TenantSelect`

### Main tab shell

Defined in `src/navigation/MainTabs.tsx` using `@react-navigation/bottom-tabs` with a custom `TabBar`.

Tabs:

- Today
- Browse
- Watchlist
- Dashboards
- Alerts

Each tab owns its own native stack in `src/navigation/stacks`.

## State Management

### Global state

Only auth/session state is centralized today.

File: `src/store/authStore.ts`

Responsibilities:

- track token, tenant, user profile, and auth flags
- coordinate login, tenant selection, sign-out, and app bootstrap
- respond globally to `401` via `setUnauthorizedHandler()`

Important properties:

- `token`
- `user`
- `tenants`
- `tenantId`
- `isAuthenticated`
- `isLoading`
- `isBootstrapping`

### Local state

Most screens use local component state for:

- filters
- search queries
- toggle state
- loading skeleton timing
- local chat message state

There is no server-state library such as React Query or SWR at the moment.

## Data Layer

### API client

File: `src/services/api.ts`

The Axios client:

- uses `https://api.newsflash.ai` from `src/constants/api.ts`
- attaches `Authorization: Bearer <token>` if a token exists
- converts Axios failures into a local `ApiError`
- triggers a global unauthorized handler on HTTP `401`

### Service modules

Service files are organized by feature:

- `src/services/auth.ts`
- `src/services/articles.ts`
- `src/services/watchlist.ts`
- `src/services/alerts.ts`
- `src/services/companies.ts`
- `src/services/chat.ts`

Pattern:

- services are thin wrappers over endpoint constants
- request/response typing comes from `src/types/api.ts`
- UI is free to call services directly or through lightweight hooks

### Current mock behavior

Current implementation is not fully wired end-to-end.

- `src/services/auth.ts` is explicitly mocked
- many screens read from `src/constants/mockData.ts`
- the API service layer exists for the future live path, but much of the UI does not consume it yet

This is the main architectural caveat in the repo.

## Persistence

File: `src/utils/storage.ts`

- access token -> Expo Secure Store
- tenant ID -> AsyncStorage

Keys:

- `newsflash_token`
- `newsflash_tenant_id`

`clearAll()` removes both and is used during sign-out and auth recovery paths.

## Theme and Design System

Theme primitives live under `src/theme`.

- `tokens.ts` -> palette, semantic colors, spacing, radius, shadows
- `typography.ts` -> font families and type presets
- `ThemeContext.tsx` -> light/dark/system mode management
- `index.ts` -> consolidated exports

Characteristics:

- dark mode is the default until persisted preference loads
- theme preference is persisted in AsyncStorage under `@newsflash_theme`
- fonts are loaded globally in `App.tsx`
- components rely on semantic theme tokens rather than hard-coded colors where possible

## UI and Screen Architecture

Top-level feature folders:

- `src/screens`
- `src/components`
- `src/navigation`
- `src/services`
- `src/store`
- `src/theme`
- `src/types`
- `src/utils`

Component structure:

- `src/components/ui` -> reusable primitives such as `Button`, `Card`, `Input`, `Chip`, `Toast`
- `src/components/layout` -> `ScreenContainer`, `Header`, `Section`, `TabBar`
- `src/components/lists` -> reusable feed/list row components
- `src/components/data` -> badges and metric display
- `src/components/charts` -> chart primitives and gauges

Feature screens are grouped under:

- `alerts`
- `auth`
- `browse`
- `chat`
- `companies`
- `dashboards`
- `settings`
- `sources`
- `today`
- `users`
- `watchlist`

## Interaction and Rendering Conventions

Current conventions in the repo:

- use `Pressable` instead of legacy touchables
- prefer `FlashList` for list-style screens
- use `StyleSheet.create` and stable list props to reduce render churn
- use `contentInsetAdjustmentBehavior="automatic"` for root scroll views where appropriate
- keep rounded surfaces consistent with `borderCurve: 'continuous'`
- use Reanimated for animated feedback and entrance motion

These conventions were recently normalized across the repo and should be preserved.

## Type System

Core contracts live in `src/types/api.ts` and `src/types/navigation.ts`.

Important model families:

- auth and tenant membership
- articles and article analysis
- watchlist items
- alerts
- companies
- sources
- dashboards
- chat assistants and chat messages

The project uses TypeScript path aliases:

- `@/*` -> `src/*`

Configured in:

- `tsconfig.json`
- `babel.config.js`

## Useful Utilities and Hooks

Hooks:

- `src/hooks/useApi.ts` -> basic async fetch hook with local loading/error state
- `src/hooks/useRefreshControl.ts` -> shared pull-to-refresh wrapper
- `src/hooks/useScrollDirection.tsx` -> shared scroll direction signal used by the chat FAB
- `src/hooks/useAnimatedEntry.ts` -> shared entry animation helper
- `src/hooks/useDebounce.ts` -> local debounce utility for search

Utilities:

- `src/utils/storage.ts`
- `src/utils/format.ts`
- `src/utils/sentiment.ts`
- `src/utils/haptics.ts`

## Current Engineering Notes

### What is production-oriented already

- typed navigation
- typed service layer
- persisted auth bootstrap
- theme system
- reusable component primitives
- list virtualization on feed-style screens

### What is still transitional

- auth is mocked by default
- most business screens still render mock data instead of service responses
- no dedicated environment/config layer beyond constants
- no automated test suite
- no lint setup

### Known architectural gaps

- `API_BASE_URL` is hard-coded in `src/constants/api.ts`
- mock/live data boundaries are not abstracted behind repositories or feature hooks yet
- tab navigation still uses JS bottom tabs with a custom tab bar rather than native tabs
- state management is intentionally minimal and may need a server-state strategy once live integration expands

## Recommended Next Steps

For a productionization pass, the likely order is:

1. Introduce environment-aware API configuration.
2. Replace per-screen `MOCK_*` usage with service-backed hooks.
3. Add linting and a minimal test harness.
4. Define a consistent server-state strategy.
5. Separate demo mode from live mode explicitly rather than mixing them inside service/UI code.

## File Map

```text
src/
  components/   reusable UI, layout, list, data, and chart components
  constants/    API constants and mock datasets
  hooks/        reusable hooks for async, refresh, debounce, animation, scroll
  navigation/   root navigation, tab shell, and per-feature stacks
  screens/      feature screens grouped by domain
  services/     API wrappers by domain
  store/        Zustand global stores
  theme/        tokens, typography, provider, and theme exports
  types/        API and navigation types
  utils/        formatting, storage, sentiment, and haptics helpers
```

## Commands Summary

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npx tsc --noEmit
```
