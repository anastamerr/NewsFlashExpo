import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { lightTap } from '@/utils/haptics';
import { ANIMATION } from '@/constants/app';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(ANIMATION.PRESS_SCALE, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      lightTap();
      onPress();
    }
  }, [onPress, disabled, loading]);

  const bgColor: Record<Variant, string> = {
    primary: colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColor: Record<Variant, string> = {
    primary: colors.textInverse,
    secondary: colors.primary,
    ghost: colors.text,
    danger: colors.textInverse,
  };

  const borderColor: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: colors.primary,
    ghost: undefined,
    danger: undefined,
  };

  const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
  const fontSizes: Record<Size, TextStyle> = {
    sm: typePresets.labelSm,
    md: typePresets.label,
    lg: typePresets.bodyLg,
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={fullWidth ? styles.fullWidth : undefined}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            animatedStyle,
            styles.button,
            {
              backgroundColor: bgColor[variant],
              height: heights[size],
              borderColor: borderColor[variant],
              borderWidth: borderColor[variant] ? 1.5 : 0,
              opacity: disabled ? 0.5 : 1,
            },
            pressed && styles.pressed,
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={textColor[variant]} />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  fontSizes[size],
                  { color: textColor[variant], fontFamily: typePresets.label.fontFamily },
                ]}
              >
                {label}
              </Text>
            </>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.8,
  },
  fullWidth: {
    width: '100%',
  },
});
