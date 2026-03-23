import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { SentimentGauge } from '@/components/charts/SentimentGauge';
import { SparkLine } from '@/components/charts/SparkLine';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { MOCK_ARTICLES, MOCK_WATCHLIST } from '@/constants/mockData';
import type { Article } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WatchlistStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<WatchlistStackParamList, 'WatchlistDetail'>;

const SPARK_DATA = [2.1, 1.8, 2.5, 1.2, 3.1, 2.8, 3.5, 2.9, 3.2, 4.0];

export function WatchlistDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { itemId, name } = route.params;

  const item = MOCK_WATCHLIST.find((w) => w.id === itemId);
  const articles = MOCK_ARTICLES.slice(0, 6);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const positiveCount = articles.filter((a) => a.sentiment > 1).length;
  const negativeCount = articles.filter((a) => a.sentiment < -1).length;
  const neutralCount = articles.length - positiveCount - negativeCount;

  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  }, [navigation]);

  const renderHeader = useCallback(() => (
    <View>
      {/* Stats Card */}
      <Animated.View entering={FadeIn.duration(400)}>
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[typePresets.monoLg, { color: colors.text }]}>{articles.length}</Text>
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>ARTICLES</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <SparkLine data={SPARK_DATA} width={70} height={28} color={colors.primary} />
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>TREND</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typePresets.monoLg, { color: colors.sentimentPositive }]}>
                +{((item?.sentiment ?? 0) > 0 ? item?.sentiment : 1.2)?.toFixed(1)}
              </Text>
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>SENTIMENT</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Sentiment Gauge */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.gaugeContainer}>
        <SentimentGauge
          positive={positiveCount}
          neutral={neutralCount}
          negative={negativeCount}
          height={8}
        />
      </Animated.View>

      <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
        Recent Coverage
      </Text>
    </View>
  ), [colors, articles.length, positiveCount, neutralCount, negativeCount, item]);

  const renderArticle = useCallback(({ item: article, index }: { item: Article; index: number }) => (
    <Animated.View entering={FadeInDown.delay(200 + index * 50).springify()}>
      <ArticleCard article={article} onPress={handleArticlePress} />
    </Animated.View>
  ), [handleArticlePress]);
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[typePresets.h3, { color: colors.text }]} numberOfLines={1}>{name}</Text>
          {item?.symbol ? (
            <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>{item.symbol}</Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlashList
        data={articles}
        keyExtractor={(a) => a.id}
        renderItem={renderArticle}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={listContentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  statsCard: {
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  gaugeContainer: {
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
});
