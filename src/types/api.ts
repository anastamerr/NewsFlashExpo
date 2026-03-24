export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: MembershipRole;
  persona: string;
  tenant_id: string;
  tenant_name: string;
  capabilities: UserCapabilities;
}

export interface UserCapabilities {
  can_manage_users: boolean;
  can_manage_sources: boolean;
  can_create_tenants: boolean;
}

export type MembershipRole = 'global-superuser' | 'tenant-superuser' | 'member';
export type AnalysisRole = 'asset_manager' | 'research_analyst' | 'executive' | 'risk_officer';

export interface TenantOption {
  tenant_id: string;
  tenant_name: string;
  role: MembershipRole;
}

export interface TenantCreateInput {
  name: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  source: string;
  date: string;
  company: string;
  tag: string;
  sentiment: number;
  importance: number;
  summary: string;
  url?: string;
  imageUrl?: string;
  focusType?: 'Report' | 'Company' | 'Country' | 'Action';
}

export interface NewsSearchInput {
  query?: string;
  source?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  dateFrom?: string;
  dateTo?: string;
  topic?: string;
  page?: number;
  limit?: number;
}

export interface NewsSearchResponse {
  articles: Article[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface WatchlistItem {
  id: string;
  type: 'company' | 'people' | 'sector' | 'market';
  name: string;
  symbol?: string;
  sentiment?: number;
  articleCount?: number;
  trend?: number[];
  sparkData?: number[];
}

export interface WatchlistCreateInput {
  type: WatchlistItem['type'];
  name: string;
  symbol?: string;
}

export interface AlertPublic {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  keywords: string[];
  source: string;
  color: string;
  createdAt: string;
  isResolved: boolean;
  type?: 'earnings' | 'ratings' | 'ceo_change' | 'macro' | 'brand_mention' | 'crisis';
}

export interface AlertCreateInput {
  title: string;
  severity: AlertPublic['severity'];
  keywords: string[];
  type?: AlertPublic['type'];
}

export interface AlertUpdateInput {
  title?: string;
  severity?: AlertPublic['severity'];
  keywords?: string[];
  isResolved?: boolean;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  articleCount: number;
  description: string;
  tags: { name: string; count: number }[];
  relatedEntities: string[];
  keyFigures: string[];
  highlights: string[];
  sentimentTrend: { date: string; value: number }[];
  coverageTimeline: { date: string; count: number }[];
}

export interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  articlesPerDay: number;
  reliability: 'high' | 'medium' | 'low';
  lastUpdate: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: MembershipRole;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalArticles: number;
  avgSentiment: number;
  topSources: { name: string; count: number }[];
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
  trendingTopics: { topic: string; count: number; trend: 'up' | 'down' | 'stable' }[];
}

export interface AnalyzeArticleResponse {
  summary: string;
  sentiment: number;
  entities: string[];
  topics: string[];
  keyInsights: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatAssistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestedQuestions: string[];
}

// ---------------------------------------------------------------------------
// Report content models (Phase 0)
// ---------------------------------------------------------------------------

export interface ReportSection {
  title: string;
  body: string;
}

export interface KeyPoint {
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Recommendation {
  text: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ReportMetadata {
  source: string;
  date: string;
  sentiment: number;
  importance: number;
  tags: string[];
  role?: AnalysisRole;
}

export interface ArticleSummaryReport {
  id: string;
  articleId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  keyPoints: KeyPoint[];
  recommendations: Recommendation[];
}

export interface DeepDiveReport {
  id: string;
  articleId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  sections: ReportSection[];
  keyPoints: KeyPoint[];
  recommendations: Recommendation[];
}

export interface TriggerSummaryReport {
  id: string;
  alertId: string;
  triggerId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  keyPoints: KeyPoint[];
  triggerReason: string;
}

export interface TriggerDeepDiveReport {
  id: string;
  alertId: string;
  triggerId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  sections: ReportSection[];
  keyPoints: KeyPoint[];
  recommendations: Recommendation[];
  triggerReason: string;
}

export interface CrisisSummaryReport {
  id: string;
  crisisId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  keyPoints: KeyPoint[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedEntities: string[];
}

export interface CrisisDeepDiveReport {
  id: string;
  crisisId: string;
  title: string;
  metadata: ReportMetadata;
  summary: string;
  sections: ReportSection[];
  keyPoints: KeyPoint[];
  recommendations: Recommendation[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedEntities: string[];
  timeline: { date: string; event: string }[];
}

export interface MarketSynthesisReport {
  id: string;
  title: string;
  metadata: ReportMetadata;
  articleCount: number;
  averageSentiment: number;
  averageImportance: number;
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  sections: ReportSection[];
  keyPoints: KeyPoint[];
  recommendations: Recommendation[];
}
