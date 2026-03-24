import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  contextLabel: string;
  onPress: () => void;
}

export function ChatEntryPoint({ contextLabel, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ask about ${contextLabel}`}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.primary + '12',
          borderColor: colors.primary + '30',
        },
        pressed && styles.pressed,
      ]}
    >
      <MessageCircle size={20} color={colors.primary} strokeWidth={1.8} />
      <View style={styles.textWrap}>
        <Text style={[typePresets.label, { color: colors.primary }]}>Talk to News</Text>
        <Text style={[typePresets.bodySm, { color: colors.textSecondary }]} numberOfLines={1}>
          Ask questions about this {contextLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.8,
  },
});
