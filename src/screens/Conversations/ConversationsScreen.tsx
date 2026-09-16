import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {COLORS} from '../../constants/colors';

import {
  Conversation,
  getConversationMembers,
  getMyConversations,
} from '../../services/communication/conversationService';

import {
  getUserById,
  PublicUser,
} from '../../services/communication/userService';

import {supabase} from '../../services/supabase/supabaseClient';

import {AppScreenProps} from '../../types/navigation';

type Props = AppScreenProps<'Conversations'>;

interface ConversationItem {
  conversation: Conversation;
  otherUser: PublicUser;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

const ConversationsScreen = ({
  navigation,
}: Props) => {
  const [items, setItems] =
    useState<ConversationItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadConversations = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: {user},
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            'You must be logged in.',
          );
        }

        const conversations =
          await getMyConversations();

        const conversationItems =
          await Promise.all(
            conversations.map(
              async conversation => {
                const members =
                  await getConversationMembers(
                    conversation.id,
                  );

                const otherMember =
                  members.find(
                    member =>
                      member.userId !==
                      user.id,
                  );

                if (!otherMember) {
                  return null;
                }

                const otherUser =
                  await getUserById(
                    otherMember.userId,
                  );

                if (!otherUser) {
                  return null;
                }

                const {
                  data: messages,
                  error:
                    messagesError,
                } = await supabase
                  .from('messages')
                  .select(
                    'text_content, created_at, sender_id',
                  )
                  .eq(
                    'conversation_id',
                    conversation.id,
                  )
                  .order(
                    'created_at',
                    {
                      ascending: false,
                    },
                  )
                  .limit(1);

                if (messagesError) {
                  throw messagesError;
                }

                const lastMessage =
                  messages?.[0] || null;

                let unreadQuery =
                  supabase
                    .from('messages')
                    .select(
                      'id',
                      {
                        count: 'exact',
                        head: true,
                      },
                    )
                    .eq(
                      'conversation_id',
                      conversation.id,
                    )
                    .neq(
                      'sender_id',
                      user.id,
                    );

                if (
                  otherMember.lastReadAt
                ) {
                  unreadQuery =
                    unreadQuery.gt(
                      'created_at',
                      otherMember.lastReadAt,
                    );
                }

                const {
                  count: unreadCount,
                  error:
                    unreadError,
                } =
                  await unreadQuery;

                if (unreadError) {
                  throw unreadError;
                }

                return {
                  conversation,
                  otherUser,
                  lastMessage:
                    lastMessage?.text_content ||
                    null,
                  lastMessageAt:
                    lastMessage?.created_at ||
                    null,
                  unreadCount:
                    unreadCount || 0,
                };
              },
            ),
          );

        setItems(
          conversationItems.filter(
            (
              item,
            ): item is ConversationItem =>
              item !== null,
          ),
        );
      } catch (loadError: any) {
        console.error(
          'Conversations loading error:',
          loadError,
        );

        setError(
          loadError?.message ||
          'Unable to load conversations.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations]),
  );

  const renderConversation = ({
    item,
  }: {
    item: ConversationItem;
  }) => {
    const {
      otherUser,
      lastMessage,
      lastMessageAt,
      unreadCount,
    } = item;

    return (
      <Pressable
        style={styles.item}
        onPress={() =>
          navigation.navigate(
            'Conversation',
            {
              conversationId:
                item.conversation.id,
              otherUserId:
                otherUser.id,
            },
          )
        }>

        <View
          style={
            styles.avatar
          }>
          <Text
            style={
              styles.avatarText
            }>
            {otherUser.displayName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.content
          }>
          <View
            style={
              styles.topRow
            }>
            <Text
              numberOfLines={1}
              style={[
                styles.name,
                unreadCount > 0 &&
                  styles.unreadName,
              ]}>
              {otherUser.displayName}
            </Text>

            {lastMessageAt && (
              <Text
                style={[
                  styles.time,
                  unreadCount > 0 &&
                    styles.unreadTime,
                ]}>
                {formatConversationTime(
                  lastMessageAt,
                )}
              </Text>
            )}
          </View>

          <View
            style={
              styles.bottomRow
            }>
            <Text
              numberOfLines={1}
              style={[
                styles.lastMessage,
                unreadCount > 0 &&
                  styles.unreadLastMessage,
              ]}>
              {lastMessage ||
                'No messages yet'}
            </Text>

            {unreadCount > 0 && (
              <View
                style={
                  styles.unreadBadge
                }>
                <Text
                  style={
                    styles.unreadBadgeText
                  }>
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View
        style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={styles.center}>
        <Text
          style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={
            loadConversations
          }>
          <Text
            style={
              styles.retryText
            }>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={styles.container}>
      {items.length === 0 ? (
        <View
          style={
            styles.emptyContainer
          }>
          <Text
            style={
              styles.emptyTitle
            }>
            No conversations yet
          </Text>

          <Text
            style={
              styles.emptyText
            }>
            Start chatting with one
            of your contacts.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item =>
            item.conversation.id
          }
          renderItem={
            renderConversation
          }
          contentContainerStyle={
            styles.listContent
          }
        />
      )}
    </View>
  );
};

const formatConversationTime = (
  timestamp: string,
): string => {
  const date =
    new Date(timestamp);

  const now = new Date();

  const sameDay =
    date.toDateString() ===
    now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(
      [],
      {
        hour: 'numeric',
        minute: '2-digit',
      },
    );
  }

  return date.toLocaleDateString(
    [],
    {
      day: 'numeric',
      month: 'short',
    },
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor:
      COLORS.background,
  },

  listContent: {
    paddingVertical: 8,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent,
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  unreadName: {
    fontWeight: '800',
  },

  time: {
    marginLeft: 8,
    fontSize: 11,
    color: COLORS.secondary,
  },

  unreadTime: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
  },

  unreadLastMessage: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor:
      COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: COLORS.secondary,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor:
      COLORS.accent,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ConversationsScreen;