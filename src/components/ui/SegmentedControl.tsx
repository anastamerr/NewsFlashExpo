import React, { useCallback } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { selectionTap } from '@/utils/haptics';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: Props) {
  const { colors } = useTheme();

  const handleChange = useCallback((nextValue: string) => {
    if (nextValue === value) {
      return;
    }

    selectionTap();
    onChange(nextValue);
  }, [onChange, value]);

  return (
    <View style={[styles.container, { backgroundColor: colors.muted, borderColor: colors.borderSubtle }]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => handleChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.surfaceElevated },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                typePresets.labelSm,
                { color: selected ? colors.text : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xxs,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.8,
  },
});
