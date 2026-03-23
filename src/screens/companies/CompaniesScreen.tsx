import React, { memo, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Building2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { useDebounce } from '@/hooks/useDebounce';
import { MOCK_COMPANIES } from '@/constants/mockData';
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
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return MOCK_COMPANIES;
    return MOCK_COMPANIES.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.ticker.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch]);
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

  const renderCompany = useCallback<ListRenderItem<Company>>(({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={styles.cardWrapper}>
        <CompanyCardItem item={item} onPressCompany={handleCompanyPress} />
      </Animated.View>
    );
  }, [handleCompanyPress]);

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

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search companies..." />
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCompany}
        numColumns={2}
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
  searchRow: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
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
