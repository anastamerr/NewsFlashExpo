import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, type DimensionValue } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Section } from '@/components/layout/Section';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { MOCK_ARTICLES, MOCK_STATS, MOCK_ALERTS } from '@/constants/mockData';
import { getSentimentLabel } from '@/utils/sentiment';
import { formatNumber, timeAgo } from '@/utils/format';
import type { Article } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TodayStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<TodayStackParamList, 'Today'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;
type TopicTrend = (typeof MOCK_STATS.trendingTopics)[number]['trend'];

const TOPIC_TREND_META: Record<TopicTrend, { label: string; Icon: typeof TrendingUp }> = {
  up: { label: 'Rising fast', Icon: TrendingUp },
  down: { label: 'Cooling off', Icon: TrendingDown },
  stable: { label: 'Holding', Icon: Minus },
};

function buildTopicPrompt(topic: string) {
  return `Give me a concise brief on why "${topic}" is trending today, the main drivers behind it, and what to watch next.`;
}

function buildArticlePrompt(article: Article) {
  return `Brief me on "${article.title}" with the key market implications, what changed, and the next signals to watch.`;
}

export function TodayScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const rootNav = useNavigation<RootNav>();
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

  const sortedArticles = React.useMemo(
    () => [...MOCK_ARTICLES].sort((a, b) => b.importance - a.importance || Date.parse(b.date) - Date.parse(a.date)),
    [],
  );
  const leadArticle = sortedArticles[0];
  const storyArticles = sortedArticles.slice(1, 6);

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

    rootNav.navigate('Alerts', {
      screen: 'CrisisDetail',
      params: { crisisId: activeCrisis.id },
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
  const supportingTopics = trendingTopics.slice(1, 5);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const leadSentiment = getSentimentLabel(leadArticle.sentiment);
  const leadSentimentColor = leadSentiment === 'positive'
    ? colors.sentimentPositive
    : leadSentiment === 'negative'
      ? colors.sentimentNegative
      : colors.sentimentNeutral;

  const pulseItems = [
    { label: 'Articles', value: formatNumber(MOCK_STATS.totalArticles), tone: colors.text },
    { label: 'Sentiment', value: MOCK_STATS.avgSentiment > 0 ? `+${MOCK_STATS.avgSentiment.toFixed(1)}` : MOCK_STATS.avgSentiment.toFixed(1), tone: leadSentimentColor },
    { label: 'Positive', value: `${MOCK_STATS.sentimentBreakdown.positive}%`, tone: colors.sentimentPositive },
    { label: 'Sources', value: '6', tone: colors.text },
  ];

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Skeleton width={220} height={24} />
            <Skeleton width={150} height={14} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={40} height={40} borderRadius={12} />
        </View>

        <View style={styles.loadingHero}>
          <Skeleton width={96} height={14} />
          <Skeleton width="88%" height={42} style={{ marginTop: spacing.base }} />
          <Skeleton width="96%" height={18} style={{ marginTop: spacing.md }} />
          <Skeleton width="84%" height={18} style={{ marginTop: spacing.sm }} />
          <View style={styles.loadingActions}>
            <Skeleton width={120} height={38} borderRadius={14} />
            <Skeleton width={104} height={38} borderRadius={14} />
          </View>
        </View>

        <View style={styles.loadingPulse}>
          <Skeleton width="100%" height={88} borderRadius={20} />
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Skeleton width={130} height={18} />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={onRefresh}>
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
          onPress={() => rootNav.navigate('Alerts', { screen: 'Alerts' })}
          style={({ pressed }) => [
            styles.settingsBtn,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <Bell size={20} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(120).springify()}
        style={[
          styles.leadHero,
          {
            backgroundColor: colors.backgroundAlt,
            borderTopColor: criticalAlerts[0] ? colors.danger + '30' : colors.borderSubtle,
            borderBottomColor: criticalAlerts[0] ? colors.danger + '30' : colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.leadEyebrow}>
          <View style={styles.leadEyebrowLeft}>
            <Text style={[typePresets.labelXs, { color: colors.primary }]}>Lead Story</Text>
            <View style={[styles.leadEyebrowDot, { backgroundColor: colors.border }]} />
            <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>{leadArticle.source}</Text>
            <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>{timeAgo(leadArticle.date)}</Text>
          </View>
          <Text style={[typePresets.labelSm, { color: leadSentimentColor }]}>
            {leadSentiment}
          </Text>
        </View>

        <Pressable
          onPress={() => handleArticlePress(leadArticle)}
          onLongPress={() => handleArticleLongPress(leadArticle)}
          accessibilityRole="button"
          accessibilityLabel={`Open lead story ${leadArticle.title}`}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={[typePresets.displayMd, styles.leadTitle, { color: colors.text }]}>
            {leadArticle.title}
          </Text>
          <Text
            style={[typePresets.body, styles.leadSummary, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {leadArticle.summary}
          </Text>
        </Pressable>

        <View style={styles.leadTags}>
          {leadArticle.company ? (
            <View style={[styles.leadTag, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
              <Text style={[typePresets.labelSm, { color: colors.text }]}>{leadArticle.company}</Text>
            </View>
          ) : null}
          {leadArticle.tag ? (
            <View style={[styles.leadTag, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
              <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>{leadArticle.tag}</Text>
            </View>
          ) : null}
          <View style={[styles.leadTag, { borderColor: leadSentimentColor + '40', backgroundColor: leadSentimentColor + '10' }]}>
            <Text style={[typePresets.labelSm, { color: leadSentimentColor }]}>
              Impact {leadArticle.importance}/10
            </Text>
          </View>
        </View>

        {criticalAlerts[0] ? (
          <Pressable
            onPress={handleCrisisPress}
            accessibilityRole="button"
            accessibilityLabel={`Open crisis report for ${criticalAlerts[0].title}`}
            style={({ pressed }) => [
              styles.heroAlertRow,
              { borderTopColor: colors.borderSubtle },
              pressed && styles.pressed,
            ]}
          >
            <AlertTriangle size={16} color={colors.danger} strokeWidth={2} />
            <View style={styles.heroAlertCopy}>
              <Text style={[typePresets.labelSm, { color: colors.danger }]}>Active crisis linked to the lead story</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]} numberOfLines={2}>
                {criticalAlerts[0].title}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <View style={styles.heroActions}>
          <Button label="Read Story" size="sm" onPress={() => handleArticlePress(leadArticle)} />
          <Button
            label="Ask AI"
            size="sm"
            variant="secondary"
            onPress={() => openChat(buildArticlePrompt(leadArticle))}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.pulseSection}>
        <Text style={[typePresets.labelXs, { color: colors.primary }]}>Market Pulse</Text>
        <View style={[styles.pulseStrip, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          {pulseItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.pulseItem}>
                <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>{item.label}</Text>
                <Text style={[typePresets.monoLg, { color: item.tone, marginTop: spacing.xs }]}>
                  {item.value}
                </Text>
              </View>
              {index < pulseItems.length - 1 ? (
                <View style={[styles.pulseDivider, { backgroundColor: colors.borderSubtle }]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.pulseFootnote}>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
            Coverage skews positive overall, but trade disruption remains the strongest pressure point.
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).springify()}>
        <Section
          title="More Stories"
          onSeeAll={() => rootNav.navigate('Main', {
            screen: 'BrowseTab',
            params: { screen: 'BrowseHome' },
          })}
        >
          <Text style={[typePresets.bodySm, styles.sectionIntro, { color: colors.textSecondary }]}>
            A tighter front page of the next-most consequential developments.
          </Text>
          <View style={[styles.storyRail, { borderTopColor: colors.borderSubtle }]}>
            {storyArticles.map((article, index) => (
              <Animated.View key={article.id} entering={FadeInDown.delay(380 + index * 50).springify()}>
                <ArticleCard
                  article={article}
                  mode="compact"
                  onPress={handleArticlePress}
                  onLongPress={handleArticleLongPress}
                />
              </Animated.View>
            ))}
          </View>
        </Section>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(520).springify()}>
        <Section title="Signals to Watch">
          <Text style={[typePresets.bodySm, styles.sectionIntro, { color: colors.textSecondary }]}>
            Open a focused brief on the themes accelerating underneath the front page.
          </Text>

          {leadTopic ? (
            <Pressable
              onPress={() => handleTopicPress(leadTopic.topic)}
              accessibilityRole="button"
              accessibilityLabel={`Open chat brief for ${leadTopic.topic}`}
              style={({ pressed }) => [
                styles.signalLead,
                { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.signalLeadHeader}>
                <Text style={[typePresets.labelXs, { color: colors.primary }]}>Lead Signal</Text>
                <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>{leadTopic.share}% of pulse</Text>
              </View>
              <Text style={[typePresets.h1, { color: colors.text, marginTop: spacing.sm }]}>{leadTopic.topic}</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                {formatNumber(leadTopic.count)} mentions and still climbing. Open chat for the drivers behind the move.
              </Text>
              <View style={[styles.topicTrack, { backgroundColor: colors.muted, marginTop: spacing.md }]}>
                <View
                  style={[
                    styles.topicTrackFill,
                    { width: leadTopic.barWidth, backgroundColor: colors.primary },
                  ]}
                />
              </View>
            </Pressable>
          ) : null}

          <View style={[styles.signalList, { borderTopColor: colors.borderSubtle }]}>
            {supportingTopics.map((topic, index) => {
              const trendMeta = TOPIC_TREND_META[topic.trend];
              const trendColor =
                topic.trend === 'up'
                  ? colors.sentimentPositive
                  : topic.trend === 'down'
                    ? colors.sentimentNegative
                    : colors.textSecondary;

              return (
                <Animated.View key={topic.topic} entering={FadeInDown.delay(580 + index * 40).springify()}>
                  <Pressable
                    onPress={() => handleTopicPress(topic.topic)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open chat brief for ${topic.topic}`}
                    style={({ pressed }) => [
                      styles.signalRow,
                      { borderBottomColor: colors.borderSubtle },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.signalRowMain}>
                      <Text style={[typePresets.h3, { color: colors.text }]}>{topic.topic}</Text>
                      <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                        {formatNumber(topic.count)} mentions
                      </Text>
                    </View>
                    <View style={styles.signalRowSide}>
                      <trendMeta.Icon size={14} color={trendColor} strokeWidth={2.2} />
                      <Text style={[typePresets.labelSm, { color: trendColor }]}>
                        {trendMeta.label}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
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
  loadingHero: {
    marginTop: spacing.xl,
  },
  loadingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  loadingPulse: {
    marginTop: spacing.xl,
  },
  leadHero: {
    marginTop: spacing.lg,
    marginHorizontal: -spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  leadEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  leadEyebrowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    flex: 1,
  },
  leadEyebrowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  leadTitle: {
    marginTop: spacing.md,
    maxWidth: '94%',
  },
  leadSummary: {
    marginTop: spacing.sm,
    maxWidth: '94%',
  },
  leadTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  leadTag: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  heroAlertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  heroAlertCopy: {
    flex: 1,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pulseSection: {
    marginTop: spacing.xl,
  },
  pulseStrip: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  pulseItem: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  pulseDivider: {
    width: StyleSheet.hairlineWidth,
  },
  pulseFootnote: {
    marginTop: spacing.sm,
  },
  sectionIntro: {
    marginBottom: spacing.sm,
  },
  storyRail: {
    borderTopWidth: 1,
  },
  signalLead: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.base,
  },
  signalLeadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signalList: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  signalRowMain: {
    flex: 1,
  },
  signalRowSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topicTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  topicTrackFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.8,
  },
});
