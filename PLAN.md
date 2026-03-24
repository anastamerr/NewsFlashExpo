# Mobile Parity Plan

This document turns the web-to-mobile parity audit into an implementation plan for the React Native app in `F:\dev\newsflashapp`.

It is intentionally ordered to reduce delivery risk:

1. ship reusable primitives first
2. add high-value read-only flows next
3. add management workflows after the navigation and content model are stable
4. finish with security, onboarding, and quality hardening

## Goal

Bring the mobile app to functional parity with the website at `C:\Users\anoos\Downloads\newsflash-content-intelligence` without degrading the current mobile UI quality or introducing fragile flows.

## Scope Summary

Top-level navigation parity already exists.

The largest mobile gaps are:

- report-style content flows: summary, deep dive, market synthesis, crisis analysis
- role-aware drill-down workflows
- richer analytics controls and chart workspaces
- real admin workflows for users, sources, alerts, and settings
- onboarding and tenant-management gaps
- contextual AI/chat integrations inside report pages

## Delivery Principles

- Keep current navigation shell intact unless a phase explicitly calls for expansion.
- Reuse existing mobile design language and shared components instead of mirroring desktop layout literally.
- Prefer additive work over rewrites.
- Build read-only flows before write flows.
- Use typed route params and shared domain models for every new screen.
- Keep list and screen performance aligned with `vercel-react-native-skills`: `FlashList`, stable callbacks, minimal subscriptions, `Pressable`, safe-area-correct scroll behavior.

## Phase 0: Foundation

### Objective

Create the shared infrastructure required for parity work so later phases do not duplicate data shaping, route wiring, and page primitives.

### Work

- Add a mobile content detail model covering:
  - article summary payload
  - deep-dive payload
  - trigger summary payload
  - trigger deep-dive payload
  - crisis summary payload
  - crisis deep-dive payload
  - market synthesis payload
- Add route definitions and typed params for:
  - browse summary
  - browse deep dive
  - watchlist summary
  - watchlist deep dive
  - dashboard deep dive variant or dedicated report route
  - alert trigger detail
  - alert trigger summary
  - alert trigger deep dive
  - crisis detail
  - crisis summary
  - crisis deep dive
  - market synthesis
- Build reusable report primitives:
  - sticky page header
  - metadata row
  - section block
  - key-points list
  - recommendation list
  - badge strip
  - report CTA row
  - contextual chat entry point
- Standardize a report screen container with:
  - safe-area support
  - large body text
  - optional bottom CTA
  - scroll restoration expectations
- Add mock/service adapters so report pages can read from one interface even if data is still mocked.

### Deliverables

- typed navigation additions
- shared report components
- normalized report data contracts

### Acceptance Criteria

- no screen duplicates layout boilerplate for report pages
- every new route has typed navigation params
- report content can be rendered from shared structures, not ad hoc inline objects

## Phase 1: Content Drill-Down Parity

### Objective

Close the highest-value user-facing gaps around article exploration and analysis.

### Work

- Add Browse summary screen matching web intent:
  - headline
  - source/date
  - sentiment and importance metadata
  - expanded summary
  - key takeaways
  - CTA to deep dive
- Add Browse deep-dive screen:
  - report sections
  - role-aware framing
  - back path to summary and browse
- Add Today deep-dive/summary actions where relevant so the home feed can launch richer analysis, not only generic article detail.
- Add Watchlist summary and Watchlist deep-dive screens.
- Add Dashboard deep-dive article/report flow from Today articles where web currently routes to `/dashboard/deep-dive/[id]`.
- Add contextual “Talk to News” entry on report screens:
  - launch chat with article/report context
  - prefill assistant prompt or metadata
  - keep current global chat overlay as fallback

### Mobile Design Mapping

- Do not recreate web tables.
- Use stacked cards and section blocks.
- Keep existing article detail as the lightweight read view.
- Use new report routes for analysis-heavy content.

### Dependencies

- Phase 0 report primitives

### Acceptance Criteria

- mobile can open summary and deep-dive flows from browse, watchlist, and today/dashboard contexts
- role-aware deep dive is supported by route param and visible in content framing
- report pages feel native and not like desktop pages squeezed onto mobile

## Phase 2: Search and Filtering Parity

### Objective

Bring browse and watchlist filtering closer to the web product so content discovery is not materially weaker on mobile.

### Work

- Expand Browse filters in [BrowseScreen.tsx](F:/dev/newsflashapp/src/screens/browse/BrowseScreen.tsx):
  - search type selector: company, people, sector, market
  - tag filter
  - date-range/time-window filter
  - clear/reset filters
- Expand Watchlist report controls in [WatchlistScreen.tsx](F:/dev/newsflashapp/src/screens/watchlist/WatchlistScreen.tsx):
  - add-item flow with type selection
  - optional symbol field for company type
  - date-range filter for monitored report
  - summary/deep-dive actions per result item
  - market synthesis launch action
- Decide whether to use:
  - native modal bottom sheets for filters
  - full-screen picker flows
  - inline collapsible filter panels

### Technical Notes

- For mobile, the web calendar widget should likely become:
  - native date pickers, or
  - a lightweight custom range flow inside a bottom sheet
- Avoid wide desktop-style filter rows.

### Dependencies

- Phase 1 routes for summary and deep-dive

### Acceptance Criteria

- browse and watchlist can express the same filter intent as the web app
- filter state is serializable and restorable inside navigation state when practical
- no performance regressions in list scrolling

## Phase 3: Market Synthesis and Crisis Reporting

### Objective

Close the largest missing intelligence workflows.

### Work

- Add Market Synthesis screen:
  - article count
  - average sentiment
  - average importance
  - sentiment distribution
  - long-form synthesis sections
  - contextual chat entry
- Add Crisis detail screen tree:
  - crisis landing page
  - summary page
  - deep-dive page
- Add Alert trigger screen tree:
  - trigger detail
  - trigger summary
  - trigger deep dive
- Wire launch points from:
  - alerts list
  - dashboards analytics
  - watchlist monitored report

### Data Model Work

- Unify “alert trigger”, “crisis event”, and “report article” models enough that rendering code can share primitives but still preserve domain-specific fields.

### Dependencies

- Phase 0 shared report system
- Phase 1 contextual report patterns

### Acceptance Criteria

- every major web intelligence report flow exists on mobile
- alerts and dashboards can drill into crisis-specific pages
- watchlist can produce a mobile market synthesis view

## Phase 4: Analytics Workspace Upgrade

### Objective

Move analytics from a tile launcher into a real workspace.

### Work

- Expand [DashboardsScreen.tsx](F:/dev/newsflashapp/src/screens/dashboards/DashboardsScreen.tsx) to support:
  - overview
  - sentiment
  - topics
  - sources
- Add richer controls:
  - period selector
  - tag search
  - multi-tag comparison
- Expand charts in [DashboardDetailScreen.tsx](F:/dev/newsflashapp/src/screens/dashboards/DashboardDetailScreen.tsx) or split into dedicated screens if complexity demands it.
- Add KPI surfaces:
  - trending tag
  - trending company
  - trending topic
- Add crisis launch surfaces if still desired in analytics.

### Mobile UX Recommendation

- Use segmented control or top tabs instead of desktop tabs if density becomes a problem.
- Keep charts vertically stacked.
- Avoid overloading a single screen if chart interaction becomes too dense; split into tabbed or paged sections.

### Dependencies

- none strictly blocking, but benefits from Phase 3 crisis routes

### Acceptance Criteria

- analytics supports the same major analysis domains as web
- selected tags and periods update chart state predictably
- no chart screen causes obvious frame drops on lower-end devices

## Phase 5: Companies and Competitor Analysis

### Objective

Close the research gaps in company intelligence.

### Work

- Upgrade [CompaniesScreen.tsx](F:/dev/newsflashapp/src/screens/companies/CompaniesScreen.tsx) and [CompanyDetailScreen.tsx](F:/dev/newsflashapp/src/screens/companies/CompanyDetailScreen.tsx):
  - preserve searchable company discovery
  - add coverage timeline chart
  - add sentiment trend chart
  - add related entities and highlights if not already fully represented
  - add “ask about company” contextual chat action
- Upgrade [CompetitorAnalysisScreen.tsx](F:/dev/newsflashapp/src/screens/companies/CompetitorAnalysisScreen.tsx):
  - company selector
  - time window selector
  - mode toggle for narrative vs market view
  - weighted score breakdown
  - expandable score detail
  - coverage and momentum charts
  - opportunity/risk/neutral signal sections

### Dependencies

- charting primitives already in place
- contextual chat from Phase 1

### Acceptance Criteria

- mobile company research is not limited to a static profile page
- competitor analysis is user-driven, not hardcoded to two mock companies

## Phase 6: Admin Workflow Parity

### Objective

Make mobile admin/reference screens functional rather than read-mostly.

### Work

- Users:
  - add-user flow
  - role edit
  - active toggle persistence
  - remove user action
- Sources:
  - search/filter
  - top stats surfaces if still valuable on mobile
  - add-source action
  - enable/disable persistence
- Alerts:
  - create-alert flow
  - alert rule fields
  - alert type filters
  - selected company filters
  - notification channel controls
  - severity threshold controls

### Mobile UX Recommendation

- implement create/edit forms as native modal screens or bottom sheets
- do not try to inline desktop form density into the list screens

### Dependencies

- some flows depend on final backend contract decisions

### Acceptance Criteria

- users, sources, and alerts are manageable from mobile
- all write actions have optimistic or explicit loading/error handling

## Phase 7: Settings, Security, and Preferences

### Objective

Close the major account-management gap.

### Work

- Expand [SettingsScreen.tsx](F:/dev/newsflashapp/src/screens/settings/SettingsScreen.tsx) into real sections:
  - Account
  - Preferences
  - Alert Delivery
  - Alert Filters
  - Privacy & Data
  - Security
- Add editable account fields:
  - full name
  - email
  - company/organization
  - persona/role
  - timezone
  - language
- Add alert delivery controls:
  - in-app
  - email
  - desktop/browser if applicable
  - mobile push
- Add multi-select filter controls:
  - alert types
  - companies
  - severities
- Add security actions:
  - log out
  - log out all devices
  - active sessions or device list if backend supports it

### Dependencies

- backend/API clarity on account and session endpoints

### Acceptance Criteria

- settings is a real management surface, not just a theme and toggle page
- mobile can express the same preference/filter intent as the web app

## Phase 8: Auth and Tenant Onboarding Upgrade

### Objective

Close onboarding and multi-tenant management gaps.

### Work

- Add signup mode to [LoginScreen.tsx](F:/dev/newsflashapp/src/screens/auth/LoginScreen.tsx)
- Add password confirmation and visibility toggles
- Add remember-me if supported
- Add forgot-password path if supported
- Add role/persona selection during signup
- Add tenant creation to [TenantSelectScreen.tsx](F:/dev/newsflashapp/src/screens/auth/TenantSelectScreen.tsx) for authorized users
- Add slug generation/edit flow for tenant creation

### Dependencies

- auth and tenant API support

### Acceptance Criteria

- mobile can onboard new users and create tenants where permissions allow
- login and tenant flows cover the same product states as web

## Phase 9: Quality, Hardening, and Rollout

### Objective

Reduce regression risk before calling parity complete.

### Work

- Add route-level test checklist for every new screen
- Add basic component/screen tests where feasible
- Add smoke coverage for:
  - auth
  - report routes
  - alert/crisis drill-down
  - market synthesis
  - settings saves
  - admin mutations
- Validate navigation memory and performance under deep drill-down stacks
- Audit large-scroll screens for:
  - `FlashList` usage where needed
  - no expensive inline render work
  - correct safe-area and content inset behavior
- Confirm loading, empty, and error states exist for every new route

### Acceptance Criteria

- parity features are not mock-only shells with missing state handling
- no obvious navigation regressions
- no screen introduces avoidable performance regressions

## Recommended Build Order

### Wave 1

- Phase 0
- Phase 1

Reason:

- highest user-visible value
- unlocks most missing report routes
- low write-risk compared with admin flows

### Wave 2

- Phase 2
- Phase 3
- Phase 4

Reason:

- completes content intelligence workflow parity
- turns mobile from a viewer into a research surface

### Wave 3

- Phase 5
- Phase 6
- Phase 7

Reason:

- deeper research and admin capability
- more backend and mutation complexity

### Wave 4

- Phase 8
- Phase 9

Reason:

- onboarding and security often depend on backend readiness
- hardening should happen after feature surfaces stabilize

## Priority Matrix

### P0

- Phase 0
- Phase 1
- Browse filters from Phase 2
- Watchlist summary/deep-dive launch paths

### P1

- Market synthesis
- crisis detail tree
- alert trigger detail tree
- analytics workspace upgrade
- company and competitor analysis upgrade

### P2

- users/source/alerts write workflows
- advanced settings sections
- signup and tenant creation parity

## Risks

- Desktop workflows that rely on large tables and dense controls cannot be translated literally to mobile.
- Report pages can sprawl unless content primitives are standardized early.
- Admin mutations will expose missing backend contracts faster than read-only work.
- Role-aware deep-dive variants can fragment UI if not backed by a shared report composition system.
- If contextual chat is implemented as separate screens instead of reusing the overlay, maintenance cost will rise.

## Decisions To Make Early

- Should contextual report chat reuse the existing overlay or become an embedded sheet?
- Should analytics stay as one screen with segments, or split into multiple screens?
- Should company research remain modal-based from root navigation, or move into a deeper stack hierarchy?
- Which write workflows are actually required on mobile for v1: full admin parity or essential-only parity?
- Which web flows are intentionally desktop-first and should remain out of scope?

## Definition of Done

Mobile parity is complete when:

- every major web intelligence workflow has a mobile equivalent
- missing report routes are closed
- browse, watchlist, alerts, dashboards, companies, competitor analysis, users, sources, settings, auth, and tenant flows cover the same core user intent
- mobile interactions feel native and performant rather than desktop ports
- the new screens are typed, testable, and integrated into the current navigation shell cleanly
