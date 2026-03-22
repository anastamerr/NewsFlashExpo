import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

function TabItem({
  index,
  isFocused,
  onPress,
  onLongPress,
}: {
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
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
    lightTap();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <Icon
          size={22}
          color={isFocused ? colors.tabBarActive : colors.tabBarInactive}
          strokeWidth={isFocused ? 2.2 : 1.8}
        />
        {isFocused && (
          <Animated.Text
            style={[
              styles.tabLabel,
              { color: colors.tabBarActive },
            ]}
          >
            {label}
          </Animated.Text>
        )}
        {isFocused && (
          <View style={[styles.activeIndicator, { backgroundColor: colors.tabBarActive }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
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
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              index={index}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
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
