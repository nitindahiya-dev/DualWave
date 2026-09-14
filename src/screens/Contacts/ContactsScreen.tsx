import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {COLORS} from '../../constants/colors';

import {
  Contact,
  acceptContactRequest,
  declineContactRequest,
  getContacts,
  getIncomingRequests,
} from '../../services/communication/contactService';

import {
  PublicUser,
  getUserById,
} from '../../services/communication/userService';

import {AppScreenProps} from '../../types/navigation';

type Props = AppScreenProps<'Contacts'>;

interface ContactWithUser {
  contact: Contact;
  user: PublicUser | null;
}

const ContactsScreen = ({
  navigation,
}: Props) => {
  const [contacts, setContacts] =
    useState<ContactWithUser[]>([]);

  const [incomingRequests, setIncomingRequests] =
    useState<ContactWithUser[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        contactData,
        requestData,
      ] = await Promise.all([
        getContacts(),
        getIncomingRequests(),
      ]);

      const currentUserResult =
        await import(
          '../../services/supabase/supabaseClient'
        );

      const {
        data: {user: currentUser},
        error: userError,
      } = await currentUserResult.supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        throw new Error(
          'You must be logged in.',
        );
      }

      const contactUserIds =
        contactData.map(item =>
          item.userId === currentUser.id
            ? item.contactUserId
            : item.userId,
        );

      const requestUserIds =
        requestData.map(
          item => item.userId,
        );

      const allUserIds = Array.from(
        new Set([
          ...contactUserIds,
          ...requestUserIds,
        ]),
      );

      const userResults =
        await Promise.all(
          allUserIds.map(id =>
            getUserById(id),
          ),
        );

      const userMap = new Map<
        string,
        PublicUser
      >();

      allUserIds.forEach(
        (id, index) => {
          const user =
            userResults[index];

          if (user) {
            userMap.set(id, user);
          }
        },
      );

      setContacts(
        contactData.map(contact => {
          const otherUserId =
            contact.userId === currentUser.id
              ? contact.contactUserId
              : contact.userId;

          return {
            contact,
            user:
              userMap.get(otherUserId) ||
              null,
          };
        }),
      );

      setIncomingRequests(
        requestData.map(request => ({
          contact: request,
          user:
            userMap.get(request.userId) ||
            null,
        })),
      );
    } catch (contactError: any) {
      console.error(
        'Contacts loading error:',
        contactError,
      );

      setError(
        contactError?.message ||
          'Unable to load contacts.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, []),
  );

  const handleAccept = async (
    contactId: string,
  ) => {
    setProcessingId(contactId);
    setError(null);

    try {
      await acceptContactRequest(
        contactId,
      );

      await loadContacts();
    } catch (acceptError: any) {
      console.error(
        'Accept contact error:',
        acceptError,
      );

      setError(
        acceptError?.message ||
          'Unable to accept contact request.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (
    contactId: string,
  ) => {
    setProcessingId(contactId);
    setError(null);

    try {
      await declineContactRequest(
        contactId,
      );

      await loadContacts();
    } catch (declineError: any) {
      console.error(
        'Decline contact error:',
        declineError,
      );

      setError(
        declineError?.message ||
          'Unable to decline contact request.',
      );
    } finally {
      setProcessingId(null);
    }
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }>

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {/* CONTACT REQUESTS */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Contact Requests
        </Text>

        {incomingRequests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {incomingRequests.length}
            </Text>
          </View>
        )}
      </View>

      {incomingRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No pending requests
          </Text>

          <Text style={styles.emptyText}>
            New contact requests will appear
            here.
          </Text>
        </View>
      ) : (
        incomingRequests.map(
          ({contact, user}) => (
            <View
              key={contact.id}
              style={styles.requestCard}>

              <Pressable
                style={styles.userInfo}
                onPress={() => {
                  if (user) {
                    navigation.navigate(
                      'UserProfile',
                      {
                        userId: user.id,
                      },
                    );
                  }
                }}>

                {user?.profilePhotoUrl ? (
                  <Image
                    source={{
                      uri:
                        user.profilePhotoUrl,
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={
                      styles.avatarPlaceholder
                    }>
                    <Text
                      style={
                        styles.avatarText
                      }>
                      {user?.displayName
                        ?.charAt(0)
                        .toUpperCase() ||
                        '?'}
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.userTextContainer
                  }>
                  <Text
                    style={
                      styles.userName
                    }>
                    {user?.displayName ||
                      'Unknown user'}
                  </Text>

                  {user?.username && (
                    <Text
                      style={
                        styles.username
                      }>
                      @{user.username}
                    </Text>
                  )}

                  {user?.nativeLanguage && (
                    <Text
                      style={
                        styles.language
                      }>
                      {user.nativeLanguage}
                    </Text>
                  )}
                </View>
              </Pressable>

              <View
                style={styles.actions}>

                <Pressable
                  style={
                    styles.acceptButton
                  }
                  onPress={() =>
                    handleAccept(
                      contact.id,
                    )
                  }
                  disabled={
                    processingId ===
                    contact.id
                  }>

                  {processingId ===
                  contact.id ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.acceptText
                      }>
                      Accept
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  style={
                    styles.declineButton
                  }
                  onPress={() =>
                    handleDecline(
                      contact.id,
                    )
                  }
                  disabled={
                    processingId ===
                    contact.id
                  }>

                  <Text
                    style={
                      styles.declineText
                    }>
                    Decline
                  </Text>
                </Pressable>

              </View>
            </View>
          ),
        )
      )}

      {/* MY CONTACTS */}

      <View
        style={[
          styles.sectionHeader,
          styles.contactsHeader,
        ]}>
        <Text style={styles.sectionTitle}>
          My Contacts
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No contacts yet
          </Text>

          <Text style={styles.emptyText}>
            Find people on DualWave and add
            them as contacts.
          </Text>

          <Pressable
            style={styles.findButton}
            onPress={() =>
              navigation.navigate('People')
            }>
            <Text
              style={styles.findButtonText}>
              Find People
            </Text>
          </Pressable>
        </View>
      ) : (
        contacts.map(
          ({contact, user}) => (
            <Pressable
              key={contact.id}
              style={styles.contactCard}
              onPress={() => {
                if (user) {
                  navigation.navigate(
                    'UserProfile',
                    {
                      userId: user.id,
                    },
                  );
                }
              }}>

              {user?.profilePhotoUrl ? (
                <Image
                  source={{
                    uri:
                      user.profilePhotoUrl,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={
                    styles.avatarPlaceholder
                  }>
                  <Text
                    style={
                      styles.avatarText
                    }>
                    {user?.displayName
                      ?.charAt(0)
                      .toUpperCase() ||
                      '?'}
                  </Text>
                </View>
              )}

              <View
                style={
                  styles.userTextContainer
                }>
                <Text
                  style={styles.userName}>
                  {user?.displayName ||
                    'Unknown user'}
                </Text>

                {user?.username && (
                  <Text
                    style={
                      styles.username
                    }>
                    @{user.username}
                  </Text>
                )}

                <Text
                  style={styles.connectedText}>
                  Contact
                </Text>
              </View>
            </Pressable>
          ),
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    paddingHorizontal: 7,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  requestCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accent,
  },

  userTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },

  username: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 3,
  },

  language: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 3,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  acceptButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  declineButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '700',
  },

  contactsHeader: {
    marginTop: 30,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  connectedText: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 4,
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 7,
  },

  findButton: {
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  findButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
});

export default ContactsScreen;