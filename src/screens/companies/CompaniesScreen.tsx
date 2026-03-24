import React, { memo, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Building2, ArrowRightLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useDebounce } from '@/hooks/useDebounce';
import { MOCK_COMPANIES } from '@/constants/mockData';
import { formatNumber } from '@/utils/format';
import { getCompanyDirectorySummary, getCompanySectors } from '@/utils/companyIntelligence';
import type { Company } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Companies'>;

const CompanyCardItem = memo(function CompanyCardItem({
  item,
  onPressCompany,
}: {
  item: Company;
  onPressCompany: (company: Company) => void;
}) {
  const { colors } = useTheme();
  const sentimentVariant = item.sentiment === 'positive' ? 'success' : item.sentiment === 'negative' ? 'danger' : 'warning';
  const handlePress = useCallback(() => {
    onPressCompany(item);
  }, [item, onPressCompany]);

  return (
    <Card variant="elevated" onPress={handlePress} style={styles.companyCard}>
      <View style={[styles.companyIcon, { backgroundColor: colors.primary + '15' }]}>
        <Building2 size={24} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.md }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[typePresets.monoSm, { color: colors.textTertiary, marginTop: 2 }]}>
        {item.ticker}
      </Text>
      <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={1}>
        {item.sector}
      </Text>
      <View style={styles.companyMeta}>
        <Badge label={item.sentiment} variant={sentimentVariant} small />
        <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>
          {item.articleCount} articles
        </Text>
      </View>
    </Card>
  );
});

export function CompaniesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const debouncedSearch = useDebounce(search);
  const sectors = useMemo(() => getCompanySectors(), []);

  const filtered = useMemo(() => {
    return MOCK_COMPANIES.filter((company) => {
      const query = debouncedSearch.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        company.name.toLowerCase().includes(query) ||
        company.ticker.toLowerCase().includes(query) ||
        company.sector.toLowerCase().includes(query);
      const matchesSector = sectorFilter === 'All' || company.sector === sectorFilter;

      return matchesQuery && matchesSector;
    });
  }, [debouncedSearch, sectorFilter]);

  const summary = useMemo(() => getCompanyDirectorySummary(filtered), [filtered]);
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base - spacing.xs / 2,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  const handleCompanyPress = useCallback((company: Company) => {
    navigation.navigate('CompanyDetail', { companyId: company.id });
  }, [navigation]);

  const handleOpenCompare = useCallback(() => {
    navigation.navigate('CompetitorAnalysis', {
      companyAId: filtered[0]?.id,
      companyBId: filtered[1]?.id,
    });
  }, [filtered, navigation]);

  const renderCompany = useCallback<ListRenderItem<Company>>(({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={styles.cardWrapper}>
        <CompanyCardItem item={item} onPressCompany={handleCompanyPress} />
      </Animated.View>
    );
  }, [handleCompanyPress]);

  const listHeader = useMemo(() => (
    <View style={styles.headerContent}>
      <GlassCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryCopy}>
            <Text style={[typePresets.h2, { color: colors.text }]}>Research Coverage</Text>
            <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Scan active names, then jump into peer comparison when the set is narrow enough to evaluate.
            </Text>
          </View>
          <Pressable
            onPress={handleOpenCompare}
            accessibilityRole="button"
            accessibilityLabel="Open competitor analysis"
            style={({ pressed }) => [styles.compareButton, { backgroundColor: colors.primary + '14' }, pressed && styles.pressed]}
          >
            <ArrowRightLeft size={18} color={colors.primary} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.totalCompanies}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>COMPANIES</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryStat}>
            <Text style={[typePresets.monoLg, { color: colors.primary }]}>{formatNumber(summary.avgCoverage)}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>AVG COVERAGE</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryStat}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.positiveLeaders}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>POSITIVE</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search companies..." />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {sectors.map((sector) => (
          <Chip
            key={sector}
            label={sector}
            selected={sectorFilter === sector}
            onPress={() => setSectorFilter(sector)}
          />
        ))}
      </ScrollView>

      <Text style={[typePresets.labelSm, { color: colors.textTertiary, paddingHorizontal: spacing.xs / 2, marginBottom: spacing.sm }]}>
        Dominant sector: {summary.dominantSector}
      </Text>
    </View>
  ), [colors.borderSubtle, colors.primary, colors.text, colors.textSecondary, colors.textTertiary, handleOpenCompare, search, sectorFilter, sectors, summary.avgCoverage, summary.dominantSector, summary.positiveLeaders, summary.totalCompanies]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Companies</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={22} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCompany}
        numColumns={2}
        ListHeaderComponent={listHeader}
        contentContainerStyle={listContentContainerStyle}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    marginBottom: spacing.base,
  },
  summaryCard: {
    marginHorizontal: spacing.xs / 2,
    marginBottom: spacing.base,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
  },
  summaryCopy: {
    flex: 1,
  },
  compareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  searchRow: {
    paddingHorizontal: spacing.xs / 2,
    marginBottom: spacing.base,
  },
  filterRow: {
    paddingHorizontal: spacing.xs / 2,
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: spacing.xs / 2,
    marginBottom: spacing.sm,
  },
  companyCard: {
    flex: 1,
  },
  companyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
