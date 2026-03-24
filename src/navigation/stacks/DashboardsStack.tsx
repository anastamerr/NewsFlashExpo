import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardsScreen } from '@/screens/dashboards/DashboardsScreen';
import { DashboardDetailScreen } from '@/screens/dashboards/DashboardDetailScreen';
import { TriggerDetailScreen } from '@/screens/reports/TriggerDetailScreen';
import { TriggerSummaryScreen } from '@/screens/reports/TriggerSummaryScreen';
import { TriggerDeepDiveScreen } from '@/screens/reports/TriggerDeepDiveScreen';
import { CrisisDetailScreen } from '@/screens/reports/CrisisDetailScreen';
import { CrisisSummaryScreen } from '@/screens/reports/CrisisSummaryScreen';
import { CrisisDeepDiveScreen } from '@/screens/reports/CrisisDeepDiveScreen';
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
      <Stack.Screen name="AlertTriggerDetail" component={TriggerDetailScreen} />
      <Stack.Screen name="AlertTriggerSummary" component={TriggerSummaryScreen} />
      <Stack.Screen name="AlertTriggerDeepDive" component={TriggerDeepDiveScreen} />
      <Stack.Screen name="CrisisDetail" component={CrisisDetailScreen} />
      <Stack.Screen name="CrisisSummary" component={CrisisSummaryScreen} />
      <Stack.Screen name="CrisisDeepDive" component={CrisisDeepDiveScreen} />
    </Stack.Navigator>
  );
}
