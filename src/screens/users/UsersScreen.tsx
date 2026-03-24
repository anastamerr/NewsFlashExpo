import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchBar } from '@/components/ui/SearchBar';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { useTheme, spacing } from '@/theme';
import { typePresets } from '@/theme/typography';
import { successNotification } from '@/utils/haptics';
import { getStoredUsers, saveStoredUsers } from '@/utils/adminPersistence';
import type { MembershipRole, User } from '@/types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Users'>;
type UserFilter = 'all' | 'active' | 'inactive';
type UserDraft = {
  name: string;
  email: string;
  role: MembershipRole;
  isActive: boolean;
};
type FormErrors = Partial<Record<'name' | 'email', string>>;

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'admin@newsflash.com',
    role: 'global-superuser',
    isActive: true,
    createdAt: '2026-01-08T09:00:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'tsu@newsflash.com',
    role: 'tenant-superuser',
    isActive: true,
    createdAt: '2026-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: 'Mahmoud Hassan',
    email: 'mahmoud@newsflash.com',
    role: 'member',
    isActive: true,
    createdAt: '2026-02-02T12:00:00Z',
  },
  {
    id: '4',
    name: 'Layla Ahmed',
    email: 'layla@newsflash.com',
    role: 'member',
    isActive: false,
    createdAt: '2026-02-18T14:20:00Z',
  },
];

const ROLE_OPTIONS: { value: MembershipRole; label: string }[] = [
  { value: 'global-superuser', label: 'Global Superuser' },
  { value: 'tenant-superuser', label: 'Tenant Superuser' },
  { value: 'member', label: 'Member' },
];

const USER_FILTERS: { value: UserFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const EMPTY_DRAFT: UserDraft = {
  name: '',
  email: '',
  role: 'member',
  isActive: true,
};

function formatRole(role: MembershipRole) {
  return role.replace(/-/g, ' ');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function UsersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    let isMounted = true;

    getStoredUsers(DEFAULT_USERS).then((storedUsers) => {
      if (isMounted) {
        setUsers(storedUsers);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: spacing.base,
      paddingBottom: insets.bottom + spacing.xxl,
    }),
    [insets.bottom],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && user.isActive) ||
        (filter === 'inactive' && !user.isActive);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        formatRole(user.role).includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, users]);

  const summary = useMemo(() => {
    const activeCount = users.filter((user) => user.isActive).length;
    const superuserCount = users.filter((user) => user.role !== 'member').length;

    return {
      total: users.length,
      active: activeCount,
      superusers: superuserCount,
    };
  }, [users]);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setEditingUserId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
  }, []);

  const persistUsers = useCallback(async (nextUsers: User[]) => {
    setUsers(nextUsers);
    await saveStoredUsers(nextUsers);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingUserId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSheetVisible(true);
  }, []);

  const handleOpenEdit = useCallback((user: User) => {
    setEditingUserId(user.id);
    setDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setErrors({});
    setSheetVisible(true);
  }, []);

  const handleToggleUser = useCallback(async (userId: string, isActive: boolean) => {
    const nextUsers = users.map((user) => (
      user.id === userId ? { ...user, isActive } : user
    ));

    await persistUsers(nextUsers);
    successNotification();
  }, [persistUsers, users]);

  const handleSaveUser = useCallback(async () => {
    const trimmedName = draft.name.trim();
    const trimmedEmail = draft.email.trim().toLowerCase();
    const nextErrors: FormErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Name is required.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    } else {
      const emailTaken = users.some((user) => (
        user.email.toLowerCase() === trimmedEmail && user.id !== editingUserId
      ));

      if (emailTaken) {
        nextErrors.email = 'This email is already assigned.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextUsers = editingUserId
      ? users.map((user) => (
          user.id === editingUserId
            ? {
                ...user,
                name: trimmedName,
                email: trimmedEmail,
                role: draft.role,
                isActive: draft.isActive,
              }
            : user
        ))
      : [
          {
            id: `user-${Date.now()}`,
            name: trimmedName,
            email: trimmedEmail,
            role: draft.role,
            isActive: draft.isActive,
            createdAt: new Date().toISOString(),
          },
          ...users,
        ];

    await persistUsers(nextUsers);
    successNotification();
    closeSheet();
  }, [closeSheet, draft, editingUserId, persistUsers, users]);

  const handleRemoveUser = useCallback(async () => {
    if (!editingUserId) {
      return;
    }

    const nextUsers = users.filter((user) => user.id !== editingUserId);
    await persistUsers(nextUsers);
    successNotification();
    closeSheet();
  }, [closeSheet, editingUserId, persistUsers, users]);

  const renderUser = useCallback(({ item, index }: { item: User; index: number }) => {
    const roleVariant = item.role.includes('superuser') ? 'primary' : 'neutral';

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Card style={styles.userCard} onPress={() => handleOpenEdit(item)}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[typePresets.h3, { color: colors.primary }]}>
                {item.name[0]}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[typePresets.h3, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary }]}>{item.email}</Text>
              <View style={styles.metaRow}>
                <View style={styles.roleBadge}>
                  <Badge label={formatRole(item.role)} variant={roleVariant} small />
                </View>
                <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>
                  {item.isActive ? 'Live access' : 'Access paused'}
                </Text>
              </View>
            </View>
            <Toggle value={item.isActive} onValueChange={(value) => handleToggleUser(item.id, value)} />
          </View>
        </Card>
      </Animated.View>
    );
  }, [colors.primary, colors.text, colors.textSecondary, colors.textTertiary, handleOpenEdit, handleToggleUser]);

  const listHeader = useMemo(() => (
    <View style={styles.headerContent}>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.total}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>USERS</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.primary }]}>{summary.active}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>ACTIVE</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[typePresets.monoLg, { color: colors.text }]}>{summary.superusers}</Text>
            <Text style={[typePresets.labelXs, { color: colors.textTertiary }]}>SUPERUSERS</Text>
          </View>
        </View>
      </Card>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search people, emails, or roles..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {USER_FILTERS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>
    </View>
  ), [colors.borderSubtle, colors.primary, colors.text, colors.textTertiary, filter, query, summary.active, summary.superusers, summary.total]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={[typePresets.h3, { color: colors.text }]}>Users</Text>
        <Pressable
          onPress={handleOpenCreate}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add user"
        >
          <UserPlus size={18} color={colors.textInverse} strokeWidth={2} />
        </Pressable>
      </View>

      <FlashList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={[typePresets.h3, { color: colors.text }]}>No matching users</Text>
            <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Adjust the search or filter to bring people back into view.
            </Text>
          </View>
        )}
        contentContainerStyle={listContentContainerStyle}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheetModal
        visible={sheetVisible}
        title={editingUserId ? 'Manage user' : 'Add user'}
        description={editingUserId ? 'Update role, access, or identity details.' : 'Create a user profile for this tenant.'}
        onClose={closeSheet}
        footer={(
          <View style={styles.sheetFooter}>
            {editingUserId ? (
              <Button
                label="Remove"
                variant="ghost"
                onPress={handleRemoveUser}
                icon={<Trash2 size={16} color={colors.text} strokeWidth={2} />}
              />
            ) : null}
            <View style={styles.footerPrimary}>
              <Button
                label={editingUserId ? 'Save changes' : 'Create user'}
                onPress={handleSaveUser}
                fullWidth
              />
            </View>
          </View>
        )}
      >
        <Input
          label="Full Name"
          placeholder="Enter user name"
          value={draft.name}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, name: value }));
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          error={errors.name}
        />
        <Input
          label="Email"
          placeholder="name@company.com"
          value={draft.email}
          onChangeText={(value) => {
            setDraft((current) => ({ ...current, email: value }));
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />

        <View>
          <Text style={[typePresets.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Role
          </Text>
          <View style={styles.sheetChips}>
            {ROLE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={draft.role === option.value}
                onPress={() => setDraft((current) => ({ ...current, role: option.value }))}
              />
            ))}
          </View>
        </View>

        <Card variant="outlined">
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={[typePresets.h3, { color: colors.text }]}>Tenant access</Text>
              <Text style={[typePresets.bodySm, { color: colors.textSecondary, marginTop: spacing.xxs }]}>
                Disable access without removing the account record.
              </Text>
            </View>
            <Toggle
              value={draft.isActive}
              onValueChange={(value) => setDraft((current) => ({ ...current, isActive: value }))}
            />
          </View>
        </Card>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  summaryCard: {
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  userCard: {
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  sheetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  toggleCopy: {
    flex: 1,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerPrimary: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
