import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, type DimensionValue } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Settings, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Section } from '@/components/layout/Section';
import { MetricCard } from '@/components/data/MetricCard';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton, SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { SparkLine } from '@/components/charts/SparkLine';
import { MOCK_ARTICLES, MOCK_STATS, MOCK_ALERTS, MOCK_WATCHLIST } from '@/constants/mockData';
import { getSentimentLabel } from '@/utils/sentiment';
import { formatNumber } from '@/utils/format';
import type { Article } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TodayStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<TodayStackParamList, 'Today'>;
type TopicTrend = (typeof MOCK_STATS.trendingTopics)[number]['trend'];

const TOPIC_TREND_META: Record<TopicTrend, { label: string; Icon: typeof TrendingUp }> = {
  up: { label: 'Rising fast', Icon: TrendingUp },
  down: { label: 'Cooling off', Icon: TrendingDown },
  stable: { label: 'Holding', Icon: Minus },
};

function buildTopicPrompt(topic: string) {
  return `Give me a concise brief on why "${topic}" is trending today, the main drivers behind it, and what to watch next.`;
}

export function TodayScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const rootNav = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const openChat = useChatStore((s) => s.openChat);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const criticalAlerts = MOCK_ALERTS.filter((a) => a.severity === 'CRITICAL' && !a.isResolved);

  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  }, [navigation]);
  const handleArticleLongPress = useCallback((article: Article) => {
    navigation.navigate('ArticleSummary', {
      articleId: article.id,
      deepDiveRoute: 'ArticleDeepDive',
    });
  }, [navigation]);
  const handleCrisisPress = useCallback(() => {
    const activeCrisis = criticalAlerts[0];

    if (!activeCrisis) {
      return;
    }

    rootNav.navigate('Main', {
      screen: 'AlertsTab',
      params: {
        screen: 'CrisisDetail',
        params: { crisisId: activeCrisis.id },
      },
    });
  }, [criticalAlerts, rootNav]);

  const handleTopicPress = useCallback((topic: string) => {
    openChat(buildTopicPrompt(topic));
  }, [openChat]);

  const trendingTopics = React.useMemo(() => {
    const totalMentions = MOCK_STATS.trendingTopics.reduce((sum, topic) => sum + topic.count, 0);
    const maxCount = Math.max(...MOCK_STATS.trendingTopics.map((topic) => topic.count), 1);

    return MOCK_STATS.trendingTopics.map((topic, index) => ({
      ...topic,
      rank: index + 1,
      share: Math.round((topic.count / totalMentions) * 100),
      barWidth: `${Math.max(14, Math.round((topic.count / maxCount) * 100))}%` as DimensionValue,
    }));
  }, []);

  const leadTopic = trendingTopics[0];
  const supportingTopics = trendingTopics.slice(1);
  const leadTopicMeta = leadTopic ? TOPIC_TREND_META[leadTopic.trend] : null;
  const leadTopicTrendColor = !leadTopic
    ? colors.textSecondary
    : leadTopic.trend === 'up'
      ? colors.sentimentPositive
      : leadTopic.trend === 'down'
        ? colors.sentimentNegative
        : colors.textSecondary;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Skeleton width={200} height={24} />
            <Skeleton width={140} height={14} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={40} height={40} borderRadius={12} />
        </View>
        <View style={{ marginTop: spacing.xl }}>
          <Skeleton width={100} height={16} />
          <View style={[styles.metricsGrid, { marginTop: spacing.md }]}>
            <View style={styles.metricGridItem}>
              <SkeletonMetric />
            </View>
            <View style={styles.metricGridItem}>
              <SkeletonMetric />
            </View>
            <View style={styles.metricGridItem}>
              <SkeletonMetric />
            </View>
            <View style={styles.metricGridItem}>
              <SkeletonMetric />
            </View>
          </View>
        </View>
        <View style={{ marginTop: spacing.xl }}>
          <Skeleton width={90} height={16} />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View>
          <Text style={[typePresets.displaySm, { color: colors.text }]}>
            {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </Text>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <Pressable
          onPress={() => rootNav.navigate('Settings')}
          style={({ pressed }) => [
            styles.settingsBtn,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <Settings size={20} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>
      </Animated.View>

      {/* Crisis Banner */}
      {criticalAlerts.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Pressable
            onPress={handleCrisisPress}
            accessibilityRole="button"
            accessibilityLabel={`Open crisis report for ${criticalAlerts[0].title}`}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <GlassCard style={{ ...styles.crisisBanner, borderColor: colors.danger + '40' }}>
              <View style={styles.crisisHeader}>
                <AlertTriangle size={18} color={colors.danger} fill={colors.danger + '30'} strokeWidth={2} />
                <Text style={[typePresets.label, { color: colors.danger }]}>Active Crisis</Text>
              </View>
              <Text style={[typePresets.bodySm, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={2}>
                {criticalAlerts[0].title}
              </Text>
            </GlassCard>
          </Pressable>
        </Animated.View>
      )}

      {/* Key Metrics */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Section title="Key Metrics">
          <View style={styles.metricsGrid}>
            <MetricCard
              label="ARTICLES TODAY"
              value={MOCK_STATS.totalArticles}
              format={formatNumber}
              trend={12.5}
              style={styles.metricGridItem}
            />
            <MetricCard
              label="AVG SENTIMENT"
              value={MOCK_STATS.avgSentiment}
              suffix=""
              format={(n) => n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1)}
              trend={-3.2}
              style={styles.metricGridItem}
            />
            <MetricCard
              label="POSITIVE"
              value={MOCK_STATS.sentimentBreakdown.positive}
              suffix="%"
              trend={5.1}
              style={styles.metricGridItem}
            />
            <MetricCard
              label="SOURCES ACTIVE"
              value={6}
              trend={0}
              style={styles.metricGridItem}
            />
          </View>
        </Section>
      </Animated.View>

      {/* Sentiment Bar */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <View style={styles.sentimentBar}>
          <View style={[styles.sentimentSegment, { flex: MOCK_STATS.sentimentBreakdown.positive, backgroundColor: colors.sentimentPositive, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
          <View style={[styles.sentimentSegment, { flex: MOCK_STATS.sentimentBreakdown.neutral, backgroundColor: colors.sentimentNeutral }]} />
          <View style={[styles.sentimentSegment, { flex: MOCK_STATS.sentimentBreakdown.negative, backgroundColor: colors.sentimentNegative, borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
        </View>
        <View style={styles.sentimentLabels}>
          <Text style={[typePresets.labelXs, { color: colors.sentimentPositive }]}>Positive {MOCK_STATS.sentimentBreakdown.positive}%</Text>
          <Text style={[typePresets.labelXs, { color: colors.sentimentNeutral }]}>Neutral {MOCK_STATS.sentimentBreakdown.neutral}%</Text>
          <Text style={[typePresets.labelXs, { color: colors.sentimentNegative }]}>Negative {MOCK_STATS.sentimentBreakdown.negative}%</Text>
        </View>
      </Animated.View>

      {/* Top Stories */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Section title="Top Stories" onSeeAll={() => rootNav.navigate('Main', { screen: 'BrowseTab' })}>
          {MOCK_ARTICLES.slice(0, 5).map((article, index) => (
            <Animated.View key={article.id} entering={FadeInDown.delay(450 + index * 60).springify()}>
              <ArticleCard
                article={article}
                onPress={handleArticlePress}
                onLongPress={handleArticleLongPress}
              />
            </Animated.View>
          ))}
        </Section>
      </Animated.View>

      {/* Trending Topics */}
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <Section title="Trending Topics">
          <Text style={[typePresets.bodySm, styles.topicIntro, { color: colors.textSecondary }]}>
            Tap any topic to open a focused brief in chat.
          </Text>

          {leadTopic ? (
            <Pressable
              onPress={() => handleTopicPress(leadTopic.topic)}
              accessibilityRole="button"
              accessibilityLabel={`Open chat brief for ${leadTopic.topic}`}
              style={({ pressed }) => [
                styles.topicLead,
                { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.topicLeadTopRow}>
                <Text style={[typePresets.labelXs, { color: colors.primary }]}>Lead Signal</Text>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>
                  {leadTopic.share}% share
                </Text>
              </View>

              <Text style={[typePresets.displaySm, styles.topicLeadTitle, { color: colors.text }]}>
                {leadTopic.topic}
              </Text>

              <View style={styles.topicLeadMetaRow}>
                <View style={styles.topicLeadMetaBlock}>
                  <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>Coverage</Text>
                  <Text style={[typePresets.monoLg, { color: colors.text }]}>
                    {formatNumber(leadTopic.count)}
                  </Text>
                </View>
                <View style={styles.topicLeadMetaBlock}>
                  <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>Momentum</Text>
                  <View style={styles.topicTrendBadge}>
                    {leadTopicMeta ? (
                      <leadTopicMeta.Icon
                        size={14}
                        color={leadTopicTrendColor}
                        strokeWidth={2.2}
                      />
                    ) : null}
                    <Text style={[typePresets.label, { color: leadTopicTrendColor }]}>
                      {leadTopicMeta?.label ?? 'Holding'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.topicTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.topicTrackFill,
                    { width: leadTopic.barWidth, backgroundColor: leadTopicTrendColor },
                  ]}
                />
              </View>
            </Pressable>
          ) : null}

          <View style={[styles.topicList, { borderTopColor: colors.borderSubtle }]}>
            {supportingTopics.map((topic, index) => {
              const trendMeta = TOPIC_TREND_META[topic.trend];
              const trendColor =
                topic.trend === 'up'
                  ? colors.sentimentPositive
                  : topic.trend === 'down'
                    ? colors.sentimentNegative
                    : colors.textSecondary;

              return (
                <Animated.View key={topic.topic} entering={FadeInDown.delay(650 + index * 50).springify()}>
                  <Pressable
                    onPress={() => handleTopicPress(topic.topic)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open chat brief for ${topic.topic}`}
                    style={({ pressed }) => [
                      styles.topicRow,
                      { borderBottomColor: colors.borderSubtle },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.topicRowHeader}>
                      <Text style={[typePresets.monoSm, styles.topicRank, { color: colors.textTertiary }]}>
                        {String(topic.rank).padStart(2, '0')}
                      </Text>
                      <Text style={[typePresets.h3, styles.topicName, { color: colors.text }]}>
                        {topic.topic}
                      </Text>
                      <View style={styles.topicTrendBadge}>
                        <trendMeta.Icon size={14} color={trendColor} strokeWidth={2.2} />
                        <Text style={[typePresets.labelSm, { color: trendColor }]}>
                          {trendMeta.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.topicRowMeta}>
                      <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                        {formatNumber(topic.count)} mentions
                      </Text>
                      <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
                        {topic.share}% of pulse
                      </Text>
                    </View>

                    <View style={[styles.topicTrack, styles.topicTrackCompact, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.topicTrackFill,
                          { width: topic.barWidth, backgroundColor: trendColor },
                        ]}
                      />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Section>
      </Animated.View>

      {/* Watchlist Highlights */}
      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <Section title="Watchlist Highlights" onSeeAll={() => rootNav.navigate('Main', { screen: 'WatchlistTab' })}>
          {MOCK_WATCHLIST.slice(0, 4).map((item, index) => {
            const label = getSentimentLabel(item.sentiment ?? 0);
            const sparkColor = label === 'positive' ? colors.sentimentPositive : label === 'negative' ? colors.sentimentNegative : colors.primary;
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(750 + index * 50).springify()}>
                <Pressable
                  onPress={() => rootNav.navigate('Main', { screen: 'WatchlistTab' })}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, sentiment ${label}`}
                  style={({ pressed }) => [
                    styles.watchlistItem,
                    { backgroundColor: colors.surface },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[typePresets.h3, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[typePresets.labelSm, { color: colors.textTertiary, marginTop: 2 }]}>
                      {item.articleCount} articles
                    </Text>
                  </View>
                  <SparkLine
                    data={item.sparkData ?? [1, 2, 1.5, 3, 2.5]}
                    width={56}
                    height={24}
                    color={sparkColor}
                  />
                  <Text style={[typePresets.monoSm, { color: sparkColor, width: 36, textAlign: 'right' }]}>
                    {(item.sentiment ?? 0) > 0 ? '+' : ''}{(item.sentiment ?? 0).toFixed(1)}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Section>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.base,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisBanner: {
    marginTop: spacing.base,
    borderWidth: 1,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricGridItem: {
    width: '48%',
    marginRight: 0,
    marginBottom: 0,
  },
  sentimentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: spacing.lg,
    gap: 2,
  },
  sentimentSegment: {
    height: '100%',
  },
  sentimentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  topicIntro: {
    marginBottom: spacing.md,
  },
  topicLead: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.base,
  },
  topicLeadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicLeadTitle: {
    marginTop: spacing.sm,
  },
  topicLeadMetaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  topicLeadMetaBlock: {
    flex: 1,
  },
  topicTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  topicList: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
  },
  topicRow: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topicRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicRank: {
    width: 28,
  },
  topicName: {
    flex: 1,
    paddingRight: spacing.md,
  },
  topicRowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingLeft: 28,
  },
  topicTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  topicTrackCompact: {
    marginLeft: 28,
  },
  topicTrackFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
