import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {COLORS} from '../../constants/colors';

import {
  PublicUser,
  getUserById,
} from '../../services/communication/userService';

import {
  Message,
  getConversationMessages,
  sendTextMessage,
} from '../../services/communication/messageService';

import {supabase} from '../../services/supabase/supabaseClient';

import {AppScreenProps} from '../../types/navigation';

type Props =
  AppScreenProps<'Conversation'>;

const ConversationScreen = ({
  route,
}: Props) => {
  const {
    conversationId,
    otherUserId,
  } = route.params;

  const [otherUser, setOtherUser] =
    useState<PublicUser | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [text, setText] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const scrollViewRef =
    useRef<ScrollViewInstance>(null);

  const loadConversation = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          user,
          conversationMessages,
        ] = await Promise.all([
          getUserById(otherUserId),
          getConversationMessages(
            conversationId,
          ),
        ]);

        if (!user) {
          throw new Error(
            'Unable to find this user.',
          );
        }

        setOtherUser(user);
        setMessages(
          conversationMessages,
        );
      } catch (conversationError: any) {
        console.error(
          'Conversation loading error:',
          conversationError,
        );

        setError(
          conversationError?.message ||
            'Unable to load conversation.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      conversationId,
      otherUserId,
    ],
  );

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    const channel = supabase
      .channel(
        `conversation:${conversationId}`,
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const newMessage =
            payload.new as Message;

          setMessages(currentMessages => {
            const alreadyExists =
              currentMessages.some(
                message =>
                  message.id ===
                  newMessage.id,
              );

            if (alreadyExists) {
              return currentMessages;
            }

            return [
              ...currentMessages,
              newMessage,
            ];
          });
        },
      )
      .subscribe(status => {
        console.log(
          `Conversation realtime status: ${status}`,
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 50);
  }, [messages.length]);

  const handleSend = async () => {
    const trimmedText =
      text.trim();

    if (!trimmedText || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const newMessage =
        await sendTextMessage(
          conversationId,
          trimmedText,
        );

      setMessages(currentMessages => [
        ...currentMessages,
        newMessage,
      ]);

      setText('');
    } catch (sendError: any) {
      console.error(
        'Send message error:',
        sendError,
      );

      setError(
        sendError?.message ||
          'Unable to send message.',
      );
    } finally {
      setIsSending(false);
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

  if (error && !otherUser) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadConversation}>
          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={90}>

      {/* CHAT HEADER */}

      <View style={styles.header}>
        {otherUser?.profilePhotoUrl ? (
          <Image
            source={{
              uri:
                otherUser.profilePhotoUrl,
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
              {otherUser?.displayName
                ?.charAt(0)
                .toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.name}>
            {otherUser?.displayName ||
              'Conversation'}
          </Text>

          {otherUser?.username && (
            <Text style={styles.username}>
              @{otherUser.username}
            </Text>
          )}
        </View>
      </View>

      {/* ERROR */}

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {/* MESSAGES */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={
          styles.messageContent
        }
        keyboardShouldPersistTaps="handled">

        {messages.length === 0 ? (
          <View
            style={
              styles.emptyContainer
            }>
            <Text
              style={
                styles.emptyTitle
              }>
              Start a conversation
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Send a message to{' '}
              {otherUser?.displayName ||
                'this contact'}.
            </Text>
          </View>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={
                message.senderId !==
                otherUserId
              }
            />
          ))
        )}
      </ScrollView>

      {/* MESSAGE INPUT */}

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={
            COLORS.secondary
          }
          style={styles.input}
          multiline
          maxLength={5000}
          editable={!isSending}
          onSubmitEditing={event => {
            if (
              Platform.OS === 'ios' &&
              !event.nativeEvent.text
            ) {
              return;
            }

            if (
              Platform.OS === 'android'
            ) {
              event.preventDefault();
            }
          }}
        />

        <Pressable
          style={[
            styles.sendButton,
            (!text.trim() ||
              isSending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={
            !text.trim() || isSending
          }>

          {isSending ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <Text
              style={
                styles.sendButtonText
              }>
              Send
            </Text>
          )}

        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

const MessageBubble = ({
  message,
  isMine,
}: MessageBubbleProps) => {
  return (
    <View
      style={[
        styles.messageRow,
        isMine
          ? styles.myMessageRow
          : styles.theirMessageRow,
      ]}>

      <View
        style={[
          styles.messageBubble,
          isMine
            ? styles.myMessageBubble
            : styles.theirMessageBubble,
        ]}>

        <Text
          style={[
            styles.messageText,
            isMine
              ? styles.myMessageText
              : styles.theirMessageText,
          ]}>
          {message.textContent || ''}
        </Text>

        <Text
          style={[
            styles.messageTime,
            isMine
              ? styles.myMessageTime
              : styles.theirMessageTime,
          ]}>
          {formatMessageTime(
            message.createdAt,
          )}
        </Text>

      </View>
    </View>
  );
};

const formatMessageTime = (
  timestamp: string,
): string => {
  const date =
    new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.accent,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },

  username: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },

  messageList: {
    flex: 1,
  },

  messageContent: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    flexGrow: 1,
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
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 8,
  },

  messageRow: {
    width: '100%',
    marginBottom: 10,
  },

  myMessageRow: {
    alignItems: 'flex-end',
  },

  theirMessageRow: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '82%',
    minWidth: 70,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  myMessageBubble: {
    backgroundColor:
      COLORS.accent,
    borderBottomRightRadius: 5,
  },

  theirMessageBubble: {
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  theirMessageText: {
    color: COLORS.primary,
  },

  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },

  myMessageTime: {
    color: '#FFFFFF',
    opacity: 0.75,
    textAlign: 'right',
  },

  theirMessageTime: {
    color: COLORS.secondary,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor:
      COLORS.surface,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 14,
    backgroundColor:
      COLORS.background,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    color: COLORS.primary,
  },

  sendButton: {
    minHeight: 46,
    minWidth: 68,
    borderRadius: 14,
    backgroundColor:
      COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  error: {
    color: '#D32F2F',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
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

export default ConversationScreen;