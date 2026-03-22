import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATION } from '@/constants/app';

export function useAnimatedEntry(index: number, enabled: boolean = true) {
  const opacity = useSharedValue(enabled ? 0 : 1);
  const translateY = useSharedValue(enabled ? 20 : 0);

  useEffect(() => {
    if (!enabled) return;
    const delay = Math.min(index * ANIMATION.STAGGER_DELAY, ANIMATION.MAX_STAGGER_ITEMS * ANIMATION.STAGGER_DELAY);
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, ANIMATION.SPRING_CONFIG));
  }, [enabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}
