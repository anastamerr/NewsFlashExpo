import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useSession } from '../../store/session';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import type { AccessRole, MembershipRole } from '../../types/api';
import { AlertsScreen as AlertsWorkspaceScreen } from './AlertsScreen';
import { BrowseScreen as BrowseWorkspaceScreen } from './BrowseScreen';
import { TodayScreen as TodayWorkspaceScreen } from './TodayScreen';
import { WatchlistScreen as WatchlistWorkspaceScreen } from './WatchlistScreen';

type WorkspaceRoute = Exclude<
  keyof RootStackParamList,
  'Login' | 'TenantSelect' | 'WorkspaceTabs' | 'WorkspaceMenu'
>;

function PlaceholderWorkspace({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.placeholderSafeArea}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderDescription}>{description}</Text>
        <View style={styles.placeholderPanel}>
          <Text style={styles.placeholderPanelTitle}>Next build chunk</Text>
          <Text style={styles.placeholderPanelText}>
            This route is staying inside the Newsflash dark theme, but it will not show invented
            metrics or fake article data.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function TodayScreen() {
  return <TodayWorkspaceScreen />;
}

export function BrowseScreen() {
  return <BrowseWorkspaceScreen />;
}

export function WatchlistScreen() {
  return <WatchlistWorkspaceScreen />;
}

export function DashboardsScreen() {
  return (
    <PlaceholderWorkspace
      description="Trend analytics will be built on top of the article and sentiment endpoints instead of local placeholders."
      title="Dashboards"
    />
  );
}

export function AlertsScreen() {
  return <AlertsWorkspaceScreen />;
}

function StaticWorkspaceScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, WorkspaceRoute>) {
  const descriptions: Record<WorkspaceRoute, string> = {
    Companies:
      'This route remains parked until the web route is stable enough to translate responsibly.',
    Settings:
      'Account settings will be connected to live profile and preference endpoints rather than mocked forms.',
    Sources:
      'Source management will be built as a real feed and publisher workspace on the same dark shell.',
    Users:
      'Admin user management is deferred until the backend route is restored and stable.',
  };

  return <PlaceholderWorkspace description={descriptions[route.name]} title={route.name} />;
}

export function SourcesScreen(props: NativeStackScreenProps<RootStackParamList, 'Sources'>) {
  return <StaticWorkspaceScreen {...props} />;
}

export function SettingsScreen(props: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  return <StaticWorkspaceScreen {...props} />;
}

export function CompaniesScreen(props: NativeStackScreenProps<RootStackParamList, 'Companies'>) {
  return <StaticWorkspaceScreen {...props} />;
}

export function UsersScreen(props: NativeStackScreenProps<RootStackParamList, 'Users'>) {
  return <StaticWorkspaceScreen {...props} />;
}

export function WorkspaceMenuScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'WorkspaceMenu'>) {
  const { capabilities, profile, selectedTenant, signOut, user } = useSession();

  const items: Array<{
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: WorkspaceRoute;
    title: string;
  }> = [
    {
      description: 'Publishers, feeds, and source controls',
      icon: 'radio-outline',
      route: 'Sources',
      title: 'Sources',
    },
    {
      description: 'Profile and application preferences',
      icon: 'settings-outline',
      route: 'Settings',
      title: 'Settings',
    },
    {
      description: 'Pending stable parity from the web app',
      icon: 'business-outline',
      route: 'Companies',
      title: 'Companies',
    },
  ];

  if (capabilities.canManageTenantUsers) {
    items.push({
      description:
        capabilities.accessRole === 'tenant_superuser'
          ? 'Tenant user management'
          : 'Admin user route waiting on backend parity',
      icon: 'people-outline',
      route: 'Users',
      title: 'Users',
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.menuHeader}>
        <Text style={styles.brand}>Newsflash</Text>
        <Text style={styles.menuTenant}>{selectedTenant?.name ?? 'Tenant'}</Text>
        <Text style={styles.menuMeta}>{selectedTenant?.slug ?? 'Workspace context'}</Text>
      </View>

      <View style={styles.menuList}>
        {items.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => navigation.navigate(item.route)}
            style={styles.menuCard}
          >
            <Ionicons color={palette.inkSoft} name={item.icon} size={18} />
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Ionicons color={palette.inkSoft} name="arrow-forward" size={16} />
          </Pressable>
        ))}
      </View>

      <View style={styles.userPanel}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarLabel}>
            {(user?.email?.[0] ?? 'N').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userCopy}>
          <Text numberOfLines={1} style={styles.userEmail}>
            {user?.email ?? 'Signed in'}
          </Text>
          <Text style={styles.userRole}>
            {formatAccessRole(capabilities.accessRole, profile?.role)}
          </Text>
        </View>
      </View>

      <Pressable onPress={() => void signOut()} style={styles.signOutButton}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function formatAccessRole(accessRole: AccessRole | null, profileRole: MembershipRole | null | undefined) {
  if (accessRole === 'global_superuser') {
    return 'Global Superuser';
  }

  if (profileRole === 'tenant_superuser' || accessRole === 'tenant_superuser') {
    return 'Tenant Superuser';
  }

  if (profileRole === 'member' || accessRole === 'member') {
    return 'Member';
  }

  return 'Authenticated User';
}

const styles = StyleSheet.create({
  brand: {
    color: palette.emerald,
    fontFamily: typography.serifBold,
    fontSize: 28,
  },
  menuCard: {
    alignItems: 'center',
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.md,
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuDescription: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 20,
  },
  menuHeader: {
    backgroundColor: palette.canvas,
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
    padding: spacing.lg,
  },
  menuList: {
    gap: spacing.md,
    padding: spacing.md,
  },
  menuMeta: {
    color: palette.inkSoft,
    fontFamily: typography.mono,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  menuTenant: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 22,
    marginTop: spacing.md,
  },
  menuTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 18,
  },
  placeholderContent: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.md,
  },
  placeholderDescription: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
  },
  placeholderPanel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  placeholderPanelText: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  placeholderPanelTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  placeholderSafeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  placeholderTitle: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 28,
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  signOutButton: {
    alignItems: 'center',
    borderColor: palette.lineStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    minHeight: 48,
  },
  signOutLabel: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 1,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  userAvatarLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 16,
  },
  userCopy: {
    flex: 1,
    gap: 2,
  },
  userEmail: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 13,
  },
  userPanel: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: 'auto',
    padding: spacing.md,
  },
  userRole: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 13,
  },
});
