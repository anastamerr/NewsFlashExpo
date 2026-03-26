import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Newspaper, Search, Building2, BarChart3, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodayStack } from './stacks/TodayStack';
import { BrowseStack } from './stacks/BrowseStack';
import { ResearchStack } from './stacks/ResearchStack';
import { DashboardsStack } from './stacks/DashboardsStack';
import { SettingsStack } from './stacks/SettingsStack';
import { useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const tabBarHeight = 52 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const iconByRoute = {
          TodayTab: Newspaper,
          BrowseTab: Search,
          ResearchTab: Building2,
          DashboardsTab: BarChart3,
          SettingsTab: Settings,
        } as const;
        const labelByRoute = {
          TodayTab: 'Today',
          BrowseTab: 'Browse',
          ResearchTab: 'Research',
          DashboardsTab: 'Dashboards',
          SettingsTab: 'Settings',
        } as const;
        const Icon = iconByRoute[route.name];

        return {
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Icon size={size} color={color} strokeWidth={focused ? 2.2 : 1.9} />
          ),
          tabBarLabel: labelByRoute[route.name],
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={90}
                tint="systemChromeMaterial"
                style={{ flex: 1 }}
              />
            ) : null
          ),
          tabBarStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingTop: 7,
            paddingBottom: bottomInset,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamily.sansMedium,
            fontSize: 10,
            letterSpacing: 0.2,
          },
          tabBarItemStyle: {
            paddingVertical: 1,
          },
          tabBarHideOnKeyboard: true,
          headerShown: false,
          freezeOnBlur: true,
          lazy: true,
          animation: 'none',
        };
      }}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} />
      <Tab.Screen name="BrowseTab" component={BrowseStack} />
      <Tab.Screen name="ResearchTab" component={ResearchStack} />
      <Tab.Screen name="DashboardsTab" component={DashboardsStack} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} />
    </Tab.Navigator>
  );
}
