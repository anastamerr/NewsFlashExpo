import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Plus, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { WatchlistRow } from '@/components/lists/WatchlistRow';
import { SwipeableRow, useDeleteAction, useShareAction } from '@/components/lists/SwipeableRow';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_WATCHLIST } from '@/constants/mockData';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { SkeletonWatchlistRow } from '@/components/ui/Skeleton';
import type { WatchlistItem } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WatchlistStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';

type Nav = NativeStackNavigationProp<WatchlistStackParamList, 'Watchlist'>;

const FILTER_TYPES = ['All', 'Companies', 'Sectors', 'Markets', 'People'] as const;
const TYPE_MAP: Record<string, string | undefined> = {
  All: undefined,
  Companies: 'company',
  Sectors: 'sector',
  Markets: 'market',
  People: 'people',
};

export function WatchlistScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const filteredItems = TYPE_MAP[activeFilter]
    ? MOCK_WATCHLIST.filter((w) => w.type === TYPE_MAP[activeFilter])
    : MOCK_WATCHLIST;

  const handleItemPress = useCallback((item: WatchlistItem) => {
    navigation.navigate('WatchlistDetail', { itemId: item.id, name: item.name });
  }, [navigation]);

  const deleteAction = useDeleteAction(() => {});
  const shareAction = useShareAction(() => {});

  const renderItem = useCallback(({ item, index }: { item: WatchlistItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <SwipeableRow rightActions={[shareAction, deleteAction]}>
        <WatchlistRow item={item} onPress={handleItemPress} />
      </SwipeableRow>
    </Animated.View>
  ), [handleItemPress, deleteAction, shareAction]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Watchlist</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Plus size={20} color={colors.textInverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TYPES.map((type) => (
          <Chip
            key={type}
            label={type}
            selected={activeFilter === type}
            onPress={() => setActiveFilter(type)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonWatchlistRow key={i} />
          ))}
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={48} color={colors.textTertiary} strokeWidth={1} />
          <Text style={[typePresets.h2, { color: colors.text, marginTop: spacing.lg }]}>
            No items yet
          </Text>
          <Text style={[typePresets.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            Add companies, sectors, or markets to track them
          </Text>
          <Button label="Add to Watchlist" onPress={() => {}} size="md" />
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
});
