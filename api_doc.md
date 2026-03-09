# Newsflash Intelligence API

Production-grade news intelligence and analysis API

- OpenAPI version: `3.1.0`
- API version: `1.0.0`
- Source Swagger UI: [http://10.100.100.43/api/docs](http://10.100.100.43/api/docs)
- Source OpenAPI JSON: [http://10.100.100.43/api/openapi.json](http://10.100.100.43/api/openapi.json)

## Authentication

- `OAuth2PasswordBearer`: oauth2 (password), token URL `/api/auth/login`

## Endpoint Summary

| Tag | Endpoints |
| --- | ---: |
| AI Analysis | 4 |
| Alerts | 5 |
| Articles | 6 |
| Auth | 2 |
| Feeds | 4 |
| Memberships | 4 |
| News | 4 |
| Other | 2 |
| Sentiment | 2 |
| Tenants | 3 |
| Users | 5 |
| Watchlist | 6 |

## AI Analysis

### `POST /api/ai/analyze-article`

**Summary:** Analyze Article

Analyze a single article with role-based AI analysis.
Returns cached summary or deep-dive if already generated; otherwise generates and stores it.

- **article_url**: URL of the article to analyze
- **role**: Analysis role - Executive Summary, Financial Analyst, Marketing Specialist, Investor Relations, or Public Relations
- **source**: Optional article source name

Returns AI-generated analysis based on the selected role perspective.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: AIAnalyzeRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | AIAnalyzeResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/ai/chat-stream`

**Summary:** Chat Stream

Stream a per-article chat response as Server-Sent Events (SSE).

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: AIChatStreamRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `GET /api/ai/roles`

**Summary:** Get Available Roles

Get list of available AI analysis roles.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | AIRolesResponse (application/json) |

### `POST /api/ai/synthesize`

**Summary:** Synthesize Articles

Synthesize multiple articles into a narrative report.

- **articles**: List of articles to synthesize
- **limit**: Maximum articles to include (1-20, default: 10)
- **when**: Time window filter (1d, 7d, m, all)

Returns a coherent market narrative report synthesizing the provided articles as a structured dictionary.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: AISynthesizeRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | AISynthesizeResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Alerts

### `GET /api/alerts`

**Summary:** List Alerts

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | AlertsListResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `POST /api/alerts`

**Summary:** Create Alert

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: AlertCreateRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 201 | Successful Response | AlertPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `DELETE /api/alerts/{alert_id}`

**Summary:** Delete Alert

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `alert_id` | path | Yes | string |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `PATCH /api/alerts/{alert_id}`

**Summary:** Update Alert

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `alert_id` | path | Yes | string |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: AlertUpdateRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | AlertPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `POST /api/alerts/run-email`

**Summary:** Run Alerts Email

Evaluate active email alerts for the current user in current tenant.

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: RunEmailAlertsRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | RunEmailAlertsResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

## Articles

### `POST /api/articles/decode-url`

**Summary:** Decode Google Url

Decode Google News URL to original article URL.

- **google_url**: Google News URL to decode

Returns decoded URL and original URL.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: DecodeUrlRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | DecodeUrlResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/articles/extract`

**Summary:** Extract Article Text

Extract full text from an article URL.

- **url**: Article URL to extract text from`

Returns extracted article text and metadata.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: ExtractRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | ExtractResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/articles/filter`

**Summary:** Filter Articles

Filter articles by time window.

- **articles**: List of articles to filter
- **when**: Time window - 1d, 7d, m, or all

Returns filtered articles.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: FilterRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/articles/search`

**Summary:** Search Articles

Search and sort articles.

- **articles**: List of articles to search
- **query**: Optional search query (searches in title and source)
- **sort_by**: Field to sort by - published, sentiment_score, or title
- **sort_order**: Sort order - asc or desc
- **limit**: Maximum results (1-100, default: 50)

Returns filtered and sorted articles.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: SearchRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/articles/sentiment-trend`

**Summary:** Calculate Sentiment Trend

Calculate sentiment trend with rolling average.

- **articles**: List of articles with published dates and sentiment scores
- **window_size**: Rolling window size (1-10, default: 3)

Returns time series data points for charting.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: SentimentTrendRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | SentimentTrendResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/articles/stats`

**Summary:** Get Article Stats

Calculate statistics for articles.

Request body should contain:
- **articles**: List of articles

Returns statistics including total count, average sentiment, top provider, etc.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: object (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | ArticleStatsResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Auth

### `POST /api/auth/login`

**Summary:** Login

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: Body_login_api_auth_login_post (application/x-www-form-urlencoded)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | Token (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `GET /api/auth/me`

**Summary:** Read Current User

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | UserPublic (application/json) |

**Security:** `OAuth2PasswordBearer`

## Feeds

### `GET /api/feeds/custom`

**Summary:** Get Custom Feeds

Get all custom RSS feeds.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | CustomFeedResponse (application/json) |

### `POST /api/feeds/custom`

**Summary:** Add Custom Feed

Add a custom RSS feed.

- **name**: Feed name
- **url**: RSS feed URL

Returns created feed with ID.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: CustomFeedCreate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | CustomFeed (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `DELETE /api/feeds/custom/{feed_id}`

**Summary:** Remove Custom Feed

Remove a custom RSS feed.

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `feed_id` | path | Yes | string | Feed ID |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `GET /api/feeds/custom/{feed_id}`

**Summary:** Get Custom Feed

Get a specific custom feed by ID.

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `feed_id` | path | Yes | string | Feed ID |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | CustomFeed (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Memberships

### `POST /api/memberships/`

**Summary:** Create Membership Handler

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: MembershipCreate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | MembershipPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `DELETE /api/memberships/{membership_id}`

**Summary:** Delete Membership

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `membership_id` | path | Yes | string (uuid) |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `PATCH /api/memberships/{membership_id}`

**Summary:** Update Membership

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `membership_id` | path | Yes | string (uuid) |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: MembershipUpdate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | MembershipPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `GET /api/memberships/me`

**Summary:** List My Memberships

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | MembershipWithTenant[] (application/json) |

**Security:** `OAuth2PasswordBearer`

## News

### `POST /api/news/feed`

**Summary:** Fetch Feed

Fetch articles from an RSS feed.

- **url**: RSS feed URL
- **feed_name**: Optional custom name for the feed

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: FeedRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | FeedResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `GET /api/news/market-feeds`

**Summary:** Fetch Market Feeds

Fetch articles from predefined market feeds.

Returns aggregated articles from:
- Global Top Stories
- Egypt / MENA (EN)
- Markets & Macro

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | NewsSearchResponse (application/json) |

### `GET /api/news/search`

**Summary:** Search News Get

Search for news articles (GET endpoint for convenience).

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `entity` | query | Yes | string | Company, person, or sector name |
| `type` | query | Yes | string | Entity type (e.g., 'Company', 'Person', 'Sector') |
| `filters` | query | No | string | null | Optional search filters |
| `hl` | query | No | string | Language code |
| `gl` | query | No | string | Geo location code |
| `ceid` | query | No | string | Edition code |
| `when` | query | No | string | Time window: 1d, 7d, m, or all |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | NewsSearchResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/news/search`

**Summary:** Search News

Search for news articles by entity (company, person, or sector).

- **entity**: Company, person, or sector name
- **type**: Entity type (e.g., "Company", "Person", "Sector")
- **filters**: Optional search filters (e.g., "stock OR earnings")
- **hl**: Language code (default: en-US)
- **gl**: Geo location code (default: US)
- **ceid**: Edition code (default: US:en)
- **when**: Time window - 1d, 7d, m, or all (default: 7d)

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: NewsSearchRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | NewsSearchResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Other

### `GET /api/health`

**Summary:** Health Check

Health check endpoint.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |

### `GET /api/version`

**Summary:** Version

API version information.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |

## Sentiment

### `POST /api/sentiment/analyze`

**Summary:** Analyze Sentiment

Analyze sentiment of text.

- **text**: Text to analyze

Returns sentiment label (Positive, Negative, Neutral) and score (-1 to 1).

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: SentimentRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | SentimentResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/sentiment/analyze-batch`

**Summary:** Analyze Sentiment Batch

Analyze sentiment for multiple articles.

- **articles**: List of articles (must have 'title' field)

Returns articles with sentiment_label and sentiment_score added.

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: BatchSentimentRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | BatchSentimentResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Tenants

### `GET /api/tenants/`

**Summary:** List All Tenants

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | TenantPublic[] (application/json) |

**Security:** `OAuth2PasswordBearer`

### `POST /api/tenants/`

**Summary:** Create Tenant Handler

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: TenantCreate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | TenantPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `GET /api/tenants/{tenant_id}`

**Summary:** Get Tenant Handler

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `tenant_id` | path | Yes | string (uuid) |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | TenantPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

## Users

### `GET /api/users/`

**Summary:** List Users

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | TenantUserPublic[] (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `POST /api/users/`

**Summary:** Create Tenant User

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: UserCreate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | TenantUserPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `DELETE /api/users/{user_id}`

**Summary:** Remove User From Tenant

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `user_id` | path | Yes | string (uuid) |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `PATCH /api/users/{user_id}`

**Summary:** Update User

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `user_id` | path | Yes | string (uuid) |  |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Request Body**

- Required: Yes
- Schema: UserUpdate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | UserPublic (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

### `GET /api/users/me`

**Summary:** Get Current User Profile

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `X-Tenant-ID` | header | No | string (uuid) | null |  |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | UserProfile (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

**Security:** `OAuth2PasswordBearer`

## Watchlist

### `DELETE /api/watchlist`

**Summary:** Clear Watchlist

Clear all watchlist items.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |

### `GET /api/watchlist`

**Summary:** Get Watchlist

Get all watchlist items.

**Parameters**

None

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | WatchlistResponse (application/json) |

### `POST /api/watchlist`

**Summary:** Add Watchlist Item

Add an entity to the watchlist.

- **entity**: Entity name to monitor
- **type**: Type - Company, Person, or Sector
- **filters**: Optional search filters
- **hl**: Language code (default: en-US)
- **gl**: Geo location code (default: US)
- **ceid**: Edition code (default: US:en)

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: WatchlistItemCreate (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | WatchlistItem (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `DELETE /api/watchlist/{item_id}`

**Summary:** Remove Watchlist Item

Remove an entity from the watchlist.

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `item_id` | path | Yes | string | Watchlist item ID |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | object (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `GET /api/watchlist/{item_id}`

**Summary:** Get Watchlist Item

Get a specific watchlist item by ID.

**Parameters**

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `item_id` | path | Yes | string | Watchlist item ID |

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | WatchlistItem (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

### `POST /api/watchlist/fetch`

**Summary:** Fetch Watchlist News

Fetch news for all watchlist items.

- **when**: Time window - 1d, 7d, m, or all (default: 7d)

**Parameters**

None

**Request Body**

- Required: Yes
- Schema: WatchlistFetchRequest (application/json)

**Responses**

| Status | Description | Schema |
| --- | --- | --- |
| 200 | Successful Response | WatchlistFetchResponse (application/json) |
| 422 | Validation Error | HTTPValidationError (application/json) |

## Schemas

### `AIAnalyzeRequest`

Request model for AI article analysis.

Fields:
- `article_url`: string (uri) required - URL of the article to analyze
- `title`: string | null - Optional article title/snippet to detect language before parsing
- `role`: string - Analysis role: Executive Summary, Financial Analyst, Marketing Specialist, Investor Relations, Public Relations
- `source`: string | null - Optional article source name

### `AIAnalyzeResponse`

Response model for AI article analysis.

Fields:
- `title`: string required
- `analysis`: string required
- `link`: string (uri) required
- `source`: string required
- `role`: string required
- `text`: string | null

### `AIChatMessage`

Chat message for article Q&A.

Fields:
- `role`: `user`, `assistant` required
- `content`: string required

### `AIChatStreamRequest`

Request model for streaming article chat.

Fields:
- `article_text`: string required - Raw article text for grounding the chat
- `messages`: AIChatMessage[] required
- `role`: string - Persona for analysis

### `AIRolesResponse`

Response model for available AI roles.

Fields:
- `roles`: string[] required
- `default_role`: string required

### `AISynthesizeRequest`

Request model for AI synthesis.

Fields:
- `articles`: Article[] required - List of articles to synthesize

### `AISynthesizeResponse`

Response model for AI synthesis.

Fields:
- `report`: object required - Structured synthesis report as a dictionary
- `articles_analyzed`: integer required

### `AlertChannel`

Enum: `in_app`, `email`, `sms`

### `AlertCreateRequest`

Create alert rule for current user in current tenant.

Fields:
- `entity_id`: string (uuid) | null
- `entity_name`: string | null
- `entity_type`: EntityType
- `channel`: AlertChannel
- `min_importance`: integer | null
- `sentiment`: AlertSentiment
- `is_active`: boolean

### `AlertPublic`

Alert DTO returned to frontend.

Fields:
- `id`: string (uuid) required
- `tenant_id`: string (uuid) required
- `user_id`: string (uuid) required
- `entity_id`: string (uuid) | null required
- `entity_name`: string | null required
- `channel`: AlertChannel required
- `min_importance`: integer | null required
- `sentiment`: AlertSentiment required
- ... 2 more field(s)

### `AlertSentiment`

Enum: `any`, `positive`, `neutral`, `negative`

### `AlertsListResponse`

Alert list response.

Fields:
- `items`: AlertPublic[] required
- `total`: integer required

### `AlertUpdateRequest`

Patch alert rule.

Fields:
- `entity_id`: string (uuid) | null
- `entity_name`: string | null
- `entity_type`: EntityType
- `channel`: AlertChannel | null
- `min_importance`: integer | null
- `sentiment`: AlertSentiment | null
- `is_active`: boolean | null

### `Article`

Article with sentiment analysis.

Fields:
- `title`: string required
- `link`: string (uri) required
- `source`: string required
- `published`: string (date-time) | null
- `feed_name`: string | null
- `language`: Language | null
- `guid`: string required
- `google_link`: string (uri) | null
- ... 7 more field(s)

### `ArticleStatsResponse`

Response model for article statistics.

Fields:
- `total_count`: integer required
- `avg_sentiment`: number required
- `top_provider`: string required
- `latest_article_date`: string | null
- `sentiment_distribution`: object required

### `BatchSentimentRequest`

Request model for batch sentiment analysis.

Fields:
- `articles`: Article[] required - List of articles to analyze

### `BatchSentimentResponse`

Response model for batch sentiment analysis.

Fields:
- `articles`: Article[] required
- `total_analyzed`: integer required

### `Body_login_api_auth_login_post`

Fields:
- `grant_type`: string | null
- `username`: string required
- `password`: string (password) required
- `scope`: string
- `client_id`: string | null
- `client_secret`: string | null

### `CustomFeed`

Custom feed model.

Fields:
- `id`: string required - Unique identifier
- `name`: string required
- `url`: string (uri) required

### `CustomFeedCreate`

Request model for creating custom feed.

Fields:
- `name`: string required - Feed name
- `url`: string (uri) required - RSS feed URL

### `CustomFeedResponse`

Response model for custom feed operations.

Fields:
- `feeds`: CustomFeed[] required
- `total`: integer required

### `DecodeUrlRequest`

Request model for URL decoding.

Fields:
- `google_url`: string (uri) required - Google News URL to decode

### `DecodeUrlResponse`

Response model for URL decoding.

Fields:
- `decoded_url`: string (uri) required
- `original_url`: string (uri) required

### `EntityType`

Enum: `company`, `market`, `person`

### `ExtractRequest`

Request model for article text extraction.

Fields:
- `url`: string (uri) required - Article URL to extract text from

### `ExtractResponse`

Response model for article text extraction.

Fields:
- `text`: string required
- `url`: string (uri) required
- `length`: integer required

### `FeedRequest`

Request model for RSS feed.

Fields:
- `url`: string (uri) required - RSS feed URL
- `feed_name`: string | null - Custom name for the feed

### `FeedResponse`

Response model for feed fetch.

Fields:
- `articles`: Article[] required
- `feed_name`: string required
- `total`: integer required

### `FilterRequest`

Request model for filtering articles.

Fields:
- `articles`: Article[] required - List of articles to filter
- `when`: string - Time window: 1d, 7d, m, or all

### `HTTPValidationError`

Fields:
- `detail`: ValidationError[]

### `Language`

Enum: `en`, `ar`

### `MembershipCreate`

Fields:
- `user_id`: string (uuid) required
- `role`: MembershipRole

### `MembershipPublic`

Fields:
- `id`: string (uuid) required
- `tenant_id`: string (uuid) required
- `user_id`: string (uuid) required
- `role`: MembershipRole required
- `created_at`: string (date-time) required

### `MembershipRole`

Enum: `tenant_superuser`, `member`

### `MembershipTenantPublic`

Fields:
- `id`: string (uuid) required
- `name`: string required
- `slug`: string required

### `MembershipUpdate`

Fields:
- `role`: MembershipRole required

### `MembershipWithTenant`

Fields:
- `membership_id`: string (uuid) required
- `role`: MembershipRole required
- `tenant`: MembershipTenantPublic required

### `NewsSearchRequest`

Request model for news search.

Fields:
- `entity`: string required - Company, person, or sector name
- `type`: string required - Entity type (e.g., 'Company', 'Person', 'Sector')
- `filters`: string | null - Additional search filters (e.g., 'stock OR earnings')
- `hl`: string - Language code
- `gl`: string - Geo location code
- `ceid`: string - Edition code
- `when`: string - Time window: 1d, 7d, m, or all

### `NewsSearchResponse`

Response model for news search.

Fields:
- `articles`: Article[] required
- `total`: integer required
- `query`: string required

### `RunEmailAlertsRequest`

Request model for running email alerts.

Fields:
- `dry_run`: boolean
- `limit_per_alert`: integer

### `RunEmailAlertsResponse`

Response model for email alert run summary.

Fields:
- `alerts_evaluated`: integer required
- `matches_found`: integer required
- `sent`: integer required
- `failed`: integer required
- `skipped_duplicates`: integer required
- `dry_run`: boolean required

### `SearchRequest`

Request model for searching within articles.

Fields:
- `articles`: Article[] required - List of articles to search
- `query`: string | null - Search query
- `sort_by`: string - Sort field: published, sentiment_score, title
- `sort_order`: string - Sort order: asc or desc
- `limit`: integer - Maximum results

### `SentimentRequest`

Request model for sentiment analysis.

Fields:
- `text`: string required - Text to analyze

### `SentimentResponse`

Response model for sentiment analysis.

Fields:
- `sentiment_label`: string required - Positive, Negative, or Neutral
- `sentiment_score`: number required - Sentiment score (-1 to 1)
- `text`: string required

### `SentimentTrendRequest`

Request model for sentiment trend calculation.

Fields:
- `articles`: Article[] required - List of articles
- `window_size`: integer - Rolling window size

### `SentimentTrendResponse`

Response model for sentiment trend.

Fields:
- `data_points`: object[] required
- `window_size`: integer required

### `TenantCreate`

Fields:
- `name`: string required
- `slug`: string required

### `TenantPublic`

Fields:
- `id`: string (uuid) required
- `name`: string required
- `slug`: string required
- `is_active`: boolean required
- `created_at`: string (date-time) required

### `TenantUserPublic`

Fields:
- `id`: string (uuid) required
- `email`: string (email) required
- `is_active`: boolean required
- `is_global_superuser`: boolean required
- `created_at`: string (date-time) required
- `membership_id`: string (uuid) required
- `role`: MembershipRole required

### `Token`

Fields:
- `access_token`: string required
- `token_type`: string

### `UserCreate`

Fields:
- `email`: string (email) required
- `password`: string required
- `role`: MembershipRole

### `UserProfile`

Fields:
- `id`: string (uuid) required
- `email`: string (email) required
- `is_active`: boolean required
- `is_global_superuser`: boolean required
- `created_at`: string (date-time) required
- `membership_id`: string (uuid) | null
- `role`: MembershipRole | null

### `UserPublic`

Fields:
- `id`: string (uuid) required
- `email`: string (email) required
- `is_active`: boolean required
- `is_global_superuser`: boolean required
- `created_at`: string (date-time) required

### `UserUpdate`

Fields:
- `email`: string (email) | null
- `is_active`: boolean | null

### `ValidationError`

Fields:
- `loc`: string | integer[] required
- `msg`: string required
- `type`: string required

### `WatchlistFetchRequest`

Request model for fetching watchlist news.

Fields:
- `when`: string - Time window: 1d, 7d, m, or all

### `WatchlistFetchResponse`

Response model for watchlist fetch.

Fields:
- `articles`: Article[] required
- `total`: integer required
- `watchlist_size`: integer required

### `WatchlistItem`

Watchlist item with ID.

Fields:
- `entity`: string required - Entity name to monitor
- `type`: string required - Type: Company, Person, or Sector
- `filters`: string | null - Optional search filters
- `hl`: string - Language code
- `gl`: string - Geo location code
- `ceid`: string - Edition code
- `id`: string required - Unique identifier

### `WatchlistItemCreate`

Request model for creating watchlist item.

Fields:
- `entity`: string required - Entity name to monitor
- `type`: string required - Type: Company, Person, or Sector
- `filters`: string | null - Optional search filters
- `hl`: string - Language code
- `gl`: string - Geo location code
- `ceid`: string - Edition code

### `WatchlistResponse`

Response model for watchlist operations.

Fields:
- `items`: WatchlistItem[] required
- `total`: integer required
