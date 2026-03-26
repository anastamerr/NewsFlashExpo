import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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

const TYPE_ICONS = {
  company: Building2,
  people: Users,
  sector: TrendingUp,
  market: Globe,
} as const;

interface Props {
  item: WatchlistItem;
  onPress: (item: WatchlistItem) => void;
  onLongPress?: (item: WatchlistItem) => void;
  onActionPress?: (item: WatchlistItem) => void;
  actionLabel?: string;
  selected?: boolean;
}

export const WatchlistRow = memo(function WatchlistRow({
  item,
  onPress,
  onLongPress,
  onActionPress,
  actionLabel = 'Focus',
  selected = false,
}: Props) {
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
  const handleLongPress = useCallback(() => {
    onLongPress?.(item);
  }, [item, onLongPress]);
  const handleActionPress = useCallback(() => {
    onActionPress?.(item);
  }, [item, onActionPress]);

  const Icon = TYPE_ICONS[item.type] || Building2;
  const sentimentLabel = item.sentiment !== undefined ? getSentimentLabel(item.sentiment) : 'neutral';
  const sentimentVariant = sentimentLabel === 'positive' ? 'success' : sentimentLabel === 'negative' ? 'danger' : 'warning';
  const sparkColor =
    sentimentLabel === 'positive'
      ? colors.sentimentPositive
      : sentimentLabel === 'negative'
        ? colors.sentimentNegative
        : colors.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.borderSubtle },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${item.name}${item.symbol ? `, ${item.symbol}` : ''}, sentiment ${sentimentLabel}`}
        accessibilityState={{ selected }}
        style={styles.rowPressable}
      >
        {({ pressed }) => (
          <Animated.View style={[animatedStyle, styles.rowContent, pressed && styles.pressed]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Icon size={20} color={colors.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={[typePresets.h3, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {selected ? (
                  <Text style={[typePresets.labelSm, { color: colors.primary }]}>Focused</Text>
                ) : null}
              </View>
              <View style={styles.meta}>
                {item.symbol ? (
                  <Text style={[typePresets.monoSm, { color: colors.textTertiary }]}>
                    {item.symbol}
                  </Text>
                ) : null}
                {item.articleCount !== undefined ? (
                  <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
                    {item.articleCount} articles
                  </Text>
                ) : null}
              </View>
            </View>
            <SparkLine
              data={item.sparkData ?? [1, 2, 1.5, 3, 2.5, 3.2, 2.8]}
              width={50}
              height={24}
              color={sparkColor}
            />
            <Badge label={sentimentLabel} variant={sentimentVariant} small />
          </Animated.View>
        )}
      </Pressable>

      {onActionPress ? (
        <Pressable
          onPress={handleActionPress}
          accessibilityRole="button"
          accessibilityLabel={`${selected ? 'Focused item' : 'Focus item'} ${item.name}`}
          accessibilityState={{ selected }}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: selected ? colors.primary + '14' : colors.surfaceElevated,
              borderColor: selected ? colors.primary : colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[typePresets.labelSm, { color: selected ? colors.primary : colors.textSecondary }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    marginBottom: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowPressable: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginLeft: spacing.base + 40 + spacing.md + spacing.sm,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
});
