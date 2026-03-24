import React, { useCallback } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, spacing } from '@/theme';
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
import { getTriggerDeepDive } from '@/services/reports';
import type { TriggerReportParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function TriggerDeepDiveScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const openChat = useChatStore((state) => state.openChat);
  const { alertId, triggerId, role } = route.params as TriggerReportParams;
  const loadReport = useCallback(() => getTriggerDeepDive(alertId, triggerId, role), [alertId, triggerId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  return (
    <ReportScreenContainer title="Trigger Deep Dive" onBack={() => navigation.goBack()} onChat={openChat}>
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

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <RecommendationList items={report.recommendations} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <ChatEntryPoint contextLabel="alert analysis" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}
