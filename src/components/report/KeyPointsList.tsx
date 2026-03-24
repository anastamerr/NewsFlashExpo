import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import type { KeyPoint } from '@/types/api';

interface Props {
  points: KeyPoint[];
  title?: string;
}

export function KeyPointsList({ points, title = 'Key Takeaways' }: Props) {
  const { colors } = useTheme();

  const dotColor = (sentiment?: string) => {
    if (sentiment === 'positive') return colors.sentimentPositive;
    if (sentiment === 'negative') return colors.sentimentNegative;
    return colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.md }]}>
        {title.toUpperCase()}
      </Text>
      {points.map((point, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: dotColor(point.sentiment) }]} />
          <Text style={[typePresets.body, { color: colors.text, flex: 1 }]}>{point.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
});
