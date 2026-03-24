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
  BadgeStrip,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getCrisisDeepDive } from '@/services/reports';
import type { CrisisReportParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function CrisisDeepDiveScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const openChat = useChatStore((state) => state.openChat);
  const { crisisId, role } = route.params as CrisisReportParams;
  const loadReport = useCallback(() => getCrisisDeepDive(crisisId, role), [crisisId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  return (
    <ReportScreenContainer title="Crisis Deep Dive" onBack={() => navigation.goBack()} onChat={openChat}>
      {!report || isLoading || error ? (
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
          sentiment={report.metadata.sentiment}
          importance={report.metadata.importance}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.xl }]}>
          {report.summary}
        </Text>
      </Animated.View>

      {report.sections.map((section, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(300 + i * 80).springify()}>
          <SectionBlock title={section.title} body={section.body} />
        </Animated.View>
      ))}

      {/* Timeline */}
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.md }]}>
            TIMELINE
          </Text>
          {report.timeline.map((entry, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                {i < report.timeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.borderSubtle }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>
                  {entry.date}
                </Text>
                <Text style={[typePresets.body, { color: colors.text }]}>{entry.event}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <RecommendationList items={report.recommendations} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900).springify()}>
        <BadgeStrip tags={report.affectedEntities} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1000).springify()}>
        <ChatEntryPoint contextLabel="crisis analysis" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    marginTop: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: spacing.xxs,
  },
  timelineContent: {
    flex: 1,
    gap: spacing.xxs,
  },
});
