import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
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

import {
  addWatchlistItem,
  analyzeArticle,
  fetchWatchlistNews,
  getArticleStats,
  getWatchlist,
  removeWatchlistItem,
  synthesizeArticles,
} from '../../services/api/newsflash';
import { useSession } from '../../store/session';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import type {
  AISynthesizeResponse,
  AnalysisRole,
  AnalyzeArticleResponse,
  Article,
  ArticleStatsResponse,
  WatchlistCreateInput,
  WatchlistItem,
  WatchlistItemType,
  WatchlistWindow,
} from '../../types/api';

/* ────────────────────────────────────────────────────── */
/*  Constants                                             */
/* ────────────────────────────────────────────────────── */

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

const cardDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
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

function formatImportance(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Unscored';
  if (value >= 8) return 'High';
  if (value >= 5) return 'Medium';
  return 'Low';
}

function sentimentTone(label: string): 'green' | 'red' | 'gold' {
  const lowered = label.toLowerCase();
  if (lowered.includes('positive')) return 'green';
  if (lowered.includes('negative')) return 'red';
  return 'gold';
}

function formatRoleLabel(role: AnalysisRole) {
  return role === 'Executive Summary' ? 'Summary' : role;
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatReportKey(value: string) {
  return titleCase(value);
}

function buildSummaryMetrics(
  watchlist: WatchlistItem[],
  articles: Article[],
  stats: ArticleStatsResponse | null,
) {
  const sources = new Set(
    articles
      .map((article) => article.source?.trim())
      .filter((source): source is string => Boolean(source)),
  );

  const sentiment = stats?.avg_sentiment;
  let sentimentLabel = 'Neutral';
  if (typeof sentiment === 'number') {
    if (sentiment > 0.2) sentimentLabel = 'Positive';
    else if (sentiment < -0.2) sentimentLabel = 'Negative';
  }

  return [
    { accent: palette.cobalt, icon: 'bookmark-outline' as const, label: 'Tracked', value: String(watchlist.length) },
    { accent: palette.emerald, icon: 'newspaper-outline' as const, label: 'Articles', value: String(articles.length) },
    { accent: palette.amber, icon: 'globe-outline' as const, label: 'Sources', value: String(sources.size) },
    { accent: sentimentLabel === 'Positive' ? palette.emerald : sentimentLabel === 'Negative' ? palette.rose : palette.amber, icon: 'analytics-outline' as const, label: 'Sentiment', value: sentimentLabel },
  ];
}

/* ────────────────────────────────────────────────────── */
/*  Main Screen                                           */
/* ────────────────────────────────────────────────────── */

export function WatchlistScreen() {
  const { selectedTenantId, token } = useSession();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArticleStatsResponse | null>(null);
  const [timeWindow, setTimeWindow] = useState<WatchlistWindow>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState<WatchlistItemType>('Company');
  const [filters, setFilters] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [synthesisResult, setSynthesisResult] = useState<AISynthesizeResponse | null>(null);
  const [analysisArticle, setAnalysisArticle] = useState<Article | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeArticleResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [rolePickerArticle, setRolePickerArticle] = useState<Article | null>(null);

  /* ── entrance animations ── */
  const heroAnim = useRef(new Animated.Value(0)).current;
  const watchlistAnim = useRef(new Animated.Value(0)).current;
  const reportAnim = useRef(new Animated.Value(0)).current;
  const feedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(watchlistAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(reportAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(feedAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    void loadWatchlistDesk();
  }, [selectedTenantId, timeWindow, token]);

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

  /* ── data loading ── */
  async function loadWatchlistDesk(refresh = false) {
    if (!token || !selectedTenantId) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [watchlistResponse, watchlistFetch] = await Promise.all([
        getWatchlist(token, selectedTenantId),
        fetchWatchlistNews(token, timeWindow, selectedTenantId),
      ]);

      const orderedArticles = [...watchlistFetch.articles].sort((left, right) => {
        const leftTime = left.published ? new Date(left.published).getTime() : 0;
        const rightTime = right.published ? new Date(right.published).getTime() : 0;
        return rightTime - leftTime;
      });

      setWatchlist(watchlistResponse.items);
      setArticles(orderedArticles);

      if (orderedArticles.length > 0) {
        const nextStats = await getArticleStats(token, orderedArticles, selectedTenantId);
        setStats(nextStats);
      } else {
        setStats(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load watchlist');
      setWatchlist([]);
      setArticles([]);
      setStats(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleCreateItem() {
    if (!token || !selectedTenantId) return;

    const trimmedEntity = entityName.trim();
    if (!trimmedEntity) {
      setCreateError('Entity name is required.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    const payload: WatchlistCreateInput = {
      entity: trimmedEntity,
      filters: filters.trim().length > 0 ? filters.trim() : null,
      type: entityType,
    };

    try {
      await addWatchlistItem(token, payload, selectedTenantId);
      setEntityName('');
      setFilters('');
      setEntityType('Company');
      setIsCreateVisible(false);
      await loadWatchlistDesk();
    } catch (submitError) {
      setCreateError(
        submitError instanceof Error ? submitError.message : 'Unable to add watchlist item',
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!token || !selectedTenantId) return;

    setIsRemovingId(itemId);

    try {
      await removeWatchlistItem(token, itemId, selectedTenantId);
      await loadWatchlistDesk();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove item');
    } finally {
      setIsRemovingId(null);
    }
  }

  async function handleSynthesize() {
    if (!token || !selectedTenantId) return;

    if (articles.length === 0) {
      setSynthesisError('Market synthesis requires at least one fetched article.');
      setSynthesisResult(null);
      return;
    }

    setSynthesisError(null);
    setSynthesisResult(null);
    setIsSynthesizing(true);

    try {
      const response = await synthesizeArticles(
        token,
        {
          articles,
          limit: Math.min(articles.length, 10),
          when: timeWindow,
        },
        selectedTenantId,
      );
      setSynthesisResult(response);
    } catch (synthesisRequestError) {
      setSynthesisError(
        synthesisRequestError instanceof Error
          ? synthesisRequestError.message
          : 'Unable to synthesize articles',
      );
    } finally {
      setIsSynthesizing(false);
    }
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
    } catch (analysisRequestError) {
      setAnalysisError(
        analysisRequestError instanceof Error
          ? analysisRequestError.message
          : 'Unable to analyze article',
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

  function closeSynthesis() {
    setIsSynthesizing(false);
    setSynthesisError(null);
    setSynthesisResult(null);
  }

  const summaryMetrics = buildSummaryMetrics(watchlist, articles, stats);

  /* ── render ── */
  return (
    <>
      <FlatList
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        data={articles}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.guid}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={36} color={palette.inkSoft} />
              <Text style={styles.emptyTitle}>No articles for this window</Text>
              <Text style={styles.emptyText}>
                Add entities to the watchlist, then fetch a wider time window to build the report.
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
                  <Ionicons name="eye" size={11} color={palette.cobalt} />
                  <Text style={styles.heroBadgeLabel}>WATCHLIST</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>Market Intelligence</Text>
              <Text style={styles.heroSubtitle}>
                Monitor companies, people, and sectors with live feeds
              </Text>
              <Text style={styles.heroDate}>{fullDateFormatter.format(new Date())}</Text>

              <View style={styles.heroActions}>
                <Pressable
                  onPress={() => {
                    setCreateError(null);
                    setIsCreateVisible(true);
                  }}
                  style={({ pressed }) => [styles.addButton, pressed && styles.pressedScale]}
                >
                  <Ionicons name="add-circle-outline" size={16} color={palette.canvas} />
                  <Text style={styles.addButtonLabel}>Add Entity</Text>
                </Pressable>
                <Pressable
                  disabled={isSynthesizing || articles.length === 0}
                  onPress={() => void handleSynthesize()}
                  style={({ pressed }) => [
                    styles.synthesizeButton,
                    (isSynthesizing || articles.length === 0) && styles.buttonDimmed,
                    pressed && styles.pressedScale,
                  ]}
                >
                  {isSynthesizing ? (
                    <ActivityIndicator color={palette.cobalt} size="small" />
                  ) : (
                    <>
                      <Ionicons name="sparkles-outline" size={15} color={palette.cobalt} />
                      <Text style={styles.synthesizeButtonLabel}>Synthesize</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </Animated.View>

            {/* ── Error ── */}
            {error ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorHeader}>
                  <Ionicons name="alert-circle" size={18} color={palette.rose} />
                  <Text style={styles.errorTitle}>Feed unavailable</Text>
                </View>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={() => void loadWatchlistDesk()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Ionicons name="refresh-outline" size={14} color={palette.ink} />
                  <Text style={styles.retryLabel}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            {/* ── Watchlist Entities Panel ── */}
            <Animated.View style={[styles.panel, fadeSlide(watchlistAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.emerald }]} />

              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                  <View style={styles.panelIconWrap}>
                    <Ionicons name="list-outline" size={16} color={palette.emerald} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Your Watchlist</Text>
                    <Text style={styles.panelDescription}>Tenant-scoped entity tracking</Text>
                  </View>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{watchlist.length}</Text>
                </View>
              </View>

              {watchlist.length === 0 ? (
                <View style={styles.watchlistEmpty}>
                  <Ionicons name="add-circle-outline" size={28} color={palette.inkSoft} />
                  <Text style={styles.watchlistEmptyTitle}>No entities tracked</Text>
                  <Text style={styles.watchlistEmptyText}>
                    Add a company, person, or sector to start monitoring.
                  </Text>
                </View>
              ) : (
                <View style={styles.watchlistGrid}>
                  {watchlist.map((item) => (
                    <WatchlistPill
                      isRemoving={isRemovingId === item.id}
                      item={item}
                      key={item.id}
                      onRemove={() => void handleRemoveItem(item.id)}
                    />
                  ))}
                </View>
              )}
            </Animated.View>

            {/* ── Report Panel ── */}
            <Animated.View style={[styles.panel, fadeSlide(reportAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.cobalt }]} />

              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                  <View style={[styles.panelIconWrap, { backgroundColor: palette.cobaltSoft }]}>
                    <Ionicons name="bar-chart-outline" size={16} color={palette.cobalt} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Media Report</Text>
                    <Text style={styles.panelDescription}>Live metrics for the active window</Text>
                  </View>
                </View>
                {isLoading ? <ActivityIndicator color={palette.emerald} size="small" /> : null}
              </View>

              {/* Time window picker */}
              <View style={styles.timeWindowRow}>
                {TIME_WINDOWS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setTimeWindow(option.value)}
                    style={({ pressed }) => [
                      styles.timeChip,
                      timeWindow === option.value && styles.timeChipActive,
                      pressed && styles.timeChipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeChipLabel,
                        timeWindow === option.value && styles.timeChipLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Stat grid */}
              <View style={styles.statGrid}>
                {summaryMetrics.map((metric) => (
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

              <View style={styles.reportFooter}>
                <Text style={styles.reportHint}>
                  Window: {TIME_WINDOWS.find((o) => o.value === timeWindow)?.label}
                </Text>
              </View>
            </Animated.View>

            {/* ── Feed Header ── */}
            <Animated.View style={[styles.feedHeaderCard, fadeSlide(feedAnim)]}>
              <View style={[styles.panelAccent, { backgroundColor: palette.amber }]} />
              <View style={styles.feedHeaderInner}>
                <View style={styles.feedHeaderLeft}>
                  <View style={[styles.panelIconWrap, { backgroundColor: palette.amberSoft }]}>
                    <Ionicons name="documents-outline" size={16} color={palette.amber} />
                  </View>
                  <View style={styles.panelHeaderCopy}>
                    <Text style={styles.panelTitle}>Watchlist Articles</Text>
                    <Text style={styles.panelDescription}>
                      Actions generated live from the API
                    </Text>
                  </View>
                </View>
                {articles.length > 0 ? (
                  <View style={[styles.countBadge, { backgroundColor: palette.amberSoft }]}>
                    <Text style={[styles.countBadgeText, { color: palette.amber }]}>
                      {articles.length}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </View>
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadWatchlistDesk(true)}
            progressBackgroundColor={palette.panel}
            refreshing={isRefreshing}
            tintColor={palette.emerald}
          />
        }
        renderItem={({ item, index }) => (
          <WatchlistArticleCard
            article={item}
            isFirst={index === 0}
            onDeepDive={() => setRolePickerArticle(item)}
            onOpen={() => void Linking.openURL(item.link)}
            onSummary={() => void runAnalysis(item, 'Executive Summary')}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Create Item Modal ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsCreateVisible(false)}
        transparent
        visible={isCreateVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable onPress={() => setIsCreateVisible(false)} style={styles.modalBackdrop}>
            <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Add to Watchlist</Text>
              <Text style={styles.modalSubtitle}>
                Track a new entity through the backend watchlist model.
              </Text>

              <ScrollView
                contentContainerStyle={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Entity Type</Text>
                  <View style={styles.typeRow}>
                    {TYPE_OPTIONS.map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => setEntityType(option)}
                        style={({ pressed }) => [
                          styles.typeChip,
                          entityType === option && styles.typeChipActive,
                          pressed && styles.typeChipPressed,
                        ]}
                      >
                        <Ionicons
                          name={TYPE_ICONS[option]}
                          size={14}
                          color={entityType === option ? palette.emerald : palette.inkSoft}
                        />
                        <Text
                          style={[
                            styles.typeChipLabel,
                            entityType === option && styles.typeChipLabelActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Entity Name</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="search-outline" size={16} color={palette.inkSoft} />
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={(text) => {
                        setEntityName(text);
                        setCreateError(null);
                      }}
                      placeholder="e.g. Apple Inc, Elon Musk"
                      placeholderTextColor={palette.inkSoft}
                      style={styles.input}
                      value={entityName}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Filters</Text>
                  <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
                    <Ionicons name="funnel-outline" size={16} color={palette.inkSoft} style={{ marginTop: spacing.sm }} />
                    <TextInput
                      autoCapitalize="none"
                      multiline
                      onChangeText={setFilters}
                      placeholder="Optional keywords or ticker"
                      placeholderTextColor={palette.inkSoft}
                      style={[styles.input, styles.inputMultiline]}
                      value={filters}
                    />
                  </View>
                </View>

                {createError ? (
                  <View style={styles.inlineErrorWrap}>
                    <Ionicons name="alert-circle-outline" size={14} color={palette.rose} />
                    <Text style={styles.inlineError}>{createError}</Text>
                  </View>
                ) : null}

                <Pressable
                  disabled={isCreating}
                  onPress={() => void handleCreateItem()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (!entityName.trim() && !isCreating) && styles.buttonDimmed,
                    pressed && styles.pressedScale,
                  ]}
                >
                  {isCreating ? (
                    <ActivityIndicator color={palette.canvas} size="small" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={16} color={palette.canvas} />
                      <Text style={styles.primaryButtonLabel}>Save Watchlist Item</Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

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
                    <Ionicons name={ROLE_ICONS[role]} size={20} color={palette.cobalt} />
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
              <View style={styles.sheetErrorCard}>
                <Ionicons name="alert-circle" size={16} color={palette.rose} />
                <Text style={styles.sheetErrorText}>{analysisError}</Text>
              </View>
            ) : null}

            {analysisResult ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.analysisBody}
              >
                <Text style={styles.analysisText}>{analysisResult.analysis}</Text>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ── Synthesis Modal ── */}
      <Modal
        animationType="slide"
        onRequestClose={closeSynthesis}
        transparent
        visible={isSynthesizing || !!synthesisError || !!synthesisResult}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.analysisSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.analysisHeader}>
              <View style={styles.analysisHeaderLeft}>
                <Text style={styles.analysisRoleBadge}>Market Synthesis</Text>
                <Text style={styles.analysisTitle}>
                  Narrative report for the active watchlist window
                </Text>
              </View>
              <Pressable onPress={closeSynthesis} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={palette.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.analysisBody}
            >
              {isSynthesizing ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator color={palette.emerald} size="large" />
                  <Text style={styles.loadingTitle}>Synthesizing articles...</Text>
                  <Text style={styles.loadingHint}>Building narrative from the fetched set</Text>
                </View>
              ) : null}

              {synthesisError ? (
                <View style={styles.sheetErrorCard}>
                  <Ionicons name="alert-circle" size={16} color={palette.rose} />
                  <Text style={styles.sheetErrorText}>{synthesisError}</Text>
                </View>
              ) : null}

              {synthesisResult ? (
                <>
                  <View style={styles.synthesisSummary}>
                    <SynthesisMetric
                      label="Articles Analyzed"
                      value={String(synthesisResult.articles_analyzed)}
                    />
                    <SynthesisMetric label="Window" value={timeWindow.toUpperCase()} />
                  </View>
                  <ReportNode depth={0} value={synthesisResult.report} />
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Sub-components                                        */
/* ────────────────────────────────────────────────────── */

const WatchlistPill = memo(function WatchlistPill({
  isRemoving,
  item,
  onRemove,
}: {
  isRemoving: boolean;
  item: WatchlistItem;
  onRemove: () => void;
}) {
  const typeIcon = TYPE_ICONS[item.type as WatchlistItemType] ?? 'ellipse-outline';

  return (
    <View style={styles.watchlistPill}>
      <View style={styles.watchlistPillIcon}>
        <Ionicons name={typeIcon} size={14} color={palette.cobalt} />
      </View>
      <View style={styles.watchlistPillCopy}>
        <Text numberOfLines={1} style={styles.watchlistEntity}>
          {item.entity}
        </Text>
        <View style={styles.watchlistMetaRow}>
          <Text style={styles.watchlistType}>{item.type}</Text>
          {item.filters ? (
            <Text numberOfLines={1} style={styles.watchlistFilters}>
              {item.filters}
            </Text>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
      >
        {isRemoving ? (
          <ActivityIndicator color={palette.rose} size="small" />
        ) : (
          <Ionicons name="close-circle-outline" size={18} color={palette.rose} />
        )}
      </Pressable>
    </View>
  );
});

const WatchlistArticleCard = memo(function WatchlistArticleCard({
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
        <Badge label={sentiment} tone={sentTone === 'green' ? 'green' : sentTone === 'red' ? 'red' : 'gold'} />
        <Badge label={importance} tone="blue" />
      </View>

      {/* Actions — all consistent pill buttons */}
      <View style={styles.articleActions}>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.pressed]}
        >
          <Ionicons name="open-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Open</Text>
        </Pressable>
        <Pressable
          onPress={onSummary}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.pressed]}
        >
          <Ionicons name="document-text-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Summary</Text>
        </Pressable>
        <Pressable
          onPress={onDeepDive}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnFilled, pressed && styles.pressedDeep]}
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

function SynthesisMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.synthesisMetric}>
      <Text style={styles.synthesisMetricLabel}>{label}</Text>
      <Text style={styles.synthesisMetricValue}>{value}</Text>
    </View>
  );
}

function ReportNode({ depth, label, value }: { depth: number; label?: string; value: unknown }) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return (
      <View style={[styles.reportBlock, depth > 0 && styles.reportBlockNested]}>
        {label ? <Text style={styles.reportLabel}>{label}</Text> : null}
        <Text style={styles.reportText}>{String(value)}</Text>
      </View>
    );
  }

  if (Array.isArray(value)) {
    return (
      <View style={[styles.reportBlock, depth > 0 && styles.reportBlockNested]}>
        {label ? <Text style={styles.reportLabel}>{label}</Text> : null}
        {value.length === 0 ? (
          <Text style={styles.reportText}>No entries.</Text>
        ) : (
          value.map((item, index) => (
            <ReportNode
              depth={depth + 1}
              key={`${label ?? 'item'}-${index}`}
              label={`Item ${index + 1}`}
              value={item}
            />
          ))
        )}
      </View>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);

  return (
    <View style={[styles.reportBlock, depth > 0 && styles.reportBlockNested]}>
      {label ? <Text style={styles.reportLabel}>{label}</Text> : null}
      {entries.map(([entryKey, entryValue]) => (
        <ReportNode
          depth={depth + 1}
          key={entryKey}
          label={formatReportKey(entryKey)}
          value={entryValue}
        />
      ))}
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
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  heroBadgeLabel: {
    color: palette.cobalt,
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
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  addButtonLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  synthesizeButton: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderColor: `${palette.cobalt}33`,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  synthesizeButtonLabel: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  buttonDimmed: {
    opacity: 0.5,
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

  /* ── watchlist entities ── */
  watchlistGrid: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  watchlistPill: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  watchlistPillIcon: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  watchlistPillCopy: {
    flex: 1,
    gap: 3,
  },
  watchlistEntity: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 16,
  },
  watchlistMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  watchlistType: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  watchlistFilters: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 11,
    flex: 1,
  },
  watchlistEmpty: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  watchlistEmptyTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 0.4,
    marginTop: spacing.xs,
  },
  watchlistEmptyText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  removeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },

  /* ── time window ── */
  timeWindowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  timeChip: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  timeChipActive: {
    backgroundColor: palette.cobaltSoft,
    borderColor: palette.cobalt,
  },
  timeChipLabel: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  timeChipLabelActive: {
    color: palette.ink,
  },
  timeChipPressed: {
    opacity: 0.86,
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
    minHeight: 84,
    overflow: 'hidden',
    width: '48%',
    flexGrow: 1,
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

  /* ── report footer ── */
  reportFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  reportHint: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
  },

  /* ── feed header card ── */
  feedHeaderCard: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
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
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 0.4,
    marginTop: spacing.md,
  },
  emptyText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
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
  modalSheet: {
    backgroundColor: palette.panel,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '88%',
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
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  modalSourceHighlight: {
    color: palette.cobalt,
    fontFamily: typography.monoBold,
    fontSize: 14,
  },
  modalBody: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },

  /* ── create form ── */
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  typeChipActive: {
    backgroundColor: palette.emeraldSoft,
    borderColor: palette.emerald,
  },
  typeChipLabel: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  typeChipLabelActive: {
    color: palette.ink,
  },
  typeChipPressed: {
    opacity: 0.86,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputWrapMultiline: {
    alignItems: 'flex-start',
    minHeight: 88,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 16,
    minHeight: 52,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inlineErrorWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  inlineError: {
    color: palette.rose,
    flex: 1,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButtonLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 0.8,
  },

  /* ── role picker ── */
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    marginBottom: spacing.md,
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
  analysisBody: {
    paddingBottom: spacing.xxl,
  },
  analysisText: {
    color: palette.ink,
    fontFamily: typography.serif,
    fontSize: 16,
    lineHeight: 25,
  },

  /* ── loading / errors ── */
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
  sheetErrorCard: {
    alignItems: 'center',
    backgroundColor: palette.roseSoft,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sheetErrorText: {
    color: palette.rose,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 14,
    lineHeight: 20,
  },

  /* ── synthesis metrics ── */
  synthesisSummary: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  synthesisMetric: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  synthesisMetricLabel: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  synthesisMetricValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 22,
    marginTop: spacing.xs,
  },

  /* ── report blocks ── */
  reportBlock: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  reportBlockNested: {
    backgroundColor: palette.panel,
  },
  reportLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  reportText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 23,
  },
});
