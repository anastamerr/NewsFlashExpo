import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { WatchlistRow } from '@/components/lists/WatchlistRow';
import { SwipeableRow, useDeleteAction, useShareAction } from '@/components/lists/SwipeableRow';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchBar } from '@/components/ui/SearchBar';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { FilterTrigger } from '@/components/ui/FilterTrigger';
import { OptionPickerSheet, type OptionPickerItem } from '@/components/ui/OptionPickerSheet';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_ARTICLES, MOCK_WATCHLIST } from '@/constants/mockData';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useDebounce } from '@/hooks/useDebounce';
import { SkeletonWatchlistRow } from '@/components/ui/Skeleton';
import { findBestArticleForWatchlistItem } from '@/utils/watchlist';
import type { WatchlistItem } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WatchlistStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import type { TimeWindow } from '@/utils/timeWindow';

type Nav = NativeStackNavigationProp<WatchlistStackParamList, 'Watchlist'>;

const FILTER_TYPES = ['All', 'Companies', 'Sectors', 'Markets', 'People'] as const;
const FILTER_OPTIONS: OptionPickerItem[] = [
  { value: 'All', label: 'All', description: 'Show every tracked entity in one feed.' },
  { value: 'Companies', label: 'Companies', description: 'Focus on named companies and listed names.' },
  { value: 'Sectors', label: 'Sectors', description: 'Review sector-level watch targets only.' },
  { value: 'Markets', label: 'Markets', description: 'Limit the workspace to market and macro entities.' },
  { value: 'People', label: 'People', description: 'Track individuals and executive names.' },
];
const TYPE_MAP: Record<string, WatchlistItem['type'] | undefined> = {
  All: undefined,
  Companies: 'company',
  Sectors: 'sector',
  Markets: 'market',
  People: 'people',
};
const FILTER_LABEL_BY_TYPE: Record<WatchlistItem['type'], (typeof FILTER_TYPES)[number]> = {
  company: 'Companies',
  sector: 'Sectors',
  market: 'Markets',
  people: 'People',
};
const REPORT_WINDOWS: TimeWindow[] = ['24H', '7D', '30D', '90D'];
const WINDOW_OPTIONS: OptionPickerItem[] = [
  { value: '24H', label: '24H', description: 'Use the last day of activity for report actions.' },
  { value: '7D', label: '7D', description: 'Balance recent movement with weekly signal context.' },
  { value: '30D', label: '30D', description: 'Expand the view to a monthly monitoring window.' },
  { value: '90D', label: '90D', description: 'Use the broadest period for synthesis and trend review.' },
];

export function WatchlistScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();
  const [items, setItems] = useState(MOCK_WATCHLIST);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TYPES)[number]>('All');
  const [reportWindow, setReportWindow] = useState<TimeWindow>('7D');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(MOCK_WATCHLIST[0]?.id ?? null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<'filter' | 'window' | null>(null);
  const [draftType, setDraftType] = useState<WatchlistItem['type']>('company');
  const [draftName, setDraftName] = useState('');
  const [draftSymbol, setDraftSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(search);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return items.filter((item) => {
      if (TYPE_MAP[activeFilter] && item.type !== TYPE_MAP[activeFilter]) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = item.name.toLowerCase();
      const symbol = item.symbol?.toLowerCase() ?? '';

      return name.includes(query) || symbol.includes(query);
    });
  }, [activeFilter, debouncedSearch, items]);
  const focusedItem = useMemo(
    () => filteredItems.find((item) => item.id === focusedItemId) ?? filteredItems[0] ?? null,
    [filteredItems, focusedItemId],
  );
  const focusedArticle = useMemo(
    () => (focusedItem ? findBestArticleForWatchlistItem(focusedItem, MOCK_ARTICLES) : null),
    [focusedItem],
  );
  const trackedArticleVolume = useMemo(
    () => filteredItems.reduce((sum, item) => sum + (item.articleCount ?? 0), 0),
    [filteredItems],
  );
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + 90,
    }),
    [insets.bottom],
  );

  const handleItemPress = useCallback((item: WatchlistItem) => {
    navigation.navigate('WatchlistDetail', { itemId: item.id, name: item.name });
  }, [navigation]);
  const handleItemLongPress = useCallback((item: WatchlistItem) => {
    setFocusedItemId(item.id);
  }, []);
  const handleOpenAddSheet = useCallback(() => {
    setIsAddSheetOpen(true);
  }, []);
  const handleCloseAddSheet = useCallback(() => {
    setIsAddSheetOpen(false);
    setDraftType('company');
    setDraftName('');
    setDraftSymbol('');
  }, []);
  const handleAddItem = useCallback(() => {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      return;
    }

    const nextItem: WatchlistItem = {
      id: `custom-${Date.now()}`,
      type: draftType,
      name: trimmedName,
      symbol: draftType === 'company' && draftSymbol.trim() ? draftSymbol.trim().toUpperCase() : undefined,
      sentiment: 0.4,
      articleCount: 0,
      sparkData: [0.1, 0.2, 0.4, 0.3, 0.5],
    };

    setItems((current) => [nextItem, ...current]);
    setActiveFilter(FILTER_LABEL_BY_TYPE[draftType]);
    setFocusedItemId(nextItem.id);
    setSearch('');
    handleCloseAddSheet();
  }, [draftName, draftSymbol, draftType, handleCloseAddSheet]);
  const handleOpenSummary = useCallback(() => {
    if (!focusedArticle) {
      return;
    }

    navigation.navigate('WatchlistSummary', {
      articleId: focusedArticle.id,
      deepDiveRoute: 'WatchlistDeepDive',
    });
  }, [focusedArticle, navigation]);
  const handleOpenDeepDive = useCallback(() => {
    if (!focusedArticle) {
      return;
    }

    navigation.navigate('WatchlistDeepDive', { articleId: focusedArticle.id });
  }, [focusedArticle, navigation]);
  const handleOpenSynthesis = useCallback(() => {
    if (!focusedItem) {
      return;
    }

    navigation.navigate('MarketSynthesis', {
      watchlistItemId: focusedItem.id,
      timeWindow: reportWindow,
    });
  }, [focusedItem, navigation, reportWindow]);

  const deleteAction = useDeleteAction(() => {});
  const shareAction = useShareAction(() => {});

  const renderItem = useCallback(({ item, index }: { item: WatchlistItem; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <SwipeableRow rightActions={[shareAction, deleteAction]}>
        <WatchlistRow
          item={item}
          onPress={handleItemPress}
          onLongPress={handleItemLongPress}
          selected={focusedItem?.id === item.id}
        />
      </SwipeableRow>
    </Animated.View>
  ), [deleteAction, focusedItem?.id, handleItemLongPress, handleItemPress, shareAction]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Watchlist</Text>
        <Pressable
          onPress={handleOpenAddSheet}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Plus size={20} color={colors.textInverse} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search watchlist..." />
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <View style={styles.controlItem}>
            <FilterTrigger
              label="Scope"
              value={activeFilter}
              onPress={() => setActivePicker('filter')}
            />
          </View>
          <View style={styles.controlItem}>
            <FilterTrigger
              label="Window"
              value={reportWindow}
              onPress={() => setActivePicker('window')}
            />
          </View>
        </View>
        <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
          {filteredItems.length} tracked items | {trackedArticleVolume} mentions in {reportWindow}
        </Text>
      </View>

      {focusedItem ? (
        <View
          style={[
            styles.focusStrip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>FOCUSED ITEM</Text>
          <Text style={[typePresets.h3, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={1}>
            {focusedItem.name}
          </Text>
          <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Long-press a row to refocus report actions. Summary and deep dive use the closest related article.
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleOpenSummary}
              disabled={!focusedArticle}
              style={({ pressed }) => [
                styles.actionPill,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: focusedArticle ? 1 : 0.45,
                },
                pressed && focusedArticle && styles.pressed,
              ]}
            >
              <Text style={[typePresets.labelSm, { color: colors.text }]}>Summary</Text>
            </Pressable>
            <Pressable
              onPress={handleOpenDeepDive}
              disabled={!focusedArticle}
              style={({ pressed }) => [
                styles.actionPill,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: focusedArticle ? 1 : 0.45,
                },
                pressed && focusedArticle && styles.pressed,
              ]}
            >
              <Text style={[typePresets.labelSm, { color: colors.text }]}>Deep Dive</Text>
            </Pressable>
            <Pressable
              onPress={handleOpenSynthesis}
              style={({ pressed }) => [
                styles.actionPill,
                { backgroundColor: colors.primary + '12', borderColor: colors.primary + '28' },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[typePresets.labelSm, { color: colors.primary }]}>Synthesis</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

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
            Add companies, sectors, markets, or people to build a monitored list.
          </Text>
          <Button label="Add to Watchlist" onPress={handleOpenAddSheet} size="md" />
        </View>
      ) : (
        <FlashList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <BottomSheetModal
        visible={isAddSheetOpen}
        title="Add Watchlist Item"
        description="Track a new entity without leaving the watchlist workspace."
        onClose={handleCloseAddSheet}
        footer={(
          <View style={styles.sheetFooter}>
            <Button label="Cancel" variant="ghost" onPress={handleCloseAddSheet} />
            <Button
              label="Add Item"
              onPress={handleAddItem}
              disabled={!draftName.trim()}
            />
          </View>
        )}
      >
        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>TYPE</Text>
          <View style={styles.sheetChipWrap}>
            {(['company', 'sector', 'market', 'people'] as const).map((type) => (
              <Chip
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                selected={draftType === type}
                onPress={() => setDraftType(type)}
              />
            ))}
          </View>
        </View>

        <Input
          label="Name"
          placeholder="Commercial International Bank"
          value={draftName}
          onChangeText={setDraftName}
          autoCapitalize="words"
        />

        {draftType === 'company' ? (
          <Input
            label="Symbol"
            placeholder="COMI.CA"
            value={draftSymbol}
            onChangeText={setDraftSymbol}
            autoCapitalize="characters"
          />
        ) : null}
      </BottomSheetModal>

      <OptionPickerSheet
        visible={activePicker === 'filter'}
        title="Watchlist Scope"
        description="Choose which tracked entity type stays in focus."
        value={activeFilter}
        options={FILTER_OPTIONS}
        onClose={() => setActivePicker(null)}
        onSelect={(value) => setActiveFilter(value as (typeof FILTER_TYPES)[number])}
      />

      <OptionPickerSheet
        visible={activePicker === 'window'}
        title="Report Window"
        description="Set the time range used for synthesis and report actions."
        value={reportWindow}
        options={WINDOW_OPTIONS}
        onClose={() => setActivePicker(null)}
        onSelect={(value) => setReportWindow(value as TimeWindow)}
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  controls: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  controlRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlItem: {
    flex: 1,
  },
  focusStrip: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
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
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sheetSection: {
    gap: spacing.sm,
  },
  sheetChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
