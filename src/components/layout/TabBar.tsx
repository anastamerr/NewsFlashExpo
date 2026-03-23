import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { TabActions } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Newspaper, Search, Bookmark, BarChart3, Bell } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { lightTap } from '@/utils/haptics';
import { fontFamily } from '@/theme/typography';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS = [Newspaper, Search, Bookmark, BarChart3, Bell] as const;
const TAB_LABELS = ['Today', 'Browse', 'Watchlist', 'Analytics', 'Alerts'] as const;

type TabRoute = BottomTabBarProps['state']['routes'][number];
type TabNavigation = BottomTabBarProps['navigation'];

const TabItem = memo(function TabItem({
  route,
  index,
  isFocused,
  navigation,
}: {
  route: TabRoute;
  index: number;
  isFocused: boolean;
  navigation: TabNavigation;
}) {
  const { colors } = useTheme();
  const Icon = TAB_ICONS[index];
  const label = TAB_LABELS[index];

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.15, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handlePress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      lightTap();
      navigation.dispatch(TabActions.jumpTo(route.name, route.params));
    }
  }, [isFocused, navigation, route.key, route.name, route.params]);

  const handleLongPress = useCallback(() => {
    navigation.emit({ type: 'tabLongPress', target: route.key });
  }, [navigation, route.key]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.tabItem}
    >
      {({ pressed }) => (
        <Animated.View style={[styles.tabContent, animatedStyle, pressed && styles.pressed]}>
          <Icon
            size={22}
            color={isFocused ? colors.tabBarActive : colors.tabBarInactive}
            strokeWidth={isFocused ? 2.2 : 1.8}
          />
          {isFocused ? (
            <Animated.Text
              style={[
                styles.tabLabel,
                { color: colors.tabBarActive },
              ]}
            >
              {label}
            </Animated.Text>
          ) : null}
          {isFocused ? (
            <View style={[styles.activeIndicator, { backgroundColor: colors.tabBarActive }]} />
          ) : null}
        </Animated.View>
      )}
    </Pressable>
  );
});

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.background,
          Platform.OS === 'android' && { backgroundColor: colors.tabBarBackground },
        ]}
      />
      <View style={[styles.topBorder, { backgroundColor: colors.tabBarBorder }]} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              navigation={navigation}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: Platform.OS === 'ios' ? 0.85 : 1,
  },
  topBorder: {
    height: StyleSheet.hairlineWidth,
  },
  tabRow: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
