import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, radius, shadows } from '@/theme';
import { ANIMATION } from '@/constants/app';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export function Card({ children, onPress, variant = 'default', style }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(ANIMATION.CARD_PRESS_SCALE, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const cardStyle: ViewStyle = {
    backgroundColor: variant === 'elevated' ? colors.surfaceElevated : colors.surface,
    borderColor: variant === 'outlined' ? colors.border : 'transparent',
    borderWidth: variant === 'outlined' ? 1 : 0,
    ...(variant === 'elevated' ? shadows.md : shadows.sm),
  };

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        style={[animatedStyle, styles.card, cardStyle, style]}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <View style={[styles.card, cardStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.base,
  },
});
