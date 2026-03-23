import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
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
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${label}${count !== undefined ? `, ${count} items` : ''}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary + '22' : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
