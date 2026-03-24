import type {
  ArticleSummaryReport,
  DeepDiveReport,
  TriggerSummaryReport,
  TriggerDeepDiveReport,
  CrisisSummaryReport,
  CrisisDeepDiveReport,
  MarketSynthesisReport,
  AnalysisRole,
} from '@/types/api';
import { MOCK_ALERTS, MOCK_ARTICLES, MOCK_WATCHLIST } from '@/constants/mockData';
import { isWithinTimeWindow, type TimeWindow } from '@/utils/timeWindow';

function articleById(id: string) {
  const article = MOCK_ARTICLES.find((item) => item.id === id);

  if (!article) {
    throw new Error(`Article report not found for id "${id}".`);
  }

  return article;
}

function alertById(id: string) {
  const alert = MOCK_ALERTS.find((item) => item.id === id);

  if (!alert) {
    throw new Error(`Alert report not found for id "${id}".`);
  }

  return alert;
}

function crisisAlertById(id: string) {
  const alert = alertById(id);

  if (alert.type !== 'crisis') {
    throw new Error(`Alert "${id}" is not a crisis report.`);
  }

  return alert;
}

function watchlistItemById(id: string) {
  const item = MOCK_WATCHLIST.find((entry) => entry.id === id);

  if (!item) {
    throw new Error(`Watchlist item not found for id "${id}".`);
  }

  return item;
}

function mockMetadata(article: typeof MOCK_ARTICLES[0], role?: AnalysisRole) {
  return {
    source: article.source,
    date: article.date,
    sentiment: article.sentiment,
    importance: article.importance,
    tags: [article.company, article.tag].filter(Boolean),
    role,
  };
}

function findRelatedArticle(keywords: string[]) {
  const normalizedKeywords = keywords
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  return MOCK_ARTICLES.find((item) => {
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();
    const company = item.company.toLowerCase();
    const tag = item.tag.toLowerCase();

    return normalizedKeywords.some((keyword) =>
      title.includes(keyword)
      || summary.includes(keyword)
      || company.includes(keyword)
      || tag.includes(keyword),
    );
  });
}

export async function getArticleSummary(
  articleId: string,
  role?: AnalysisRole,
): Promise<ArticleSummaryReport> {
  const article = articleById(articleId);

  return {
    id: `summary-${article.id}`,
    articleId: article.id,
    title: article.title,
    metadata: mockMetadata(article, role),
    summary: article.summary,
    keyPoints: [
      { text: 'Significant market impact expected in the short term.', sentiment: 'negative' },
      { text: 'Regulatory attention may increase across the sector.', sentiment: 'neutral' },
      { text: 'Long-term fundamentals remain intact according to analysts.', sentiment: 'positive' },
    ],
    recommendations: [
      { text: 'Monitor related positions for potential volatility.', priority: 'high' },
      { text: 'Review sector exposure in current portfolio allocation.', priority: 'medium' },
    ],
  };
}

export async function getDeepDive(
  articleId: string,
  role?: AnalysisRole,
): Promise<DeepDiveReport> {
  const article = articleById(articleId);

  return {
    id: `deepdive-${article.id}`,
    articleId: article.id,
    title: article.title,
    metadata: mockMetadata(article, role),
    summary: article.summary,
    sections: [
      {
        title: 'Background & Context',
        body: 'This development comes amid broader regional shifts in monetary policy and trade dynamics. Analysts have been tracking leading indicators for several weeks, and the confirmation adds clarity to the near-term outlook.',
      },
      {
        title: 'Market Impact Analysis',
        body: 'The immediate market reaction was measured, with sector indices adjusting by 1.2-2.5%. Fixed-income instruments showed greater sensitivity, particularly in short-duration positions. Currency markets reflected a cautious stance from institutional participants.',
      },
      {
        title: 'Sector Implications',
        body: 'Companies with direct exposure to this development are expected to update forward guidance within the next earnings cycle. Indirect beneficiaries include firms positioned in adjacent markets that may capture redirected capital flows.',
      },
      {
        title: 'Outlook & Forward View',
        body: 'Consensus expectations have shifted modestly. The 12-month outlook remains constructive, though the path is likely to include periods of elevated volatility. Key catalysts to watch include upcoming regulatory decisions and quarterly earnings releases.',
      },
    ],
    keyPoints: [
      { text: 'Near-term volatility expected across directly exposed sectors.', sentiment: 'negative' },
      { text: 'Policy response is broadly in line with market expectations.', sentiment: 'neutral' },
      { text: 'Institutional positioning suggests confidence in medium-term recovery.', sentiment: 'positive' },
    ],
    recommendations: [
      { text: 'Reduce short-term tactical exposure to affected sectors.', priority: 'high' },
      { text: 'Maintain strategic allocation with hedging overlay.', priority: 'medium' },
      { text: 'Monitor earnings guidance revisions over the next 30 days.', priority: 'low' },
    ],
  };
}

export async function getTriggerSummary(
  alertId: string,
  triggerId: string,
  role?: AnalysisRole,
): Promise<TriggerSummaryReport> {
  const alert = alertById(alertId);
  const article = findRelatedArticle(alert.keywords);

  if (!article) {
    throw new Error(`No related article was found for alert "${alert.id}".`);
  }

  return {
    id: `trigger-summary-${alert.id}-${triggerId}`,
    alertId,
    triggerId,
    title: `${alert.title} Trigger Analysis`,
    metadata: {
      ...mockMetadata(article, role),
      source: alert.source,
      date: alert.createdAt,
      tags: [...new Set([article.company, ...alert.keywords].filter(Boolean))],
    },
    summary: alert.message,
    keyPoints: [
      { text: `Source reliability is anchored on ${alert.source}.`, sentiment: 'positive' },
      { text: `Severity is currently ${alert.severity}.`, sentiment: alert.severity === 'LOW' ? 'neutral' : 'negative' },
      { text: `${alert.keywords.length} monitored keywords matched this event.`, sentiment: 'neutral' },
    ],
    triggerReason: `Keyword match on "${alert.keywords.join(', ')}" + severity >= ${alert.severity}.`,
  };
}

export async function getTriggerDeepDive(
  alertId: string,
  triggerId: string,
  role?: AnalysisRole,
): Promise<TriggerDeepDiveReport> {
  const summary = await getTriggerSummary(alertId, triggerId, role);

  return {
    ...summary,
    id: `trigger-deepdive-${summary.alertId}-${summary.triggerId}`,
    sections: [
      {
        title: 'Trigger Analysis',
        body: 'The alert rule matched on multiple keyword signals within the configured time window. Cross-referencing with additional sources confirms the event.',
      },
      {
        title: 'Impact Assessment',
        body: 'Based on historical patterns, similar triggers have preceded material market moves in 68% of cases. The current signal strength is above the 90th percentile.',
      },
    ],
    recommendations: [
      { text: 'Escalate to portfolio management for immediate review.', priority: 'high' },
      { text: 'Cross-reference with internal risk models.', priority: 'medium' },
    ],
  };
}

export async function getCrisisSummary(
  crisisId: string,
  role?: AnalysisRole,
): Promise<CrisisSummaryReport> {
  const alert = crisisAlertById(crisisId);
  const article = findRelatedArticle(alert.keywords);

  if (!article) {
    throw new Error(`No related article was found for crisis "${alert.id}".`);
  }

  return {
    id: `crisis-summary-${alert.id}`,
    crisisId: alert.id,
    title: alert.title,
    metadata: {
      ...mockMetadata(article, role),
      source: alert.source,
      date: alert.createdAt,
      tags: ['Crisis', ...alert.keywords],
    },
    summary: alert.message,
    keyPoints: [
      { text: `${alert.title} is currently unresolved and active.`, sentiment: 'negative' },
      { text: `Primary monitored keywords: ${alert.keywords.join(', ')}.`, sentiment: 'neutral' },
      { text: `Coverage source for this crisis is ${alert.source}.`, sentiment: 'positive' },
    ],
    severity: 'critical',
    affectedEntities: [...new Set([article.company, ...alert.keywords].filter(Boolean))],
  };
}

export async function getCrisisDeepDive(
  crisisId: string,
  role?: AnalysisRole,
): Promise<CrisisDeepDiveReport> {
  const summary = await getCrisisSummary(crisisId, role);

  return {
    ...summary,
    id: `crisis-deepdive-${summary.crisisId}`,
    sections: [
      {
        title: 'Situation Overview',
        body: 'The Red Sea shipping disruption entered its fourth month with no resolution in sight. Military operations in the region continue to threaten commercial vessels, forcing major carriers to avoid the Suez Canal route.',
      },
      {
        title: 'Economic Impact',
        body: 'Egypt faces an estimated $6B annual revenue loss. Global supply chain costs have risen by 15-20% for affected routes. Consumer goods inflation in Europe has accelerated by 0.3 percentage points attributable to rerouting.',
      },
      {
        title: 'Market Response',
        body: 'Shipping and logistics stocks have diverged sharply: companies with Cape of Good Hope capacity are outperforming, while Suez-dependent operators face margin pressure.',
      },
    ],
    recommendations: [
      { text: 'Hedge exposure to Egypt sovereign risk instruments.', priority: 'high' },
      { text: 'Review supply-chain-sensitive portfolio positions.', priority: 'high' },
      { text: 'Monitor diplomatic developments for de-escalation signals.', priority: 'medium' },
    ],
    timeline: [
      { date: '2025-11-19', event: 'First commercial vessel seized in Red Sea.' },
      { date: '2025-12-15', event: 'Major carriers announce Red Sea route suspensions.' },
      { date: '2026-01-10', event: 'Insurance premiums for Red Sea transit triple.' },
      { date: '2026-02-20', event: 'Suez Canal Authority reports 35% revenue decline.' },
      { date: '2026-03-22', event: 'Revenue decline reaches 40%; canal traffic at multi-year low.' },
    ],
  };
}

export async function getMarketSynthesis(
  params: { watchlistItemId?: string; query?: string; timeWindow?: TimeWindow },
  role?: AnalysisRole,
): Promise<MarketSynthesisReport> {
  const watchlistItem = params.watchlistItemId ? watchlistItemById(params.watchlistItemId) : null;
  const activeTimeWindow = params.timeWindow;
  const titleContext = watchlistItem?.name ?? params.query ?? 'MENA Market';
  const scopedArticles = watchlistItem
    ? MOCK_ARTICLES.filter((article) =>
        article.company === watchlistItem.name
        || article.company === watchlistItem.symbol
        || article.title.includes(watchlistItem.name)
        || (watchlistItem.symbol ? article.title.includes(watchlistItem.symbol) : false),
      )
    : MOCK_ARTICLES;
  const timeScopedArticles = activeTimeWindow
    ? scopedArticles.filter((article) => isWithinTimeWindow(article.date, activeTimeWindow))
    : scopedArticles;
  const fallbackArticles = activeTimeWindow
    ? MOCK_ARTICLES.filter((article) => isWithinTimeWindow(article.date, activeTimeWindow))
    : MOCK_ARTICLES;
  const articles = timeScopedArticles.length > 0
    ? timeScopedArticles
    : scopedArticles.length > 0
      ? scopedArticles
      : fallbackArticles.length > 0
        ? fallbackArticles
        : MOCK_ARTICLES;
  const averageSentiment = articles.reduce((sum, article) => sum + article.sentiment, 0) / articles.length;
  const averageImportance = articles.reduce((sum, article) => sum + article.importance, 0) / articles.length;
  const sentimentDistribution = articles.reduce(
    (acc, article) => {
      if (article.sentiment > 1) {
        acc.positive += 1;
      } else if (article.sentiment < -1) {
        acc.negative += 1;
      } else {
        acc.neutral += 1;
      }

      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 },
  );

  return {
    id: `synthesis-${watchlistItem?.id ?? 'global'}`,
    title: `${titleContext} Synthesis`,
    metadata: {
      source: 'NewsFlash AI',
      date: '2026-03-22T12:00:00Z',
      sentiment: averageSentiment,
      importance: averageImportance,
      tags: watchlistItem ? [watchlistItem.name, 'Synthesis'] : ['MENA', 'Market Overview', 'Synthesis'],
      role,
    },
    articleCount: articles.length,
    averageSentiment,
    averageImportance,
    sentimentDistribution,
    sections: [
      {
        title: 'Market Overview',
        body: `${titleContext} remains in focus across ${articles.length} monitored articles. Coverage shows a mixed but actionable picture, with sentiment and importance concentrated in a small number of high-impact developments.`,
      },
      {
        title: 'Key Themes',
        body: 'The dominant themes include policy sensitivity, sector-specific earnings momentum, and the market impact of regional logistics and infrastructure developments.',
      },
      {
        title: 'Sector Performance',
        body: 'Positive articles remain concentrated in banking and infrastructure-linked names, while negative sentiment is clustered around regulatory pressure and shipping disruption narratives.',
      },
    ],
    keyPoints: [
      { text: `${articles.length} articles were included in this synthesis.`, sentiment: 'neutral' },
      {
        text: `Average sentiment is ${averageSentiment.toFixed(1)}.`,
        sentiment: averageSentiment > 0 ? 'positive' : averageSentiment < 0 ? 'negative' : 'neutral',
      },
      { text: `Average importance is ${averageImportance.toFixed(1)} out of 10.`, sentiment: 'neutral' },
    ],
    recommendations: [
      { text: 'Overweight Gulf banking exposure on earnings momentum.', priority: 'high' },
      { text: 'Underweight Suez-dependent logistics and trade names.', priority: 'high' },
      { text: 'Neutral on Egypt equities pending FX stabilization confirmation.', priority: 'medium' },
    ],
  };
}
