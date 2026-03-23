import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
      <Search size={18} color={colors.textTertiary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoFocus={autoFocus}
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        style={[styles.input, { color: colors.text, fontFamily: fontFamily.sans }]}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search" style={({ pressed }) => pressed && styles.pressed}>
          <X size={16} color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
