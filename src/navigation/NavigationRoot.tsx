import React, { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  createNavigationContainerRef,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { ScrollDirectionProvider, useScrollDirection } from '@/hooks/useScrollDirection';
import { useTheme, shadows } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { lightTap } from '@/utils/haptics';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { AlertsStack } from './stacks/AlertsStack';
import { SourcesScreen } from '@/screens/sources/SourcesScreen';
import { UsersScreen } from '@/screens/users/UsersScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index ?? 0];
  const nestedState = route.state as NavigationState | PartialState<NavigationState> | undefined;

  if (nestedState) {
    return getActiveRouteName(nestedState);
  }

  return route.name;
}

function ChatFab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { isScrollingDown } = useScrollDirection();
  const [isInteractive, setIsInteractive] = useState(true);
  const fabScale = useSharedValue(1);
  const fabProgress = useSharedValue(0);
  const handleFabInteractivityChange = useCallback((interactive: boolean) => {
    setIsInteractive(interactive);
  }, []);

  useAnimatedReaction(
    () => isScrollingDown.value,
    (down) => {
      if (down) {
        runOnJS(handleFabInteractivityChange)(false);
        fabProgress.value = withTiming(1, { duration: 220 });
        return;
      }

      fabProgress.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(handleFabInteractivityChange)(true);
        }
      });
    },
    [handleFabInteractivityChange],
  );

  const fabAnimStyle = useAnimatedStyle(() => {
    const translateY = interpolate(fabProgress.value, [0, 1], [0, 80], Extrapolation.CLAMP);
    const opacity = interpolate(fabProgress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP);
    return {
      transform: [{ scale: fabScale.value }, { translateY }],
      opacity,
    };
  });

  return (
    <AnimatedPressable
      onPress={() => { lightTap(); onPress(); }}
      onPressIn={() => { fabScale.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { fabScale.value = withSpring(1, { damping: 12 }); }}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel="Open AI chat assistant"
      style={[styles.fabPressable, fabAnimStyle]}
      pointerEvents={isInteractive ? 'auto' : 'none'}
    >
      <View style={[styles.fab, { backgroundColor: colors.primary, ...shadows.glow }]}>
        <MessageCircle size={24} color={colors.textInverse} strokeWidth={2} />
      </View>
    </AnimatedPressable>
  );
}

export function NavigationRoot() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const chatVisible = useChatStore((state) => state.isOpen);
  const openChat = useChatStore((state) => state.openChat);
  const closeChat = useChatStore((state) => state.closeChat);
  const [activeRouteName, setActiveRouteName] = useState<string>();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  const showAuth = !isAuthenticated;
  const showChatFab = activeRouteName === 'Today';

  return (
    <ScrollDirectionProvider>
      <View style={styles.root}>
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          onReady={() => {
            if (navigationRef.isReady()) {
              setActiveRouteName(getActiveRouteName(navigationRef.getRootState()));
            }
          }}
          onStateChange={(state) => {
            if (state) {
              setActiveRouteName(getActiveRouteName(state));
            }
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showAuth ? (
              <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                  <Stack.Screen name="Sources" component={SourcesScreen} />
                  <Stack.Screen name="Users" component={UsersScreen} />
                  <Stack.Screen name="Alerts" component={AlertsStack} />
                </Stack.Group>
              </>
            )}
          </Stack.Navigator>

          {/* Chat FAB */}
          {isAuthenticated && !chatVisible && showChatFab && (
            <ChatFab onPress={openChat} />
          )}

        </NavigationContainer>

        <Modal
          visible={chatVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          statusBarTranslucent
          onRequestClose={closeChat}
        >
          <ChatScreen visible={chatVisible} onClose={closeChat} />
        </Modal>
      </View>
    </ScrollDirectionProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fabPressable: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
