import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BrowseHomeScreen } from '@/screens/browse/BrowseHomeScreen';
import { ArticleDetailScreen } from '@/screens/today/ArticleDetailScreen';
import { WatchlistDetailScreen } from '@/screens/watchlist/WatchlistDetailScreen';
import { SummaryScreen } from '@/screens/reports/SummaryScreen';
import { DeepDiveScreen } from '@/screens/reports/DeepDiveScreen';
import { MarketSynthesisScreen } from '@/screens/reports/MarketSynthesisScreen';
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
      <Stack.Screen name="BrowseHome" component={BrowseHomeScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="BrowseSummary" component={SummaryScreen} />
      <Stack.Screen name="BrowseDeepDive" component={DeepDiveScreen} />
      <Stack.Screen name="WatchlistDetail" component={WatchlistDetailScreen} />
      <Stack.Screen name="WatchlistSummary" component={SummaryScreen} />
      <Stack.Screen name="WatchlistDeepDive" component={DeepDiveScreen} />
      <Stack.Screen name="MarketSynthesis" component={MarketSynthesisScreen} />
    </Stack.Navigator>
  );
}
