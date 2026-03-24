import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, type TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  ...props
}: Props) {
  const { colors } = useTheme();
  const focus = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(false);

  const focusFrameStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger + '24'
      : interpolateColor(
          focus.value,
          [0, 1],
          ['transparent', colors.primary + '2e'],
        ),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger
      : interpolateColor(
          focus.value,
          [0, 1],
          [colors.border, colors.primary],
        ),
  }));

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    focus.value = withTiming(1, { duration: 200 });
    props.onFocus?.(e);
  }, [props.onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    focus.value = withTiming(0, { duration: 200 });
    props.onBlur?.(e);
  }, [props.onBlur]);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <AnimatedView
        style={[
          styles.focusFrame,
          focusFrameStyle,
        ]}
      >
        <AnimatedView
          style={[
            styles.inputContainer,
            { backgroundColor: colors.inputBackground },
            borderStyle,
            isFocused && { backgroundColor: colors.surface },
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <TextInput
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={label || props.placeholder}
            accessibilityHint={error ? `Error: ${error}` : undefined}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: fontFamily.sans,
              },
              Platform.OS === 'web' ? styles.webInput : null,
              style,
            ]}
          />
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </AnimatedView>
      </AnimatedView>
      {error ? (
        <Text style={[typePresets.bodySm, { color: colors.danger, marginTop: spacing.xs }]}>
          {error}
        </Text>
      ) : null}
      {hint && !error ? (
        <Text style={[typePresets.bodySm, { color: colors.textTertiary, marginTop: spacing.xs }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.base,
  },
  focusFrame: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 2,
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: spacing.md,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  webInput: {
    outlineWidth: 0,
  },
});
