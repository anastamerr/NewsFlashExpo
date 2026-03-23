import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';

interface Props {
  label: string;
  variant?: Variant;
  dot?: boolean;
  small?: boolean;
}

export function Badge({ label, variant = 'neutral', dot = false, small = false }: Props) {
  const { colors } = useTheme();

  const variantColors: Record<Variant, string> = {
    success: colors.sentimentPositive,
    danger: colors.sentimentNegative,
    warning: colors.sentimentNeutral,
    info: colors.info,
    neutral: colors.textSecondary,
    primary: colors.primary,
  };

  const color = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '18' },
        small && styles.small,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text
        style={[
          small ? typePresets.labelXs : typePresets.labelSm,
          { color, textTransform: undefined },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  small: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
