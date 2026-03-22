import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, TrendingUp, PieChart, Activity, Radio, Target } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_STATS } from '@/constants/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardsStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<DashboardsStackParamList, 'Dashboards'>;

const PERIODS = ['24h', '7d', '30d', '90d'] as const;

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
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<string>('7d');

  return (
    <ScreenContainer>
      <View style={[styles.header, { paddingTop: spacing.base }]}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Analytics</Text>
      </View>

      {/* Period Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
        {PERIODS.map((p) => (
          <Chip key={p} label={p} selected={period === p} onPress={() => setPeriod(p)} />
        ))}
      </ScrollView>

      {/* Quick Stats */}
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

      {/* Dashboard Tiles */}
      <Section title="Dashboards">
        <View style={styles.tilesGrid}>
          {DASHBOARD_TILES.map((tile, index) => (
            <Animated.View
              key={tile.id}
              entering={FadeInDown.delay(200 + index * 60).springify()}
              style={styles.tileWrapper}
            >
              <Card variant="elevated" onPress={() => navigation.navigate('DashboardDetail', { dashboardId: tile.id, title: tile.title })} style={styles.tile}>
                <View style={[styles.tileIcon, { backgroundColor: tile.color + '18' }]}>
                  <tile.icon size={22} color={tile.color} strokeWidth={1.8} />
                </View>
                <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.md }]}>
                  {tile.title}
                </Text>
                <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                  {tile.description}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>
      </Section>

      {/* Top Sources */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
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
  periodRow: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statsCard: {
    marginBottom: spacing.sm,
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
    width: '48.5%',
  },
  tile: {
    minHeight: 130,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});
