import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {COLORS} from '../../constants/colors';

import {
  PublicUser,
  getUserById,
} from '../../services/communication/userService';

import {
  Contact,
  acceptContactRequest,
  declineContactRequest,
  getContactStatus,
  removeContact,
  sendContactRequest,
} from '../../services/communication/contactService';

import {
  supabase,
} from '../../services/supabase/supabaseClient';

import {AppScreenProps} from '../../types/navigation';

type Props = AppScreenProps<'UserProfile'>;

const UserProfileScreen = ({
  navigation,
  route,
}: Props) => {
  const {userId} = route.params;

  const [user, setUser] =
    useState<PublicUser | null>(null);

  const [contact, setContact] =
    useState<Contact | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: {user: currentUser},
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!currentUser) {
        throw new Error(
          'You must be logged in.',
        );
      }

      const [
        userData,
        contactData,
      ] = await Promise.all([
        getUserById(userId),
        getContactStatus(userId),
      ]);

      setCurrentUserId(
        currentUser.id,
      );

      setUser(userData);
      setContact(contactData);
    } catch (profileError: any) {
      console.error(
        'User profile loading error:',
        profileError,
      );

      setError(
        profileError?.message ||
          'Unable to load this profile.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const newContact =
        await sendContactRequest(userId);

      setContact(newContact);
    } catch (contactError: any) {
      console.error(
        'Contact request error:',
        contactError,
      );

      setError(
        contactError?.message ||
          'Unable to send contact request.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!contact) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const updatedContact =
        await acceptContactRequest(
          contact.id,
        );

      setContact(updatedContact);
    } catch (contactError: any) {
      console.error(
        'Accept contact error:',
        contactError,
      );

      setError(
        contactError?.message ||
          'Unable to accept contact request.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!contact) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const updatedContact =
        await declineContactRequest(
          contact.id,
        );

      setContact(updatedContact);
    } catch (contactError: any) {
      console.error(
        'Decline contact error:',
        contactError,
      );

      setError(
        contactError?.message ||
          'Unable to decline contact request.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveContact = () => {
    if (!contact) {
      return;
    }

    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${user?.displayName || 'this contact'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            setError(null);

            try {
              await removeContact(
                contact.id,
              );

              // The relationship no longer exists.
              setContact(null);
            } catch (removeError: any) {
              console.error(
                'Remove contact error:',
                removeError,
              );

              setError(
                removeError?.message ||
                  'Unable to remove contact.',
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadUser}>
          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          User not found
        </Text>
      </View>
    );
  }

  const contactStatus =
    contact?.status || null;

  const isRequestSentByMe =
    contactStatus === 'pending' &&
    contact?.userId === currentUserId;

  const isRequestReceivedByMe =
    contactStatus === 'pending' &&
    contact?.contactUserId === currentUserId;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }>

      <View style={styles.profileHeader}>
        {user.profilePhotoUrl ? (
          <Image
            source={{
              uri: user.profilePhotoUrl,
            }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={
              styles.avatarPlaceholder
            }>
            <Text
              style={styles.avatarText}>
              {user.displayName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {user.displayName}
        </Text>

        {user.username && (
          <Text style={styles.username}>
            @{user.username}
          </Text>
        )}
      </View>

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.card}>
        <ProfileRow
          label="Country"
          value={
            user.country ||
            'Not provided'
          }
        />

        <ProfileRow
          label="Native language"
          value={
            user.nativeLanguage ||
            'Not provided'
          }
        />

        <ProfileRow
          label="Preferred language"
          value={
            user.preferredLanguage ||
            'Not provided'
          }
        />

        <ProfileRow
          label="Spoken languages"
          value={
            user.spokenLanguages.length
              ? user.spokenLanguages.join(
                  ', ',
                )
              : 'Not provided'
          }
          last
        />
      </View>

      <View style={styles.actionContainer}>

        {/* NO RELATIONSHIP */}

        {!contactStatus && (
          <Pressable
            style={styles.primaryButton}
            onPress={handleAddContact}
            disabled={isProcessing}>

            {isProcessing ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }>
                Add Contact
              </Text>
            )}

          </Pressable>
        )}

        {/* I SENT THE REQUEST */}

        {isRequestSentByMe && (
          <View style={styles.statusButton}>
            <Text style={styles.statusText}>
              Contact Request Sent
            </Text>

            <Text
              style={
                styles.statusSubtext
              }>
              Waiting for this user to
              respond.
            </Text>
          </View>
        )}

        {/* I RECEIVED THE REQUEST */}

        {isRequestReceivedByMe && (
          <View>
            <Text style={styles.requestTitle}>
              Contact Request
            </Text>

            <Text
              style={styles.requestSubtitle}>
              This user wants to add you
              as a contact.
            </Text>

            <View
              style={styles.requestActions}>

              <Pressable
                style={styles.primaryButton}
                onPress={handleAccept}
                disabled={isProcessing}>

                {isProcessing ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.primaryButtonText
                    }>
                    Accept
                  </Text>
                )}

              </Pressable>

              <Pressable
                style={
                  styles.secondaryButton
                }
                onPress={handleDecline}
                disabled={isProcessing}>

                <Text
                  style={
                    styles.secondaryButtonText
                  }>
                  Decline
                </Text>

              </Pressable>

            </View>
          </View>
        )}

        {/* ACCEPTED */}

        {contactStatus === 'accepted' && (
          <View>
            <View
              style={styles.connectedStatus}>
              <Text
                style={
                  styles.connectedStatusText
                }>
                ✓ You are contacts
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate(
                  'Contacts',
                )
              }>

              <Text
                style={
                  styles.primaryButtonText
                }>
                Open Contacts
              </Text>

            </Pressable>

            <Pressable
              style={
                styles.removeButton
              }
              onPress={
                handleRemoveContact
              }
              disabled={isProcessing}>

              {isProcessing ? (
                <ActivityIndicator
                  color="#D32F2F"
                />
              ) : (
                <Text
                  style={
                    styles.removeButtonText
                  }>
                  Remove Contact
                </Text>
              )}

            </Pressable>
          </View>
        )}

        {/* DECLINED */}

        {contactStatus === 'declined' && (
          <Pressable
            style={styles.primaryButton}
            onPress={handleAddContact}
            disabled={isProcessing}>

            {isProcessing ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }>
                Send Contact Request Again
              </Text>
            )}

          </Pressable>
        )}

        {/* BLOCKED */}

        {contactStatus === 'blocked' && (
          <View style={styles.statusButton}>
            <Text style={styles.statusText}>
              This user is blocked
            </Text>
          </View>
        )}

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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
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
    marginTop: 20,
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

  actionContainer: {
    marginTop: 28,
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
  },

  connectedStatus: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  connectedStatusText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
  },

  removeButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },

  removeButtonText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '700',
  },

  statusButton: {
    minHeight: 70,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  statusText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  statusSubtext: {
    color: COLORS.secondary,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },

  requestTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },

  requestSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  requestActions: {
    marginTop: 4,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default UserProfileScreen;