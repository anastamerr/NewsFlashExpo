import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayStack } from './stacks/TodayStack';
import { BrowseStack } from './stacks/BrowseStack';
import { WatchlistStack } from './stacks/WatchlistStack';
import { DashboardsStack } from './stacks/DashboardsStack';
import { AlertsStack } from './stacks/AlertsStack';
import { TabBar } from '@/components/layout/TabBar';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} />
      <Tab.Screen name="BrowseTab" component={BrowseStack} />
      <Tab.Screen name="WatchlistTab" component={WatchlistStack} />
      <Tab.Screen name="DashboardsTab" component={DashboardsStack} />
      <Tab.Screen name="AlertsTab" component={AlertsStack} />
    </Tab.Navigator>
  );
}
