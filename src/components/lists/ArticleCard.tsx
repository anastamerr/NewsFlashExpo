import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { getSentimentLabel } from '@/utils/sentiment';
import { timeAgo, formatSentiment } from '@/utils/format';
import { ANIMATION } from '@/constants/app';
import type { Article } from '@/types/api';

interface Props {
  article: Article;
  mode?: 'compact' | 'expanded';
  onPress: (article: Article) => void;
  index?: number;
}

export const ArticleCard = memo(function ArticleCard({
  article,
  mode = 'expanded',
  onPress,
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

  const handlePress = useCallback(() => onPress(article), [article, onPress]);

  const sentimentLabel = getSentimentLabel(article.sentiment);
  const sentimentVariant = sentimentLabel === 'positive' ? 'success' : sentimentLabel === 'negative' ? 'danger' : 'warning';

  if (mode === 'compact') {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${article.title}, ${article.source}, sentiment ${sentimentLabel}`}
        style={styles.pressable}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              animatedStyle,
              styles.compactContainer,
              { borderBottomColor: colors.borderSubtle },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.compactLeft}>
              <Text
                style={[typePresets.body, { color: colors.text }]}
                numberOfLines={1}
              >
                {article.title}
              </Text>
              <View style={styles.compactMeta}>
                <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
                  {article.source}
                </Text>
                <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
                  {timeAgo(article.date)}
                </Text>
              </View>
            </View>
            <Badge
              label={formatSentiment(article.sentiment)}
              variant={sentimentVariant}
              small
            />
          </Animated.View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${article.source}, sentiment ${sentimentLabel}`}
      style={styles.pressable}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            animatedStyle,
            styles.expandedContainer,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.expandedHeader}>
            <View style={[styles.sourceDot, { backgroundColor: colors.primary }]} />
            <Text style={[typePresets.labelSm, { color: colors.textSecondary }]}>
              {article.source}
            </Text>
            <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>
              {timeAgo(article.date)}
            </Text>
          </View>

          <Text
            style={[typePresets.articleTitle, { color: colors.text, marginTop: spacing.sm }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          {article.summary ? (
            <Text
              style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}
              numberOfLines={2}
            >
              {article.summary}
            </Text>
          ) : null}

          <View style={styles.expandedFooter}>
            <Badge label={sentimentLabel} variant={sentimentVariant} dot />
            {article.tag ? (
              <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[typePresets.labelXs, { color: colors.textSecondary, textTransform: undefined }]}>
                  {article.tag}
                </Text>
              </View>
            ) : null}
            {article.company ? (
              <Text style={[typePresets.labelSm, { color: colors.primary }]}>
                {article.company}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  compactMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  pressable: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.8,
  },
  expandedContainer: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  expandedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
  },
});
