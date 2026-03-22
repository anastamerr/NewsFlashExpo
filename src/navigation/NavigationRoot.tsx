import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
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

export function NavigationRoot() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isBootstrapping, tenants, tenantId } = useAuthStore();
  const [chatVisible, setChatVisible] = useState(false);
  const fabScale = useSharedValue(1);

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

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
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
      </NavigationContainer>

      {/* Chat FAB */}
      {isAuthenticated && !chatVisible && (
        <AnimatedTouchable
          onPress={() => { lightTap(); setChatVisible(true); }}
          onPressIn={() => { fabScale.value = withSpring(0.9, { damping: 12 }); }}
          onPressOut={() => { fabScale.value = withSpring(1, { damping: 12 }); }}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Open AI chat assistant"
          style={[
            styles.fab,
            fabStyle,
            { backgroundColor: colors.primary, ...shadows.glow },
          ]}
        >
          <MessageCircle size={24} color={colors.textInverse} strokeWidth={2} />
        </AnimatedTouchable>
      )}

      {/* Chat Overlay */}
      {chatVisible && (
        <View style={StyleSheet.absoluteFill}>
          <ChatScreen visible={chatVisible} onClose={() => setChatVisible(false)} />
        </View>
      )}
    </View>
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
