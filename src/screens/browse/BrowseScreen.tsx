import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus, LayoutGrid, List, SlidersHorizontal, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { SwipeableRow, useBookmarkAction, useShareAction } from '@/components/lists/SwipeableRow';
import { useTheme, spacing, radius, shadows } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { selectionTap } from '@/utils/haptics';
import { useDebounce } from '@/hooks/useDebounce';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { SkeletonArticle } from '@/components/ui/Skeleton';
import { MOCK_ARTICLES } from '@/constants/mockData';
import type { Article } from '@/types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BrowseStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, ScrollView } from 'react-native';

type Nav = NativeStackNavigationProp<BrowseStackParamList, 'Browse'>;

const FILTER_SOURCES = ['All', 'Reuters', 'Bloomberg', 'Financial Times', 'Alborsa News', 'Mubasher', 'TechCrunch'];
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
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  const [showSentimentMenu, setShowSentimentMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasAnimated = useRef(false);
  const listRef = useRef<FlashListRef<Article>>(null);

  const switchViewMode = useCallback((mode: 'expanded' | 'compact') => {
    if (mode === viewMode) return;

    listRef.current?.prepareForLayoutAnimationRender();
    listRef.current?.clearLayoutCacheOnUpdate();
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
      setTimeout(() => { hasAnimated.current = true; }, 500);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const filteredArticles = useMemo(() => {
    return MOCK_ARTICLES.filter((a) => {
      if (debouncedSearch && !a.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (selectedSource !== 'All' && a.source !== selectedSource) return false;
      if (selectedSentiment === 'Positive' && a.sentiment <= 1) return false;
      if (selectedSentiment === 'Negative' && a.sentiment >= -1) return false;
      if (selectedSentiment === 'Neutral' && (a.sentiment > 1 || a.sentiment < -1)) return false;
      return true;
    });
  }, [debouncedSearch, selectedSource, selectedSentiment]);

  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  }, [navigation]);

  const bookmarkAction = useBookmarkAction(() => {});
  const shareAction = useShareAction(() => {});

  const renderArticle = useCallback(({ item, index }: { item: Article; index: number }) => {
    const entering = hasAnimated.current ? undefined : FadeInDown.delay(index * 40).springify();
    return (
      <Animated.View entering={entering}>
        <SwipeableRow leftActions={[bookmarkAction]} rightActions={[shareAction]}>
          <ArticleCard article={item} mode={viewMode} onPress={handleArticlePress} />
        </SwipeableRow>
      </Animated.View>
    );
  }, [viewMode, handleArticlePress, bookmarkAction, shareAction]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Browse</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => switchViewMode('expanded')}
            style={[styles.toggleBtn, viewMode === 'expanded' && { backgroundColor: colors.primary + '20' }]}
          >
            <LayoutGrid size={18} color={viewMode === 'expanded' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchViewMode('compact')}
            style={[styles.toggleBtn, viewMode === 'compact' && { backgroundColor: colors.primary + '20' }]}
          >
            <List size={18} color={viewMode === 'compact' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Sentiment filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrapper}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search articles..." />
        </View>
        <TouchableOpacity
          onPress={() => setShowSentimentMenu((v) => !v)}
          activeOpacity={0.7}
          style={[
            styles.filterBtn,
            {
              backgroundColor: selectedSentiment !== 'All'
                ? SENTIMENT_OPTIONS.find((o) => o.key === selectedSentiment)!.color + '18'
                : colors.inputBackground,
              borderColor: selectedSentiment !== 'All'
                ? SENTIMENT_OPTIONS.find((o) => o.key === selectedSentiment)!.color
                : colors.border,
            },
          ]}
        >
          <SlidersHorizontal
            size={18}
            color={
              selectedSentiment !== 'All'
                ? SENTIMENT_OPTIONS.find((o) => o.key === selectedSentiment)!.color
                : colors.textTertiary
            }
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {showSentimentMenu && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={[styles.sentimentMenu, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        >
          {SENTIMENT_OPTIONS.map((opt) => {
            const active = selectedSentiment === opt.key;
            const optColor = opt.key === 'All' ? colors.text : opt.color;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  selectionTap();
                  setSelectedSentiment(opt.key);
                  setShowSentimentMenu(false);
                }}
                activeOpacity={0.7}
                style={[
                  styles.sentimentMenuItem,
                  active && { backgroundColor: (opt.key === 'All' ? colors.primary : opt.color) + '12' },
                ]}
              >
                {opt.key !== 'All' && React.createElement(opt.Icon, {
                  size: 16,
                  color: active ? optColor : colors.textSecondary,
                  strokeWidth: 2,
                })}
                <Text
                  style={[
                    typePresets.body,
                    {
                      flex: 1,
                      color: active ? optColor : colors.textSecondary,
                      fontFamily: active ? fontFamily.sansSemiBold : fontFamily.sans,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {active && (
                  <Check size={16} color={optColor} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {/* Source filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_SOURCES.map((source) => (
          <Chip
            key={source}
            label={source}
            selected={selectedSource === source}
            onPress={() => setSelectedSource(source)}
          />
        ))}
      </ScrollView>

      {/* Results Count */}
      <Text style={[typePresets.bodySm, { color: colors.textTertiary, paddingHorizontal: spacing.base, marginBottom: spacing.sm }]}>
        {filteredArticles.length} articles found
      </Text>

      {/* Article List */}
      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonArticle key={i} compact={viewMode === 'compact'} />
          ))}
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={filteredArticles}
          extraData={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
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
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentimentMenu: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.md,
  },
  sentimentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  filterRow: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  articleItem: {},
});
