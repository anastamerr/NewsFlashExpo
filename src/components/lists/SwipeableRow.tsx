import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Bookmark, Share2, Trash2 } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { lightTap, successNotification } from '@/utils/haptics';

interface SwipeAction {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  onPress: () => void;
}

interface Props {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeableOpen?: (direction: 'left' | 'right') => void;
}

export function SwipeableRow({
  children,
  leftActions,
  rightActions,
  onSwipeableOpen,
}: Props) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const close = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderLeftActions = useCallback(
    (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      if (!leftActions?.length) return null;

      return (
        <View style={styles.actionsContainer}>
          {leftActions.map((action, index) => {
            const trans = dragX.interpolate({
              inputRange: [0, 50, 100],
              outputRange: [-20, 0, 0],
              extrapolate: 'clamp',
            });
            const opacity = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <RNAnimated.View
                key={index}
                style={[{ transform: [{ translateX: trans }], opacity }]}
              >
                <RectButton
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={() => {
                    successNotification();
                    action.onPress();
                    close();
                  }}
                >
                  <action.icon size={20} color="#fff" strokeWidth={2} />
                  <Text style={[typePresets.labelSm, { color: '#fff' }]}>{action.label}</Text>
                </RectButton>
              </RNAnimated.View>
            );
          })}
        </View>
      );
    },
    [leftActions, close],
  );

  const renderRightActions = useCallback(
    (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      if (!rightActions?.length) return null;

      return (
        <View style={styles.actionsContainer}>
          {rightActions.map((action, index) => {
            const trans = dragX.interpolate({
              inputRange: [-100, -50, 0],
              outputRange: [0, 0, 20],
              extrapolate: 'clamp',
            });
            const opacity = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <RNAnimated.View
                key={index}
                style={[{ transform: [{ translateX: trans }], opacity }]}
              >
                <RectButton
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={() => {
                    lightTap();
                    action.onPress();
                    close();
                  }}
                >
                  <action.icon size={20} color="#fff" strokeWidth={2} />
                  <Text style={[typePresets.labelSm, { color: '#fff' }]}>{action.label}</Text>
                </RectButton>
              </RNAnimated.View>
            );
          })}
        </View>
      );
    },
    [rightActions, close],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={leftActions?.length ? renderLeftActions : undefined}
      renderRightActions={rightActions?.length ? renderRightActions : undefined}
      onSwipeableOpen={(direction) => {
        lightTap();
        onSwipeableOpen?.(direction);
      }}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

// Pre-built action configs
export function useBookmarkAction(onBookmark: () => void) {
  const { colors } = useTheme();
  return {
    icon: Bookmark,
    label: 'Save',
    color: colors.primary,
    onPress: onBookmark,
  };
}

export function useShareAction(onShare: () => void) {
  const { colors } = useTheme();
  return {
    icon: Share2,
    label: 'Share',
    color: colors.textSecondary,
    onPress: onShare,
  };
}

export function useDeleteAction(onDelete: () => void) {
  return {
    icon: Trash2,
    label: 'Delete',
    color: '#ef4444',
    onPress: onDelete,
  };
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radius.sm,
    marginHorizontal: 2,
  },
});
