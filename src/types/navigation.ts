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

export type BrowseHomeParams = {
  initialTab?: 'Browse' | 'Watchlist';
};

// ---------------------------------------------------------------------------
// Stack param lists
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Sources: undefined;
  Users: undefined;
  Alerts: NavigatorScreenParams<AlertsStackParamList> | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignupOnboarding: {
    name: string;
    email: string;
    password: string;
    rememberSession: boolean;
  };
  TenantSelect: undefined;
};

export type MainTabParamList = {
  TodayTab: NavigatorScreenParams<TodayStackParamList>;
  BrowseTab: NavigatorScreenParams<BrowseStackParamList>;
  ResearchTab: NavigatorScreenParams<ResearchStackParamList>;
  DashboardsTab: NavigatorScreenParams<DashboardsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type TodayStackParamList = {
  Today: undefined;
  ArticleDetail: { articleId: string };
  CompanyDetail: { companyId: string };
  ArticleSummary: ReportSummaryParams;
  ArticleDeepDive: ReportDeepDiveParams;
};

export type BrowseStackParamList = {
  BrowseHome: BrowseHomeParams | undefined;
  ArticleDetail: { articleId: string };
  BrowseSummary: ReportSummaryParams;
  BrowseDeepDive: ReportDeepDiveParams;
  WatchlistDetail: { itemId: string; name: string };
  WatchlistSummary: ReportSummaryParams;
  WatchlistDeepDive: ReportDeepDiveParams;
  MarketSynthesis: MarketSynthesisParams;
};

export type ResearchStackParamList = {
  ResearchHome: undefined;
  CompanyDetail: { companyId: string };
  CompetitorAnalysis: { companyAId?: string; companyBId?: string } | undefined;
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

export type SettingsStackParamList = {
  Settings: undefined;
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
