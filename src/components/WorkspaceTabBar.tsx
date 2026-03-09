import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, spacing, typography } from '../theme/tokens';

/* ────────────────────────────────────────────────────── */

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  AlertsTab: 'notifications-outline',
  BrowseTab: 'search-outline',
  DashboardsTab: 'stats-chart-outline',
  TodayTab: 'pulse-outline',
  WatchlistTab: 'bookmark-outline',
};

const TAB_ICONS_FILLED: Record<string, keyof typeof Ionicons.glyphMap> = {
  AlertsTab: 'notifications',
  BrowseTab: 'search',
  DashboardsTab: 'stats-chart',
  TodayTab: 'pulse',
  WatchlistTab: 'bookmark',
};

const TAB_LABELS: Record<string, string> = {
  AlertsTab: 'Alerts',
  BrowseTab: 'Browse',
  DashboardsTab: 'Dashboards',
  TodayTab: 'Today',
  WatchlistTab: 'Watchlist',
};

/* ────────────────────────────────────────────────────── */

export function WorkspaceTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      <View style={styles.topBorder} />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = TAB_LABELS[route.name] ?? route.name;
          const iconName = isFocused
            ? TAB_ICONS_FILLED[route.name]
            : TAB_ICONS[route.name];

          function handlePress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function handleLongPress() {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={handlePress}
              onLongPress={handleLongPress}
              style={styles.tab}
            >
              {/* Active indicator dot */}
              <View
                style={[
                  styles.indicator,
                  isFocused ? styles.indicatorActive : styles.indicatorHidden,
                ]}
              />

              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? palette.ink : palette.inkSoft}
              />

              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.canvas,
  },
  topBorder: {
    backgroundColor: palette.line,
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingVertical: 4,
  },
  indicator: {
    borderRadius: 999,
    height: 3,
    marginBottom: 2,
    width: 18,
  },
  indicatorActive: {
    backgroundColor: palette.emerald,
  },
  indicatorHidden: {
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  labelActive: {
    color: palette.ink,
  },
  labelInactive: {
    color: palette.inkSoft,
  },
});
