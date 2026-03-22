import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BrowseScreen } from '@/screens/browse/BrowseScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { useTheme } from '@/theme';
import type { BrowseStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<BrowseStackParamList>();

export function BrowseStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Browse" component={BrowseScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}
