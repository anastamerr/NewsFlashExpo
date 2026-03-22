import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme, radius } from '@/theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius: br = radius.sm,
  style,
}: Props) {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: colors.muted,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="60%" height={12} />
      <Skeleton width="100%" height={18} style={{ marginTop: 8 }} />
      <Skeleton width="90%" height={14} style={{ marginTop: 6 }} />
      <Skeleton width="40%" height={10} style={{ marginTop: 10 }} />
    </View>
  );
}

export function SkeletonMetric() {
  return (
    <View style={skeletonStyles.metric}>
      <Skeleton width={60} height={10} />
      <Skeleton width={80} height={28} style={{ marginTop: 6 }} />
      <Skeleton width={40} height={10} style={{ marginTop: 4 }} />
    </View>
  );
}

export function SkeletonArticle({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View style={skeletonStyles.articleCompact}>
        <View style={{ flex: 1 }}>
          <Skeleton width="40%" height={10} />
          <Skeleton width="100%" height={16} style={{ marginTop: 6 }} />
          <Skeleton width="30%" height={10} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={60} borderRadius={8} style={{ marginLeft: 12 }} />
      </View>
    );
  }
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="100%" height={160} borderRadius={12} />
      <Skeleton width="35%" height={10} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={18} style={{ marginTop: 6 }} />
      <Skeleton width="85%" height={14} style={{ marginTop: 6 }} />
      <Skeleton width="45%" height={10} style={{ marginTop: 10 }} />
    </View>
  );
}

export function SkeletonAlert() {
  const { colors } = useTheme();
  return (
    <View style={skeletonStyles.alert}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2, backgroundColor: colors.muted, opacity: 0.5 }} />
      <View style={{ paddingLeft: 12, flex: 1 }}>
        <Skeleton width="25%" height={10} />
        <Skeleton width="80%" height={16} style={{ marginTop: 6 }} />
        <Skeleton width="100%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="35%" height={10} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonWatchlistRow() {
  return (
    <View style={skeletonStyles.watchlistRow}>
      <Skeleton width={40} height={40} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={50} height={24} borderRadius={6} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  metric: {
    width: 140,
    padding: 16,
  },
  articleCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alert: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  watchlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
