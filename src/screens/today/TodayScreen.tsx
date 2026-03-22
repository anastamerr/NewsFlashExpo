import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Settings, AlertTriangle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Section } from '@/components/layout/Section';
import { MetricCard } from '@/components/data/MetricCard';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { Chip } from '@/components/ui/Chip';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton, SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useTheme, spacing, palette } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { useAuthStore } from '@/store/authStore';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { MOCK_ARTICLES, MOCK_STATS, MOCK_ALERTS } from '@/constants/mockData';
import { formatNumber } from '@/utils/format';
import type { Article } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TodayStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

export function TodayScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const rootNav = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    setRefreshKey((k) => k + 1);
    await new Promise((r) => setTimeout(r, 800));
  });

  const criticalAlerts = MOCK_ALERTS.filter((a) => a.severity === 'CRITICAL' && !a.isResolved);

  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  }, [navigation]);

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.metricsRow, { marginTop: spacing.md }]}>
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
          </ScrollView>
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
        <TouchableOpacity
          onPress={() => rootNav.navigate('Settings')}
          style={[styles.settingsBtn, { backgroundColor: colors.surface }]}
        >
          <Settings size={20} color={colors.textSecondary} strokeWidth={1.8} />
        </TouchableOpacity>
      </Animated.View>

      {/* Crisis Banner */}
      {criticalAlerts.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={{ ...styles.crisisBanner, borderColor: colors.danger + '40' }}>
            <View style={styles.crisisHeader}>
              <AlertTriangle size={18} color={colors.danger} fill={colors.danger + '30'} strokeWidth={2} />
              <Text style={[typePresets.label, { color: colors.danger }]}>Active Crisis</Text>
            </View>
            <Text style={[typePresets.bodySm, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={2}>
              {criticalAlerts[0].title}
            </Text>
          </GlassCard>
        </Animated.View>
      )}

      {/* Key Metrics */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Section title="Key Metrics">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            <MetricCard label="ARTICLES TODAY" value={MOCK_STATS.totalArticles} format={formatNumber} trend={12.5} />
            <MetricCard label="AVG SENTIMENT" value={MOCK_STATS.avgSentiment} suffix="" format={(n) => n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1)} trend={-3.2} />
            <MetricCard label="POSITIVE" value={MOCK_STATS.sentimentBreakdown.positive} suffix="%" trend={5.1} />
            <MetricCard label="SOURCES ACTIVE" value={6} trend={0} />
          </ScrollView>
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
              <ArticleCard article={article} onPress={handleArticlePress} />
            </Animated.View>
          ))}
        </Section>
      </Animated.View>

      {/* Trending Topics */}
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <Section title="Trending Topics">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {MOCK_STATS.trendingTopics.map((topic) => (
              <Chip
                key={topic.topic}
                label={topic.topic}
                count={topic.count}
              />
            ))}
          </ScrollView>
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
  metricsRow: {
    paddingRight: spacing.base,
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
  chipRow: {
    gap: spacing.sm,
  },
});
