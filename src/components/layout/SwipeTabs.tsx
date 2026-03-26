import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, spacing } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { lightTap } from '@/utils/haptics';

type SwipeTab<T extends string> = {
  key: T;
  label: string;
  content: React.ReactNode;
};

type Props<T extends string> = {
  tabs: readonly SwipeTab<T>[];
  requestedTab?: T;
  topInset?: number;
};

export function SwipeTabs<T extends string>({
  tabs,
  requestedTab,
  topInset = 0,
}: Props<T>) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const initialTab = useMemo(
    () => tabs.find((tab) => tab.key === requestedTab)?.key ?? tabs[0]?.key,
    [requestedTab, tabs],
  );
  const [activeTab, setActiveTab] = useState<T>(initialTab);
  const [mountedTabs, setMountedTabs] = useState<T[]>(() => (initialTab ? [initialTab] : []));
  const indicatorIndex = useSharedValue(
    Math.max(0, tabs.findIndex((tab) => tab.key === initialTab)),
  );

  useEffect(() => {
    if (requestedTab && requestedTab !== activeTab) {
      const nextIndex = tabs.findIndex((tab) => tab.key === requestedTab);

      if (nextIndex >= 0) {
        setActiveTab(requestedTab);
        setMountedTabs((current) => (
          current.includes(requestedTab) ? current : [...current, requestedTab]
        ));
        indicatorIndex.value = withTiming(nextIndex, { duration: 180 });
      }
    }
  }, [activeTab, indicatorIndex, requestedTab, tabs]);

  const handleTabPress = useCallback((tabKey: T) => {
    if (tabKey === activeTab) {
      return;
    }

    const nextIndex = tabs.findIndex((tab) => tab.key === tabKey);

    if (nextIndex < 0) {
      return;
    }

    lightTap();
    setActiveTab(tabKey);
    setMountedTabs((current) => (current.includes(tabKey) ? current : [...current, tabKey]));
    indicatorIndex.value = withTiming(nextIndex, { duration: 180 });
  }, [activeTab, indicatorIndex, tabs]);

  const indicatorStyle = useAnimatedStyle(() => {
    const itemWidth = trackWidth / Math.max(tabs.length, 1);

    return {
      width: itemWidth,
      transform: [{ translateX: indicatorIndex.value * itemWidth }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabBar, { paddingTop: topInset + spacing.sm }]}>
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    typePresets.h3,
                    {
                      color: isActive ? colors.text : colors.textTertiary,
                      fontFamily: isActive ? fontFamily.sansBold : fontFamily.sans,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View
          style={[styles.indicatorTrack, { backgroundColor: colors.borderSubtle }]}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[styles.indicator, { backgroundColor: colors.primary }, indicatorStyle]}
          />
        </View>
      </View>

      <View style={styles.content}>
        {tabs.map((tab) => {
          if (!mountedTabs.includes(tab.key)) {
            return null;
          }

          const isActive = activeTab === tab.key;

          return (
            <View
              key={tab.key}
              style={[styles.scene, !isActive && styles.sceneHidden]}
              pointerEvents={isActive ? 'auto' : 'none'}
            >
              {tab.content}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    paddingHorizontal: spacing.base,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  indicatorTrack: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  indicator: {
    height: 2,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  scene: {
    flex: 1,
  },
  sceneHidden: {
    display: 'none',
  },
});
