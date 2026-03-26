import React, { createContext, useContext, useCallback } from 'react';
import { type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

interface ScrollDirectionCtx {
  isScrollingDown: SharedValue<boolean>;
  updateScrollDirection: (offsetY: number) => void;
  handleScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const ScrollDirectionContext = createContext<ScrollDirectionCtx>({
  isScrollingDown: { value: false } as SharedValue<boolean>,
  updateScrollDirection: () => {},
  handleScroll: () => {},
});

export function ScrollDirectionProvider({ children }: { children: React.ReactNode }) {
  const isScrollingDown = useSharedValue(false);
  const lastOffset = useSharedValue(0);

  const updateScrollDirection = useCallback((offsetY: number) => {
    'worklet';

    const delta = offsetY - lastOffset.value;

    if (delta > 4 && offsetY > 10) {
      isScrollingDown.value = true;
    } else if (delta < -4 || offsetY <= 0) {
      isScrollingDown.value = false;
    }

    lastOffset.value = offsetY;
  }, [isScrollingDown, lastOffset]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateScrollDirection(e.nativeEvent.contentOffset.y);
  }, [updateScrollDirection]);

  return (
    <ScrollDirectionContext.Provider value={{ isScrollingDown, updateScrollDirection, handleScroll }}>
      {children}
    </ScrollDirectionContext.Provider>
  );
}

export function useScrollDirection() {
  return useContext(ScrollDirectionContext);
}
