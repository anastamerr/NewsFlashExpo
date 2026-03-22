import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { WatchlistItem, WatchlistCreateInput, NewsSearchResponse } from '@/types/api';

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return handleResponse(apiClient.get(ENDPOINTS.WATCHLIST.LIST));
}

export async function addWatchlistItem(input: WatchlistCreateInput): Promise<WatchlistItem> {
  return handleResponse(apiClient.post(ENDPOINTS.WATCHLIST.ADD, input));
}

export async function removeWatchlistItem(id: string): Promise<void> {
  return handleResponse(apiClient.delete(ENDPOINTS.WATCHLIST.REMOVE(id)));
}

export async function fetchWatchlistNews(itemId: string): Promise<NewsSearchResponse> {
  return handleResponse(
    apiClient.get(ENDPOINTS.WATCHLIST.NEWS, { params: { item_id: itemId } }),
  );
}
