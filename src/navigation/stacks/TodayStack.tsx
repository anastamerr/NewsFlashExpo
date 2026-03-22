import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '@/screens/today/TodayScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { CompanyDetailScreen } from '@/screens/companies/CompanyDetailScreen';
import { useTheme } from '@/theme';
import type { TodayStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Today" component={TodayScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
    </Stack.Navigator>
  );
}
