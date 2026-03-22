import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { ScrollDirectionProvider, useScrollDirection } from '@/hooks/useScrollDirection';
import { useTheme, shadows } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { lightTap } from '@/utils/haptics';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { SourcesScreen } from '@/screens/sources/SourcesScreen';
import { UsersScreen } from '@/screens/users/UsersScreen';
import { CompaniesScreen } from '@/screens/companies/CompaniesScreen';
import { CompanyDetailScreen } from '@/screens/companies/CompanyDetailScreen';
import { CompetitorAnalysisScreen } from '@/screens/companies/CompetitorAnalysisScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import type { RootStackParamList } from '@/types/navigation';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const Stack = createNativeStackNavigator<RootStackParamList>();

function ChatFab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { isScrollingDown } = useScrollDirection();
  const fabScale = useSharedValue(1);
  const fabProgress = useSharedValue(0);

  useAnimatedReaction(
    () => isScrollingDown.value,
    (down) => {
      fabProgress.value = withTiming(down ? 1 : 0, { duration: 250 });
    },
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
    <AnimatedTouchable
      onPress={() => { lightTap(); onPress(); }}
      onPressIn={() => { fabScale.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { fabScale.value = withSpring(1, { damping: 12 }); }}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Open AI chat assistant"
      style={[
        styles.fab,
        fabAnimStyle,
        { backgroundColor: colors.primary, ...shadows.glow },
      ]}
    >
      <MessageCircle size={24} color={colors.textInverse} strokeWidth={2} />
    </AnimatedTouchable>
  );
}

export function NavigationRoot() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isBootstrapping, tenants, tenantId } = useAuthStore();
  const [chatVisible, setChatVisible] = useState(false);

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

  return (
    <ScrollDirectionProvider>
      <View style={styles.root}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showAuth ? (
              <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="Sources" component={SourcesScreen} />
                  <Stack.Screen name="Users" component={UsersScreen} />
                  <Stack.Screen name="Companies" component={CompaniesScreen} />
                  <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
                  <Stack.Screen name="CompetitorAnalysis" component={CompetitorAnalysisScreen} />
                </Stack.Group>
              </>
            )}
          </Stack.Navigator>

          {/* Chat FAB */}
          {isAuthenticated && !chatVisible && (
            <ChatFab onPress={() => setChatVisible(true)} />
          )}

          {/* Chat Overlay */}
          {chatVisible && (
            <View style={StyleSheet.absoluteFill}>
              <ChatScreen visible={chatVisible} onClose={() => setChatVisible(false)} />
            </View>
          )}
        </NavigationContainer>
      </View>
    </ScrollDirectionProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
