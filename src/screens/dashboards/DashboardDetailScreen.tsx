import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Activity, Radio } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { SentimentGauge } from '@/components/charts/SentimentGauge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Section } from '@/components/layout/Section';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_ALERTS, MOCK_STATS } from '@/constants/mockData';
import { getActiveCrisis, getTopTrigger } from '@/utils/alertReports';
import { timeAgo } from '@/utils/format';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardsStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<DashboardsStackParamList, 'DashboardDetail'>;

const SENTIMENT_TREND = [
  { x: 0, y: 2.1 },
  { x: 1, y: 1.8 },
  { x: 2, y: 2.5 },
  { x: 3, y: 1.2 },
  { x: 4, y: 3.1 },
  { x: 5, y: 2.8 },
  { x: 6, y: 3.5 },
];

const NEGATIVE_TREND = [
  { x: 0, y: -1.5 },
  { x: 1, y: -2.1 },
  { x: 2, y: -1.8 },
  { x: 3, y: -3.2 },
  { x: 4, y: -2.0 },
  { x: 5, y: -1.3 },
  { x: 6, y: -1.7 },
];

const VOLUME_DATA = [
  { x: 0, y: 145 },
  { x: 1, y: 178 },
  { x: 2, y: 162 },
  { x: 3, y: 201 },
  { x: 4, y: 189 },
  { x: 5, y: 215 },
  { x: 6, y: 198 },
];

const CATEGORY_DATA = [
  { value: 342, label: 'Technology', color: '#8aa8ff' },
  { value: 289, label: 'Economics', color: '#00f700' },
  { value: 256, label: 'Finance', color: '#00eff0' },
  { value: 198, label: 'Healthcare', color: '#ff9f43' },
  { value: 167, label: 'Energy', color: '#ff6b6b' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DashboardDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const title = route.params.title;
  const dashboardId = route.params.dashboardId;
  const [period, setPeriod] = useState('7d');
  const activeCrisis = useMemo(() => getActiveCrisis(MOCK_ALERTS), []);
  const topTrigger = useMemo(() => getTopTrigger(MOCK_ALERTS), []);
  const handleOpenCrisis = useCallback(() => {
    if (!activeCrisis) {
      return;
    }

    navigation.navigate('CrisisDetail', { crisisId: activeCrisis.id });
  }, [activeCrisis, navigation]);
  const handleOpenTrigger = useCallback(() => {
    if (!topTrigger) {
      return;
    }

    navigation.navigate('AlertTriggerDetail', {
      alertId: topTrigger.id,
      triggerId: topTrigger.id,
    });
  }, [navigation, topTrigger]);
  const sectionTitle = dashboardId === 'crisis' ? 'Crisis Launches' : 'Related Intelligence';

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
        <Text style={[typePresets.h3, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
          {['24h', '7d', '30d', '90d'].map((p) => (
            <Chip key={p} label={p} selected={period === p} onPress={() => setPeriod(p)} />
          ))}
        </ScrollView>

        {(activeCrisis || topTrigger) ? (
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Section title={sectionTitle}>
              <View style={styles.intelligenceStack}>
                {activeCrisis ? (
                  <Pressable
                    onPress={handleOpenCrisis}
                    accessibilityRole="button"
                    accessibilityLabel={`Open crisis report for ${activeCrisis.title}`}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <GlassCard style={{ ...styles.intelligenceCard, borderColor: colors.danger + '35' }}>
                      <View style={styles.intelligenceHeader}>
                        <View style={[styles.intelligenceBadge, { backgroundColor: colors.danger + '14' }]}>
                          <Activity size={14} color={colors.danger} strokeWidth={2.2} />
                          <Text style={[typePresets.labelXs, { color: colors.danger }]}>ACTIVE CRISIS</Text>
                        </View>
                        <ArrowRight size={16} color={colors.textTertiary} strokeWidth={2} />
                      </View>
                      <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={2}>
                        {activeCrisis.title}
                      </Text>
                      <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
                        {activeCrisis.message}
                      </Text>
                      <Text style={[typePresets.labelXs, { color: colors.textTertiary, marginTop: spacing.sm }]}>
                        {timeAgo(activeCrisis.createdAt)}
                      </Text>
                    </GlassCard>
                  </Pressable>
                ) : null}

                {topTrigger ? (
                  <Card variant="outlined" onPress={handleOpenTrigger} style={styles.intelligenceCard}>
                    <View style={styles.intelligenceHeader}>
                      <View style={[styles.intelligenceBadge, { backgroundColor: colors.primary + '10' }]}>
                        <Radio size={14} color={colors.primary} strokeWidth={2.2} />
                        <Text style={[typePresets.labelXs, { color: colors.primary }]}>TOP TRIGGER</Text>
                      </View>
                      <ArrowRight size={16} color={colors.textTertiary} strokeWidth={2} />
                    </View>
                    <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={2}>
                      {topTrigger.title}
                    </Text>
                    <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
                      {topTrigger.message}
                    </Text>
                    <Text style={[typePresets.labelXs, { color: colors.textTertiary, marginTop: spacing.sm }]}>
                      {topTrigger.severity} | {timeAgo(topTrigger.createdAt)}
                    </Text>
                  </Card>
                ) : null}
              </View>
            </Section>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Section title="Sentiment Breakdown">
            <SentimentGauge
              positive={MOCK_STATS.sentimentBreakdown.positive}
              neutral={MOCK_STATS.sentimentBreakdown.neutral}
              negative={MOCK_STATS.sentimentBreakdown.negative}
              height={10}
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Section title="Sentiment Trend">
            <Card>
              <LineChart
                series={[
                  { data: SENTIMENT_TREND, color: colors.sentimentPositive, label: 'Positive' },
                  { data: NEGATIVE_TREND, color: colors.sentimentNegative, label: 'Negative' },
                ]}
                height={220}
                xLabels={DAYS}
              />
            </Card>
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Section title="Article Volume">
            <Card>
              <BarChart
                data={VOLUME_DATA}
                height={200}
                color={colors.primary}
                xLabels={DAYS}
              />
            </Card>
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Section title="Content by Category">
            <Card>
              <PieChart
                data={CATEGORY_DATA}
                size={200}
                innerRadius={65}
                centerLabel="TOTAL"
                centerValue={CATEGORY_DATA.reduce((s, d) => s + d.value, 0).toString()}
              />
            </Card>
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Section title="Trending Topics">
            {MOCK_STATS.trendingTopics.map((topic, i) => (
              <View key={topic.topic} style={styles.topicRow}>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary, width: 20 }]}>
                  {i + 1}
                </Text>
                <Text style={[typePresets.body, { color: colors.text, flex: 1 }]}>
                  {topic.topic}
                </Text>
                <View style={[styles.topicBarWrapper, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.topicBar,
                      {
                        width: `${(topic.count / MOCK_STATS.trendingTopics[0].count) * 100}%`,
                        backgroundColor:
                          topic.trend === 'up' ? colors.sentimentPositive
                          : topic.trend === 'down' ? colors.sentimentNegative
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[typePresets.monoSm, { color: colors.textSecondary, width: 36, textAlign: 'right' }]}>
                  {topic.count}
                </Text>
              </View>
            ))}
          </Section>
        </Animated.View>
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.base,
  },
  periodRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  intelligenceStack: {
    gap: spacing.sm,
  },
  intelligenceCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  intelligenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intelligenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  topicBarWrapper: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topicBar: {
    height: '100%',
    borderRadius: 3,
  },
  pressed: {
    opacity: 0.8,
  },
});
