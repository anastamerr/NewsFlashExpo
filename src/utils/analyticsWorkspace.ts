import { MOCK_ARTICLES, MOCK_STATS } from '@/constants/mockData';

export type AnalyticsDomain = 'overview' | 'sentiment' | 'topics' | 'sources';
export type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d';

interface ChartPoint {
  x: number;
  y: number;
}

interface BarPoint {
  x: number;
  y: number;
  label?: string;
  [key: string]: unknown;
}

interface PieSlice {
  value: number;
  label: string;
  color: string;
}

interface AnalyticsKpi {
  label: string;
  value: number;
  trend: number;
  mode?: 'number' | 'sentiment';
}

interface ComparisonRow {
  label: string;
  mentions: number;
  sentiment: number;
  momentum: number;
}

interface WorkspacePayload {
  title: string;
  description: string;
  kpis: AnalyticsKpi[];
  lineSeries: { data: ChartPoint[]; color: string; label: string }[];
  lineLabels: string[];
  barData: BarPoint[];
  barLabels: string[];
  pieData: PieSlice[];
  pieCenterLabel: string;
  pieCenterValue: string;
  comparisonRows: ComparisonRow[];
}

export const ANALYTICS_DOMAINS: { id: AnalyticsDomain; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'topics', label: 'Topics' },
  { id: 'sources', label: 'Sources' },
];

const PERIOD_MULTIPLIER: Record<AnalyticsPeriod, number> = {
  '24h': 0.4,
  '7d': 1,
  '30d': 2.3,
  '90d': 4.8,
};

const DOMAIN_DESCRIPTIONS: Record<AnalyticsDomain, { title: string; description: string }> = {
  overview: {
    title: 'Cross-market operating picture',
    description:
      'Use one surface to scan volume, sentiment, topic concentration, and source mix before drilling into a specific dashboard.',
  },
  sentiment: {
    title: 'Sentiment pressure and recovery',
    description:
      'Track whether selected narratives are gaining positive follow-through or compounding negative pressure over the chosen period.',
  },
  topics: {
    title: 'Topic momentum workspace',
    description:
      'Compare the tags drawing the most attention and identify where coverage is accelerating relative to the rest of the market.',
  },
  sources: {
    title: 'Source mix and concentration',
    description:
      'See which publishers are driving the narrative and how dependent the feed is on a small number of outlets.',
  },
};

const LINE_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TOPIC_COLORS = ['#8aa8ff', '#00f700', '#00eff0', '#ff9f43', '#ff6b6b'];

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function truncateLabel(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
}

const topicWeights = new Map<string, number>();
const tagWeights = new Map<string, number>();
const companyWeights = new Map<string, number>();

for (const topic of MOCK_STATS.trendingTopics) {
  topicWeights.set(topic.topic, topic.count);
}

for (const article of MOCK_ARTICLES) {
  tagWeights.set(article.tag, (tagWeights.get(article.tag) ?? 0) + article.importance * 2);
  companyWeights.set(article.company, (companyWeights.get(article.company) ?? 0) + article.importance);
}

function getTagWeight(tag: string) {
  return topicWeights.get(tag) ?? tagWeights.get(tag) ?? companyWeights.get(tag) ?? 18;
}

export function getAnalyticsTags() {
  return Array.from(
    new Set([
      ...MOCK_STATS.trendingTopics.map((topic) => topic.topic),
      ...MOCK_ARTICLES.map((article) => article.tag),
      ...MOCK_ARTICLES.map((article) => article.company),
    ]),
  ).sort((left, right) => getTagWeight(right) - getTagWeight(left));
}

function buildTagRows(tags: string[]) {
  return tags.map((tag) => {
    const base = getTagWeight(tag);
    const mentions = Math.max(8, Math.round(base * 1.4));
    const sentiment = clamp(((base % 17) - 8) / 2.5, -4.5, 4.8);
    const momentum = clamp((base % 13) * 1.7 - 7, -8, 14);

    return {
      label: tag,
      mentions,
      sentiment: round(sentiment),
      momentum: round(momentum),
    };
  });
}

function buildLineSeries(period: AnalyticsPeriod, selectedTags: string[], domain: AnalyticsDomain) {
  const multiplier = PERIOD_MULTIPLIER[period];
  const selectedWeight = selectedTags.length
    ? selectedTags.reduce((sum, tag) => sum + getTagWeight(tag), 0) / selectedTags.length
    : 28;
  const emphasis = clamp(selectedWeight / 60, 0.6, 1.9);

  const positiveBaseline = [1.8, 2.1, 2.4, 2.2, 2.7, 3, 3.2];
  const negativeBaseline = [-1.4, -1.8, -1.6, -2.2, -1.9, -1.5, -1.3];
  const volumeBaseline = [112, 138, 128, 154, 149, 168, 176];

  if (domain === 'sources') {
    return [
      {
        label: 'Source Diversity',
        color: '#8aa8ff',
        data: volumeBaseline.map((value, index) => ({
          x: index,
          y: round((value / 48) * multiplier + emphasis * 0.8),
        })),
      },
      {
        label: 'Concentration Risk',
        color: '#ff9f43',
        data: volumeBaseline.map((value, index) => ({
          x: index,
          y: round((value / 62) * multiplier + emphasis * 0.5),
        })),
      },
    ];
  }

  if (domain === 'topics') {
    return [
      {
        label: 'Topic Velocity',
        color: '#00eff0',
        data: volumeBaseline.map((value, index) => ({
          x: index,
          y: round((value / 52) * multiplier + emphasis),
        })),
      },
      {
        label: 'Selected Tag Lift',
        color: '#8aa8ff',
        data: positiveBaseline.map((value, index) => ({
          x: index,
          y: round(value * multiplier * 0.7 + emphasis * 0.9 + index * 0.08),
        })),
      },
    ];
  }

  if (domain === 'overview') {
    return [
      {
        label: 'Market Signal',
        color: '#8aa8ff',
        data: positiveBaseline.map((value, index) => ({
          x: index,
          y: round(value * multiplier * 0.85 + emphasis * 0.4),
        })),
      },
      {
        label: 'Risk Pressure',
        color: '#ff6b6b',
        data: negativeBaseline.map((value, index) => ({
          x: index,
          y: round(Math.abs(value) * multiplier * 0.75 + emphasis * 0.3),
        })),
      },
    ];
  }

  return [
    {
      label: 'Positive Sentiment',
      color: '#10b981',
      data: positiveBaseline.map((value, index) => ({
        x: index,
        y: round(value * multiplier * 0.8 + emphasis * 0.5),
      })),
    },
    {
      label: 'Negative Sentiment',
      color: '#ef4444',
      data: negativeBaseline.map((value, index) => ({
        x: index,
        y: round(value * multiplier * 0.7 - emphasis * 0.35),
      })),
    },
  ];
}

function buildBarData(domain: AnalyticsDomain, tags: string[], period: AnalyticsPeriod) {
  const multiplier = PERIOD_MULTIPLIER[period];
  const activeTags = tags.length > 0 ? tags : getAnalyticsTags().slice(0, 5);

  if (domain === 'sources') {
    return {
      labels: MOCK_STATS.topSources.map((source) => source.name),
      data: MOCK_STATS.topSources.map((source, index) => ({
        x: index,
        y: Math.round(source.count * multiplier),
        label: source.name,
      })),
    };
  }

  const rows = buildTagRows(activeTags.slice(0, 5));

  return {
    labels: rows.map((row) => truncateLabel(row.label, 10)),
    data: rows.map((row, index) => ({
      x: index,
      y: Math.round(row.mentions * multiplier),
      label: row.label,
    })),
  };
}

function buildPieData(domain: AnalyticsDomain, period: AnalyticsPeriod, tags: string[]) {
  const multiplier = PERIOD_MULTIPLIER[period];

  if (domain === 'sources') {
    const data = MOCK_STATS.topSources.slice(0, 4).map((source, index) => ({
      label: source.name,
      value: Math.round(source.count * multiplier),
      color: TOPIC_COLORS[index],
    }));

    return {
      data,
      centerLabel: 'SOURCES',
      centerValue: String(data.reduce((sum, item) => sum + item.value, 0)),
    };
  }

  if (domain === 'sentiment') {
    const positive = Math.round(MOCK_STATS.sentimentBreakdown.positive * multiplier);
    const neutral = Math.round(MOCK_STATS.sentimentBreakdown.neutral * multiplier);
    const negative = Math.round(MOCK_STATS.sentimentBreakdown.negative * multiplier);

    return {
      data: [
        { label: 'Positive', value: positive, color: '#10b981' },
        { label: 'Neutral', value: neutral, color: '#eab308' },
        { label: 'Negative', value: negative, color: '#ef4444' },
      ],
      centerLabel: 'TONE',
      centerValue: String(positive + neutral + negative),
    };
  }

  const comparisonRows = buildTagRows(tags.length > 0 ? tags.slice(0, 4) : getAnalyticsTags().slice(0, 4));

  return {
    data: comparisonRows.map((row, index) => ({
      label: truncateLabel(row.label, 12),
      value: Math.round(row.mentions * multiplier),
      color: TOPIC_COLORS[index],
    })),
    centerLabel: domain === 'overview' ? 'COVERAGE' : 'TOPICS',
    centerValue: String(
      comparisonRows.reduce((sum, row) => sum + Math.round(row.mentions * multiplier), 0),
    ),
  };
}

function buildKpis(domain: AnalyticsDomain, period: AnalyticsPeriod, tags: string[]): AnalyticsKpi[] {
  const multiplier = PERIOD_MULTIPLIER[period];
  const comparisonRows = buildTagRows(tags.length > 0 ? tags.slice(0, 3) : getAnalyticsTags().slice(0, 3));
  const strongestTag = comparisonRows[0];
  const strongestCompany = Array.from(companyWeights.entries()).sort((left, right) => right[1] - left[1])[0];

  if (domain === 'sources') {
    return [
      { label: 'SOURCE CONC.', value: 62 * multiplier, trend: -2.4 },
      { label: 'TOP PUBLISHER', value: MOCK_STATS.topSources[0].count * multiplier, trend: 6.8 },
      { label: 'ACTIVE FEED', value: MOCK_STATS.topSources.length, trend: 1.2 },
    ];
  }

  if (domain === 'sentiment') {
    return [
      {
        label: 'POSITIVE SHIFT',
        value: MOCK_STATS.avgSentiment * multiplier,
        trend: 5.6,
        mode: 'sentiment',
      },
      {
        label: 'NEGATIVE LOAD',
        value: comparisonRows.reduce((sum, row) => sum + Math.abs(Math.min(row.sentiment, 0)), 0),
        trend: -3.1,
        mode: 'sentiment',
      },
      { label: 'TOP TAG', value: strongestTag?.mentions ?? 0, trend: strongestTag?.momentum ?? 0 },
    ];
  }

  if (domain === 'topics') {
    return [
      { label: 'TRENDING TAG', value: strongestTag?.mentions ?? 0, trend: strongestTag?.momentum ?? 0 },
      { label: 'COMPARE SET', value: tags.length || 1, trend: 0.9 },
      { label: 'TOPIC SHARE', value: 34 * multiplier, trend: 4.2 },
    ];
  }

  return [
    { label: 'ARTICLES', value: MOCK_STATS.totalArticles * multiplier, trend: 7.4 },
    { label: 'TRENDING CO.', value: strongestCompany?.[1] ?? 0, trend: 3.8 },
    {
      label: 'SENTIMENT',
      value: MOCK_STATS.avgSentiment * multiplier,
      trend: 2.1,
      mode: 'sentiment',
    },
  ];
}

export function getAnalyticsWorkspace(
  domain: AnalyticsDomain,
  period: AnalyticsPeriod,
  selectedTags: string[],
): WorkspacePayload {
  const lineSeries = buildLineSeries(period, selectedTags, domain);
  const bar = buildBarData(domain, selectedTags, period);
  const pie = buildPieData(domain, period, selectedTags);
  const comparisonRows = buildTagRows(
    selectedTags.length > 0 ? selectedTags : getAnalyticsTags().slice(0, 4),
  );
  const copy = DOMAIN_DESCRIPTIONS[domain];

  return {
    title: copy.title,
    description: copy.description,
    kpis: buildKpis(domain, period, selectedTags),
    lineSeries,
    lineLabels: LINE_LABELS,
    barData: bar.data,
    barLabels: bar.labels,
    pieData: pie.data,
    pieCenterLabel: pie.centerLabel,
    pieCenterValue: pie.centerValue,
    comparisonRows,
  };
}
