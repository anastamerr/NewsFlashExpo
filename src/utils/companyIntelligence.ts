import { MOCK_ARTICLES, MOCK_COMPANIES } from '@/constants/mockData';
import type { Company, Article } from '@/types/api';

export type CompanyPeriod = '30d' | '90d' | 'YTD';
export type CompetitorMode = 'market' | 'narrative';

interface ChartPoint {
  x: number;
  y: number;
}

interface MetricSummary {
  label: string;
  value: number;
  trend: number;
  mode?: 'number' | 'sentiment';
}

interface ComparisonMetric {
  key: string;
  label: string;
  aScore: number;
  bScore: number;
  detail: string;
}

interface SignalGroup {
  title: string;
  items: string[];
}

interface CompanyDirectorySummary {
  totalCompanies: number;
  avgCoverage: number;
  positiveLeaders: number;
  dominantSector: string;
}

interface CompanyDetailWorkspace {
  metrics: MetricSummary[];
  sentimentSeries: { data: ChartPoint[]; color: string; label: string }[];
  coverageSeries: { data: ChartPoint[]; color: string; label: string }[];
  chartLabels: string[];
  relatedArticles: Article[];
  peerCompanies: Company[];
  momentumLabel: string;
}

interface CompetitorWorkspace {
  summaryTitle: string;
  summaryText: string;
  scoreA: number;
  scoreB: number;
  scoreGap: number;
  sentimentSeries: { data: ChartPoint[]; color: string; label: string }[];
  coverageSeries: { data: ChartPoint[]; color: string; label: string }[];
  chartLabels: string[];
  pieData: { label: string; value: number; color: string }[];
  pieCenterLabel: string;
  pieCenterValue: string;
  metrics: ComparisonMetric[];
  opportunities: SignalGroup;
  risks: SignalGroup;
  neutrals: SignalGroup;
}

const PERIOD_FACTOR: Record<CompanyPeriod, number> = {
  '30d': 1,
  '90d': 1.35,
  YTD: 1.75,
};

const CHART_LABELS = ['Jan', 'Feb', 'Mar'];

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLatestSentiment(company: Company) {
  return company.sentimentTrend[company.sentimentTrend.length - 1]?.value ?? 0;
}

function getSentimentMomentum(company: Company) {
  if (company.sentimentTrend.length < 2) {
    return 0;
  }

  const first = company.sentimentTrend[0]?.value ?? 0;
  const latest = company.sentimentTrend[company.sentimentTrend.length - 1]?.value ?? 0;
  return round(((latest - first) / Math.max(Math.abs(first), 1)) * 100);
}

function getCoverageMomentum(company: Company) {
  if (company.coverageTimeline.length < 2) {
    return 0;
  }

  const first = company.coverageTimeline[0]?.count ?? 0;
  const latest = company.coverageTimeline[company.coverageTimeline.length - 1]?.count ?? 0;
  return round(((latest - first) / Math.max(first, 1)) * 100);
}

function getRiskScore(company: Company) {
  const negativeHighlights = company.highlights.filter((item) => /review|scrutiny|risk|pressure|compliance/i.test(item)).length;
  const base = 52 - getLatestSentiment(company) * 6 + negativeHighlights * 10;
  return clamp(round(base), 12, 92);
}

function getCoverageScore(company: Company, factor = 1) {
  return clamp(round((company.articleCount / 2.6) * factor), 18, 95);
}

function getMomentumScore(company: Company, factor = 1) {
  return clamp(round((getSentimentMomentum(company) + 35) * factor), 10, 94);
}

function getNarrativeScore(company: Company) {
  return clamp(round(company.tags.length * 12 + company.highlights.length * 8 + getLatestSentiment(company) * 4), 15, 96);
}

function getSourceQualityScore(company: Company) {
  const sectorBoost = company.sector === 'Banking' ? 12 : company.sector === 'Telecommunications' ? 8 : 5;
  return clamp(round(52 + sectorBoost + company.tags.length * 3), 24, 92);
}

function getRelatedArticles(company: Company) {
  const nameTokens = company.name.toLowerCase().split(/\s+/);
  const ticker = company.ticker.split('.')[0]?.toLowerCase() ?? '';

  const matches = MOCK_ARTICLES.filter((article) => {
    const articleCompany = article.company.toLowerCase();
    return (
      articleCompany.includes(ticker) ||
      nameTokens.some((token) => token.length > 3 && articleCompany.includes(token)) ||
      article.tag.toLowerCase().includes(company.sector.toLowerCase())
    );
  });

  return matches.length > 0 ? matches.slice(0, 4) : MOCK_ARTICLES.slice(0, 4);
}

export function getCompanySectors() {
  return ['All', ...Array.from(new Set(MOCK_COMPANIES.map((company) => company.sector)))];
}

export function getCompanyDirectorySummary(companies: Company[]): CompanyDirectorySummary {
  const positiveLeaders = companies.filter((company) => company.sentiment === 'positive').length;
  const totalCoverage = companies.reduce((sum, company) => sum + company.articleCount, 0);
  const sectorCounts = companies.reduce<Record<string, number>>((acc, company) => {
    acc[company.sector] = (acc[company.sector] ?? 0) + 1;
    return acc;
  }, {});
  const dominantSector =
    Object.entries(sectorCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'N/A';

  return {
    totalCompanies: companies.length,
    avgCoverage: round(totalCoverage / Math.max(companies.length, 1)),
    positiveLeaders,
    dominantSector,
  };
}

export function getCompanyDetailWorkspace(company: Company): CompanyDetailWorkspace {
  const sentimentSeries = [
    {
      label: `${company.ticker} Sentiment`,
      color: '#8aa8ff',
      data: company.sentimentTrend.map((point, index) => ({ x: index, y: point.value })),
    },
  ];
  const coverageSeries = [
    {
      label: `${company.ticker} Coverage`,
      color: '#00eff0',
      data: company.coverageTimeline.map((point, index) => ({ x: index, y: point.count })),
    },
  ];
  const peerCompanies = MOCK_COMPANIES.filter((item) => item.sector === company.sector && item.id !== company.id);

  return {
    metrics: [
      { label: 'ARTICLES', value: company.articleCount, trend: getCoverageMomentum(company) },
      { label: 'SENTIMENT', value: getLatestSentiment(company), trend: getSentimentMomentum(company), mode: 'sentiment' },
      { label: 'TOPICS', value: company.tags.length, trend: 4.1 },
      { label: 'RISK LOAD', value: getRiskScore(company), trend: -2.6 },
    ],
    sentimentSeries,
    coverageSeries,
    chartLabels: CHART_LABELS,
    relatedArticles: getRelatedArticles(company),
    peerCompanies,
    momentumLabel: getSentimentMomentum(company) >= 0 ? 'Improving' : 'Under pressure',
  };
}

export function getCompetitorWorkspace(
  companyA: Company,
  companyB: Company,
  period: CompanyPeriod,
  mode: CompetitorMode,
): CompetitorWorkspace {
  const factor = PERIOD_FACTOR[period];
  const aCoverage = getCoverageScore(companyA, factor);
  const bCoverage = getCoverageScore(companyB, factor);
  const aMomentum = getMomentumScore(companyA, factor);
  const bMomentum = getMomentumScore(companyB, factor);
  const aNarrative = getNarrativeScore(companyA);
  const bNarrative = getNarrativeScore(companyB);
  const aRisk = getRiskScore(companyA);
  const bRisk = getRiskScore(companyB);
  const aSourceQuality = getSourceQualityScore(companyA);
  const bSourceQuality = getSourceQualityScore(companyB);
  const aSentiment = clamp(round((getLatestSentiment(companyA) + 5) * 10), 0, 100);
  const bSentiment = clamp(round((getLatestSentiment(companyB) + 5) * 10), 0, 100);

  const metricRows: ComparisonMetric[] = mode === 'market'
    ? [
        { key: 'coverage', label: 'Coverage Share', aScore: aCoverage, bScore: bCoverage, detail: 'How much of the monitored feed each company commands.' },
        { key: 'sentiment', label: 'Sentiment Strength', aScore: aSentiment, bScore: bSentiment, detail: 'Current tone translated into a normalized score.' },
        { key: 'momentum', label: 'Momentum', aScore: aMomentum, bScore: bMomentum, detail: 'Acceleration in sentiment and topic pickup.' },
        { key: 'source', label: 'Source Quality', aScore: aSourceQuality, bScore: bSourceQuality, detail: 'Weighted by sector credibility and reporting mix.' },
        { key: 'risk', label: 'Risk Exposure', aScore: 100 - aRisk, bScore: 100 - bRisk, detail: 'Higher is safer; lower scores indicate more unresolved pressure.' },
      ]
    : [
        { key: 'narrative', label: 'Narrative Control', aScore: aNarrative, bScore: bNarrative, detail: 'Breadth of topics and highlights shaping the company story.' },
        { key: 'tone', label: 'Tone Stability', aScore: aSentiment, bScore: bSentiment, detail: 'How consistently the company is trending positive.' },
        { key: 'velocity', label: 'Story Velocity', aScore: aMomentum, bScore: bMomentum, detail: 'Whether recent mentions are gaining or fading.' },
        { key: 'share', label: 'Share of Voice', aScore: aCoverage, bScore: bCoverage, detail: 'Relative coverage weight inside the chosen period.' },
        { key: 'risk', label: 'Narrative Risk', aScore: 100 - aRisk, bScore: 100 - bRisk, detail: 'Lower scores reflect unresolved negative catalysts.' },
      ];

  const scoreA = round(metricRows.reduce((sum, row) => sum + row.aScore, 0) / metricRows.length);
  const scoreB = round(metricRows.reduce((sum, row) => sum + row.bScore, 0) / metricRows.length);
  const winner = scoreA >= scoreB ? companyA : companyB;
  const runner = scoreA >= scoreB ? companyB : companyA;

  return {
    summaryTitle: `${winner.name} leads the ${mode === 'market' ? 'market picture' : 'narrative race'}`,
    summaryText: `${winner.ticker} is ahead of ${runner.ticker} over ${period} on the back of ${mode === 'market' ? 'coverage, sentiment, and risk balance.' : 'story control, momentum, and tone stability.'}`,
    scoreA,
    scoreB,
    scoreGap: round(Math.abs(scoreA - scoreB)),
    sentimentSeries: [
      {
        label: companyA.ticker,
        color: '#8aa8ff',
        data: companyA.sentimentTrend.map((point, index) => ({ x: index, y: round(point.value * factor) })),
      },
      {
        label: companyB.ticker,
        color: '#00eff0',
        data: companyB.sentimentTrend.map((point, index) => ({ x: index, y: round(point.value * factor) })),
      },
    ],
    coverageSeries: [
      {
        label: companyA.ticker,
        color: '#8aa8ff',
        data: companyA.coverageTimeline.map((point, index) => ({ x: index, y: round(point.count * factor) })),
      },
      {
        label: companyB.ticker,
        color: '#00eff0',
        data: companyB.coverageTimeline.map((point, index) => ({ x: index, y: round(point.count * factor) })),
      },
    ],
    chartLabels: CHART_LABELS,
    pieData: [
      { label: companyA.ticker, value: round(companyA.articleCount * factor), color: '#8aa8ff' },
      { label: companyB.ticker, value: round(companyB.articleCount * factor), color: '#00eff0' },
    ],
    pieCenterLabel: 'SHARE',
    pieCenterValue: `${round(companyA.articleCount * factor + companyB.articleCount * factor)}`,
    metrics: metricRows,
    opportunities: {
      title: 'Opportunities',
      items: winner.highlights.slice(0, 2).concat(
        mode === 'market'
          ? [`${winner.ticker} is carrying a ${round(Math.max(scoreA, scoreB) - Math.min(scoreA, scoreB))}-point operating edge.`]
          : [`${winner.ticker} has the cleaner narrative setup over ${period}.`],
      ),
    },
    risks: {
      title: 'Risks',
      items: [
        ...companyA.highlights.filter((item) => /review|scrutiny|risk|pressure|compliance/i.test(item)).slice(0, 1),
        ...companyB.highlights.filter((item) => /review|scrutiny|risk|pressure|compliance/i.test(item)).slice(0, 1),
        `${companyA.ticker} risk score ${aRisk} vs ${companyB.ticker} risk score ${bRisk}.`,
      ],
    },
    neutrals: {
      title: 'Watch Items',
      items: [
        `${companyA.ticker} topic breadth: ${companyA.tags.length} active themes.`,
        `${companyB.ticker} topic breadth: ${companyB.tags.length} active themes.`,
        `Both companies remain inside the ${companyA.sector === companyB.sector ? companyA.sector : 'tracked'} coverage set.`,
      ],
    },
  };
}
