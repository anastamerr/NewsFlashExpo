import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { timeAgo } from '@/utils/format';
import { ANIMATION } from '@/constants/app';
import type { AlertPublic } from '@/types/api';

interface Props {
  alert: AlertPublic;
  onPress: (alert: AlertPublic) => void;
  onLongPress?: (alert: AlertPublic) => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#ef4444', Icon: ShieldAlert },
  HIGH: { color: '#f97316', Icon: AlertTriangle },
  MEDIUM: { color: '#eab308', Icon: AlertCircle },
  LOW: { color: '#8aa8ff', Icon: Info },
} as const;

export const AlertRow = memo(function AlertRow({ alert, onPress, onLongPress }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const config = SEVERITY_CONFIG[alert.severity];

  React.useEffect(() => {
    if (alert.severity === 'CRITICAL' && !alert.isResolved) {
      pulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 1500 }),
        -1,
        true,
      );
    }
  }, [alert.severity, alert.isResolved]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(ANIMATION.CARD_PRESS_SCALE, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = useCallback(() => onPress(alert), [alert, onPress]);
  const handleLongPress = useCallback(() => {
    onLongPress?.(alert);
  }, [alert, onLongPress]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${alert.severity} alert: ${alert.title}${alert.isResolved ? ', resolved' : ''}`}
      style={styles.pressable}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            animatedStyle,
            styles.container,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.iconBadge,
                  { backgroundColor: config.color + '18' },
                  alert.severity === 'CRITICAL' ? pulseStyle : null,
                ]}
              >
                <config.Icon size={16} color={config.color} strokeWidth={2.5} />
              </Animated.View>
              <View style={styles.headerText}>
                <Text style={[typePresets.labelXs, { color: config.color, textTransform: undefined }]}>
                  {alert.severity}
                </Text>
                <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>
                  {timeAgo(alert.createdAt)}
                </Text>
              </View>
            </View>
            <Text
              style={[typePresets.h3, { color: colors.text, marginTop: spacing.sm }]}
              numberOfLines={1}
            >
              {alert.title}
            </Text>
            <Text
              style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}
              numberOfLines={2}
            >
              {alert.message}
            </Text>
            {alert.keywords.length > 0 ? (
              <View style={styles.keywords}>
                {alert.keywords.slice(0, 3).map((kw) => (
                  <View key={kw} style={[styles.keyword, { backgroundColor: colors.muted }]}>
                    <Text style={[typePresets.labelXs, { color: colors.textSecondary, textTransform: undefined }]}>
                      {kw}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    marginBottom: spacing.sm,
  },
  pressable: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keywords: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  keyword: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
  },
});
