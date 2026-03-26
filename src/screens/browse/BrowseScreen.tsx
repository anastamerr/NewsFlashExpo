import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform, Pressable } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus, LayoutGrid, List, SlidersHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedFlashList } from '@shopify/flash-list';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { SwipeableRow, useBookmarkAction, useShareAction } from '@/components/lists/SwipeableRow';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { selectionTap } from '@/utils/haptics';
import { useDebounce } from '@/hooks/useDebounce';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { SkeletonArticle } from '@/components/ui/Skeleton';
import { MOCK_ARTICLES } from '@/constants/mockData';
import type { Article } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BrowseStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import type { TimeWindow } from '@/utils/timeWindow';
import { isWithinTimeWindow } from '@/utils/timeWindow';

type Nav = NativeStackNavigationProp<BrowseStackParamList, 'BrowseHome'>;

const FILTER_SOURCES = ['All', 'Reuters', 'Bloomberg', 'Financial Times', 'Alborsa News', 'Mubasher', 'TechCrunch'];
const SEARCH_TYPES = ['All', 'Company', 'People', 'Sector', 'Market'] as const;
const TAG_OPTIONS = ['All Tags', ...Array.from(new Set(MOCK_ARTICLES.map((article) => article.tag)))];
const TIME_WINDOWS: TimeWindow[] = ['24H', '7D', '30D', '90D'];
const SENTIMENT_OPTIONS = [
  { key: 'All', label: 'All Sentiments', color: '', Icon: Minus },
  { key: 'Positive', label: 'Positive', color: '#10b981', Icon: TrendingUp },
  { key: 'Neutral', label: 'Neutral', color: '#eab308', Icon: Minus },
  { key: 'Negative', label: 'Negative', color: '#ef4444', Icon: TrendingDown },
] as const;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function BrowseScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { updateScrollDirection } = useScrollDirection();
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [searchType, setSearchType] = useState<(typeof SEARCH_TYPES)[number]>('All');
  const [selectedTag, setSelectedTag] = useState('All Tags');
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [controlsInteractive, setControlsInteractive] = useState(true);
  const controlsProgress = useSharedValue(0);
  const controlsHidden = useSharedValue(false);
  const lastOffset = useSharedValue(0);

  const switchViewMode = useCallback((mode: 'expanded' | 'compact') => {
    if (mode === viewMode) return;

    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setViewMode(mode);
  }, [viewMode]);

  const debouncedSearch = useDebounce(search);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const filteredArticles = useMemo(() => {
    return MOCK_ARTICLES.filter((a) => {
      const query = debouncedSearch.trim().toLowerCase();

      if (query) {
        const title = a.title.toLowerCase();
        const summary = a.summary.toLowerCase();
        const company = a.company.toLowerCase();
        const tag = a.tag.toLowerCase();

        switch (searchType) {
          case 'Company':
            if (!title.includes(query) && !company.includes(query)) return false;
            break;
          case 'People':
            if (!title.includes(query) && !summary.includes(query)) return false;
            break;
          case 'Sector':
            if (!tag.includes(query) && !summary.includes(query)) return false;
            break;
          case 'Market':
            if (!title.includes(query) && !summary.includes(query) && !tag.includes(query)) return false;
            break;
          default:
            if (!title.includes(query) && !summary.includes(query) && !company.includes(query) && !tag.includes(query)) return false;
        }
      }

      if (selectedSource !== 'All' && a.source !== selectedSource) return false;
      if (selectedTag !== 'All Tags' && a.tag !== selectedTag) return false;
      if (selectedSentiment === 'Positive' && a.sentiment <= 1) return false;
      if (selectedSentiment === 'Negative' && a.sentiment >= -1) return false;
      if (selectedSentiment === 'Neutral' && (a.sentiment > 1 || a.sentiment < -1)) return false;
      if (timeWindow && !isWithinTimeWindow(a.date, timeWindow)) return false;
      return true;
    });
  }, [debouncedSearch, searchType, selectedSource, selectedSentiment, selectedTag, timeWindow]);
  const activeFilters = useMemo(() => {
    const filters = [];

    if (searchType !== 'All') {
      filters.push(`${searchType} scope`);
    }
    if (selectedSentiment !== 'All') {
      filters.push(selectedSentiment);
    }
    if (selectedTag !== 'All Tags') {
      filters.push(selectedTag);
    }
    if (timeWindow) {
      filters.push(timeWindow);
    }
    if (selectedSource !== 'All') {
      filters.push(selectedSource);
    }

    return filters;
  }, [searchType, selectedSentiment, selectedSource, selectedTag, timeWindow]);
  const activeRefineCount = activeFilters.length + (viewMode === 'compact' ? 1 : 0);
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingTop: controlsHeight + spacing.sm,
      paddingBottom: insets.bottom + 90,
    }),
    [controlsHeight, insets.bottom],
  );

  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  }, [navigation]);
  const handleArticleLongPress = useCallback((article: Article) => {
    navigation.navigate('BrowseSummary', {
      articleId: article.id,
      deepDiveRoute: 'BrowseDeepDive',
    });
  }, [navigation]);
  const handleResetFilters = useCallback(() => {
    setSearchType('All');
    setSelectedSentiment('All');
    setSelectedTag('All Tags');
    setTimeWindow(null);
    setSelectedSource('All');
    setViewMode('expanded');
  }, []);

  const bookmarkAction = useBookmarkAction(() => {});
  const shareAction = useShareAction(() => {});

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(controlsProgress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(controlsProgress.value, [0, 1], [0, -28], Extrapolation.CLAMP) },
    ],
  }));

  const updateControlsInteractivity = useCallback((interactive: boolean) => {
    setControlsInteractive(interactive);
  }, []);

  const handleListScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;
      const delta = offsetY - lastOffset.value;

      updateScrollDirection(offsetY);

      if (delta > 4 && offsetY > 24 && !controlsHidden.value) {
        controlsHidden.value = true;
        runOnJS(updateControlsInteractivity)(false);
        controlsProgress.value = withTiming(1, { duration: 180 });
      } else if ((delta < -4 || offsetY <= 12) && controlsHidden.value) {
        controlsHidden.value = false;
        controlsProgress.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(updateControlsInteractivity)(true);
          }
        });
      }

      lastOffset.value = offsetY;
    },
  });

  const renderArticle = useCallback(({ item }: { item: Article }) => (
    <SwipeableRow leftActions={[bookmarkAction]} rightActions={[shareAction]}>
      <ArticleCard
        article={item}
        mode={viewMode}
        onPress={handleArticlePress}
        onLongPress={handleArticleLongPress}
      />
    </SwipeableRow>
  ), [viewMode, handleArticlePress, handleArticleLongPress, bookmarkAction, shareAction]);

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Browse</Text>
        <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>Search first. Refine only when needed.</Text>
      </View>

      <Animated.View
        pointerEvents={controlsInteractive ? 'auto' : 'none'}
        onLayout={(event) => setControlsHeight(event.nativeEvent.layout.height)}
        style={[
          styles.controlsPanel,
          { top: headerHeight, backgroundColor: colors.background },
          controlsAnimatedStyle,
        ]}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBarWrapper}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search articles..." />
          </View>
          <Pressable
            onPress={() => setShowFilterSheet(true)}
            style={({ pressed }) => [
              styles.refineBtn,
              {
                backgroundColor: activeFilters.length > 0 ? colors.primary + '16' : colors.inputBackground,
                borderColor: activeFilters.length > 0 ? colors.primary : colors.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <SlidersHorizontal
              size={16}
              color={activeFilters.length > 0 ? colors.primary : colors.textTertiary}
              strokeWidth={2}
            />
            <Text
              style={[
                typePresets.labelSm,
                { color: activeFilters.length > 0 ? colors.primary : colors.textSecondary },
              ]}
            >
              Refine
            </Text>
          </Pressable>
        </View>

        <View style={styles.controlsMeta}>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
            {filteredArticles.length} articles found
          </Text>
          {activeRefineCount > 0 ? (
            <Pressable onPress={handleResetFilters} style={({ pressed }) => [styles.resetLink, pressed && styles.pressed]}>
              <Text style={[typePresets.labelSm, { color: colors.primary }]}>
                {activeRefineCount} active {activeRefineCount === 1 ? 'refinement' : 'refinements'} • Reset
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      {/* Article List */}
      {isLoading ? (
        <View style={[styles.list, { paddingTop: controlsHeight + spacing.sm }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonArticle key={i} compact={viewMode === 'compact'} />
          ))}
        </View>
      ) : (
        <AnimatedFlashList
          data={filteredArticles}
          extraData={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <BottomSheetModal
        visible={showFilterSheet}
        title="Refine Browse"
        description="Adjust scope, source, sentiment, layout, tags, and time window without crowding the feed."
        onClose={() => setShowFilterSheet(false)}
        footer={(
          <View style={styles.sheetFooter}>
            <Button label="Reset" variant="ghost" onPress={handleResetFilters} />
            <Button label="Done" onPress={() => setShowFilterSheet(false)} />
          </View>
        )}
      >
        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>LAYOUT</Text>
          <View style={styles.layoutOptionRow}>
            <Pressable
              onPress={() => switchViewMode('expanded')}
              style={({ pressed }) => [
                styles.layoutOption,
                {
                  backgroundColor: viewMode === 'expanded' ? colors.primary + '12' : colors.surface,
                  borderColor: viewMode === 'expanded' ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.layoutOptionLabel}>
                <LayoutGrid size={16} color={viewMode === 'expanded' ? colors.primary : colors.textTertiary} strokeWidth={2} />
                <Text style={[typePresets.body, { color: viewMode === 'expanded' ? colors.primary : colors.textSecondary }]}>
                  Expanded
                </Text>
              </View>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>More context per story</Text>
            </Pressable>
            <Pressable
              onPress={() => switchViewMode('compact')}
              style={({ pressed }) => [
                styles.layoutOption,
                {
                  backgroundColor: viewMode === 'compact' ? colors.primary + '12' : colors.surface,
                  borderColor: viewMode === 'compact' ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.layoutOptionLabel}>
                <List size={16} color={viewMode === 'compact' ? colors.primary : colors.textTertiary} strokeWidth={2} />
                <Text style={[typePresets.body, { color: viewMode === 'compact' ? colors.primary : colors.textSecondary }]}>
                  Compact
                </Text>
              </View>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>Faster scanning</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>SEARCH SCOPE</Text>
          <View style={styles.sheetChipWrap}>
            {SEARCH_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={searchType === type}
                onPress={() => setSearchType(type)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>SOURCES</Text>
          <View style={styles.sheetChipWrap}>
            {FILTER_SOURCES.map((source) => (
              <Chip
                key={source}
                label={source}
                selected={selectedSource === source}
                onPress={() => setSelectedSource(source)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>SENTIMENT</Text>
          <View style={styles.optionList}>
            {SENTIMENT_OPTIONS.map((option) => {
              const active = selectedSentiment === option.key;
              const Icon = option.Icon;
              const tone = option.key === 'All' ? colors.textSecondary : option.color;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    selectionTap();
                    setSelectedSentiment(option.key);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      backgroundColor: active ? (option.key === 'All' ? colors.primary + '10' : option.color + '12') : colors.surface,
                      borderColor: active ? (option.key === 'All' ? colors.primary : option.color) : colors.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionRowLeft}>
                    <Icon size={16} color={active ? tone : colors.textTertiary} strokeWidth={2} />
                    <Text
                      style={[
                        typePresets.body,
                        {
                          color: active ? tone : colors.textSecondary,
                          fontFamily: active ? fontFamily.sansSemiBold : fontFamily.sans,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  <View style={[styles.optionDot, { backgroundColor: active ? tone : colors.border }]} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>TAGS</Text>
          <View style={styles.sheetChipWrap}>
            {TAG_OPTIONS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selectedTag === tag}
                onPress={() => setSelectedTag(tag)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={[typePresets.labelXs, { color: colors.primary }]}>TIME WINDOW</Text>
          <View style={styles.sheetChipWrap}>
            <Chip
              label="All Time"
              selected={timeWindow === null}
              onPress={() => setTimeWindow(null)}
            />
            {TIME_WINDOWS.map((window) => (
              <Chip
                key={window}
                label={window}
                selected={timeWindow === window}
                onPress={() => setTimeWindow(window)}
              />
            ))}
          </View>
        </View>
      </BottomSheetModal>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  controlsPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  searchBarWrapper: {
    flex: 1,
  },
  refineBtn: {
    minWidth: 96,
    height: 44,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  resetLink: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  sheetSection: {
    gap: spacing.sm,
  },
  layoutOptionRow: {
    gap: spacing.sm,
  },
  layoutOption: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    gap: spacing.xs,
  },
  layoutOptionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sheetChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  optionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  pressed: {
    opacity: 0.8,
  },
});
