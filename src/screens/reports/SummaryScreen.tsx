import React, { useCallback } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import {
  ReportScreenContainer,
  MetadataRow,
  KeyPointsList,
  RecommendationList,
  BadgeStrip,
  ChatEntryPoint,
  ReportStateView,
} from '@/components/report';
import { useReportResource } from '@/hooks/useReportResource';
import { getArticleSummary } from '@/services/reports';
import type {
  BrowseStackParamList,
  ReportSummaryParams,
  TodayStackParamList,
  WatchlistStackParamList,
} from '@/types/navigation';
import { useChatStore } from '@/store/chatStore';

type ReportDeepDiveNavigationParamList =
  TodayStackParamList
  & BrowseStackParamList
  & WatchlistStackParamList;

export function SummaryScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<ReportDeepDiveNavigationParamList>>();
  const openChat = useChatStore((state) => state.openChat);
  const { articleId, role, deepDiveRoute } = route.params as ReportSummaryParams;
  const loadReport = useCallback(() => getArticleSummary(articleId, role), [articleId, role]);
  const {
    data: report,
    error,
    isLoading,
    reload,
  } = useReportResource(loadReport);
  const handleOpenDeepDive = useCallback(() => {
    if (!deepDiveRoute) {
      return;
    }

    navigation.push(deepDiveRoute, { articleId, role });
  }, [articleId, deepDiveRoute, navigation, role]);

  return (
    <ReportScreenContainer
      title="Summary"
      onBack={() => navigation.goBack()}
      onChat={openChat}
      ctaActions={deepDiveRoute ? [
        {
          label: 'Read Deep Dive',
          onPress: handleOpenDeepDive,
        },
      ] : undefined}
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
        <RecommendationList items={report.recommendations} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <BadgeStrip tags={report.metadata.tags} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <ChatEntryPoint contextLabel="article" onPress={openChat} />
      </Animated.View>
        </>
      )}
    </ReportScreenContainer>
  );
}
