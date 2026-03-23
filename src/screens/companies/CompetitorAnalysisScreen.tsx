import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_COMPANIES } from '@/constants/mockData';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitorAnalysis'>;

const METRICS = [
  { key: 'sentiment', label: 'Sentiment Score' },
  { key: 'coverage', label: 'Coverage Share' },
  { key: 'momentum', label: 'Sentiment Momentum' },
  { key: 'source_quality', label: 'Source Quality' },
  { key: 'risk', label: 'Risk Exposure' },
];

export function CompetitorAnalysisScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [companyA] = useState(MOCK_COMPANIES[0]);
  const [companyB] = useState(MOCK_COMPANIES[1]);

  // Simulated scores
  const scoresA = [65, 42, 55, 70, 38];
  const scoresB = [78, 58, 72, 82, 25];

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
        <Text style={[typePresets.h3, { color: colors.text }]}>Competitor Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* Company Comparison Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard>
            <View style={styles.vsRow}>
              <View style={styles.vsCompany}>
                <Text style={[typePresets.h3, { color: colors.text, textAlign: 'center' }]} numberOfLines={1}>
                  {companyA.name}
                </Text>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>{companyA.ticker}</Text>
              </View>
              <View style={[styles.vsBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[typePresets.label, { color: colors.primary }]}>VS</Text>
              </View>
              <View style={styles.vsCompany}>
                <Text style={[typePresets.h3, { color: colors.text, textAlign: 'center' }]} numberOfLines={1}>
                  {companyB.name}
                </Text>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>{companyB.ticker}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Metric Comparisons */}
        {METRICS.map((metric, index) => (
          <Animated.View key={metric.key} entering={FadeInDown.delay(200 + index * 60).springify()}>
            <Card style={styles.metricCard}>
              <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                {metric.label}
              </Text>
              <View style={styles.barComparison}>
                <View style={styles.barRow}>
                  <Text style={[typePresets.monoSm, { color: colors.primary, width: 32 }]}>
                    {scoresA[index]}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${scoresA[index]}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.barRow}>
                  <Text style={[typePresets.monoSm, { color: colors.info, width: 32 }]}>
                    {scoresB[index]}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${scoresB[index]}%`, backgroundColor: colors.info },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
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
  content: { paddingHorizontal: spacing.base },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vsCompany: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  vsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  metricCard: {
    marginTop: spacing.sm,
  },
  barComparison: {
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
