import React, { createContext, useContext, useRef, useCallback } from 'react';
import { type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

interface ScrollDirectionCtx {
  isScrollingDown: { value: boolean };
  handleScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const ScrollDirectionContext = createContext<ScrollDirectionCtx>({
  isScrollingDown: { value: false },
  handleScroll: () => {},
});

export function ScrollDirectionProvider({ children }: { children: React.ReactNode }) {
  const isScrollingDown = useSharedValue(false);
  const lastOffset = useRef(0);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const delta = y - lastOffset.current;

    if (delta > 4 && y > 10) {
      isScrollingDown.value = true;
    } else if (delta < -4) {
      isScrollingDown.value = false;
    }

    lastOffset.current = y;
  }, []);

  return (
    <ScrollDirectionContext.Provider value={{ isScrollingDown, handleScroll }}>
      {children}
    </ScrollDirectionContext.Provider>
  );
}

export function useScrollDirection() {
  return useContext(ScrollDirectionContext);
}
