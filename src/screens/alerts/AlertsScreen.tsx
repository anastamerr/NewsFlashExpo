import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { AlertRow } from '@/components/lists/AlertRow';
import { Chip } from '@/components/ui/Chip';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { MOCK_ALERTS } from '@/constants/mockData';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { SkeletonAlert } from '@/components/ui/Skeleton';
import type { AlertPublic } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '@/types/navigation';
import { ScrollView } from 'react-native';

type Props = NativeStackScreenProps<AlertsStackParamList, 'Alerts'>;

const FILTERS = ['All', 'Crisis', 'Active', 'Resolved'] as const;

export function AlertsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { refreshing, onRefresh } = useRefreshControl(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });

  const filteredAlerts = useMemo(() => {
    switch (activeFilter) {
      case 'Crisis': return MOCK_ALERTS.filter((a) => a.severity === 'CRITICAL');
      case 'Active': return MOCK_ALERTS.filter((a) => !a.isResolved);
      case 'Resolved': return MOCK_ALERTS.filter((a) => a.isResolved);
      default: return MOCK_ALERTS;
    }
  }, [activeFilter]);
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + 90,
    }),
    [insets.bottom],
  );

  const handleAlertPress = useCallback((alert: AlertPublic) => {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  }, [navigation]);

  const renderAlert = useCallback(({ item, index }: { item: AlertPublic; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <AlertRow alert={item} onPress={handleAlertPress} />
    </Animated.View>
  ), [handleAlertPress]);

  const activeCount = MOCK_ALERTS.filter((a) => !a.isResolved).length;
  const criticalCount = MOCK_ALERTS.filter((a) => a.severity === 'CRITICAL' && !a.isResolved).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[typePresets.h1, { color: colors.text }]}>Alerts</Text>
          <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: 2 }]}>
            {activeCount} active{criticalCount > 0 ? ` \u00b7 ${criticalCount} critical` : ''}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Plus size={20} color={colors.textInverse} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonAlert key={i} />
          ))}
        </View>
      ) : (
        <FlashList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: spacing.base,
  },
  filterRow: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  pressed: {
    opacity: 0.8,
  },
});
