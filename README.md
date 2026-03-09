# Newsflash Mobile

React Native / Expo mobile client for Newsflash, a news intelligence and market monitoring workspace.

This project is being built from two local source documents:

- `ui_spec.md` for screen structure, interaction patterns, and information architecture
- `api_doc.md` for backend contracts and endpoint behavior

## Current Status

The first implementation chunk is in place:

- authenticated app bootstrap
- persisted session state
- tenant selection flow
- bottom-tab mobile shell
- overflow workspace menu
- placeholder workspace screens mapped from the UI spec
- editorial mobile theme tokens and custom fonts

The next planned chunks are the real `Today` and `Browse` experiences with live API integration.

## Tech Stack

- Expo 55
- React 19
- React Native 0.83
- TypeScript
- React Navigation
- Expo Secure Store
- Async Storage

## Project Structure

```text
.
|-- App.tsx
|-- api_doc.md
|-- ui_spec.md
|-- src
|   |-- app
|   |   `-- App.tsx
|   |-- components
|   |   `-- WorkspacePreview.tsx
|   |-- hooks
|   |   `-- useAppFonts.ts
|   |-- navigation
|   |   `-- AppNavigator.tsx
|   |-- screens
|   |   |-- auth
|   |   |   |-- LoginScreen.tsx
|   |   |   `-- TenantSelectScreen.tsx
|   |   `-- workspace
|   |       `-- WorkspaceScreens.tsx
|   |-- services
|   |   |-- api
|   |   |   `-- newsflash.ts
|   |   `-- sessionStorage.ts
|   |-- store
|   |   `-- SessionProvider.tsx
|   |-- theme
|   |   `-- tokens.ts
|   `-- types
|       `-- api.ts
`-- assets
```

## Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.100.100.43/api
```

Expo will expose `EXPO_PUBLIC_*` variables to the app at build/runtime.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo dev server:

```bash
npm run start
```

Run on a device or simulator:

```bash
npm run android
npm run ios
```

## Scripts

- `npm run start` starts Expo
- `npm run android` opens the Android target
- `npm run ios` opens the iOS target
- `npm run web` runs the Expo web target

## Mobile Architecture

### Session Flow

The current app flow is:

1. App boot
2. Restore secure token and saved tenant id
3. Validate the user with `/auth/me`
4. Load memberships from `/memberships/me`
5. If needed, show login
6. If authenticated but no tenant is selected, show tenant selection
7. Enter the workspace shell

### Navigation

Bottom tabs currently match the recommended mobile IA from the UI spec:

- Today
- Browse
- Watchlist
- Dashboards
- Alerts

Overflow workspace routes are exposed through the menu screen:

- Sources
- Settings
- Companies
- Users

`Companies` and `Users` are intentionally placeholder routes for now because the source web behavior was not stable enough to implement fully.

### Persistence

- auth token: Expo Secure Store
- selected tenant id: Async Storage

This mirrors the web product behavior described in the spec while using native-friendly storage primitives.

## API Notes

The current implementation uses these backend areas:

- `POST /auth/login`
- `GET /auth/me`
- `GET /memberships/me`
- `GET /tenants/`
- `POST /tenants/`

The tenant list falls back to `GET /tenants/` for global superusers when membership-driven access is empty.

## Design Direction

The mobile UI is not a direct desktop table port. The current shell follows an editorial monitoring aesthetic:

- serif headlines for section hierarchy
- monospace labels for system tone
- warm paper backgrounds
- dark slate hero panels
- green, cobalt, amber, and rose accents for status surfaces

This is the visual base for the next feature chunks.

## Verification

TypeScript check:

```bash
npx tsc --noEmit
```

## Next Implementation Chunks

1. Build `Today` with real KPI data, quick actions, and article cards.
2. Build `Browse` with search, mobile filters, and result list actions.
3. Add watchlist entity management and fetch flows.
4. Replace remaining placeholders with real feature screens.
