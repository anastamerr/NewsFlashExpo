import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  value: number;
  label?: string;
}

export function TrendIndicator({ value, label }: Props) {
  const { colors } = useTheme();

  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = value > 0 ? colors.sentimentPositive : value < 0 ? colors.sentimentNegative : colors.textTertiary;

  return (
    <View style={styles.container}>
      <Icon size={14} color={color} strokeWidth={2.5} />
      <Text style={[typePresets.labelSm, { color }]}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </Text>
      {label && (
        <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
