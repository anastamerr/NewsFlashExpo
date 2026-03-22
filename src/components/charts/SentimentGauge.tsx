import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  positive: number;
  negative: number;
  neutral: number;
  height?: number;
  showLabels?: boolean;
}

export function SentimentGauge({
  positive,
  negative,
  neutral,
  height = 8,
  showLabels = true,
}: Props) {
  const { colors } = useTheme();
  const total = positive + negative + neutral || 1;

  return (
    <View>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.segment,
            {
              flex: positive,
              backgroundColor: colors.sentimentPositive,
              borderTopLeftRadius: height / 2,
              borderBottomLeftRadius: height / 2,
            },
          ]}
        />
        {neutral > 0 && (
          <View
            style={[styles.segment, { flex: neutral, backgroundColor: colors.sentimentNeutral }]}
          />
        )}
        <View
          style={[
            styles.segment,
            {
              flex: negative,
              backgroundColor: colors.sentimentNegative,
              borderTopRightRadius: height / 2,
              borderBottomRightRadius: height / 2,
            },
          ]}
        />
      </View>
      {showLabels && (
        <View style={styles.labels}>
          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: colors.sentimentPositive }]} />
            <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>
              {Math.round((positive / total) * 100)}% Positive
            </Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: colors.sentimentNeutral }]} />
            <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>
              {Math.round((neutral / total) * 100)}% Neutral
            </Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: colors.sentimentNegative }]} />
            <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>
              {Math.round((negative / total) * 100)}% Negative
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  segment: {
    height: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
