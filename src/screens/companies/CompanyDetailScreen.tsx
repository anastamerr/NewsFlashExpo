import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Building2, MessageCircle, ArrowRightLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/data/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_COMPANIES } from '@/constants/mockData';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { formatNumber, formatSentiment } from '@/utils/format';
import { getCompanyDetailWorkspace } from '@/utils/companyIntelligence';
import { useChatStore } from '@/store/chatStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyDetail'>;

export function CompanyDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const openChat = useChatStore((state) => state.openChat);
  const company = useMemo(
    () => MOCK_COMPANIES.find((item) => item.id === route.params.companyId) ?? MOCK_COMPANIES[0],
    [route.params.companyId],
  );
  const workspace = useMemo(() => getCompanyDetailWorkspace(company), [company]);
  const sentimentVariant = company.sentiment === 'positive' ? 'success' : company.sentiment === 'negative' ? 'danger' : 'warning';

  const handleOpenArticle = useCallback((articleId: string) => {
    navigation.navigate('Main', {
      screen: 'TodayTab',
      params: {
        screen: 'ArticleDetail',
        params: { articleId },
      },
    });
  }, [navigation]);

  const handleAskAboutCompany = useCallback(() => {
    openChat(`Give me a concise intelligence brief on ${company.name} (${company.ticker}), including sentiment drivers, current risks, and watch items.`);
  }, [company.name, company.ticker, openChat]);

  const handleComparePeers = useCallback(() => {
    navigation.navigate('CompetitorAnalysis', {
      companyAId: company.id,
      companyBId: workspace.peerCompanies[0]?.id,
    });
  }, [company.id, navigation, workspace.peerCompanies]);

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
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={[styles.companyIcon, { backgroundColor: colors.primary + '15' }]}>
            <Building2 size={32} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[typePresets.displaySm, { color: colors.text, marginTop: spacing.base }]}>
            {company.name}
          </Text>
          <View style={styles.tickerRow}>
            <Text style={[typePresets.mono, { color: colors.textSecondary }]}>{company.ticker}</Text>
            <Badge label={company.sector} variant="primary" small />
            <Badge label={company.sentiment} variant={sentimentVariant} dot />
          </View>
          <Text style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {company.description}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <View style={styles.actionRow}>
            <View style={styles.actionPrimary}>
              <Button
                label="Ask About Company"
                onPress={handleAskAboutCompany}
                icon={<MessageCircle size={16} color={colors.textInverse} strokeWidth={2} />}
                fullWidth
              />
            </View>
            <View style={styles.actionSecondary}>
              <Button
                label="Compare Peers"
                onPress={handleComparePeers}
                variant="secondary"
                icon={<ArrowRightLeft size={16} color={colors.primary} strokeWidth={2} />}
                fullWidth
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {workspace.metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                trend={metric.trend}
                format={metric.mode === 'sentiment' ? formatSentiment : formatNumber}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.text }]}>{company.articleCount}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>ARTICLES</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.primary }]}>{workspace.peerCompanies.length}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>PEERS</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.text }]}>{workspace.momentumLabel}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>MOMENTUM</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Sentiment Trend
          </Text>
          <Card>
            <LineChart series={workspace.sentimentSeries} height={220} xLabels={workspace.chartLabels} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Coverage Timeline
          </Text>
          <Card>
            <LineChart series={workspace.coverageSeries} height={220} xLabels={workspace.chartLabels} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Key Topics</Text>
          <View style={styles.tagsRow}>
            {company.tags.map((tag) => (
              <Chip key={tag.name} label={tag.name} count={tag.count} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Related Entities</Text>
          <View style={styles.tagsRow}>
            {company.relatedEntities.map((entity) => (
              <Chip key={entity} label={entity} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Key Figures</Text>
          {company.keyFigures.map((figure) => (
            <Text key={figure} style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {figure}
            </Text>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(440).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Recent Highlights</Text>
          {company.highlights.map((highlight) => (
            <Card key={highlight} style={styles.highlightCard}>
              <Text style={[typePresets.body, { color: colors.text }]}>{highlight}</Text>
            </Card>
          ))}
        </Animated.View>

        {workspace.peerCompanies.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(480).springify()}>
            <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Peer Set</Text>
            <View style={styles.tagsRow}>
              {workspace.peerCompanies.map((peer) => (
                <Chip
                  key={peer.id}
                  label={peer.ticker}
                  onPress={() => navigation.navigate('CompetitorAnalysis', { companyAId: company.id, companyBId: peer.id })}
                />
              ))}
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(520).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Recent Coverage
          </Text>
          {workspace.relatedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={(selectedArticle) => handleOpenArticle(selectedArticle.id)}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
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
  companyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionPrimary: {
    flex: 1.2,
  },
  actionSecondary: {
    flex: 1,
  },
  metricsRow: {
    paddingRight: spacing.base,
    marginTop: spacing.lg,
  },
  statsCard: { marginTop: spacing.sm },
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  highlightCard: {
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
