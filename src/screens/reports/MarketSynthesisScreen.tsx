import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import {
  ReportScreenContainer,
  MetadataRow,
  SectionBlock,
  KeyPointsList,
  RecommendationList,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getMarketSynthesis } from '@/services/reports';
import type { MarketSynthesisParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function MarketSynthesisScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const openChat = useChatStore((state) => state.openChat);
  const { watchlistItemId, query, role, timeWindow } = route.params as MarketSynthesisParams;
  const loadReport = useCallback(
    () => getMarketSynthesis({ watchlistItemId, query, timeWindow }, role),
    [query, role, timeWindow, watchlistItemId],
  );
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  const dist = report?.sentimentDistribution;
  const total = dist ? dist.positive + dist.negative + dist.neutral : 0;

  return (
    <ReportScreenContainer title="Market Synthesis" onBack={() => navigation.goBack()} onChat={openChat}>
      {!report || isLoading || error || !dist ? (
        <ReportStateView
          isLoading={isLoading}
          error={error?.message ?? null}
          onRetry={reload}
        />
      ) : (
        <>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Text style={[typePresets.displayMd, { color: colors.text, marginTop: spacing.md }]}>
          {report.title}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <MetadataRow
          source={report.metadata.source}
          date={report.metadata.date}
          sentiment={report.averageSentiment}
          importance={report.averageImportance}
        />
      </Animated.View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{report.articleCount}</Text>
            <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Articles</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{report.averageSentiment.toFixed(1)}</Text>
            <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Avg Sentiment</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{report.averageImportance.toFixed(1)}</Text>
            <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Avg Importance</Text>
          </View>
        </View>
      </Animated.View>

      {/* Sentiment distribution */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <View style={[styles.distCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.md }]}>
            SENTIMENT DISTRIBUTION
          </Text>
          <View style={styles.distBar}>
            <View style={[styles.distSegment, { flex: dist.positive, backgroundColor: colors.sentimentPositive }]} />
            <View style={[styles.distSegment, { flex: dist.neutral, backgroundColor: colors.sentimentNeutral }]} />
            <View style={[styles.distSegment, { flex: dist.negative, backgroundColor: colors.sentimentNegative }]} />
          </View>
          <View style={styles.distLabels}>
            <Text style={[typePresets.labelSm, { color: colors.sentimentPositive }]}>
              {Math.round((dist.positive / total) * 100)}% Positive
            </Text>
            <Text style={[typePresets.labelSm, { color: colors.sentimentNeutral }]}>
              {Math.round((dist.neutral / total) * 100)}% Neutral
            </Text>
            <Text style={[typePresets.labelSm, { color: colors.sentimentNegative }]}>
              {Math.round((dist.negative / total) * 100)}% Negative
            </Text>
          </View>
        </View>
      </Animated.View>

      {report.sections.map((section, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(500 + i * 80).springify()}>
          <SectionBlock title={section.title} body={section.body} />
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900).springify()}>
        <RecommendationList items={report.recommendations} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1000).springify()}>
        <ChatEntryPoint contextLabel="market synthesis" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xxs,
  },
  distCard: {
    marginTop: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  distBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  distSegment: {
    borderRadius: 4,
  },
  distLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
