import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertsScreen } from '@/screens/alerts/AlertsScreen';
import { AlertDetailScreen } from '@/screens/alerts/AlertDetailScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { TriggerDetailScreen } from '@/screens/reports/TriggerDetailScreen';
import { TriggerSummaryScreen } from '@/screens/reports/TriggerSummaryScreen';
import { TriggerDeepDiveScreen } from '@/screens/reports/TriggerDeepDiveScreen';
import { CrisisDetailScreen } from '@/screens/reports/CrisisDetailScreen';
import { CrisisSummaryScreen } from '@/screens/reports/CrisisSummaryScreen';
import { CrisisDeepDiveScreen } from '@/screens/reports/CrisisDeepDiveScreen';
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
      <Stack.Screen name="AlertTriggerDetail" component={TriggerDetailScreen} />
      <Stack.Screen name="AlertTriggerSummary" component={TriggerSummaryScreen} />
      <Stack.Screen name="AlertTriggerDeepDive" component={TriggerDeepDiveScreen} />
      <Stack.Screen name="CrisisDetail" component={CrisisDetailScreen} />
      <Stack.Screen name="CrisisSummary" component={CrisisSummaryScreen} />
      <Stack.Screen name="CrisisDeepDive" component={CrisisDeepDiveScreen} />
    </Stack.Navigator>
  );
}
