import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { WorkspaceTabBar } from '../components/WorkspaceTabBar';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { TenantSelectScreen } from '../screens/auth/TenantSelectScreen';
import {
  AlertsScreen,
  BrowseScreen,
  CompaniesScreen,
  DashboardsScreen,
  SettingsScreen,
  SourcesScreen,
  TodayScreen,
  UsersScreen,
  WatchlistScreen,
  WorkspaceMenuScreen,
} from '../screens/workspace/WorkspaceScreens';
import { useSession } from '../store/session';
import { palette, radii, spacing, typography } from '../theme/tokens';

export type RootStackParamList = {
  Companies: undefined;
  Login: undefined;
  Settings: undefined;
  Sources: undefined;
  TenantSelect: undefined;
  Users: undefined;
  WorkspaceMenu: undefined;
  WorkspaceTabs: undefined;
};

type WorkspaceTabsParamList = {
  AlertsTab: undefined;
  BrowseTab: undefined;
  DashboardsTab: undefined;
  TodayTab: undefined;
  WatchlistTab: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<WorkspaceTabsParamList>();

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    border: palette.line,
    card: palette.canvas,
    primary: palette.cobalt,
    text: palette.ink,
  },
};

const tabTitles: Record<keyof WorkspaceTabsParamList, string> = {
  AlertsTab: 'Alerts',
  BrowseTab: 'Browse',
  DashboardsTab: 'Dashboards',
  TodayTab: 'Today',
  WatchlistTab: 'Watchlist',
};

export function AppNavigator() {
  const { capabilities, phase, selectedTenantId, token } = useSession();

  if (phase === 'booting') {
    return <BootSplash />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator>
        {!token ? (
          <RootStack.Screen component={LoginScreen} name="Login" options={{ headerShown: false }} />
        ) : !selectedTenantId ? (
          <RootStack.Screen component={TenantSelectScreen} name="TenantSelect" options={{ headerShown: false }} />
        ) : (
          <>
            <RootStack.Screen component={WorkspaceTabs} name="WorkspaceTabs" options={{ headerShown: false }} />
            <RootStack.Screen component={WorkspaceMenuScreen} name="WorkspaceMenu" options={{ headerShown: false, presentation: 'modal' }} />
            <RootStack.Screen component={SourcesScreen} name="Sources" options={stackOptions('Sources')} />
            <RootStack.Screen component={SettingsScreen} name="Settings" options={stackOptions('Settings')} />
            <RootStack.Screen component={CompaniesScreen} name="Companies" options={stackOptions('Companies')} />
            {capabilities.canManageTenantUsers ? (
              <RootStack.Screen component={UsersScreen} name="Users" options={stackOptions('Users')} />
            ) : null}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function WorkspaceTabs() {
  const { selectedTenant } = useSession();

  return (
    <Tabs.Navigator
      tabBar={(props) => <WorkspaceTabBar {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerLeft: () => (
          <View style={styles.headerTenant}>
            <View style={styles.headerTenantDot} />
            <Text numberOfLines={1} style={styles.headerTenantText}>
              {selectedTenant?.name ?? 'Workspace'}
            </Text>
          </View>
        ),
        headerRight: () => (
          <Pressable hitSlop={10} onPress={() => navigation.getParent()?.navigate('WorkspaceMenu')} style={styles.headerMenuButton}>
            <Ionicons color={palette.ink} name="grid-outline" size={18} />
          </Pressable>
        ),
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: palette.canvas,
        },
        headerTitle: tabTitles[route.name],
        headerTitleAlign: 'left',
        headerTitleStyle: {
          color: palette.ink,
          fontFamily: typography.monoBold,
          fontSize: 18,
          letterSpacing: 1.2,
        },
        sceneStyle: {
          backgroundColor: palette.background,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen component={TodayScreen} name="TodayTab" />
      <Tabs.Screen component={BrowseScreen} name="BrowseTab" />
      <Tabs.Screen component={WatchlistScreen} name="WatchlistTab" />
      <Tabs.Screen component={DashboardsScreen} name="DashboardsTab" />
      <Tabs.Screen component={AlertsScreen} name="AlertsTab" />
    </Tabs.Navigator>
  );
}

function stackOptions(title: string) {
  return {
    contentStyle: {
      backgroundColor: palette.background,
    },
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: palette.canvas,
    },
    headerTitle: title,
    headerTitleStyle: {
      color: palette.ink,
      fontFamily: typography.monoBold,
      fontSize: 18,
      letterSpacing: 1.2,
    },
  };
}

function BootSplash() {
  return (
    <View style={styles.boot}>
      <Text style={styles.bootEyebrow}>NEWSFLASH</Text>
      <Text style={styles.bootTitle}>Preparing the mobile desk.</Text>
      <ActivityIndicator color={palette.emerald} style={styles.bootSpinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    backgroundColor: palette.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  bootEyebrow: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 2,
  },
  bootSpinner: {
    marginTop: spacing.lg,
  },
  bootTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 34,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  headerMenuButton: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.lg,
    width: 36,
  },
  headerTenant: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.lg,
    maxWidth: 144,
  },
  headerTenantDot: {
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  headerTenantText: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 13,
  },
});
