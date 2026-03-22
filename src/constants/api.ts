export const API_BASE_URL = 'https://api.newsflash.ai';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
  },
  TENANTS: {
    LIST: '/tenants',
    CREATE: '/tenants',
    MEMBERSHIPS: '/tenants/memberships',
  },
  ARTICLES: {
    SEARCH: '/articles/search',
    DETAIL: (id: string) => `/articles/${id}`,
    ANALYZE: '/articles/analyze',
    STATS: '/articles/stats',
  },
  WATCHLIST: {
    LIST: '/watchlist',
    ADD: '/watchlist',
    REMOVE: (id: string) => `/watchlist/${id}`,
    NEWS: '/watchlist/news',
  },
  ALERTS: {
    LIST: '/alerts',
    CREATE: '/alerts',
    UPDATE: (id: string) => `/alerts/${id}`,
    DELETE: (id: string) => `/alerts/${id}`,
  },
  COMPANIES: {
    LIST: '/companies',
    DETAIL: (id: string) => `/companies/${id}`,
  },
  SOURCES: {
    LIST: '/sources',
  },
  USERS: {
    LIST: '/users',
  },
  CHAT: {
    SEND: '/chat/send',
    ASSISTANTS: '/chat/assistants',
  },
  SYNTHESIZE: '/articles/synthesize',
} as const;
