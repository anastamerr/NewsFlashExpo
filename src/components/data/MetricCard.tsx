import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  format?: (n: number) => string;
}

export function MetricCard({
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  format: formatFn,
}: Props) {
  const { colors } = useTheme();

  const displayValue = formatFn ? formatFn(value) : `${prefix}${value}${suffix}`;

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? colors.sentimentPositive : trend && trend < 0 ? colors.sentimentNegative : colors.textTertiary;

  return (
    <GlassCard style={styles.container}>
      <Text style={[typePresets.labelXs, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[typePresets.monoLg, { color: colors.text, marginTop: spacing.xs }]}>
        {displayValue}
      </Text>
      {trend !== undefined && (
        <View style={styles.trendRow}>
          <TrendIcon size={12} color={trendColor} strokeWidth={2.5} />
          <Text style={[typePresets.labelSm, { color: trendColor }]}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: spacing.sm,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
});
