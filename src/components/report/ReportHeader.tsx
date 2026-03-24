import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Share2, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';

interface Props {
  title: string;
  onBack: () => void;
  onShare?: () => void;
  onChat?: () => void;
}

export function ReportHeader({ title, onBack, onShare, onChat }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={[typePresets.label, { color: colors.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.actions}>
        {onChat && (
          <Pressable
            onPress={onChat}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Talk to News"
          >
            <MessageCircle size={20} color={colors.textSecondary} strokeWidth={1.8} />
          </Pressable>
        )}
        {onShare && (
          <Pressable
            onPress={onShare}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Share2 size={20} color={colors.textSecondary} strokeWidth={1.8} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.7,
  },
});
