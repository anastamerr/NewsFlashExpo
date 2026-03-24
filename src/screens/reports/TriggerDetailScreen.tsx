import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import {
  ReportScreenContainer,
  MetadataRow,
  KeyPointsList,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getTriggerSummary } from '@/services/reports';
import type { TriggerReportParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function TriggerDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const openChat = useChatStore((state) => state.openChat);
  const { alertId, triggerId, role } = route.params as TriggerReportParams;
  const loadReport = useCallback(() => getTriggerSummary(alertId, triggerId, role), [alertId, triggerId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  return (
    <ReportScreenContainer
      title="Alert Trigger"
      onBack={() => navigation.goBack()}
      onChat={openChat}
      ctaActions={[
        {
          label: 'View Summary',
          onPress: () => navigation.push('AlertTriggerSummary', { alertId, triggerId, role }),
        },
        {
          label: 'Deep Dive',
          variant: 'secondary',
          onPress: () => navigation.push('AlertTriggerDeepDive', { alertId, triggerId, role }),
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
        <View style={[styles.triggerBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
          <Text style={[typePresets.labelXs, { color: colors.warning }]}>TRIGGER REASON</Text>
          <Text style={[typePresets.body, { color: colors.text, marginTop: spacing.xs }]}>
            {report.triggerReason}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text style={[typePresets.articleBody, { color: colors.text, marginTop: spacing.xl }]}>
          {report.summary}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <ChatEntryPoint contextLabel="alert" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}

const styles = StyleSheet.create({
  triggerBox: {
    marginTop: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
