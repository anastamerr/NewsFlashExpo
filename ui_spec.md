# Newsflash Web UI Specification

Derived from the live site at `http://10.100.100.43/` on March 9, 2026, using rendered screen captures plus client bundle inspection.

## Goal

This document describes the current web UI so it can be translated into a React Native application without guessing screen structure, module boundaries, or interaction patterns.

## Product Structure

- Product name: `Newsflash`
- Platform style: content intelligence / market monitoring workspace
- Primary layout pattern: fixed left sidebar + top-level content canvas
- Core experience: search, monitor, summarize, analyze, and alert on news/content
- Major states: unauthenticated login, tenant selection, main workspace, admin-only routes

## Visual Direction

- Overall tone: Bloomberg-like monitoring workspace with editorial headlines and data cards
- Typography:
  - Page titles use a bold monospace display style
  - Supporting copy uses a neutral sans-serif
  - Numeric KPIs are large and dense
- Color:
  - Brand green is used for the `Newsflash` mark in the sidebar
  - Primary action color is a soft periwinkle / blue
  - Most application surfaces are white or very light gray with subtle borders
  - One observed `Today` screen variant uses a dark shell; the rest of the app appears light
- Surfaces:
  - Rounded cards with light border and soft shadow
  - Inputs and selects are medium-rounded with minimal chrome
  - Status badges are pill-based
- Iconography:
  - Thin line icons in sidebar and controls
  - Table actions use document/book style icons for `Summary` and `Deep Dive`

## Global Layout

### Sidebar

- Fixed vertical navigation on the left
- Approximate structure:
  - Brand at top
  - Primary nav list in middle
  - User identity block at bottom
  - Theme toggle / small utility icon in footer area
- Base nav items observed:
  - `Today`
  - `Browse`
  - `Watchlist`
  - `Alerts`
  - `Dashboards`
  - `Companies`
  - `Sources`
  - `Settings`
- Admin tenant session adds:
  - `Users`

### Content Area

- Full-height scrolling workspace to the right of sidebar
- Screen header usually includes:
  - monospace page title
  - one-line subtitle
  - optional top-right control or CTA
- Most screens are composed from stacked card sections

## Auth And Workspace Flows

### Login

Route: `/login`

Modules:
- Centered sign-in card
- Email field
- Password field
- Primary `Sign in` button
- Helper text: use Newsflash admin credentials

### Tenant Selection

Route: `/tenant/select`

Modules:
- Page title: `Select a tenant`
- Subtitle explaining workspace selection or creation
- `Create tenant` form
  - Name
  - Slug
  - Create button
- `Available tenants` list card

### Auth State Notes

- Web client stores auth in local storage:
  - `newsflash-token`
  - `newsflash-tenant-id`
- Global superusers appear to require tenant context before full workspace access
- React Native implementation should model:
  - auth token store
  - selected tenant store
  - guarded navigation

## Screen Inventory

### Today

Route: `/`

Purpose:
- Daily watchlist snapshot
- Quick jump-off to browsing and analytics

Observed modules:
- Header:
  - `Today's News`
  - subtitle about real-time monitoring and watchlist analysis
- KPI card row:
  - `Articles Today`
  - `Watchlist Size`
  - `Top Provider`
  - `Sentiment Index`
- Quick action cards:
  - `Browse Articles`
  - `View Analytics`
- Monitoring table:
  - section title `Today's Media Monitoring`
  - columns:
    - Date
    - Source
    - Title
    - Tag
    - Summary
    - Deep Dive
    - Sentiment
    - Importance
- Loading/empty state text is present when no watchlist data exists

Interaction notes:
- `Summary` opens an article summary flow
- `Deep Dive` opens role-based analysis

### Browse Articles

Route: `/browse`

Purpose:
- Search across monitored content
- Filter and inspect article results

Observed modules:
- Header:
  - `Browse Articles`
  - subtitle about monitored content sources
- Header utilities in one observed variant:
  - `Asset Manager` dropdown
  - circular user avatar
- Search card:
  - large search input
  - placeholder similar to `Search companies, sectors, tickers...`
  - search CTA
- Primary filters:
  - Search type: `Company`, `People`, `Sector`, `Market`
  - Time window: `1d`, `7d`, `m`, `all`
  - Language: `English (US)`, `Arabic`
  - Geography / edition: `United States`, `Egypt`, `United Arab Emirates`
- Results table:
  - Date
  - Source
  - Title
  - Tag
  - Summary
  - Deep Dive
  - Sentiment
  - Importance
- Column-level filters:
  - Source
  - Tag
  - Sentiment
  - Importance
- Sort control on Date column
- Empty state:
  - `No articles found matching your filters`
  - `Clear all filters`
- Footer controls:
  - items-per-page
  - previous / next pagination
  - result count

Interaction notes:
- Search state is persisted in session storage on web
- `Summary` action triggers AI executive summary
- `Deep Dive` opens role picker before navigating to detail
- Role options observed:
  - Finance
  - Marketing
  - Investor Relations
  - Public Relations

Suggested RN breakdown:
- `BrowseScreen`
- `BrowseSearchBar`
- `BrowseFilterSheet`
- `ArticleResultList`
- `ArticleActionRow`
- `DeepDiveRoleSheet`

### Watchlist

Route: `/watchlist`

Purpose:
- Manage tracked entities
- Run watchlist-specific monitoring

Observed modules:
- Header:
  - `Watchlist`
  - subtitle about monitoring companies, sectors, and markets
  - top-right `Add to Watchlist` button
- `Your Watchlist` card:
  - monitored item count
  - empty state when no tracked entities exist
- `Media Monitoring Report` control card:
  - `Market Synthesis` action
  - time range selector
  - `Fetch Watchlist` button
  - `Time Window` control
- Results table:
  - Select
  - Date
  - Source
  - Title
  - Tag
  - Summary
  - Deep Dive
  - Sentiment
  - Importance
- Empty state text when no articles exist

Interaction notes:
- Watchlist rows support the same summary/deep-dive model as Browse
- Deep dive uses the same role-based analysis concept

Suggested RN breakdown:
- `WatchlistScreen`
- `WatchlistEntityList`
- `AddWatchlistEntityModal`
- `WatchlistReportToolbar`
- `WatchlistArticleList`

### Alerts

Route: `/alerts`

Purpose:
- Configure automated content alerts
- Trigger manual alert evaluation

Observed modules:
- Header:
  - `Alerts`
  - subtitle about content monitoring alerts
- `Saved Alert Rules` card:
  - entity input
  - sentiment select
  - min importance input
  - `Create Email Alert` CTA
  - list/empty state for saved rules
- Tenant warning state observed:
  - `X-Tenant-ID header required`
- `Email Alert Engine (Test)` card:
  - limit per alert numeric field
  - `Dry run` checkbox
  - `Run Email Alerts` button
- Settings/filter row:
  - type filter
  - company filter
  - channel filter
  - severity selector
  - `Save Settings`
- Lower module:
  - `Recent Triggers`
  - subtitle for latest alert notifications

Suggested RN breakdown:
- `AlertsScreen`
- `AlertRuleComposer`
- `AlertRuleList`
- `AlertEngineTestCard`
- `AlertPreferencesBar`
- `RecentTriggersList`

### Analytics Dashboard

Route: `/dashboards`

Purpose:
- Trend analysis and overview reporting

Observed modules:
- Header:
  - `Analytics Dashboard`
  - subtitle about comprehensive insights and trend analysis
  - top-right time-range select
- Top KPI cards:
  - `Trending Tag`
  - `Trending Company`
  - `Trending Topic`
- Analytics tabs:
  - `Overview`
  - `Sentiment`
  - `Topics`
  - `Sources`
- Chart panel:
  - `Tag Popularity Over Time`
  - tag search field
  - selected tag chips
  - chart canvas / grid

Likely follow-on modules:
- more charts or tab-specific analytics sections below the first viewport

Suggested RN breakdown:
- `DashboardScreen`
- `DashboardTimeRangePicker`
- `TrendSummaryCards`
- `DashboardTabs`
- `TagTrendChart`
- `TagChipSelector`

### Content Sources

Route: `/sources`

Purpose:
- Manage monitored publishers / feeds

Observed modules:
- Header:
  - `Content Sources`
  - subtitle about monitored news sources and publishers
  - `Add Source` button
- Stat cards:
  - `Active Sources`
  - `Total Sources`
  - `Articles/Day`
- Search card:
  - source/category search input
- Source list:
  - section title `All Sources`
  - each row includes:
    - source icon
    - source name
    - domain
    - category badge
    - reliability badge
    - articles/day metric
    - last update text
    - enabled toggle

Example seed data observed:
- Reuters
- Bloomberg
- Financial Times
- Wall Street Journal
- TechCrunch
- The Verge
- Alborsa News
- Mubasher

Suggested RN breakdown:
- `SourcesScreen`
- `SourceStatsStrip`
- `SourceSearchBar`
- `SourceList`
- `SourceListItem`
- `AddSourceModal`

### Settings

Route: `/settings`

Purpose:
- Manage account and app preferences

Observed modules:
- Header:
  - `Settings`
  - subtitle about account and application preferences
- `Account Information` card:
  - Full Name
  - Email Address
  - Company / Organization
  - Timezone
  - `Save Changes`
- `Data & Privacy` card:
  - Data Collection toggle
  - Email Preferences toggle
  - likely more preference rows below

Suggested RN breakdown:
- `SettingsScreen`
- `ProfileForm`
- `PreferenceToggleList`
- `TimezonePicker`

### Companies

Route: `/companies`

Observed state:
- Item exists in navigation
- Route did not produce a stable rendered screen during capture
- One authenticated capture remained on a loading state

Implementation note:
- Treat `Companies` as a declared module, but do not begin RN implementation until the web source or backend contract for this screen is clarified

### Users

Route observed from admin nav: `/users`

Observed state:
- Admin sidebar shows `Users`
- Direct route capture returned `404`

Implementation note:
- Keep `Users` in the admin IA backlog, not in the first RN implementation scope unless the web route is restored

## Shared Interaction Modules

### Tables

The web app uses desktop data tables heavily for:
- Today monitoring
- Browse results
- Watchlist report
- Alerts recent triggers

React Native translation:
- Replace tables with list cards or grouped row cells
- Preserve these repeated data fields:
  - source
  - date
  - title
  - tag
  - sentiment
  - importance
  - summary/deep-dive actions

### Filters

Common filter types:
- time window
- sentiment
- source
- tag
- importance
- language
- geography / edition

React Native translation:
- use bottom sheets or segmented filter chips
- avoid placing more than 2 inline filters in a single mobile row

### Article Actions

Repeated action patterns:
- open external article
- generate summary
- open deep-dive role picker

Recommended RN module:
- `ArticleActionsSheet`

### Status And Identity

Repeated status primitives:
- reliability badge
- sentiment badge
- active/inactive switch
- user avatar / initials
- role label in profile block

## React Native Navigation Proposal

### Bottom Tabs

- Today
- Browse
- Watchlist
- Dashboards
- Alerts

### Drawer Or Overflow Stack

- Sources
- Settings
- Companies
- Users

### Modal / Stack Flows

- Login
- Tenant Select
- Add Watchlist Item
- Add Source
- Article Summary
- Deep Dive Role Picker
- Deep Dive Detail
- Alert Rule Create/Edit

## State Model To Preserve In RN

- auth session
- selected tenant
- current theme
- browse query + filters
- watchlist entities
- selected dashboard time range
- article analysis cache for summary / deep dive
- settings form values
- source enable/disable state

## Known Gaps And Inconsistencies

- `Today` was observed in a dark variant while most other screens rendered in a light variant
- `Companies` did not resolve into a stable page during capture
- `Users` appears in admin nav but returns `404`
- Some routes appear publicly renderable, while others enforce auth + tenant state
- Web uses table-first layouts that will need intentional mobile redesign rather than direct 1:1 porting

## Recommended RN Build Order

1. Login and tenant selection
2. App shell with sidebar-to-tab navigation adaptation
3. Today dashboard
4. Browse + article actions
5. Watchlist management
6. Analytics dashboard
7. Alerts
8. Sources
9. Settings
10. Companies and Users only after web parity is clarified
