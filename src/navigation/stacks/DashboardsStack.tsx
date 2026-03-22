import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardsScreen } from '@/screens/dashboards/DashboardsScreen';
import { DashboardDetailScreen } from '@/screens/dashboards/DashboardDetailScreen';
import { useTheme } from '@/theme';
import type { DashboardsStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<DashboardsStackParamList>();

export function DashboardsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Dashboards" component={DashboardsScreen} />
      <Stack.Screen name="DashboardDetail" component={DashboardDetailScreen} />
    </Stack.Navigator>
  );
}
