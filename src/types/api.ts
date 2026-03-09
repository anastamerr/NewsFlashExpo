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

export type WatchlistItemType = 'Company' | 'Person' | 'Sector';
export type WatchlistWindow = '1d' | '7d' | 'm' | 'all';

export interface WatchlistCreateInput {
  ceid?: string;
  entity: string;
  filters?: string | null;
  gl?: string;
  hl?: string;
  type: WatchlistItemType;
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

export interface NewsSearchInput {
  ceid?: string;
  entity: string;
  filters?: string | null;
  gl?: string;
  hl?: string;
  type: WatchlistItemType;
  when?: WatchlistWindow;
}

export interface NewsSearchResponse {
  articles: Article[];
  query: string;
  total: number;
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

export interface AISynthesizeInput {
  articles: Article[];
  limit?: number;
  when?: WatchlistWindow;
}

export interface AISynthesizeResponse {
  articles_analyzed: number;
  report: Record<string, unknown>;
}

export interface SessionCapabilities {
  accessRole: AccessRole | null;
  canCreateTenant: boolean;
  canManageTenantUsers: boolean;
}

export type AlertChannel = 'in_app' | 'email' | 'sms';
export type AlertSentiment = 'any' | 'positive' | 'neutral' | 'negative';
export type EntityType = 'company' | 'market' | 'person';

export interface AlertPublic {
  channel: AlertChannel;
  created_at: string;
  entity_id: string | null;
  entity_name: string | null;
  id: string;
  is_active: boolean;
  min_importance: number | null;
  sentiment: AlertSentiment;
  tenant_id: string;
  user_id: string;
}

export interface AlertsListResponse {
  items: AlertPublic[];
  total: number;
}

export interface AlertCreateInput {
  channel: AlertChannel;
  entity_id?: string | null;
  entity_name?: string | null;
  entity_type: EntityType;
  is_active: boolean;
  min_importance?: number | null;
  sentiment: AlertSentiment;
}

export interface AlertUpdateInput {
  channel?: AlertChannel | null;
  entity_id?: string | null;
  entity_name?: string | null;
  entity_type: EntityType;
  is_active?: boolean | null;
  min_importance?: number | null;
  sentiment?: AlertSentiment | null;
}

export interface RunEmailAlertsInput {
  dry_run: boolean;
  limit_per_alert: number;
}

export interface RunEmailAlertsResponse {
  alerts_evaluated: number;
  dry_run: boolean;
  failed: number;
  matches_found: number;
  sent: number;
  skipped_duplicates: number;
}
