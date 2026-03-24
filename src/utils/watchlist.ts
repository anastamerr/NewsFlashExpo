import type { Article, WatchlistItem } from '@/types/api';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function findBestArticleForWatchlistItem(
  item: WatchlistItem,
  articles: Article[],
) {
  const tokens = [
    item.name,
    item.symbol,
    ...item.name.split(/[()/-]/),
    ...item.name.split(/\s+/),
  ]
    .filter((token): token is string => Boolean(token))
    .map(normalize)
    .filter((token) => token.length > 2);

  return articles.find((article) => {
    const fields = [
      article.title,
      article.summary,
      article.company,
      article.tag,
    ].map(normalize);

    return tokens.some((token) => fields.some((field) => field.includes(token)));
  }) ?? null;
}
