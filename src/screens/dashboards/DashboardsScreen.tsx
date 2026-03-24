import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, TrendingUp, PieChart, Activity, Radio, Target, ArrowRight } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { GlassCard } from '@/components/ui/GlassCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { MetricCard } from '@/components/data/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart as DistributionChart } from '@/components/charts/PieChart';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_ALERTS, MOCK_STATS } from '@/constants/mockData';
import { getActiveCrisis, getTopTrigger } from '@/utils/alertReports';
import { formatNumber, formatSentiment, timeAgo } from '@/utils/format';
import {
  ANALYTICS_DOMAINS,
  getAnalyticsTags,
  getAnalyticsWorkspace,
  type AnalyticsDomain,
  type AnalyticsPeriod,
} from '@/utils/analyticsWorkspace';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardsStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<DashboardsStackParamList, 'Dashboards'>;

class AnalyticsRenderBoundary extends React.PureComponent<
  { children: React.ReactNode; fallback: React.ReactNode; boundaryKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Readonly<{ boundaryKey: string }>) {
    if (prevProps.boundaryKey !== this.props.boundaryKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const PERIODS: AnalyticsPeriod[] = ['24h', '7d', '30d', '90d'];

const DASHBOARD_TILES = [
  { id: 'sentiment', title: 'Sentiment Trends', description: 'Track sentiment over time', icon: TrendingUp, color: '#8aa8ff' },
  { id: 'sources', title: 'Source Distribution', description: 'Article volume by source', icon: PieChart, color: '#00f700' },
  { id: 'topics', title: 'Topic Popularity', description: 'Trending topics analysis', icon: BarChart3, color: '#00eff0' },
  { id: 'crisis', title: 'Crisis Detection', description: 'Anomaly monitoring', icon: Activity, color: '#ff6b6b' },
  { id: 'coverage', title: 'Coverage Share', description: 'Company coverage analysis', icon: Radio, color: '#ff9f43' },
  { id: 'performance', title: 'Topic Performance', description: 'Impact scoring', icon: Target, color: '#8aa8ff' },
];

export function DashboardsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [domain, setDomain] = useState<AnalyticsDomain>('overview');
  const [tagQuery, setTagQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const activeCrisis = useMemo(() => getActiveCrisis(MOCK_ALERTS), []);
  const topTrigger = useMemo(() => getTopTrigger(MOCK_ALERTS), []);
  const analyticsTags = useMemo(() => getAnalyticsTags(), []);
  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();

    if (!query) {
      return analyticsTags.slice(0, 10);
    }

    return analyticsTags
      .filter((tag) => tag.toLowerCase().includes(query))
      .slice(0, 10);
  }, [analyticsTags, tagQuery]);
  const workspace = useMemo(() => {
    try {
      return getAnalyticsWorkspace(domain, period, selectedTags);
    } catch {
      return null;
    }
  }, [domain, period, selectedTags]);
  const workspaceBoundaryKey = useMemo(
    () => `${domain}:${period}:${selectedTags.join('|')}`,
    [domain, period, selectedTags],
  );
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
  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      if (current.length >= 3) {
        return [...current.slice(1), tag];
      }

      return [...current, tag];
    });
  }, []);
  const handleResetWorkspace = useCallback(() => {
    setDomain('overview');
    setTagQuery('');
    setSelectedTags([]);
  }, []);

  return (
    <ScreenContainer>
      <View style={[styles.header, { paddingTop: spacing.base }]}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Analytics</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll} contentContainerStyle={styles.periodRow}>
        {PERIODS.map((p) => (
          <Chip key={p} label={p} selected={period === p} onPress={() => setPeriod(p)} />
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[typePresets.monoLg, { color: colors.text }]}>{MOCK_STATS.totalArticles}</Text>
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>ARTICLES</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typePresets.monoLg, { color: colors.sentimentPositive }]}>+{MOCK_STATS.avgSentiment.toFixed(1)}</Text>
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>AVG SENTIMENT</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typePresets.monoLg, { color: colors.text }]}>{MOCK_STATS.topSources.length}</Text>
              <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>SOURCES</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {(activeCrisis || topTrigger) ? (
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Section title="Live Intelligence">
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

      <Animated.View entering={FadeInDown.delay(180).springify()}>
        <Section title="Workspace">
          {workspace ? (
            <>
              <Text style={[typePresets.h2, { color: colors.text }]}>
                {workspace.title}
              </Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                {workspace.description}
              </Text>
            </>
          ) : (
            <Card style={styles.workspaceCard}>
              <Text style={[typePresets.h3, { color: colors.text }]}>Analytics workspace unavailable</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                The analytics widgets failed to initialize. Change the filter or reopen the tab to retry.
              </Text>
            </Card>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.domainScroll}
            contentContainerStyle={styles.periodRow}
          >
            {ANALYTICS_DOMAINS.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                selected={domain === item.id}
                onPress={() => setDomain(item.id)}
              />
            ))}
          </ScrollView>

          <View style={styles.searchWrap}>
            <SearchBar
              value={tagQuery}
              onChangeText={setTagQuery}
              placeholder="Search tags, companies, or topics..."
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagScroll}
            contentContainerStyle={styles.periodRow}
          >
            {filteredTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => handleToggleTag(tag)}
              />
            ))}
            {(selectedTags.length > 0 || domain !== 'overview') ? (
              <Pressable onPress={handleResetWorkspace} style={({ pressed }) => [styles.resetWorkspace, pressed && styles.pressed]}>
                <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>Reset</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {(workspace?.kpis ?? []).map((kpi) => (
              <MetricCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                trend={kpi.trend}
                format={kpi.mode === 'sentiment' ? formatSentiment : formatNumber}
              />
            ))}
          </ScrollView>

          {workspace ? (
            <AnalyticsRenderBoundary
              boundaryKey={workspaceBoundaryKey}
              fallback={(
                <Card style={styles.workspaceCard}>
                  <Text style={[typePresets.h3, { color: colors.text }]}>Analytics widgets unavailable</Text>
                  <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                    One of the analytics widgets failed to render. Adjust the active filters or reopen the tab to retry.
                  </Text>
                </Card>
              )}
            >
              <>
                <Card style={styles.workspaceCard}>
                  <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.sm }]}>
                    SIGNAL TREND
                  </Text>
                  <LineChart
                    series={workspace.lineSeries}
                    height={220}
                    xLabels={workspace.lineLabels}
                  />
                </Card>

                <Card style={styles.workspaceCard}>
                  <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.sm }]}>
                    COVERAGE COMPARISON
                  </Text>
                  <BarChart
                    data={workspace.barData}
                    height={210}
                    color={colors.primary}
                    xLabels={workspace.barLabels}
                  />
                </Card>

                <Card style={styles.workspaceCard}>
                  <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.sm }]}>
                    DISTRIBUTION
                  </Text>
                  <DistributionChart
                    data={workspace.pieData}
                    size={210}
                    innerRadius={68}
                    centerLabel={workspace.pieCenterLabel}
                    centerValue={workspace.pieCenterValue}
                  />
                </Card>

                <Card style={styles.workspaceCard}>
                  <View style={styles.comparisonHeader}>
                    <Text style={[typePresets.labelXs, { color: colors.primary }]}>COMPARE SET</Text>
                    <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>
                      {selectedTags.length > 0 ? `${selectedTags.length} selected` : 'Auto-ranked'}
                    </Text>
                  </View>
                  {workspace.comparisonRows.map((row, index) => (
                    <View
                      key={row.label}
                      style={[
                        styles.comparisonRow,
                        {
                          borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                          borderTopColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <View style={styles.comparisonCopy}>
                        <Text style={[typePresets.h3, { color: colors.text }]} numberOfLines={1}>
                          {row.label}
                        </Text>
                        <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                          {row.mentions} mentions
                        </Text>
                      </View>
                      <View style={styles.comparisonMetric}>
                        <Text style={[typePresets.monoSm, { color: row.sentiment >= 0 ? colors.sentimentPositive : colors.sentimentNegative }]}>
                          {formatSentiment(row.sentiment)}
                        </Text>
                        <Text style={[typePresets.labelXs, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                          {row.momentum >= 0 ? '+' : ''}{row.momentum.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            </AnalyticsRenderBoundary>
          ) : null}
        </Section>
      </Animated.View>

      <Section title="Dashboards">
        <View style={styles.tilesGrid}>
          {DASHBOARD_TILES.map((tile, index) => (
            <Animated.View
              key={tile.id}
              entering={FadeInDown.delay(260 + index * 60).springify()}
              style={styles.tileWrapper}
            >
              <Card variant="elevated" onPress={() => navigation.navigate('DashboardDetail', { dashboardId: tile.id, title: tile.title })} style={styles.tile}>
                <View style={[styles.tileIcon, { backgroundColor: tile.color + '18' }]}>
                  <tile.icon size={22} color={tile.color} strokeWidth={1.8} />
                </View>
                <Text style={[typePresets.h3, styles.tileTitle, { color: colors.text }]}>
                  {tile.title}
                </Text>
                <Text
                  style={[typePresets.bodySm, styles.tileDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {tile.description}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>
      </Section>

      <Animated.View entering={FadeInDown.delay(620).springify()}>
        <Section title="Top Sources">
          {MOCK_STATS.topSources.map((source, index) => (
            <View key={source.name} style={styles.sourceRow}>
              <Text style={[typePresets.body, { color: colors.text, flex: 1 }]}>{source.name}</Text>
              <View style={[styles.sourceBar, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.sourceBarFill,
                    {
                      width: `${(source.count / MOCK_STATS.topSources[0].count) * 100}%`,
                      backgroundColor: colors.primary + (index === 0 ? 'ff' : '80'),
                    },
                  ]}
                />
              </View>
              <Text style={[typePresets.monoSm, { color: colors.textSecondary, width: 40, textAlign: 'right' }]}>
                {source.count}
              </Text>
            </View>
          ))}
        </Section>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.sm,
  },
  periodScroll: {
    flexGrow: 0,
    marginBottom: spacing.base,
  },
  periodRow: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  domainScroll: {
    flexGrow: 0,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    marginBottom: spacing.sm,
  },
  tagScroll: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  resetWorkspace: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  metricsRow: {
    paddingRight: spacing.base,
    marginBottom: spacing.base,
  },
  workspaceCard: {
    marginBottom: spacing.sm,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  comparisonCopy: {
    flex: 1,
    paddingRight: spacing.base,
  },
  comparisonMetric: {
    alignItems: 'flex-end',
  },
  statsCard: {
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
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tileWrapper: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  tile: {
    minHeight: 156,
    justifyContent: 'flex-start',
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    marginTop: spacing.md,
    minHeight: 44,
  },
  tileDescription: {
    marginTop: spacing.xxs,
    minHeight: 36,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  sourceBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pressed: {
    opacity: 0.8,
  },
});
