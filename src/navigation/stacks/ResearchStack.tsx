import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ResearchHomeScreen } from '@/screens/companies/ResearchHomeScreen';
import { CompanyDetailScreen } from '@/screens/companies/CompanyDetailScreen';
import { CompetitorAnalysisWrapper } from '@/screens/companies/CompetitorAnalysisWrapper';
import { useTheme } from '@/theme';
import type { ResearchStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<ResearchStackParamList>();

export function ResearchStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ResearchHome" component={ResearchHomeScreen} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
      <Stack.Screen name="CompetitorAnalysis" component={CompetitorAnalysisWrapper} />
    </Stack.Navigator>
  );
}
