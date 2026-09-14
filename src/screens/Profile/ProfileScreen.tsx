import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';
import {getProfile} from '../../services/profile/profileService';
import {useAuthStore} from '../../store/authStore';

interface Profile {
  id: string;
  displayName: string;
  username: string | null;
  profilePhotoUrl: string | null;
  country: string | null;
  nativeLanguage: string | null;
  spokenLanguages: string[];
  preferredLanguage: string | null;
}

const ProfileScreen = ({navigation}: any) => {
  const logout = useAuthStore(
    state => state.logout,
  );

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error(
        'Unable to load profile:',
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          Profile not found
        </Text>

        <Text style={styles.emptyText}>
          We couldn't load your profile.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>

      <View style={styles.profileHeader}>
        {profile.profilePhotoUrl ? (
          <Image
            source={{
              uri: profile.profilePhotoUrl,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.displayName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {profile.displayName}
        </Text>

        {profile.username && (
          <Text style={styles.username}>
            @{profile.username}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <ProfileRow
          label="Country"
          value={
            profile.country || 'Not selected'
          }
        />

        <ProfileRow
          label="Native language"
          value={
            profile.nativeLanguage ||
            'Not selected'
          }
        />

        <ProfileRow
          label="Preferred language"
          value={
            profile.preferredLanguage ||
            'Not selected'
          }
        />

        <ProfileRow
          label="Spoken languages"
          value={
            profile.spokenLanguages.length
              ? profile.spokenLanguages.join(', ')
              : 'None added'
          }
          last
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit profile"
          onPress={() => {}}
        />

        <View style={styles.buttonSpacing} />

        <Button
          title="Log out"
          onPress={handleLogout}
        />
      </View>

    </ScrollView>
  );
};

interface ProfileRowProps {
  label: string;
  value: string;
  last?: boolean;
}

const ProfileRow = ({
  label,
  value,
  last,
}: ProfileRowProps) => {
  return (
    <View
      style={[
        styles.row,
        !last && styles.rowBorder,
      ]}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyText: {
    marginTop: 8,
    color: COLORS.secondary,
  },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.accent,
  },

  name: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 18,
  },

  username: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 18,
  },

  row: {
    paddingVertical: 18,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  label: {
    fontSize: 13,
    color: COLORS.secondary,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 5,
  },

  actions: {
    marginTop: 30,
  },

  buttonSpacing: {
    height: 12,
  },
});

export default ProfileScreen;