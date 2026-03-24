import React from 'react';
import { View, StyleSheet, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, spacing, radius } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 40 }: Props) {
  const { colors, isDark } = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, style]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.overlay, { backgroundColor: colors.cardGlass }]} />
        <View style={[styles.border, { borderColor: colors.borderSubtle }]} />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.content,
        {
          backgroundColor: colors.cardGlass,
          borderColor: colors.borderSubtle,
          borderWidth: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  content: {
    padding: spacing.base,
    borderRadius: radius.lg,
  },
});
