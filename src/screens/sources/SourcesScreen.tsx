import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Globe, Plus, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchBar } from '@/components/ui/SearchBar';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_SOURCES } from '@/constants/mockData';
import { timeAgo } from '@/utils/format';
import { successNotification } from '@/utils/haptics';
import { getStoredSources, saveStoredSources } from '@/utils/adminPersistence';
import type { Source } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Sources'>;
type SourceFilter = 'all' | 'enabled' | 'disabled' | 'high' | 'medium' | 'low';
type SourceDraft = {
  name: string;
  url: string;
  category: string;
  articlesPerDay: string;
  reliability: Source['reliability'];
  enabled: boolean;
};
type FormErrors = Partial<Record<'name' | 'url' | 'category' | 'articlesPerDay', string>>;

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Paused' },
  { value: 'high', label: 'High Trust' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const RELIABILITY_OPTIONS: Source['reliability'][] = ['high', 'medium', 'low'];

const EMPTY_DRAFT: SourceDraft = {
  name: '',
  url: '',
  category: '',
  articlesPerDay: '12',
  reliability: 'medium',
  enabled: true,
};

function isValidUrl(value: string) {
  return /^https?:\/\/.+/i.test(value);
}

export function SourcesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sources, setSources] = useState<Source[]>(MOCK_SOURCES);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SourceFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SourceDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    let isMounted = true;

    getStoredSources(MOCK_SOURCES).then((storedSources) => {
      if (isMounted) {
        setSources(storedSources);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  const filteredSources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sources.filter((source) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'enabled' && source.enabled) ||
        (filter === 'disabled' && !source.enabled) ||
        source.reliability === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        source.name.toLowerCase().includes(normalizedQuery) ||
        source.category.toLowerCase().includes(normalizedQuery) ||
        source.url.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, sources]);

  const summary = useMemo(() => {
    const enabledCount = sources.filter((source) => source.enabled).length;
    const trustedCount = sources.filter((source) => source.reliability === 'high').length;
    const dailyVolume = sources.reduce((sum, source) => sum + source.articlesPerDay, 0);

    return {
      enabled: enabledCount,
      trusted: trustedCount,
      volume: dailyVolume,
    };
  }, [sources]);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setEditingSourceId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
  }, []);

  const persistSources = useCallback(async (nextSources: Source[]) => {
    setSources(nextSources);
    await saveStoredSources(nextSources);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingSourceId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSheetVisible(true);
  }, []);

  const handleOpenEdit = useCallback((source: Source) => {
    setEditingSourceId(source.id);
    setDraft({
      name: source.name,
      url: source.url,
      category: source.category,
      articlesPerDay: String(source.articlesPerDay),
      reliability: source.reliability,
      enabled: source.enabled,
    });
    setErrors({});
    setSheetVisible(true);
  }, []);

  const handleToggleEnabled = useCallback(async (sourceId: string, enabled: boolean) => {
    const nextSources = sources.map((source) => (
      source.id === sourceId ? { ...source, enabled } : source
    ));

    await persistSources(nextSources);
    successNotification();
  }, [persistSources, sources]);

  const handleSaveSource = useCallback(async () => {
    const trimmedName = draft.name.trim();
    const trimmedUrl = draft.url.trim();
    const trimmedCategory = draft.category.trim();
    const articlesPerDay = Number.parseInt(draft.articlesPerDay, 10);
    const nextErrors: FormErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Source name is required.';
    }

    if (!trimmedUrl) {
      nextErrors.url = 'Source URL is required.';
    } else if (!isValidUrl(trimmedUrl)) {
      nextErrors.url = 'Use a full URL starting with http or https.';
    }

    if (!trimmedCategory) {
      nextErrors.category = 'Category is required.';
    }

    if (!Number.isFinite(articlesPerDay) || articlesPerDay <= 0) {
      nextErrors.articlesPerDay = 'Enter a valid daily article count.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextSources = editingSourceId
      ? sources.map((source) => (
          source.id === editingSourceId
            ? {
                ...source,
                name: trimmedName,
                url: trimmedUrl,
                category: trimmedCategory,
                articlesPerDay,
                reliability: draft.reliability,
                enabled: draft.enabled,
                lastUpdate: new Date().toISOString(),
              }
            : source
        ))
      : [
          {
            id: `source-${Date.now()}`,
            name: trimmedName,
            url: trimmedUrl,
            category: trimmedCategory,
            articlesPerDay,
            reliability: draft.reliability,
            enabled: draft.enabled,
            lastUpdate: new Date().toISOString(),
          },
          ...sources,
        ];

    await persistSources(nextSources);
    successNotification();
    closeSheet();
  }, [closeSheet, draft, editingSourceId, persistSources, sources]);

  const handleRemoveSource = useCallback(async () => {
    if (!editingSourceId) {
      return;
    }

    const nextSources = sources.filter((source) => source.id !== editingSourceId);
    await persistSources(nextSources);
    successNotification();
    closeSheet();
  }, [closeSheet, editingSourceId, persistSources, sources]);

  const renderSource = useCallback(({ item, index }: { item: Source; index: number }) => {
    const reliabilityVariant =
      item.reliability === 'high'
        ? 'success'
        : item.reliability === 'medium'
          ? 'warning'
          : 'danger';

    return (
      <Animated.View entering={FadeInDown.delay(index * 45).springify()}>
        <Card style={styles.sourceCard} onPress={() => handleOpenEdit(item)}>
          <View style={styles.sourceHeader}>
            <View style={[styles.sourceIcon, { backgroundColor: colors.primary + '15' }]}>
              <Globe size={20} color={colors.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.sourceInfo}>
              <Text style={[typePresets.h3, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>{item.category}</Text>
            </View>
            <Toggle value={item.enabled} onValueChange={(value) => handleToggleEnabled(item.id, value)} />
          </View>
          <View style={styles.sourceMeta}>
            <Badge label={item.reliability} variant={reliabilityVariant} small />
            <Text style={[typePresets.monoSm, { color: colors.textSecondary }]}>
              {item.articlesPerDay} articles/day
            </Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>
              {timeAgo(item.lastUpdate)}
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  }, [colors.primary, colors.text, colors.textSecondary, colors.textTertiary, handleOpenEdit, handleToggleEnabled]);

  const listHeader = useMemo(() => (
    <View style={styles.headerContent}>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.enabled}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>ENABLED</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.primary }]}>{summary.volume}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>ARTICLES / DAY</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.trusted}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>HIGH TRUST</Text>
          </View>
        </View>
      </Card>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search publishers, categories, or URLs..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {SOURCE_FILTERS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>
    </View>
  ), [colors.borderSubtle, colors.primary, colors.text, colors.textTertiary, filter, query, summary.enabled, summary.trusted, summary.volume]);

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
        <Text style={[typePresets.h3, { color: colors.text }]}>Content Sources</Text>
        <Pressable
          onPress={handleOpenCreate}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add source"
        >
          <Plus size={18} color={colors.textInverse} strokeWidth={2} />
        </Pressable>
      </View>

      <FlashList
        data={filteredSources}
        keyExtractor={(item) => item.id}
        renderItem={renderSource}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={[typePresets.h3, { color: colors.text }]}>No sources found</Text>
            <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Change the filter or search to inspect the rest of the feed.
            </Text>
          </View>
        )}
        contentContainerStyle={listContentContainerStyle}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheetModal
        visible={sheetVisible}
        title={editingSourceId ? 'Manage source' : 'Add source'}
        description={editingSourceId ? 'Tune trust, volume, or feed status.' : 'Bring a new content source into the monitoring mix.'}
        onClose={closeSheet}
        footer={(
          <View style={styles.sheetFooter}>
            {editingSourceId ? (
              <Button
                label="Remove"
                variant="ghost"
                onPress={handleRemoveSource}
                icon={<Trash2 size={16} color={colors.text} strokeWidth={2} />}
              />
            ) : null}
            <View style={styles.footerPrimary}>
              <Button
                label={editingSourceId ? 'Save changes' : 'Create source'}
                onPress={handleSaveSource}
                fullWidth
              />
            </View>
          </View>
        )}
      >
        <Input
          label="Source Name"
          placeholder="Reuters"
          value={draft.name}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, name: value }));
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          error={errors.name}
        />
        <Input
          label="Source URL"
          placeholder="https://example.com"
          value={draft.url}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, url: value }));
            setErrors((current) => ({ ...current, url: undefined }));
          }}
          autoCapitalize="none"
          keyboardType="url"
          error={errors.url}
        />
        <Input
          label="Category"
          placeholder="Financial News"
          value={draft.category}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, category: value }));
            setErrors((current) => ({ ...current, category: undefined }));
          }}
          error={errors.category}
        />
        <Input
          label="Articles Per Day"
          placeholder="12"
          value={draft.articlesPerDay}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, articlesPerDay: value }));
            setErrors((current) => ({ ...current, articlesPerDay: undefined }));
          }}
          keyboardType="number-pad"
          error={errors.articlesPerDay}
        />

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Reliability
          </Text>
          <View style={styles.sheetChips}>
            {RELIABILITY_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={draft.reliability === option}
                onPress={() => setDraft((current) => ({ ...current, reliability: option }))}
              />
            ))}
          </View>
        </View>

        <Card variant="outlined">
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={[typePresets.h3, { color: colors.text }]}>Source enabled</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                Keep the source configured while pausing ingestion when needed.
              </Text>
            </View>
            <Toggle
              value={draft.enabled}
              onValueChange={(value) => setDraft((current) => ({ ...current, enabled: value }))}
            />
          </View>
        </Card>
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
    paddingBottom: spacing.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  summaryCard: {
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  sourceCard: {
    marginBottom: spacing.sm,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingLeft: spacing.xxxl + spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  sheetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  toggleCopy: {
    flex: 1,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerPrimary: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
