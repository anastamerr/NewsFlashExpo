export type MembershipRole = 'tenant_superuser' | 'member';
export type AccessRole = MembershipRole | 'global_superuser';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
  is_global_superuser: boolean;
  created_at: string;
}

export interface UserProfile extends AuthUser {
  membership_id: string | null;
  role: MembershipRole | null;
}

export interface MembershipWithTenant {
  membership_id: string;
  role: MembershipRole;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TenantPublic {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantOption {
  id: string;
  name: string;
  slug: string;
  role: AccessRole;
}

export interface TenantCreateInput {
  name: string;
  slug: string;
}

export interface WatchlistItem {
  ceid: string;
  entity: string;
  filters: string | null;
  gl: string;
  hl: string;
  id: string;
  type: string;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
  total: number;
}

export interface Article {
  feed_name?: string | null;
  google_link?: string | null;
  guid: string;
  importance?: number | null;
  language?: string | null;
  link: string;
  published: string | null;
  sentiment_label?: string | null;
  sentiment_score?: number | null;
  source: string;
  tag?: string | null;
  title: string;
}

export interface WatchlistFetchResponse {
  articles: Article[];
  total: number;
  watchlist_size: number;
}

export interface ArticleStatsResponse {
  avg_sentiment: number;
  latest_article_date: string | null;
  sentiment_distribution: Record<string, number>;
  top_provider: string;
  total_count: number;
}

export type AnalysisRole =
  | 'Executive Summary'
  | 'Financial Analyst'
  | 'Marketing Specialist'
  | 'Investor Relations'
  | 'Public Relations';

export interface AnalyzeArticleInput {
  articleUrl: string;
  role: AnalysisRole;
  source?: string | null;
  title?: string | null;
}

export interface AnalyzeArticleResponse {
  analysis: string;
  link: string;
  role: AnalysisRole;
  source: string;
  text: string | null;
  title: string;
}

export interface SessionCapabilities {
  accessRole: AccessRole | null;
  canCreateTenant: boolean;
  canManageTenantUsers: boolean;
}
