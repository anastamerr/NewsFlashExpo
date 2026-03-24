import React, { useCallback } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import {
  ReportScreenContainer,
  MetadataRow,
  KeyPointsList,
  BadgeStrip,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getCrisisSummary } from '@/services/reports';
import type { CrisisReportParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function CrisisSummaryScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const openChat = useChatStore((state) => state.openChat);
  const { crisisId, role } = route.params as CrisisReportParams;
  const loadReport = useCallback(() => getCrisisSummary(crisisId, role), [crisisId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  return (
    <ReportScreenContainer
      title="Crisis Summary"
      onBack={() => navigation.goBack()}
      onChat={openChat}
      ctaActions={[
        {
          label: 'Read Deep Dive',
          onPress: () => navigation.push('CrisisDeepDive', { crisisId, role }),
        },
      ]}
    >
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

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.xl }]}>
          {report.summary}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <BadgeStrip tags={report.affectedEntities} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <ChatEntryPoint contextLabel="crisis" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}
