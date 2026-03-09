import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { analyzeArticle, getArticleStats, searchNews } from '../../services/api/newsflash';
import { useSession } from '../../store/session';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';
import type {
  AnalysisRole,
  AnalyzeArticleResponse,
  Article,
  ArticleStatsResponse,
  WatchlistItemType,
  WatchlistWindow,
} from '../../types/api';

/* ────────────────────────────────────────────────────── */
/*  Constants                                             */
/* ────────────────────────────────────────────────────── */

const DEFAULT_ENTITY = 'Commercial International Bank';

const DEEP_DIVE_ROLES: AnalysisRole[] = [
  'Financial Analyst',
  'Marketing Specialist',
  'Investor Relations',
  'Public Relations',
];

const ROLE_ICONS: Record<AnalysisRole, keyof typeof Ionicons.glyphMap> = {
  'Executive Summary': 'document-text-outline',
  'Financial Analyst': 'trending-up-outline',
  'Marketing Specialist': 'megaphone-outline',
  'Investor Relations': 'people-outline',
  'Public Relations': 'globe-outline',
};

const TYPE_OPTIONS: WatchlistItemType[] = ['Company', 'Person', 'Sector'];

const TYPE_ICONS: Record<WatchlistItemType, keyof typeof Ionicons.glyphMap> = {
  Company: 'business-outline',
  Person: 'person-outline',
  Sector: 'pie-chart-outline',
};

const TIME_WINDOWS: Array<{ label: string; value: WatchlistWindow }> = [
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '1M', value: 'm' },
  { label: 'All', value: 'all' },
];

const SENTIMENT_OPTIONS = ['all', 'positive', 'neutral', 'negative'] as const;
const SORT_OPTIONS = [
  { icon: 'time-outline' as keyof typeof Ionicons.glyphMap, label: 'Latest', value: 'latest' },
  { icon: 'heart-outline' as keyof typeof Ionicons.glyphMap, label: 'Sentiment', value: 'sentiment' },
  { icon: 'globe-outline' as keyof typeof Ionicons.glyphMap, label: 'Source', value: 'source' },
  { icon: 'text-outline' as keyof typeof Ionicons.glyphMap, label: 'Title', value: 'title' },
] as const;

type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number];
type SortFilter = (typeof SORT_OPTIONS)[number]['value'];

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const cardDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/* ────────────────────────────────────────────────────── */
/*  Helpers                                               */
/* ────────────────────────────────────────────────────── */

function formatPublishedDate(value: string | null) {
  if (!value) return 'Live';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Live';
  return cardDateFormatter.format(parsed);
}

function formatSentiment(article: Article) {
  if (article.sentiment_label) return article.sentiment_label;
  if (article.sentiment_score === null || article.sentiment_score === undefined) return 'Neutral';
  if (article.sentiment_score > 0.2) return 'Positive';
  if (article.sentiment_score < -0.2) return 'Negative';
  return 'Neutral';
}

function sentimentTone(label: string): 'green' | 'red' | 'gold' {
  const lowered = label.toLowerCase();
  if (lowered.includes('positive')) return 'green';
  if (lowered.includes('negative')) return 'red';
  return 'gold';
}

function formatImportance(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Unscored';
  if (value >= 8) return 'High';
  if (value >= 5) return 'Medium';
  return 'Low';
}

function formatOptionLabel(value: string) {
  return value.replace('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatRoleLabel(role: AnalysisRole) {
  return role === 'Executive Summary' ? 'Summary' : role;
}

function sortArticles(articles: Article[], sortMode: SortFilter) {
  return [...articles].sort((left, right) => {
    if (sortMode === 'title') return left.title.localeCompare(right.title);
    if (sortMode === 'source') return left.source.localeCompare(right.source);
    if (sortMode === 'sentiment') return (right.sentiment_score ?? 0) - (left.sentiment_score ?? 0);

    const leftTime = left.published ? new Date(left.published).getTime() : 0;
    const rightTime = right.published ? new Date(right.published).getTime() : 0;
    return rightTime - leftTime;
  });
}

function buildMetrics(
  queryLabel: string,
  articles: Article[],
  stats: ArticleStatsResponse | null,
) {
  const sources = new Set(
    articles
      .map((article) => article.source?.trim())
      .filter((source): source is string => Boolean(source)),
  );

  return [
    { accent: palette.cobalt, icon: 'search-outline' as const, label: 'Query', value: queryLabel || 'Unset' },
    { accent: palette.emerald, icon: 'newspaper-outline' as const, label: 'Articles', value: String(articles.length) },
    { accent: palette.amber, icon: 'globe-outline' as const, label: 'Sources', value: String(sources.size) },
    { accent: stats?.top_provider ? palette.cobalt : palette.inkSoft, icon: 'trophy-outline' as const, label: 'Top Provider', value: stats?.top_provider ?? 'N/A' },
  ];
}

/* ────────────────────────────────────────────────────── */
/*  Main Screen                                           */
/* ────────────────────────────────────────────────────── */

export function BrowseScreen() {
  const { selectedTenantId, token } = useSession();
  const [entity, setEntity] = useState(DEFAULT_ENTITY);
  const [entityType, setEntityType] = useState<WatchlistItemType>('Company');
  const [filters, setFilters] = useState('');
  const [timeWindow, setTimeWindow] = useState<WatchlistWindow>('7d');
  const [articles, setArticles] = useState<Article[]>([]);
  const [queryLabel, setQueryLabel] = useState(DEFAULT_ENTITY);
  const [stats, setStats] = useState<ArticleStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState<SortFilter>('latest');
  const [analysisArticle, setAnalysisArticle] = useState<Article | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeArticleResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [rolePickerArticle, setRolePickerArticle] = useState<Article | null>(null);
  const [entityFocused, setEntityFocused] = useState(false);
  const [filtersFocused, setFiltersFocused] = useState(false);

  /* ── refs ── */
  const filtersRef = useRef<TextInput>(null);

  /* ── entrance animations ── */
  const heroAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const snapshotAnim = useRef(new Animated.Value(0)).current;
  const refineAnim = useRef(new Animated.Value(0)).current;
  const feedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(searchAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(snapshotAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(refineAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(feedAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!token || !selectedTenantId) return;
    void runSearch();
  }, [selectedTenantId, token]);

  /* ── animation helper ── */
  function fadeSlide(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        },
      ],
    };
  }

  /* ── data ── */
  async function runSearch(
    refresh = false,
    overrides?: {
      entity?: string;
      entityType?: WatchlistItemType;
      filters?: string;
      timeWindow?: WatchlistWindow;
    },
  ) {
    if (!token || !selectedTenantId) return;

    const nextEntity = overrides?.entity ?? entity;
    const nextEntityType = overrides?.entityType ?? entityType;
    const nextFilters = overrides?.filters ?? filters;
    const nextTimeWindow = overrides?.timeWindow ?? timeWindow;
    const trimmedEntity = nextEntity.trim();

    if (!trimmedEntity) {
      setError('Entity search is required.');
      setArticles([]);
      setStats(null);
      setHasSearched(false);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await searchNews(
        token,
        {
          entity: trimmedEntity,
          filters: nextFilters.trim().length > 0 ? nextFilters.trim() : null,
          type: nextEntityType,
          when: nextTimeWindow,
        },
        selectedTenantId,
      );

      const orderedArticles = sortArticles(response.articles, 'latest');

      setArticles(orderedArticles);
      setQueryLabel(response.query || trimmedEntity);
      setHasSearched(true);
      setSentimentFilter('all');
      setSourceFilter('all');
      setTagFilter('all');
      setSortFilter('latest');

      if (orderedArticles.length > 0) {
        const nextStats = await getArticleStats(token, orderedArticles, selectedTenantId);
        setStats(nextStats);
      } else {
        setStats(null);
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Unable to search articles');
      setArticles([]);
      setStats(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function handleClearAll() {
    const nextEntity = DEFAULT_ENTITY;
    const nextType: WatchlistItemType = 'Company';
    const nextFilters = '';
    const nextWindow: WatchlistWindow = '7d';

    setEntity(nextEntity);
    setEntityType(nextType);
    setFilters(nextFilters);
    setTimeWindow(nextWindow);
    setSentimentFilter('all');
    setSourceFilter('all');
    setTagFilter('all');
    setSortFilter('latest');
    setError(null);
    void runSearch(false, {
      entity: nextEntity,
      entityType: nextType,
      filters: nextFilters,
      timeWindow: nextWindow,
    });
  }

  async function runAnalysis(article: Article, role: AnalysisRole) {
    if (!token || !selectedTenantId) return;

    setRolePickerArticle(null);
    setAnalysisArticle(article);
    setAnalysisResult(null);
    setAnalysisError(null);
    setAnalysisLoading(true);

    try {
      const response = await analyzeArticle(
        token,
        {
          articleUrl: article.link,
          role,
          source: article.source,
          title: article.title,
        },
        selectedTenantId,
      );
      setAnalysisResult(response);
    } catch (requestError) {
      setAnalysisError(
        requestError instanceof Error ? requestError.message : 'Unable to analyze article',
      );
    } finally {
      setAnalysisLoading(false);
    }
  }

  function closeAnalysis() {
    setAnalysisArticle(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
    setAnalysisResult(null);
  }

  /* ── derived data ── */
  const sourceOptions = [
    'all',
    ...Array.from(new Set(articles.map((article) => article.source).filter(Boolean))),
  ];
  const tagOptions = [
    'all',
    ...(Array.from(new Set(articles.map((article) => article.tag).filter(Boolean))) as string[]),
  ];

  const filteredArticles = sortArticles(
    articles.filter((article) => {
      const sentimentLabel = formatSentiment(article).toLowerCase();
      const matchesSentiment =
        sentimentFilter === 'all' || sentimentLabel.includes(sentimentFilter);
      const matchesSource = sourceFilter === 'all' || article.source === sourceFilter;
      const matchesTag = tagFilter === 'all' || article.tag === tagFilter;
      return matchesSentiment && matchesSource && matchesTag;
    }),
    sortFilter,
  );

  const metrics = buildMetrics(queryLabel, articles, stats);

  const activeFilterCount =
    (sentimentFilter !== 'all' ? 1 : 0) +
    (sourceFilter !== 'all' ? 1 : 0) +
    (tagFilter !== 'all' ? 1 : 0) +
    (sortFilter !== 'latest' ? 1 : 0);

  /* ── render ── */
  return (
    <>
      <FlatList
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        data={filteredArticles}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.guid}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons color={palette.inkSoft} name="search-outline" size={28} />
              </View>
              <Text style={styles.emptyTitle}>
                {hasSearched ? 'No articles matched' : 'Search the live feed'}
              </Text>
              <Text style={styles.emptyText}>
                {hasSearched
                  ? 'Broaden the sentiment, source, or tag filters to see more results.'
                  : 'Enter a company, person, or sector to query the live news index.'}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.headerStack}>
            {/* ── Hero ── */}
            <Animated.View style={[styles.hero, fadeSlide(heroAnim)]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <Ionicons name="compass" size={11} color={palette.emerald} />
                  <Text style={styles.heroBadgeLabel}>BROWSE</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>Article Search</Text>
              <Text style={styles.heroSubtitle}>
                Search and filter all monitored content sources with real-time results
              </Text>
              <Text style={styles.heroDate}>{fullDateFormatter.format(new Date())}</Text>

              {/* Inline stats */}
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{articles.length}</Text>
                  <Text style={styles.heroStatLabel}>results</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {new Set(articles.map((a) => a.source).filter(Boolean)).size}
                  </Text>
                  <Text style={styles.heroStatLabel}>sources</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {TIME_WINDOWS.find((o) => o.value === timeWindow)?.label ?? '7D'}
                  </Text>
                  <Text style={styles.heroStatLabel}>window</Text>
                </View>
              </View>
            </Animated.View>

            {/* ── Error ── */}
            {error ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorHeader}>
                  <Ionicons name="alert-circle" size={18} color={palette.rose} />
                  <Text style={styles.errorTitle}>Search failed</Text>
                </View>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={() => void runSearch()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Ionicons name="refresh-outline" size={14} color={palette.ink} />
                  <Text style={styles.retryLabel}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            {/* ── Search Desk Panel ── */}
            <Animated.View style={[styles.panel, fadeSlide(searchAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.emerald }]} />

              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                  <View style={styles.panelIconWrap}>
                    <Ionicons name="search-outline" size={16} color={palette.emerald} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Search Desk</Text>
                    <Text style={styles.panelDescription}>
                      Query the live news index by entity
                    </Text>
                  </View>
                </View>
                {isLoading ? <ActivityIndicator color={palette.emerald} size="small" /> : null}
              </View>

              {/* Entity input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Entity</Text>
                <View style={[styles.inputWrap, entityFocused && styles.inputWrapFocused]}>
                  <Ionicons
                    name={TYPE_ICONS[entityType]}
                    size={16}
                    color={entityFocused ? palette.emerald : palette.inkSoft}
                  />
                  <TextInput
                    autoCapitalize="words"
                    onBlur={() => setEntityFocused(false)}
                    onChangeText={setEntity}
                    onFocus={() => setEntityFocused(true)}
                    onSubmitEditing={() => filtersRef.current?.focus()}
                    placeholder="Commercial International Bank"
                    placeholderTextColor={palette.inkSoft}
                    returnKeyType="next"
                    style={styles.input}
                    value={entity}
                  />
                </View>
              </View>

              {/* Filters input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Filters</Text>
                <View style={[styles.inputWrap, filtersFocused && styles.inputWrapFocused]}>
                  <Ionicons
                    name="funnel-outline"
                    size={16}
                    color={filtersFocused ? palette.emerald : palette.inkSoft}
                  />
                  <TextInput
                    autoCapitalize="none"
                    onBlur={() => setFiltersFocused(false)}
                    onChangeText={setFilters}
                    onFocus={() => setFiltersFocused(true)}
                    onSubmitEditing={() => void runSearch()}
                    placeholder="Optional: stock OR earnings"
                    placeholderTextColor={palette.inkSoft}
                    ref={filtersRef}
                    returnKeyType="search"
                    style={styles.input}
                    value={filters}
                  />
                </View>
              </View>

              {/* Entity type chips */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Search Type</Text>
                <View style={styles.chipRow}>
                  {TYPE_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setEntityType(option)}
                      style={({ pressed }) => [
                        styles.chip,
                        entityType === option && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                    >
                      <Ionicons
                        name={TYPE_ICONS[option]}
                        size={13}
                        color={entityType === option ? palette.emerald : palette.inkSoft}
                      />
                      <Text
                        style={[
                          styles.chipLabel,
                          entityType === option && styles.chipLabelActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Time window chips */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Time Window</Text>
                <View style={styles.chipRow}>
                  {TIME_WINDOWS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setTimeWindow(option.value)}
                      style={({ pressed }) => [
                        styles.chip,
                        timeWindow === option.value && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          timeWindow === option.value && styles.chipLabelActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action buttons — fixed layout, no collision */}
              <View style={styles.searchActions}>
                <Pressable
                  disabled={isLoading}
                  onPress={() => void runSearch()}
                  style={({ pressed }) => [
                    styles.searchButton,
                    isLoading && styles.buttonDimmed,
                    pressed && styles.pressedScale,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={palette.canvas} size="small" />
                  ) : (
                    <>
                      <Ionicons color={palette.canvas} name="search-outline" size={15} />
                      <Text style={styles.searchButtonLabel}>Search</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={handleClearAll}
                  style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                >
                  <Ionicons name="refresh-outline" size={14} color={palette.ink} />
                  <Text style={styles.resetButtonLabel}>Reset</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* ── Result Snapshot Panel ── */}
            <Animated.View style={[styles.panel, fadeSlide(snapshotAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.cobalt }]} />

              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                  <View style={[styles.panelIconWrap, { backgroundColor: palette.cobaltSoft }]}>
                    <Ionicons name="bar-chart-outline" size={16} color={palette.cobalt} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Result Snapshot</Text>
                    <Text style={styles.panelDescription}>
                      {queryLabel} &middot; {TIME_WINDOWS.find((o) => o.value === timeWindow)?.label} window
                    </Text>
                  </View>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{filteredArticles.length}</Text>
                </View>
              </View>

              <View style={styles.statGrid}>
                {metrics.map((metric) => (
                  <View key={metric.label} style={styles.statCard}>
                    <View style={[styles.statAccent, { backgroundColor: metric.accent }]} />
                    <View style={styles.statInner}>
                      <View style={styles.statTop}>
                        <Ionicons name={metric.icon} size={13} color={palette.inkSoft} />
                        <Text style={styles.statLabel}>{metric.label}</Text>
                      </View>
                      <Text numberOfLines={1} style={styles.statValue}>
                        {metric.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* ── Refine Results Panel ── */}
            <Animated.View style={[styles.panel, fadeSlide(refineAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.amber }]} />

              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                  <View style={[styles.panelIconWrap, { backgroundColor: palette.amberSoft }]}>
                    <Ionicons name="options-outline" size={16} color={palette.amber} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Refine Results</Text>
                    <Text style={styles.panelDescription}>
                      Client-side filters on the current result set
                    </Text>
                  </View>
                </View>
                {activeFilterCount > 0 ? (
                  <View style={[styles.countBadge, { backgroundColor: palette.amberSoft }]}>
                    <Text style={[styles.countBadgeText, { color: palette.amber }]}>
                      {activeFilterCount}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Sentiment */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Sentiment</Text>
                <View style={styles.chipRow}>
                  {SENTIMENT_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setSentimentFilter(option)}
                      style={({ pressed }) => [
                        styles.chip,
                        sentimentFilter === option && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          sentimentFilter === option && styles.chipLabelActive,
                        ]}
                      >
                        {formatOptionLabel(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Source */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Source</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.scrollChipRow}>
                    {sourceOptions.map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => setSourceFilter(option)}
                        style={({ pressed }) => [
                          styles.chip,
                          sourceFilter === option && styles.chipActive,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            sourceFilter === option && styles.chipLabelActive,
                          ]}
                        >
                          {option === 'all' ? 'All Sources' : option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Tag */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Tag</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.scrollChipRow}>
                    {tagOptions.map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => setTagFilter(option)}
                        style={({ pressed }) => [
                          styles.chip,
                          tagFilter === option && styles.chipActive,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            tagFilter === option && styles.chipLabelActive,
                          ]}
                        >
                          {option === 'all' ? 'All Tags' : option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Sort */}
              <View style={styles.optionBlock}>
                <Text style={styles.fieldLabel}>Sort</Text>
                <View style={styles.chipRow}>
                  {SORT_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setSortFilter(option.value)}
                      style={({ pressed }) => [
                        styles.chip,
                        sortFilter === option.value && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={12}
                        color={sortFilter === option.value ? palette.cobalt : palette.inkSoft}
                      />
                      <Text
                        style={[
                          styles.chipLabel,
                          sortFilter === option.value && styles.chipLabelActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* ── Feed Header Card ── */}
            <Animated.View style={[styles.feedHeaderCard, fadeSlide(feedAnim)]}>
              <View style={[styles.feedAccent, { backgroundColor: palette.emerald }]} />
              <View style={styles.feedHeaderInner}>
                <View style={styles.feedHeaderLeft}>
                  <View style={styles.panelIconWrap}>
                    <Ionicons name="documents-outline" size={16} color={palette.emerald} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Search Results</Text>
                    <Text style={styles.panelDescription}>
                      {filteredArticles.length} of {articles.length} articles
                    </Text>
                  </View>
                </View>
                {filteredArticles.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{filteredArticles.length}</Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </View>
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => void runSearch(true)}
            progressBackgroundColor={palette.panel}
            refreshing={isRefreshing}
            tintColor={palette.emerald}
          />
        }
        renderItem={({ item, index }) => (
          <BrowseArticleCard
            article={item}
            isFirst={index === 0}
            onDeepDive={() => setRolePickerArticle(item)}
            onOpen={() => void Linking.openURL(item.link)}
            onSummary={() => void runAnalysis(item, 'Executive Summary')}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Role Picker Modal ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setRolePickerArticle(null)}
        transparent
        visible={!!rolePickerArticle}
      >
        <Pressable onPress={() => setRolePickerArticle(null)} style={styles.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Deep Dive Analysis</Text>
            <Text style={styles.modalSubtitle}>
              Choose a perspective for{' '}
              <Text style={styles.modalSourceHighlight}>
                {rolePickerArticle?.source ?? 'this article'}
              </Text>
            </Text>

            <View style={styles.roleGrid}>
              {DEEP_DIVE_ROLES.map((role) => (
                <Pressable
                  key={role}
                  onPress={() => rolePickerArticle && void runAnalysis(rolePickerArticle, role)}
                  style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
                >
                  <View style={styles.roleIconWrap}>
                    <Ionicons color={palette.cobalt} name={ROLE_ICONS[role]} size={20} />
                  </View>
                  <Text style={styles.roleLabel}>{formatRoleLabel(role)}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setRolePickerArticle(null)}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Analysis Modal ── */}
      <Modal
        animationType="slide"
        onRequestClose={closeAnalysis}
        transparent
        visible={analysisLoading || !!analysisError || !!analysisResult}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.analysisSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.analysisHeader}>
              <View style={styles.analysisHeaderLeft}>
                <Text style={styles.analysisRoleBadge}>
                  {analysisResult?.role ?? 'Analysis'}
                </Text>
                <Text numberOfLines={2} style={styles.analysisTitle}>
                  {analysisResult?.title ?? analysisArticle?.title ?? 'Preparing...'}
                </Text>
              </View>
              <Pressable onPress={closeAnalysis} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={palette.ink} />
              </Pressable>
            </View>

            {analysisLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={palette.emerald} size="large" />
                <Text style={styles.loadingTitle}>Generating analysis...</Text>
                <Text style={styles.loadingHint}>This may take a few seconds</Text>
              </View>
            ) : null}

            {analysisError ? (
              <View style={styles.analysisErrorBanner}>
                <Ionicons name="alert-circle" size={16} color={palette.rose} />
                <Text style={styles.analysisErrorText}>{analysisError}</Text>
              </View>
            ) : null}

            {analysisResult ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.analysisBody}
              >
                <Text style={styles.analysisText}>{analysisResult.analysis}</Text>

                {analysisResult.role === 'Executive Summary' && analysisArticle ? (
                  <Pressable
                    onPress={() => {
                      closeAnalysis();
                      setRolePickerArticle(analysisArticle);
                    }}
                    style={({ pressed }) => [styles.deepDivePrompt, pressed && styles.pressed]}
                  >
                    <Ionicons name="layers-outline" size={15} color={palette.cobalt} />
                    <Text style={styles.deepDivePromptLabel}>Continue to Deep Dive</Text>
                    <Ionicons name="chevron-forward" size={14} color={palette.inkSoft} />
                  </Pressable>
                ) : null}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Sub-components                                        */
/* ────────────────────────────────────────────────────── */

const BrowseArticleCard = memo(function BrowseArticleCard({
  article,
  isFirst,
  onDeepDive,
  onOpen,
  onSummary,
}: {
  article: Article;
  isFirst: boolean;
  onDeepDive: () => void;
  onOpen: () => void;
  onSummary: () => void;
}) {
  const sentiment = formatSentiment(article);
  const importance = formatImportance(article.importance);
  const sentTone = sentimentTone(sentiment);

  return (
    <View style={[styles.articleCard, isFirst && styles.articleCardFirst]}>
      {/* Meta row */}
      <View style={styles.articleMetaRow}>
        <View style={styles.articleSourceRow}>
          <Ionicons name="newspaper-outline" size={12} color={palette.inkSoft} />
          <Text style={styles.articleSource}>{article.source}</Text>
        </View>
        <Text style={styles.articleDate}>{formatPublishedDate(article.published)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.articleTitle}>{article.title}</Text>

      {/* Badges */}
      <View style={styles.badgeRow}>
        {article.tag ? <Badge label={article.tag} tone="blue" /> : null}
        <Badge
          label={sentiment}
          tone={sentTone === 'green' ? 'green' : sentTone === 'red' ? 'red' : 'gold'}
        />
        <Badge label={importance} tone="blue" />
      </View>

      {/* Actions — consistent pill buttons, no collision */}
      <View style={styles.articleActions}>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnOutline,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="open-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Open</Text>
        </Pressable>
        <Pressable
          onPress={onSummary}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnOutline,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="document-text-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Summary</Text>
        </Pressable>
        <Pressable
          onPress={onDeepDive}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnFilled,
            pressed && styles.pressedDeep,
          ]}
        >
          <Ionicons name="layers-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Deep Dive</Text>
        </Pressable>
      </View>
    </View>
  );
});

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: 'blue' | 'gold' | 'green' | 'red';
}) {
  const toneMap = {
    blue: { bg: palette.cobaltSoft, text: palette.cobalt },
    gold: { bg: palette.amberSoft, text: palette.amber },
    green: { bg: palette.emeraldSoft, text: palette.emerald },
    red: { bg: palette.roseSoft, text: palette.rose },
  };
  const t = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeLabel, { color: t.text }]}>{label}</Text>
    </View>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Styles                                                */
/* ────────────────────────────────────────────────────── */

const CARD_RADIUS = radii.md;
const SECTION_PAD = spacing.lg;

const styles = StyleSheet.create({
  /* ── layout ── */
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl + 8,
    paddingHorizontal: SECTION_PAD,
    paddingTop: spacing.md,
  },
  headerStack: {
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* ── hero ── */
  hero: {
    backgroundColor: palette.canvas,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SECTION_PAD,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  heroBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  heroBadgeLabel: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 30,
    lineHeight: 36,
  },
  heroSubtitle: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  heroDate: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 13,
    letterSpacing: 0.3,
    marginTop: spacing.sm,
  },
  heroStatsRow: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  heroStat: {
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 20,
  },
  heroStatLabel: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  heroStatDivider: {
    backgroundColor: palette.line,
    height: 28,
    width: 1,
  },

  /* ── error ── */
  errorBanner: {
    backgroundColor: palette.roseSoft,
    borderColor: `${palette.rose}44`,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: SECTION_PAD,
  },
  errorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  errorTitle: {
    color: palette.rose,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorText: {
    color: palette.ink,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.panel,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  retryLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },

  /* ── panels ── */
  panel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SECTION_PAD,
    paddingTop: 0,
  },
  panelAccent: {
    height: 3,
    marginBottom: SECTION_PAD,
    width: '100%',
  },
  panelHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  panelHeaderLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  panelIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  panelHeaderCopy: {
    flex: 1,
  },
  panelTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 20,
  },
  panelDescription: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 12,
  },

  /* ── form fields ── */
  fieldGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputWrapFocused: {
    borderColor: palette.emerald,
    borderWidth: 1.5,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.serif,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
  },

  /* ── chips ── */
  optionBlock: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scrollChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  chipActive: {
    backgroundColor: palette.cobaltSoft,
    borderColor: palette.cobalt,
  },
  chipLabel: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  chipLabelActive: {
    color: palette.ink,
  },
  chipPressed: {
    opacity: 0.86,
  },

  /* ── search actions ── */
  searchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 46,
  },
  searchButtonLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  resetButtonLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  buttonDimmed: {
    opacity: 0.5,
  },

  /* ── stat grid ── */
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 84,
    overflow: 'hidden',
    width: '48%',
  },
  statAccent: {
    height: 3,
    width: '100%',
  },
  statInner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  statTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  statLabel: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  statValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 22,
    marginTop: spacing.xs,
  },

  /* ── feed header card ── */
  feedHeaderCard: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  feedAccent: {
    height: 3,
    width: '100%',
  },
  feedHeaderInner: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: SECTION_PAD,
  },
  feedHeaderLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },

  /* ── empty state ── */
  emptyState: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  emptyTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  emptyText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  /* ── article cards ── */
  articleCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  articleCardFirst: {
    borderColor: `${palette.emerald}33`,
  },
  articleMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleSourceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  articleSource: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  articleDate: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
  },
  articleTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 17,
    lineHeight: 23,
    marginTop: spacing.sm,
  },

  /* ── badges ── */
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* ── article actions ── */
  articleActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  actionBtnOutline: {
    borderColor: palette.lineStrong,
    borderWidth: 1,
  },
  actionBtnFilled: {
    backgroundColor: palette.cobaltSoft,
  },
  actionBtnLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },

  /* ── shared press states ── */
  pressed: {
    opacity: 0.78,
  },
  pressedScale: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pressedDeep: {
    opacity: 0.8,
  },

  /* ── modals shared ── */
  modalBackdrop: {
    backgroundColor: 'rgba(4, 5, 8, 0.78)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: palette.lineStrong,
    borderRadius: 999,
    height: 4,
    marginBottom: spacing.lg,
    width: 40,
  },

  /* ── role picker modal ── */
  modalSheet: {
    backgroundColor: palette.panel,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: SECTION_PAD,
    paddingTop: spacing.md,
  },
  modalTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 24,
  },
  modalSubtitle: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  modalSourceHighlight: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 14,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 88,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    width: '48%',
  },
  roleCardPressed: {
    backgroundColor: palette.cobaltSoft,
    borderColor: palette.cobalt,
  },
  roleIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  roleLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: palette.lineStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 48,
  },
  cancelLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.6,
  },

  /* ── analysis modal ── */
  analysisSheet: {
    backgroundColor: palette.panel,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    flex: 1,
    marginTop: 80,
    padding: SECTION_PAD,
    paddingTop: spacing.md,
  },
  analysisHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  analysisHeaderLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  analysisRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.pill,
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.6,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  analysisTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 20,
    lineHeight: 26,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  loadingHint: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
  },
  analysisErrorBanner: {
    alignItems: 'center',
    backgroundColor: palette.roseSoft,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  analysisErrorText: {
    color: palette.rose,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  analysisBody: {
    paddingBottom: spacing.xxl,
  },
  analysisText: {
    color: palette.ink,
    fontFamily: typography.serif,
    fontSize: 16,
    lineHeight: 25,
  },
  deepDivePrompt: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderColor: `${palette.cobalt}33`,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  deepDivePromptLabel: {
    color: palette.cobalt,
    flex: 1,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
