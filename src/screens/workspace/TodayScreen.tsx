import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  analyzeArticle,
  fetchWatchlistNews,
  getArticleStats,
  getWatchlist,
} from '../../services/api/newsflash';
import { useSession } from '../../store/session';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';
import type {
  AnalysisRole,
  AnalyzeArticleResponse,
  Article,
  ArticleStatsResponse,
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

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Financial Analyst': 'trending-up-outline',
  'Investor Relations': 'people-outline',
  'Marketing Specialist': 'megaphone-outline',
  'Public Relations': 'globe-outline',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatArticleDate(value: string | null) {
  if (!value) return 'Live';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Live';
  return dateFormatter.format(parsed);
}

function formatSentimentIndex(score: number | null) {
  if (score === null || Number.isNaN(score)) return 'Neutral';
  if (score > 0.2) return 'Positive';
  if (score < -0.2) return 'Negative';
  return 'Neutral';
}

function formatImportance(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Unscored';
  if (value >= 8) return 'High';
  if (value >= 5) return 'Medium';
  return 'Low';
}

function sentimentColor(label: string) {
  if (label === 'Positive') return palette.emerald;
  if (label === 'Negative') return palette.rose;
  return palette.inkSoft;
}

/* ────────────────────────────────────────────────────── */
/*  Main Screen                                           */
/* ────────────────────────────────────────────────────── */

export function TodayScreen() {
  const { selectedTenantId, token } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [watchlistSize, setWatchlistSize] = useState(0);
  const [stats, setStats] = useState<ArticleStatsResponse | null>(null);
  const [analysisArticle, setAnalysisArticle] = useState<Article | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeArticleResponse | null>(null);
  const [rolePickerArticle, setRolePickerArticle] = useState<Article | null>(null);

  /* ── entrance animations ── */
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const feedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(statsAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(actionsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(feedAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    void loadToday();
  }, [selectedTenantId, token]);

  /* ── data loading ── */
  async function loadToday(refresh = false) {
    if (!token) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [watchlist, watchlistNews] = await Promise.all([
        getWatchlist(token, selectedTenantId),
        fetchWatchlistNews(token, '1d', selectedTenantId),
      ]);

      const orderedArticles = [...watchlistNews.articles].sort((left, right) => {
        const leftTime = left.published ? new Date(left.published).getTime() : 0;
        const rightTime = right.published ? new Date(right.published).getTime() : 0;
        return rightTime - leftTime;
      });

      setWatchlistSize(watchlist.total ?? watchlistNews.watchlist_size);
      setArticles(orderedArticles);

      if (orderedArticles.length > 0) {
        const nextStats = await getArticleStats(token, orderedArticles, selectedTenantId);
        setStats(nextStats);
      } else {
        setStats(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load today\u2019s news');
      setArticles([]);
      setStats(null);
      setWatchlistSize(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function runAnalysis(article: Article, role: AnalysisRole) {
    if (!token) return;

    setRolePickerArticle(null);
    setAnalysisArticle(article);
    setAnalysisError(null);
    setAnalysisLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeArticle(
        token,
        {
          articleUrl: article.link,
          role,
          source: article.source,
          title: article.title,
        },
        selectedTenantId,
      );
      setAnalysisResult(result);
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

  const sentimentLabel = formatSentimentIndex(stats?.avg_sentiment ?? null);

  /* ── render ── */
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadToday(true)}
            progressBackgroundColor={palette.panel}
            refreshing={isRefreshing}
            tintColor={palette.emerald}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View style={[styles.hero, fadeSlide(heroAnim)]}>
          <View style={styles.heroTopRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.heroTitle}>Today's News</Text>
          <Text style={styles.heroDate}>{fullDateFormatter.format(new Date())}</Text>
        </Animated.View>

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={18} color={palette.rose} />
              <Text style={styles.errorTitle}>Feed unavailable</Text>
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={() => void loadToday()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressedLight]}
            >
              <Ionicons name="refresh-outline" size={14} color={palette.ink} />
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Stat Grid ── */}
        <Animated.View style={[styles.statGrid, fadeSlide(statsAnim)]}>
          <StatCard
            accent={palette.cobalt}
            icon="newspaper-outline"
            label="Articles"
            value={String(articles.length)}
          />
          <StatCard
            accent={palette.emerald}
            icon="bookmark-outline"
            label="Watchlist"
            value={String(watchlistSize)}
          />
          <StatCard
            accent={palette.amber}
            icon="globe-outline"
            label="Top Provider"
            value={stats?.top_provider ?? 'N/A'}
          />
          <StatCard
            accent={sentimentColor(sentimentLabel)}
            icon="analytics-outline"
            label="Sentiment"
            value={sentimentLabel}
          />
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View style={[styles.actionRow, fadeSlide(actionsAnim)]}>
          <ActionCard
            description="Search and filter content"
            icon="search-outline"
            title="Browse"
          />
          <ActionCard
            description="Trends and insights"
            icon="stats-chart-outline"
            title="Analytics"
          />
        </Animated.View>

        {/* ── Article Feed ── */}
        <Animated.View style={[styles.feedSection, fadeSlide(feedAnim)]}>
          <View style={styles.feedHeader}>
            <View style={styles.feedHeaderLeft}>
              <View style={styles.feedAccent} />
              <Text style={styles.feedTitle}>Media Monitoring</Text>
            </View>
            {isLoading ? <ActivityIndicator color={palette.emerald} size="small" /> : null}
            {!isLoading && articles.length > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{articles.length}</Text>
              </View>
            ) : null}
          </View>

          {articles.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={36} color={palette.inkSoft} />
              <Text style={styles.emptyTitle}>No articles today</Text>
              <Text style={styles.emptyText}>
                Your watchlist feed is empty. Articles will appear here once they're published.
              </Text>
            </View>
          ) : null}

          <View style={styles.articleList}>
            {articles.map((article, idx) => (
              <ArticleCard
                key={article.guid}
                article={article}
                isFirst={idx === 0}
                onDeepDive={() => setRolePickerArticle(article)}
                onOpen={() => void Linking.openURL(article.link)}
                onSummary={() => void runAnalysis(article, 'Executive Summary')}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Role Picker Modal ── */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        transparent
        visible={!!rolePickerArticle}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setRolePickerArticle(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
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
                    <Ionicons
                      name={ROLE_ICONS[role] ?? 'person-outline'}
                      size={20}
                      color={palette.cobalt}
                    />
                  </View>
                  <Text style={styles.roleLabel}>{role}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setRolePickerArticle(null)}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressedLight]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Analysis Modal ── */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        transparent
        visible={analysisLoading || !!analysisResult || !!analysisError}
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
              <Pressable
                onPress={() => {
                  setAnalysisArticle(null);
                  setAnalysisError(null);
                  setAnalysisLoading(false);
                  setAnalysisResult(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={palette.ink} />
              </Pressable>
            </View>

            {analysisLoading ? (
              <View style={styles.analysisLoadingState}>
                <ActivityIndicator color={palette.emerald} size="large" />
                <Text style={styles.analysisLoadingText}>
                  Generating analysis...
                </Text>
                <Text style={styles.analysisLoadingHint}>
                  This may take a few seconds
                </Text>
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

function StatCard({
  accent,
  icon,
  label,
  value,
}: {
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <View style={styles.statInner}>
        <View style={styles.statTop}>
          <Ionicons name={icon} size={14} color={palette.inkSoft} />
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text numberOfLines={1} style={styles.statValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionCard({
  description,
  icon,
  title,
}: {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.pressedLight]}>
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={18} color={palette.cobalt} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.inkSoft} />
    </Pressable>
  );
}

function ArticleCard({
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
  const sentLabel = article.sentiment_label ?? 'Unlabeled';
  const impLabel = formatImportance(article.importance);

  return (
    <View style={[styles.articleCard, isFirst && styles.articleCardFirst]}>
      {/* Meta row */}
      <View style={styles.articleMetaRow}>
        <View style={styles.articleSourceRow}>
          <Ionicons name="newspaper-outline" size={12} color={palette.inkSoft} />
          <Text style={styles.articleSource}>{article.source}</Text>
        </View>
        <Text style={styles.articleDate}>{formatArticleDate(article.published)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.articleTitle}>{article.title}</Text>

      {/* Badges */}
      <View style={styles.badgeRow}>
        {article.tag ? <Badge label={article.tag} tone="blue" /> : null}
        <Badge label={sentLabel} tone="green" />
        <Badge label={impLabel} tone="gold" />
      </View>

      {/* Actions */}
      <View style={styles.articleActions}>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.pressedLight]}
        >
          <Ionicons name="open-outline" size={13} color={palette.ink} />
          <Text style={styles.actionBtnLabel}>Open</Text>
        </Pressable>
        <Pressable
          onPress={onSummary}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.pressedLight]}
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
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: 'blue' | 'gold' | 'green';
}) {
  const toneMap = {
    blue: { bg: palette.cobaltSoft, text: palette.cobalt },
    gold: { bg: palette.amberSoft, text: palette.amber },
    green: { bg: palette.emeraldSoft, text: palette.emerald },
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
  liveBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  liveDot: {
    backgroundColor: palette.emerald,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  liveLabel: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  greeting: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 16,
    lineHeight: 22,
  },
  heroTitle: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 32,
    lineHeight: 38,
    marginTop: 2,
  },
  heroDate: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 13,
    letterSpacing: 0.3,
    marginTop: spacing.sm,
  },

  /* ── error ── */
  errorCard: {
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

  /* ── stat grid ── */
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    minHeight: 88,
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
    fontSize: 12,
    letterSpacing: 0.4,
  },
  statValue: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 24,
    marginTop: spacing.xs,
  },

  /* ── quick actions ── */
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.cobaltSoft,
    borderRadius: radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  actionDesc: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  /* ── feed section ── */
  feedSection: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: SECTION_PAD,
  },
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedAccent: {
    backgroundColor: palette.emerald,
    borderRadius: 999,
    height: 14,
    width: 3,
  },
  feedTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 20,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: palette.emeraldSoft,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countBadgeText: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 12,
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
    textAlign: 'center',
  },

  /* ── article list ── */
  articleList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  articleCard: {
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: spacing.md,
  },
  articleCardFirst: {
    borderColor: palette.emerald + '33',
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
  pressedLight: {
    opacity: 0.75,
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
    alignSelf: 'flex-start',
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
  analysisLoadingState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  analysisLoadingText: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  analysisLoadingHint: {
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
});
