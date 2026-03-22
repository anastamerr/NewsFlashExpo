import type { Article, AlertPublic, WatchlistItem, Company, Source, DashboardStats, ChatAssistant } from '@/types/api';

export const MOCK_ARTICLES: Article[] = [
  { id: '1', title: 'Central Bank of Egypt Raises Interest Rates by 200 Basis Points', source: 'Reuters', date: '2026-03-22T08:30:00Z', company: 'CBE', tag: 'Monetary Policy', sentiment: -2.3, importance: 9, summary: 'The Central Bank of Egypt raised its overnight lending rate to 19.25%, citing persistent inflationary pressures and currency volatility.' },
  { id: '2', title: 'QNB Group Reports Record Q4 2025 Earnings, Beats Expectations', source: 'Bloomberg', date: '2026-03-22T07:15:00Z', company: 'QNB', tag: 'Earnings', sentiment: 4.2, importance: 8, summary: 'Qatar National Bank posted net profit of QR 4.8 billion in Q4, surpassing analyst estimates by 12%.' },
  { id: '3', title: 'Suez Canal Revenue Drops 40% Amid Red Sea Shipping Disruptions', source: 'Financial Times', date: '2026-03-22T06:00:00Z', company: 'SUEZ', tag: 'Trade', sentiment: -3.8, importance: 10, summary: 'Revenue from the Suez Canal fell dramatically as major shipping lines continue to reroute around the Cape of Good Hope.' },
  { id: '4', title: 'ADIB Launches AI-Powered Islamic Banking Platform', source: 'TechCrunch', date: '2026-03-21T18:45:00Z', company: 'ADIB', tag: 'Technology', sentiment: 3.5, importance: 7, summary: 'Abu Dhabi Islamic Bank unveils a new AI-driven digital banking experience, targeting younger demographics across the GCC.' },
  { id: '5', title: 'Telecom Egypt Signs $200M 5G Infrastructure Deal', source: 'Mubasher', date: '2026-03-21T15:20:00Z', company: 'Telecom Egypt', tag: '5G', sentiment: 2.8, importance: 7, summary: 'Telecom Egypt partners with Ericsson to deploy 5G infrastructure across Cairo and Alexandria, with completion expected by Q3 2026.' },
  { id: '6', title: 'Egyptian Pound Stabilizes After IMF Tranche Disbursement', source: 'Alborsa News', date: '2026-03-21T12:00:00Z', company: 'CBE', tag: 'Macro', sentiment: 1.5, importance: 8, summary: 'The Egyptian pound showed signs of stabilization following the IMFs latest $820M disbursement under the Extended Fund Facility.' },
  { id: '7', title: 'Saudi Aramco Eyes Expansion into Egyptian Downstream Market', source: 'Reuters', date: '2026-03-21T09:30:00Z', company: 'Aramco', tag: 'Energy', sentiment: 2.1, importance: 6, summary: 'Saudi Aramco is in advanced talks to acquire a stake in Egyptian refining assets as part of its downstream diversification strategy.' },
  { id: '8', title: 'Commercial International Bank Faces Regulatory Scrutiny', source: 'Bloomberg', date: '2026-03-20T16:00:00Z', company: 'CIB', tag: 'Regulation', sentiment: -1.8, importance: 7, summary: 'CIB is under review by Egyptian financial regulators over compliance concerns related to anti-money laundering procedures.' },
  { id: '9', title: 'Emirates NBD Expands African Operations with Kenya Acquisition', source: 'Financial Times', date: '2026-03-20T11:00:00Z', company: 'Emirates NBD', tag: 'M&A', sentiment: 3.1, importance: 6, summary: 'Emirates NBD completes the acquisition of a Kenyan bank, marking its largest expansion into Sub-Saharan Africa.' },
  { id: '10', title: 'Egypt Tourism Revenue Hits Record $18.2B in 2025', source: 'Alborsa News', date: '2026-03-20T08:00:00Z', company: 'Egypt Tourism', tag: 'Tourism', sentiment: 4.5, importance: 5, summary: 'Egypt recorded its highest-ever tourism revenue, driven by increased European visitors and the reopening of the Grand Egyptian Museum.' },
  { id: '11', title: 'Orascom Construction Wins $1.2B Saudi Infrastructure Contract', source: 'Mubasher', date: '2026-03-19T14:30:00Z', company: 'Orascom', tag: 'Infrastructure', sentiment: 3.7, importance: 7, summary: 'Orascom Construction secured a major contract for infrastructure development in NEOM, Saudis flagship mega-city project.' },
  { id: '12', title: 'MENA Tech Startups Raise $2.3B in Q1 2026', source: 'TechCrunch', date: '2026-03-19T10:00:00Z', company: 'MENA VC', tag: 'Venture Capital', sentiment: 3.9, importance: 5, summary: 'The MENA regions startup ecosystem continues to attract global investor interest with record Q1 funding.' },
];

export const MOCK_ALERTS: AlertPublic[] = [
  { id: 'a1', title: 'Suez Canal Crisis - Revenue Collapse', severity: 'CRITICAL', message: 'Suez Canal revenue has dropped 40% due to Red Sea disruptions. Immediate market impact expected.', keywords: ['Suez Canal', 'shipping', 'Red Sea'], source: 'System', color: '#ef4444', createdAt: '2026-03-22T06:30:00Z', isResolved: false, type: 'crisis' },
  { id: 'a2', title: 'CBE Interest Rate Hike - 200bps', severity: 'HIGH', message: 'Central Bank of Egypt raised rates by 200 basis points. Bond and equity markets may react significantly.', keywords: ['CBE', 'interest rates', 'monetary policy'], source: 'Reuters', color: '#f97316', createdAt: '2026-03-22T08:45:00Z', isResolved: false, type: 'macro' },
  { id: 'a3', title: 'QNB Record Earnings Beat', severity: 'MEDIUM', message: 'QNB Group posted record Q4 earnings, beating consensus by 12%. Positive sentiment expected for banking sector.', keywords: ['QNB', 'earnings', 'banking'], source: 'Bloomberg', color: '#eab308', createdAt: '2026-03-22T07:30:00Z', isResolved: false, type: 'earnings' },
  { id: 'a4', title: 'CIB Regulatory Review', severity: 'HIGH', message: 'Commercial International Bank is facing regulatory scrutiny over AML compliance. Stock may face downward pressure.', keywords: ['CIB', 'regulation', 'AML'], source: 'Bloomberg', color: '#f97316', createdAt: '2026-03-20T16:30:00Z', isResolved: false, type: 'brand_mention' },
  { id: 'a5', title: 'Telecom Egypt 5G Partnership', severity: 'LOW', message: 'Telecom Egypt signed a $200M 5G deal with Ericsson. Long-term positive for the company.', keywords: ['Telecom Egypt', '5G', 'Ericsson'], source: 'Mubasher', color: '#8aa8ff', createdAt: '2026-03-21T15:45:00Z', isResolved: true, type: 'brand_mention' },
  { id: 'a6', title: 'EGP Stabilization Signal', severity: 'MEDIUM', message: 'Egyptian pound showing stability post-IMF disbursement. FX risk may be easing for MENA-exposed portfolios.', keywords: ['EGP', 'IMF', 'forex'], source: 'System', color: '#eab308', createdAt: '2026-03-21T12:30:00Z', isResolved: true, type: 'macro' },
];

export const MOCK_WATCHLIST: WatchlistItem[] = [
  { id: 'w1', type: 'company', name: 'Commercial International Bank', symbol: 'COMI.CA', sentiment: 1.2, articleCount: 24, sparkData: [1.0, 1.5, 1.2, 1.8, 1.4, 1.1, 1.2] },
  { id: 'w2', type: 'company', name: 'QNB Group', symbol: 'QNBK.QA', sentiment: 3.8, articleCount: 31, sparkData: [2.1, 2.5, 3.0, 3.2, 3.5, 3.6, 3.8] },
  { id: 'w3', type: 'company', name: 'Telecom Egypt', symbol: 'ETEL.CA', sentiment: 2.1, articleCount: 15, sparkData: [1.5, 1.8, 2.0, 1.9, 2.2, 2.0, 2.1] },
  { id: 'w4', type: 'sector', name: 'MENA Banking', sentiment: 1.5, articleCount: 87, sparkData: [1.0, 1.2, 1.6, 1.3, 1.8, 1.4, 1.5] },
  { id: 'w5', type: 'market', name: 'Egyptian Exchange (EGX)', sentiment: -0.3, articleCount: 42, sparkData: [0.5, 0.2, -0.1, 0.1, -0.2, -0.4, -0.3] },
  { id: 'w6', type: 'company', name: 'Abu Dhabi Islamic Bank', symbol: 'ADIB.AD', sentiment: 2.9, articleCount: 12, sparkData: [2.0, 2.3, 2.5, 2.4, 2.7, 2.8, 2.9] },
  { id: 'w7', type: 'people', name: 'Hassan Abdalla (CBE Governor)', sentiment: -0.8, articleCount: 8, sparkData: [0.5, 0.2, -0.1, -0.3, -0.5, -0.6, -0.8] },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1', name: 'Commercial International Bank', ticker: 'COMI.CA', sector: 'Banking',
    sentiment: 'neutral', articleCount: 156, description: 'Egypt\'s largest private sector bank by assets, serving corporate, SME, and retail clients.',
    tags: [{ name: 'Banking', count: 89 }, { name: 'Regulation', count: 23 }, { name: 'Earnings', count: 18 }, { name: 'Digital Banking', count: 12 }],
    relatedEntities: ['CBE', 'EGX', 'NBE'], keyFigures: ['Hussein Abaza (CEO)', 'Hisham Ezz Al-Arab (Chairman)'],
    highlights: ['Under regulatory review for AML compliance', 'Digital banking platform launch in Q2', 'Strong Q4 loan growth of 18%'],
    sentimentTrend: [{ date: '2026-01', value: 2.1 }, { date: '2026-02', value: 1.5 }, { date: '2026-03', value: -0.8 }],
    coverageTimeline: [{ date: '2026-01', count: 45 }, { date: '2026-02', count: 52 }, { date: '2026-03', count: 59 }],
  },
  {
    id: 'c2', name: 'QNB Group', ticker: 'QNBK.QA', sector: 'Banking',
    sentiment: 'positive', articleCount: 198, description: 'The largest financial institution in the Middle East and Africa by assets.',
    tags: [{ name: 'Earnings', count: 45 }, { name: 'Expansion', count: 32 }, { name: 'Banking', count: 78 }],
    relatedEntities: ['QCB', 'QSE'], keyFigures: ['Abdulla Mubarak Al-Khalifa (Group CEO)'],
    highlights: ['Record Q4 2025 earnings', 'Expanding into Southeast Asia', 'Digital transformation roadmap'],
    sentimentTrend: [{ date: '2026-01', value: 3.2 }, { date: '2026-02', value: 3.5 }, { date: '2026-03', value: 4.2 }],
    coverageTimeline: [{ date: '2026-01', count: 58 }, { date: '2026-02', count: 65 }, { date: '2026-03', count: 75 }],
  },
  {
    id: 'c3', name: 'Telecom Egypt', ticker: 'ETEL.CA', sector: 'Telecommunications',
    sentiment: 'positive', articleCount: 89, description: 'Egypt\'s incumbent fixed-line telecom operator and a major wholesale voice carrier.',
    tags: [{ name: '5G', count: 28 }, { name: 'Infrastructure', count: 19 }, { name: 'Revenue', count: 15 }],
    relatedEntities: ['NTRA', 'Vodafone Egypt'], keyFigures: ['Adel Hamed (CEO)'],
    highlights: ['$200M 5G deal with Ericsson', 'Fiber network expansion', 'Revenue growth of 22% YoY'],
    sentimentTrend: [{ date: '2026-01', value: 1.8 }, { date: '2026-02', value: 2.3 }, { date: '2026-03', value: 2.8 }],
    coverageTimeline: [{ date: '2026-01', count: 25 }, { date: '2026-02', count: 30 }, { date: '2026-03', count: 34 }],
  },
];

export const MOCK_SOURCES: Source[] = [
  { id: 's1', name: 'Reuters', url: 'https://reuters.com', category: 'International Wire', enabled: true, articlesPerDay: 45, reliability: 'high', lastUpdate: '2026-03-22T09:00:00Z' },
  { id: 's2', name: 'Bloomberg', url: 'https://bloomberg.com', category: 'Financial News', enabled: true, articlesPerDay: 38, reliability: 'high', lastUpdate: '2026-03-22T08:55:00Z' },
  { id: 's3', name: 'Financial Times', url: 'https://ft.com', category: 'Financial News', enabled: true, articlesPerDay: 22, reliability: 'high', lastUpdate: '2026-03-22T08:30:00Z' },
  { id: 's4', name: 'Alborsa News', url: 'https://alborsanews.com', category: 'Egypt Local', enabled: true, articlesPerDay: 30, reliability: 'medium', lastUpdate: '2026-03-22T09:05:00Z' },
  { id: 's5', name: 'Mubasher', url: 'https://mubasher.info', category: 'MENA Finance', enabled: true, articlesPerDay: 25, reliability: 'medium', lastUpdate: '2026-03-22T08:45:00Z' },
  { id: 's6', name: 'TechCrunch', url: 'https://techcrunch.com', category: 'Technology', enabled: true, articlesPerDay: 15, reliability: 'high', lastUpdate: '2026-03-22T07:00:00Z' },
  { id: 's7', name: 'Wall Street Journal', url: 'https://wsj.com', category: 'Financial News', enabled: false, articlesPerDay: 20, reliability: 'high', lastUpdate: '2026-03-21T22:00:00Z' },
];

export const MOCK_STATS: DashboardStats = {
  totalArticles: 1247,
  avgSentiment: 0.8,
  topSources: [
    { name: 'Reuters', count: 312 },
    { name: 'Bloomberg', count: 289 },
    { name: 'Alborsa News', count: 198 },
    { name: 'Financial Times', count: 167 },
    { name: 'Mubasher', count: 145 },
  ],
  sentimentBreakdown: { positive: 42, negative: 28, neutral: 30 },
  trendingTopics: [
    { topic: 'Interest Rates', count: 89, trend: 'up' },
    { topic: 'Red Sea Crisis', count: 76, trend: 'up' },
    { topic: 'Banking Earnings', count: 65, trend: 'stable' },
    { topic: '5G Rollout', count: 43, trend: 'up' },
    { topic: 'IMF Program', count: 38, trend: 'down' },
    { topic: 'Tourism Recovery', count: 34, trend: 'up' },
  ],
};

export const MOCK_CHAT_ASSISTANTS: ChatAssistant[] = [
  {
    id: 'market-analyst',
    name: 'Market Analyst',
    description: 'Deep market analysis and investment insights',
    icon: 'trending-up',
    suggestedQuestions: [
      'What is the current outlook for Egyptian banking stocks?',
      'How will the CBE rate hike impact bond markets?',
      'Compare QNB and CIB performance this quarter.',
    ],
  },
  {
    id: 'news-summarizer',
    name: 'News Summarizer',
    description: 'Concise summaries of trending news',
    icon: 'newspaper',
    suggestedQuestions: [
      'Summarize today\'s top 5 stories.',
      'What happened with the Suez Canal this week?',
      'Give me a MENA banking sector update.',
    ],
  },
  {
    id: 'sentiment-expert',
    name: 'Sentiment Expert',
    description: 'Sentiment analysis and trend detection',
    icon: 'bar-chart',
    suggestedQuestions: [
      'Which companies have the most negative sentiment today?',
      'Is sentiment improving for the Egyptian pound?',
      'What are the biggest sentiment shifts this week?',
    ],
  },
];
