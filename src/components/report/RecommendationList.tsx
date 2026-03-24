import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import type { Recommendation } from '@/types/api';

interface Props {
  items: Recommendation[];
  title?: string;
}

const PRIORITY_COLORS = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
} as const;

export function RecommendationList({ items, title = 'Recommendations' }: Props) {
  const { colors } = useTheme();

  const priorityColor = (p?: string) => {
    if (p === 'high') return colors.danger;
    if (p === 'medium') return colors.warning;
    if (p === 'low') return colors.info;
    return colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <Text style={[typePresets.labelXs, { color: colors.primary, marginBottom: spacing.md }]}>
        {title.toUpperCase()}
      </Text>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.indicator, { backgroundColor: priorityColor(item.priority) }]} />
          <View style={styles.content}>
            <Text style={[typePresets.body, { color: colors.text }]}>{item.text}</Text>
            {item.priority && (
              <Text style={[typePresets.labelSm, { color: priorityColor(item.priority), marginTop: spacing.xxs }]}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} priority
              </Text>
            )}
          </View>
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
  indicator: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    minHeight: 20,
  },
  content: {
    flex: 1,
  },
});
