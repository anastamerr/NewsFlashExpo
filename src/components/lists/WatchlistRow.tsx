import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Building2, Users, TrendingUp, Globe } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { SparkLine } from '@/components/charts/SparkLine';
import { getSentimentLabel } from '@/utils/sentiment';
import { ANIMATION } from '@/constants/app';
import type { WatchlistItem } from '@/types/api';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TYPE_ICONS = {
  company: Building2,
  people: Users,
  sector: TrendingUp,
  market: Globe,
} as const;

interface Props {
  item: WatchlistItem;
  onPress: (item: WatchlistItem) => void;
}

export const WatchlistRow = memo(function WatchlistRow({ item, onPress }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(ANIMATION.CARD_PRESS_SCALE, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  const Icon = TYPE_ICONS[item.type] || Building2;
  const sentimentLabel = item.sentiment !== undefined ? getSentimentLabel(item.sentiment) : 'neutral';
  const sentimentVariant = sentimentLabel === 'positive' ? 'success' : sentimentLabel === 'negative' ? 'danger' : 'warning';

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}${item.symbol ? `, ${item.symbol}` : ''}, sentiment ${sentimentLabel}`}
      style={[
        animatedStyle,
        styles.container,
        { backgroundColor: colors.surface },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Icon size={20} color={colors.primary} strokeWidth={1.8} />
      </View>
      <View style={styles.info}>
        <Text style={[typePresets.h3, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.meta}>
          {item.symbol && (
            <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>
              {item.symbol}
            </Text>
          )}
          {item.articleCount !== undefined && (
            <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
              {item.articleCount} articles
            </Text>
          )}
        </View>
      </View>
      <SparkLine
        data={item.sparkData ?? [1, 2, 1.5, 3, 2.5, 3.2, 2.8]}
        width={50}
        height={24}
        color={sentimentLabel === 'positive' ? colors.sentimentPositive : sentimentLabel === 'negative' ? colors.sentimentNegative : colors.primary}
      />
      <Badge label={sentimentLabel} variant={sentimentVariant} small />
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
});
