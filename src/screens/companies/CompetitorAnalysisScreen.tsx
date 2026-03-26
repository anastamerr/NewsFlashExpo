import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ChevronRight, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { MetricCard } from '@/components/data/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_COMPANIES } from '@/constants/mockData';
import { formatNumber } from '@/utils/format';
import { getCompetitorWorkspace, type CompanyPeriod, type CompetitorMode } from '@/utils/companyIntelligence';
import { useChatStore } from '@/store/chatStore';

type Props = {
  companyAId?: string;
  companyBId?: string;
  onBack?: () => void;
  showHeader?: boolean;
};
type SelectorTarget = 'A' | 'B' | null;

const PERIODS: CompanyPeriod[] = ['30d', '90d', 'YTD'];
const MODES: { value: CompetitorMode; label: string }[] = [
  { value: 'market', label: 'Market View' },
  { value: 'narrative', label: 'Narrative View' },
];

function ComparisonBar({
  label,
  detail,
  aScore,
  bScore,
  aLabel,
  bLabel,
}: {
  label: string;
  detail: string;
  aScore: number;
  bScore: number;
  aLabel: string;
  bLabel: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricCopy}>
        <Text style={[typePresets.h3, { color: colors.text }]}>{label}</Text>
        <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
          {detail}
        </Text>
      </View>

      <View style={styles.metricBars}>
        <View style={styles.barRow}>
          <Text style={[typePresets.labelXs, { color: colors.primary, width: 46 }]}>{aLabel}</Text>
          <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${aScore}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[typePresets.monoSm, { color: colors.text, width: 36, textAlign: 'right' }]}>
            {Math.round(aScore)}
          </Text>
        </View>
        <View style={styles.barRow}>
          <Text style={[typePresets.labelXs, { color: colors.info, width: 46 }]}>{bLabel}</Text>
          <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.barFill, { width: `${bScore}%`, backgroundColor: colors.info }]} />
          </View>
          <Text style={[typePresets.monoSm, { color: colors.text, width: 36, textAlign: 'right' }]}>
            {Math.round(bScore)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SignalSection({ title, items }: { title: string; items: string[] }) {
  const { colors } = useTheme();

  return (
    <Card style={styles.signalCard}>
      <Text style={[typePresets.labelXs, { color: colors.primary }]}>{title.toUpperCase()}</Text>
      {items.map((item) => (
        <Text key={item} style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          {item}
        </Text>
      ))}
    </Card>
  );
}

export function CompetitorAnalysisScreen({
  companyAId: propCompanyAId,
  companyBId: propCompanyBId,
  onBack,
  showHeader = false,
}: Props = {}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const openChat = useChatStore((state) => state.openChat);
  const defaultCompanyA = propCompanyAId ?? MOCK_COMPANIES[0]?.id;
  const defaultCompanyB = propCompanyBId ?? MOCK_COMPANIES[1]?.id ?? MOCK_COMPANIES[0]?.id;
  const [companyAId, setCompanyAId] = useState(defaultCompanyA);
  const [companyBId, setCompanyBId] = useState(
    defaultCompanyB === defaultCompanyA ? MOCK_COMPANIES[1]?.id ?? defaultCompanyA : defaultCompanyB,
  );
  const [period, setPeriod] = useState<CompanyPeriod>('90d');
  const [mode, setMode] = useState<CompetitorMode>('market');
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget>(null);
  const [selectorQuery, setSelectorQuery] = useState('');

  useEffect(() => {
    const nextCompanyA = propCompanyAId ?? MOCK_COMPANIES[0]?.id;
    const nextCompanyBBase = propCompanyBId ?? MOCK_COMPANIES[1]?.id ?? nextCompanyA;
    const nextCompanyB = nextCompanyBBase === nextCompanyA
      ? MOCK_COMPANIES.find((company) => company.id !== nextCompanyA)?.id ?? nextCompanyBBase
      : nextCompanyBBase;

    setCompanyAId(nextCompanyA);
    setCompanyBId(nextCompanyB);
  }, [propCompanyAId, propCompanyBId]);

  const companyA = useMemo(
    () => MOCK_COMPANIES.find((company) => company.id === companyAId) ?? MOCK_COMPANIES[0],
    [companyAId],
  );
  const companyB = useMemo(
    () => MOCK_COMPANIES.find((company) => company.id === companyBId) ?? MOCK_COMPANIES[1] ?? MOCK_COMPANIES[0],
    [companyBId],
  );
  const workspace = useMemo(
    () => getCompetitorWorkspace(companyA, companyB, period, mode),
    [companyA, companyB, mode, period],
  );

  const selectorCandidates = useMemo(() => {
    const query = selectorQuery.trim().toLowerCase();
    const excludedId = selectorTarget === 'A' ? companyB.id : selectorTarget === 'B' ? companyA.id : null;

    return MOCK_COMPANIES.filter((company) => {
      const matchesQuery =
        query.length === 0 ||
        company.name.toLowerCase().includes(query) ||
        company.ticker.toLowerCase().includes(query) ||
        company.sector.toLowerCase().includes(query);

      return matchesQuery && company.id !== excludedId;
    });
  }, [companyA.id, companyB.id, selectorQuery, selectorTarget]);

  const closeSelector = useCallback(() => {
    setSelectorTarget(null);
    setSelectorQuery('');
  }, []);

  const handleSelectCompany = useCallback((selectedId: string) => {
    if (selectorTarget === 'A') {
      setCompanyAId(selectedId);
    } else if (selectorTarget === 'B') {
      setCompanyBId(selectedId);
    }

    closeSelector();
  }, [closeSelector, selectorTarget]);

  const handleAskAboutComparison = useCallback(() => {
    openChat(`Compare ${companyA.name} (${companyA.ticker}) against ${companyB.name} (${companyB.ticker}) over ${period}. Focus on ${mode === 'market' ? 'coverage, sentiment, and risk positioning.' : 'narrative control, momentum, and watch items.'}`);
  }, [companyA.name, companyA.ticker, companyB.name, companyB.ticker, mode, openChat, period]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader ? (
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={[typePresets.h3, { color: colors.text }]}>Competitor Analysis</Text>
          <View style={styles.headerSpacer} />
        </View>
      ) : null}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <GlassCard>
            <View style={styles.selectorRow}>
              <Pressable
                onPress={() => setSelectorTarget('A')}
                accessibilityRole="button"
                accessibilityLabel={`Select primary company, current ${companyA.name}`}
                style={({ pressed }) => [styles.selectorCard, { backgroundColor: colors.surface }, pressed && styles.pressed]}
              >
                <Text style={[typePresets.labelXs, { color: colors.primary }]}>PRIMARY</Text>
                <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={1}>
                  {companyA.name}
                </Text>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                  {companyA.ticker}
                </Text>
              </Pressable>

              <View style={[styles.vsBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[typePresets.label, { color: colors.primary }]}>VS</Text>
              </View>

              <Pressable
                onPress={() => setSelectorTarget('B')}
                accessibilityRole="button"
                accessibilityLabel={`Select comparison company, current ${companyB.name}`}
                style={({ pressed }) => [styles.selectorCard, { backgroundColor: colors.surface }, pressed && styles.pressed]}
              >
                <Text style={[typePresets.labelXs, { color: colors.info }]}>COMPARE</Text>
                <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={1}>
                  {companyB.name}
                </Text>
                <Text style={[typePresets.monoSm, { color: colors.textTertiary, marginTop: spacing.xxs }]}>
                  {companyB.ticker}
                </Text>
              </Pressable>
            </View>

            <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.lg }]}>
              {workspace.summaryTitle}
            </Text>
            <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {workspace.summaryText}
            </Text>

            <View style={styles.askWrap}>
              <Button
                label="Ask About Comparison"
                onPress={handleAskAboutComparison}
                icon={<MessageCircle size={16} color={colors.textInverse} strokeWidth={2} />}
                fullWidth
              />
            </View>
          </GlassCard>
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsRow}>
          {PERIODS.map((item) => (
            <Chip key={item} label={item} selected={period === item} onPress={() => setPeriod(item)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsRow}>
          {MODES.map((item) => (
            <Chip key={item.value} label={item.label} selected={mode === item.value} onPress={() => setMode(item.value)} />
          ))}
        </ScrollView>

        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsStrip}>
            <MetricCard label={companyA.ticker} value={workspace.scoreA} trend={workspace.scoreGap} format={formatNumber} />
            <MetricCard label={companyB.ticker} value={workspace.scoreB} trend={-workspace.scoreGap} format={formatNumber} />
            <MetricCard label="GAP" value={workspace.scoreGap} trend={workspace.scoreGap} format={formatNumber} />
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
            Sentiment Trend
          </Text>
          <Card>
            <LineChart series={workspace.sentimentSeries} height={220} xLabels={workspace.chartLabels} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Coverage Trend
          </Text>
          <Card>
            <LineChart series={workspace.coverageSeries} height={220} xLabels={workspace.chartLabels} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Share of Voice
          </Text>
          <Card>
            <PieChart
              data={workspace.pieData}
              size={220}
              innerRadius={70}
              centerLabel={workspace.pieCenterLabel}
              centerValue={workspace.pieCenterValue}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Weighted Scorecard
          </Text>
          <Card>
            {workspace.metrics.map((metric, index) => (
              <View
                key={metric.key}
                style={[
                  styles.scoreRow,
                  {
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.borderSubtle,
                  },
                ]}
              >
                <ComparisonBar
                  label={metric.label}
                  detail={metric.detail}
                  aScore={metric.aScore}
                  bScore={metric.bScore}
                  aLabel={companyA.ticker}
                  bLabel={companyB.ticker}
                />
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Signals
          </Text>
          <SignalSection title={workspace.opportunities.title} items={workspace.opportunities.items} />
          <SignalSection title={workspace.risks.title} items={workspace.risks.items} />
          <SignalSection title={workspace.neutrals.title} items={workspace.neutrals.items} />
        </Animated.View>
      </ScrollView>

      <BottomSheetModal
        visible={selectorTarget !== null}
        title={selectorTarget === 'A' ? 'Select Primary Company' : 'Select Comparison Company'}
        description="Choose the company you want to stack against the current peer set."
        onClose={closeSelector}
      >
        <SearchBar
          value={selectorQuery}
          onChangeText={setSelectorQuery}
          placeholder="Search companies, tickers, or sectors..."
        />
        <View style={styles.selectorList}>
          {selectorCandidates.map((company) => (
            <Pressable
              key={company.id}
              onPress={() => handleSelectCompany(company.id)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${company.name}`}
              style={({ pressed }) => [
                styles.sheetOption,
                { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.sheetOptionCopy}>
                <Text style={[typePresets.h3, { color: colors.text }]}>{company.name}</Text>
                <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                  {company.ticker} | {company.sector}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      </BottomSheetModal>
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
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: { paddingHorizontal: spacing.base },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectorCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askWrap: {
    marginTop: spacing.lg,
  },
  controlsRow: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingRight: spacing.base,
    marginTop: spacing.base,
  },
  metricsStrip: {
    paddingRight: spacing.base,
    marginTop: spacing.lg,
  },
  scoreRow: {
    paddingVertical: spacing.sm,
  },
  metricRow: {
    gap: spacing.md,
  },
  metricCopy: {
    marginBottom: spacing.sm,
  },
  metricBars: {
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
  signalCard: {
    marginBottom: spacing.sm,
  },
  selectorList: {
    gap: spacing.sm,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.md,
  },
  sheetOptionCopy: {
    flex: 1,
    paddingRight: spacing.base,
  },
  pressed: {
    opacity: 0.8,
  },
});
