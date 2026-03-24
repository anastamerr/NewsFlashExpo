import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AnalysisRole } from './api';
import type { TimeWindow } from '@/utils/timeWindow';

// ---------------------------------------------------------------------------
// Shared report route params
// ---------------------------------------------------------------------------

export type ReportSummaryParams = {
  articleId: string;
  role?: AnalysisRole;
  deepDiveRoute?: 'ArticleDeepDive' | 'BrowseDeepDive' | 'WatchlistDeepDive';
};

export type ReportDeepDiveParams = {
  articleId: string;
  role?: AnalysisRole;
};

export type TriggerReportParams = {
  alertId: string;
  triggerId: string;
  role?: AnalysisRole;
};

export type CrisisReportParams = {
  crisisId: string;
  role?: AnalysisRole;
};

export type MarketSynthesisParams = {
  watchlistItemId?: string;
  query?: string;
  role?: AnalysisRole;
  timeWindow?: TimeWindow;
};

// ---------------------------------------------------------------------------
// Stack param lists
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  Sources: undefined;
  Users: undefined;
  Companies: undefined;
  CompanyDetail: { companyId: string };
  CompetitorAnalysis: { companyAId?: string; companyBId?: string } | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  TenantSelect: undefined;
};

export type MainTabParamList = {
  TodayTab: NavigatorScreenParams<TodayStackParamList>;
  BrowseTab: NavigatorScreenParams<BrowseStackParamList>;
  WatchlistTab: NavigatorScreenParams<WatchlistStackParamList>;
  DashboardsTab: NavigatorScreenParams<DashboardsStackParamList>;
  AlertsTab: NavigatorScreenParams<AlertsStackParamList>;
};

export type TodayStackParamList = {
  Today: undefined;
  ArticleDetail: { articleId: string };
  CompanyDetail: { companyId: string };
  ArticleSummary: ReportSummaryParams;
  ArticleDeepDive: ReportDeepDiveParams;
};

export type BrowseStackParamList = {
  Browse: undefined;
  ArticleDetail: { articleId: string };
  BrowseSummary: ReportSummaryParams;
  BrowseDeepDive: ReportDeepDiveParams;
};

export type WatchlistStackParamList = {
  Watchlist: undefined;
  WatchlistDetail: { itemId: string; name: string };
  ArticleDetail: { articleId: string };
  WatchlistSummary: ReportSummaryParams;
  WatchlistDeepDive: ReportDeepDiveParams;
  MarketSynthesis: MarketSynthesisParams;
};

export type DashboardsStackParamList = {
  Dashboards: undefined;
  DashboardDetail: { dashboardId: string; title: string };
  AlertTriggerDetail: TriggerReportParams;
  AlertTriggerSummary: TriggerReportParams;
  AlertTriggerDeepDive: TriggerReportParams;
  CrisisDetail: CrisisReportParams;
  CrisisSummary: CrisisReportParams;
  CrisisDeepDive: CrisisReportParams;
};

export type AlertsStackParamList = {
  Alerts: undefined;
  AlertDetail: { alertId: string };
  ArticleDetail: { articleId: string };
  AlertTriggerDetail: TriggerReportParams;
  AlertTriggerSummary: TriggerReportParams;
  AlertTriggerDeepDive: TriggerReportParams;
  CrisisDetail: CrisisReportParams;
  CrisisSummary: CrisisReportParams;
  CrisisDeepDive: CrisisReportParams;
};
