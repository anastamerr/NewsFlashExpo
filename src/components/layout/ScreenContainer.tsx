import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '@/theme';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'bottom')[];
}

export function ScreenContainer({
  children,
  scrollable = true,
  padded = true,
  refreshing,
  onRefresh,
  edges = ['top'],
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    edges.includes('top') && { paddingTop: insets.top },
    edges.includes('bottom') && { paddingBottom: insets.bottom + 80 },
    !edges.includes('bottom') && { paddingBottom: 80 },
  ];

  if (!scrollable) {
    return (
      <View style={[containerStyle, padded && styles.padded]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentInsetAdjustmentBehavior={edges.includes('top') ? 'automatic' : 'never'}
      contentContainerStyle={[
        Platform.OS === 'android' && edges.includes('top') ? { paddingTop: insets.top } : null,
        { paddingBottom: insets.bottom + 90 },
        padded && styles.padded,
      ]}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.base,
  },
});
