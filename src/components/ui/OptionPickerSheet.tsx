import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

export interface OptionPickerItem {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  value: string;
  options: readonly OptionPickerItem[];
  onClose: () => void;
  onSelect: (value: string) => void;
}

export function OptionPickerSheet({
  visible,
  title,
  description,
  value,
  options,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useTheme();

  return (
    <BottomSheetModal
      visible={visible}
      title={title}
      description={description}
      onClose={onClose}
    >
      <View style={styles.optionList}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? colors.primary + '10' : colors.surface,
                  borderColor: selected ? colors.primary + '28' : colors.borderSubtle,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionCopy}>
                <Text style={[typePresets.labelSm, { color: colors.text }]}>{option.label}</Text>
                {option.description ? (
                  <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {selected ? <Check size={16} color={colors.primary} strokeWidth={2.5} /> : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  optionList: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.84,
  },
});
