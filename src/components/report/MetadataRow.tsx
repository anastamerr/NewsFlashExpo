import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { SentimentBadge } from '@/components/data/SentimentBadge';
import { formatDate, timeAgo } from '@/utils/format';

interface Props {
  source: string;
  date: string;
  sentiment?: number;
  importance?: number;
}

export function MetadataRow({ source, date, sentiment, importance }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <Text style={[typePresets.label, { color: colors.textSecondary }]}>{source}</Text>
        <Text style={[typePresets.bodySm, { color: colors.textTertiary }]}>
          {formatDate(date)} &middot; {timeAgo(date)}
        </Text>
      </View>
      <View style={styles.row}>
        {sentiment !== undefined && <SentimentBadge value={sentiment} showValue small />}
        {importance !== undefined && (
          <View style={[styles.importanceBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[typePresets.labelSm, { color: colors.primary }]}>
              {importance}/10
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  importanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 9999,
  },
});
