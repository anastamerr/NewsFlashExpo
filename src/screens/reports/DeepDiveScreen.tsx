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
  BadgeStrip,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getDeepDive } from '@/services/reports';
import type { ReportDeepDiveParams } from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

export function DeepDiveScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const openChat = useChatStore((state) => state.openChat);
  const { articleId, role } = route.params as ReportDeepDiveParams;
  const loadReport = useCallback(() => getDeepDive(articleId, role), [articleId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);

  return (
    <ReportScreenContainer title="Deep Dive" onBack={() => navigation.goBack()} onChat={openChat}>
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

      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <KeyPointsList points={report.keyPoints} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <RecommendationList items={report.recommendations} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900).springify()}>
        <BadgeStrip tags={report.metadata.tags} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1000).springify()}>
        <ChatEntryPoint contextLabel="report" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}
