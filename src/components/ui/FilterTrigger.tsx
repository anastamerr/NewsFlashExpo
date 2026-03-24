import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  label: string;
  value: string;
  onPress: () => void;
}

export function FilterTrigger({ label, value, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [
        styles.trigger,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.copy}>
        <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[typePresets.labelSm, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <ChevronDown size={16} color={colors.textSecondary} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.82,
  },
});
