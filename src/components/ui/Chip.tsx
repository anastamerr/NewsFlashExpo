import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { selectionTap } from '@/utils/haptics';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  count?: number;
}

export function Chip({ label, selected = false, onPress, count }: Props) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    selectionTap();
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label}${count !== undefined ? `, ${count} items` : ''}`}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary + '22' : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          typePresets.labelSm,
          { color: selected ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
