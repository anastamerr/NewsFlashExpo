import type {
  AlertCreateInput,
  AlertPublic,
  AlertsListResponse,
  AlertUpdateInput,
  AISynthesizeInput,
  AISynthesizeResponse,
  AuthUser,
  AnalyzeArticleInput,
  AnalyzeArticleResponse,
  Article,
  ArticleStatsResponse,
  MembershipWithTenant,
  NewsSearchInput,
  NewsSearchResponse,
  TenantCreateInput,
  TenantOption,
  TenantPublic,
  TokenResponse,
  RunEmailAlertsInput,
  RunEmailAlertsResponse,
  UserProfile,
  WatchlistCreateInput,
  WatchlistFetchResponse,
  WatchlistResponse,
  WatchlistItem,
  WatchlistWindow,
} from '../../types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is required. Configure it in .env before starting the app.');
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  tenantId?: string | null;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.tenantId) {
    headers['X-Tenant-ID'] = options.tenantId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const raw = await response.text();
  const payload = raw ? tryParseJson(raw) : null;

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.statusText), response.status, payload);
  }

  return payload as T;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail;

    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg?: unknown }).msg);
          }

          return String(item);
        })
        .join(', ');
    }
  }

  return fallback || 'Request failed';
}

export async function login(username: string, password: string) {
  const body = new URLSearchParams({
    username,
    password,
    scope: '',
  });

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const raw = await response.text();
  const payload = raw ? tryParseJson(raw) : null;

  if (!response.ok) {
    throw new ApiError('Invalid email or password', response.status, payload);
  }

  return payload as TokenResponse;
}

export function getAuthenticatedUser(token: string) {
  return requestJson<AuthUser>('/auth/me', {
    token,
  });
}

export function getCurrentUserProfile(token: string, tenantId?: string | null) {
  return requestJson<UserProfile>('/users/me', {
    tenantId,
    token,
  });
}

export function getMemberships(token: string) {
  return requestJson<MembershipWithTenant[]>('/memberships/me', {
    token,
  });
}

export function listTenants(token: string) {
  return requestJson<TenantPublic[]>('/tenants/', {
    token,
  });
}

export function createTenant(token: string, input: TenantCreateInput) {
  return requestJson<TenantPublic>('/tenants/', {
    body: input,
    method: 'POST',
    token,
  });
}

export function listAlerts(token: string, tenantId: string) {
  return requestJson<AlertsListResponse>('/alerts', {
    tenantId,
    token,
  });
}

export function createAlert(token: string, tenantId: string, input: AlertCreateInput) {
  return requestJson<AlertPublic>('/alerts', {
    body: input,
    method: 'POST',
    tenantId,
    token,
  });
}

export function updateAlert(
  token: string,
  tenantId: string,
  alertId: string,
  input: AlertUpdateInput,
) {
  return requestJson<AlertPublic>(`/alerts/${alertId}`, {
    body: input,
    method: 'PATCH',
    tenantId,
    token,
  });
}

export function deleteAlert(token: string, tenantId: string, alertId: string) {
  return requestJson<{ id: string; message: string }>(`/alerts/${alertId}`, {
    method: 'DELETE',
    tenantId,
    token,
  });
}

export function runEmailAlerts(
  token: string,
  tenantId: string,
  input: RunEmailAlertsInput,
) {
  return requestJson<RunEmailAlertsResponse>('/alerts/run-email', {
    body: input,
    method: 'POST',
    tenantId,
    token,
  });
}

export async function bootstrapTenants(token: string, user: AuthUser) {
  const memberships = await getMemberships(token);
  const membershipMap = new Map(
    memberships.map((membership) => [membership.tenant.id, membership.role]),
  );

  if (user.is_global_superuser) {
    const tenants = await listTenants(token);
    return tenants.map<TenantOption>((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      role: membershipMap.get(tenant.id) ?? 'global_superuser',
    }));
  }

  if (memberships.length > 0) {
    return memberships.map<TenantOption>((membership) => ({
      id: membership.tenant.id,
      name: membership.tenant.name,
      slug: membership.tenant.slug,
      role: membership.role,
    }));
  }

  return [];
}

export function getWatchlist(token: string, tenantId?: string | null) {
  return requestJson<WatchlistResponse>('/watchlist', {
    tenantId,
    token,
  });
}

export function searchNews(
  token: string,
  input: NewsSearchInput,
  tenantId?: string | null,
) {
  return requestJson<NewsSearchResponse>('/news/search', {
    body: {
      ceid: input.ceid ?? 'US:en',
      entity: input.entity,
      filters: input.filters ?? null,
      gl: input.gl ?? 'US',
      hl: input.hl ?? 'en-US',
      type: input.type,
      when: input.when ?? '7d',
    },
    method: 'POST',
    tenantId,
    token,
  });
}

export function fetchWatchlistNews(
  token: string,
  when: WatchlistWindow,
  tenantId?: string | null,
) {
  return requestJson<WatchlistFetchResponse>('/watchlist/fetch', {
    body: { when },
    method: 'POST',
    tenantId,
    token,
  });
}

export function addWatchlistItem(
  token: string,
  input: WatchlistCreateInput,
  tenantId?: string | null,
) {
  return requestJson<WatchlistItem>('/watchlist', {
    body: {
      ceid: input.ceid ?? 'US:en',
      entity: input.entity,
      filters: input.filters ?? null,
      gl: input.gl ?? 'US',
      hl: input.hl ?? 'en-US',
      type: input.type,
    },
    method: 'POST',
    tenantId,
    token,
  });
}

export function removeWatchlistItem(
  token: string,
  itemId: string,
  tenantId?: string | null,
) {
  return requestJson<{ item_id: string; message: string }>(`/watchlist/${itemId}`, {
    method: 'DELETE',
    tenantId,
    token,
  });
}

export function getArticleStats(
  token: string,
  articles: Article[],
  tenantId?: string | null,
) {
  return requestJson<ArticleStatsResponse>('/articles/stats', {
    body: { articles },
    method: 'POST',
    tenantId,
    token,
  });
}

export function synthesizeArticles(
  token: string,
  input: AISynthesizeInput,
  tenantId?: string | null,
) {
  return requestJson<AISynthesizeResponse>('/ai/synthesize', {
    body: {
      articles: input.articles,
      limit: input.limit ?? 10,
      when: input.when ?? '7d',
    },
    method: 'POST',
    tenantId,
    token,
  });
}

export function analyzeArticle(
  token: string,
  input: AnalyzeArticleInput,
  tenantId?: string | null,
) {
  return requestJson<AnalyzeArticleResponse>('/ai/analyze-article', {
    body: {
      article_url: input.articleUrl,
      role: input.role,
      source: input.source ?? null,
      title: input.title ?? null,
    },
    method: 'POST',
    tenantId,
    token,
  });
}
