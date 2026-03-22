import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  Sources: undefined;
  Users: undefined;
  Companies: undefined;
  CompanyDetail: { companyId: string };
  CompetitorAnalysis: undefined;
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
};

export type BrowseStackParamList = {
  Browse: undefined;
  ArticleDetail: { articleId: string };
};

export type WatchlistStackParamList = {
  Watchlist: undefined;
  WatchlistDetail: { itemId: string; name: string };
  ArticleDetail: { articleId: string };
};

export type DashboardsStackParamList = {
  Dashboards: undefined;
  DashboardDetail: { dashboardId: string; title: string };
};

export type AlertsStackParamList = {
  Alerts: undefined;
  AlertDetail: { alertId: string };
  ArticleDetail: { articleId: string };
};
