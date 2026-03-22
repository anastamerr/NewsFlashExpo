import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { ArticleCard } from '@/components/lists/ArticleCard';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
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
const FILTER_SENTIMENTS = ['All', 'Positive', 'Negative', 'Neutral'];

export function BrowseScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(search);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
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

  const renderArticle = useCallback(({ item, index }: { item: Article; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.articleItem}>
      <ArticleCard article={item} mode={viewMode} onPress={handleArticlePress} />
    </Animated.View>
  ), [viewMode, handleArticlePress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typePresets.h1, { color: colors.text }]}>Browse</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('expanded')}
            style={[styles.toggleBtn, viewMode === 'expanded' && { backgroundColor: colors.primary + '20' }]}
          >
            <LayoutGrid size={18} color={viewMode === 'expanded' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('compact')}
            style={[styles.toggleBtn, viewMode === 'compact' && { backgroundColor: colors.primary + '20' }]}
          >
            <List size={18} color={viewMode === 'compact' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search articles..." />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_SENTIMENTS.map((sent) => (
          <Chip
            key={sent}
            label={sent}
            selected={selectedSentiment === sent}
            onPress={() => setSelectedSentiment(sent)}
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
          data={filteredArticles}
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
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  filterRow: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  articleItem: {},
});
