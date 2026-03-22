import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { Article, NewsSearchInput, NewsSearchResponse, DashboardStats, AnalyzeArticleResponse } from '@/types/api';

export async function searchArticles(params: NewsSearchInput): Promise<NewsSearchResponse> {
  return handleResponse(apiClient.get(ENDPOINTS.ARTICLES.SEARCH, { params }));
}

export async function getArticle(id: string): Promise<Article> {
  return handleResponse(apiClient.get(ENDPOINTS.ARTICLES.DETAIL(id)));
}

export async function getArticleStats(): Promise<DashboardStats> {
  return handleResponse(apiClient.get(ENDPOINTS.ARTICLES.STATS));
}

export async function analyzeArticle(url: string, role: string): Promise<AnalyzeArticleResponse> {
  return handleResponse(
    apiClient.post(ENDPOINTS.ARTICLES.ANALYZE, { url, role }),
  );
}

export async function synthesizeArticles(articleIds: string[]): Promise<{ summary: string }> {
  return handleResponse(
    apiClient.post(ENDPOINTS.SYNTHESIZE, { article_ids: articleIds }),
  );
}
