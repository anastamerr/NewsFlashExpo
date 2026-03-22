import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WatchlistScreen } from '@/screens/watchlist/WatchlistScreen';
import { WatchlistDetailScreen } from '@/screens/watchlist/WatchlistDetailScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { useTheme } from '@/theme';
import type { WatchlistStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<WatchlistStackParamList>();

export function WatchlistStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
      <Stack.Screen name="WatchlistDetail" component={WatchlistDetailScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}
