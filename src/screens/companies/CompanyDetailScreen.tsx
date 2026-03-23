import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, Building2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_COMPANIES, MOCK_ARTICLES } from '@/constants/mockData';
import { ArticleCard } from '@/components/lists/ArticleCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyDetail'>;

export function CompanyDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const company = MOCK_COMPANIES.find((c) => c.id === route.params.companyId) ?? MOCK_COMPANIES[0];
  const sentimentVariant = company.sentiment === 'positive' ? 'success' : company.sentiment === 'negative' ? 'danger' : 'warning';
  const relatedArticles = MOCK_ARTICLES.slice(0, 3);

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
        {/* Company Header */}
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

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.text }]}>{company.articleCount}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>ARTICLES</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.text }]}>{company.tags.length}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>TOPICS</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[typePresets.monoLg, { color: colors.text }]}>{company.relatedEntities.length}</Text>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>ENTITIES</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Tags */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Key Topics</Text>
          <View style={styles.tagsRow}>
            {company.tags.map((tag) => (
              <Chip key={tag.name} label={tag.name} count={tag.count} />
            ))}
          </View>
        </Animated.View>

        {/* Key Figures */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Key Figures</Text>
          {company.keyFigures.map((figure) => (
            <Text key={figure} style={[typePresets.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {figure}
            </Text>
          ))}
        </Animated.View>

        {/* Highlights */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl }]}>Recent Highlights</Text>
          {company.highlights.map((hl, i) => (
            <Card key={i} style={{ marginTop: spacing.sm }}>
              <Text style={[typePresets.body, { color: colors.text }]}>{hl}</Text>
            </Card>
          ))}
        </Animated.View>

        {/* Recent Coverage */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            Recent Coverage
          </Text>
          {relatedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} onPress={() => {}} />
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
  },
  statsCard: { marginTop: spacing.xl },
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
  pressed: {
    opacity: 0.8,
  },
});
