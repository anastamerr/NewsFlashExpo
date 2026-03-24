import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
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

const SEVERITY_VARIANT = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
} as const;

export function CrisisDetailScreen() {
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
      title="Crisis Report"
      onBack={() => navigation.goBack()}
      onChat={openChat}
      ctaActions={[
        {
          label: 'View Summary',
          onPress: () => navigation.push('CrisisSummary', { crisisId, role }),
        },
        {
          label: 'Deep Dive',
          variant: 'secondary',
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
        <View style={styles.severityRow}>
          <Badge
            label={report.severity.toUpperCase()}
            variant={SEVERITY_VARIANT[report.severity]}
            dot
          />
        </View>
        <Text style={[typePresets.displayMd, { color: colors.text, marginTop: spacing.sm }]}>
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
        <View style={styles.entitiesSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.sm }]}>
            AFFECTED ENTITIES
          </Text>
          <BadgeStrip tags={report.affectedEntities} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <ChatEntryPoint contextLabel="crisis" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}

const styles = StyleSheet.create({
  severityRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  entitiesSection: {
    marginTop: spacing.xl,
  },
});
