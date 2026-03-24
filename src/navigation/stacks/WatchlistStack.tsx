import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WatchlistScreen } from '@/screens/watchlist/WatchlistScreen';
import { WatchlistDetailScreen } from '@/screens/watchlist/WatchlistDetailScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { SummaryScreen } from '@/screens/reports/SummaryScreen';
import { DeepDiveScreen } from '@/screens/reports/DeepDiveScreen';
import { MarketSynthesisScreen } from '@/screens/reports/MarketSynthesisScreen';
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
      <Stack.Screen name="WatchlistSummary" component={SummaryScreen} />
      <Stack.Screen name="WatchlistDeepDive" component={DeepDiveScreen} />
      <Stack.Screen name="MarketSynthesis" component={MarketSynthesisScreen} />
    </Stack.Navigator>
  );
}
