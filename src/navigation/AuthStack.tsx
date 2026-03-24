import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignupOnboardingScreen } from '@/screens/auth/SignupOnboardingScreen';
import { TenantSelectScreen } from '@/screens/auth/TenantSelectScreen';
import type { AuthStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupOnboarding" component={SignupOnboardingScreen} />
      <Stack.Screen name="TenantSelect" component={TenantSelectScreen} />
    </Stack.Navigator>
  );
}
