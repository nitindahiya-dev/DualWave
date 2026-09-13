import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';
import {createProfile} from '../../services/profile/profileService';
import {useAuthStore} from '../../store/authStore';

interface Props {
  navigation: any;
  route: any;
}

const ProfileCompleteScreen = ({
  route,
}: Props) => {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const setHasProfile = useAuthStore(
    state => state.setHasProfile,
  );

  const {
    profilePhotoUrl,
    displayName,
    username,
    nativeLanguage,
    country,
  } = route.params || {};

  const handleComplete = async () => {
    setError(null);

    if (!displayName || !username) {
      setError(
        'Some profile information is missing.',
      );
      return;
    }

    setIsLoading(true);

    try {
      await createProfile({
        displayName,
        username,
        profilePhotoUrl,
        country,
        nativeLanguage,
        spokenLanguages: [],
      });

      setHasProfile(true);
    } catch (profileError: any) {
      console.error(
        'Profile creation error:',
        profileError,
      );

      setError(
        profileError?.message ||
          'Unable to create your profile. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>
        STEP 4 OF 4
      </Text>

      <Text style={styles.title}>
        You're all set
      </Text>

      <Text style={styles.subtitle}>
        Review your information before creating your
        DualWave profile.
      </Text>

      <View style={styles.profileCard}>
        {profilePhotoUrl ? (
          <Image
            source={{uri: profilePhotoUrl}}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName
                ? displayName
                    .charAt(0)
                    .toUpperCase()
                : '?'}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {displayName || 'Your name'}
        </Text>

        <Text style={styles.username}>
          @{username || 'username'}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Native language
            </Text>

            <Text style={styles.detailValue}>
              {nativeLanguage || 'Not selected'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Country
            </Text>

            <Text style={styles.detailValue}>
              {country || 'Not selected'}
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.bottom}>
        <Button
          title="Complete profile"
          onPress={handleComplete}
          loading={isLoading}
          disabled={isLoading}
        />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={COLORS.accent}
            style={styles.loader}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 60,
  },

  step: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.accent,
    marginBottom: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 32,
  },

  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    backgroundColor: COLORS.surface,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.accent,
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 16,
  },

  username: {
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 4,
  },

  details: {
    width: '100%',
    marginTop: 24,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 14,
  },

  detailLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
  },

  bottom: {
    marginTop: 'auto',
    marginBottom: 20,
  },

  loader: {
    marginTop: 12,
  },
});

export default ProfileCompleteScreen;