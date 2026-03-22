import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertsScreen } from '@/screens/alerts/AlertsScreen';
import { AlertDetailScreen } from '@/screens/alerts/AlertDetailScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { useTheme } from '@/theme';
import type { AlertsStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AlertsStackParamList>();

export function AlertsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}
