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
  Modal,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../../constants/colors';

import {
  PublicUser,
  getUserById,
} from '../../services/communication/userService';

import {
  Message,
  getConversationMessages,
  sendTextMessage,
  mapMessage
} from '../../services/communication/messageService';

import {
  getMessageTranslation,
  saveMessageTranslation,
} from '../../services/communication/messageTranslationService';

import {
  translateMessage,
  detectMessageLanguage
} from '../../services/communication/translationService';

import { supabase } from '../../services/supabase/supabaseClient';

import { AppScreenProps } from '../../types/navigation';

type Props = AppScreenProps<'Conversation'>;

interface ViewerProfile {
  nativeLanguage: string | null;
  preferredLanguage: string | null;
}

interface TranslationMap {
  [messageId: string]: string;
}

const getClearChatStorageKey = (
  conversationId: string,
): string =>
  `@dualwave_clear_chat_${conversationId}`;

const ConversationScreen = ({
  route,
}: Props) => {
  const {
    conversationId,
    otherUserId,
  } = route.params;

  const [otherUser, setOtherUser] =
    useState<PublicUser | null>(null);

  const [viewerProfile, setViewerProfile] =
    useState<ViewerProfile | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [translations, setTranslations] =
    useState<TranslationMap>({});

  const [translatingMessages, setTranslatingMessages] =
    useState<Record<string, boolean>>({});

  const [text, setText] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isMenuVisible, setIsMenuVisible] =
    useState(false);

  const [clearChatAt, setClearChatAt] =
    useState<string | null>(null);

  const scrollViewRef =
    useRef<ScrollViewInstance>(null);

  /**
   * Load the currently authenticated user's
   * language information.
   */
  const loadViewerProfile =
    useCallback(async (): Promise<{
      userId: string;
      profile: ViewerProfile;
    }> => {
      const {
        data: { user },
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

      const {
        data,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'native_language, preferred_language',
        )
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return {
        userId: user.id,
        profile: {
          nativeLanguage:
            data?.native_language || null,
          preferredLanguage:
            data?.preferred_language || null,
        },
      };
    }, []);

  /**
   * Determine which language the viewer wants
   * translations displayed in.
   */
  const getTargetLanguage =
    useCallback((): string | null => {
      if (!viewerProfile) {
        return null;
      }

      return (
        viewerProfile.preferredLanguage ||
        viewerProfile.nativeLanguage ||
        null
      );
    }, [viewerProfile]);

  /**
   * Translate one message for the current viewer.
   */
  const translateOneMessage =
    useCallback(
      async (
        message: Message,
        userProfile: ViewerProfile,
        userId: string,
        otherUserData: PublicUser,
      ) => {
        const targetLanguage =
          userProfile.preferredLanguage ||
          userProfile.nativeLanguage;

        if (!targetLanguage) {
          return;
        }

        if (!message.textContent?.trim()) {
          return;
        }

        /*
         * Determine the source language.
         *
         * New messages contain source_language.
         * Older messages may not, so we use the
         * sender's known language as a fallback.
         */
        const sourceLanguage =
          message.sourceLanguage ||
          (
            message.senderId === userId
              ? userProfile.preferredLanguage ||
              userProfile.nativeLanguage
              : otherUserData.nativeLanguage
          );

        if (!sourceLanguage) {
          return;
        }

        const normalizedSource =
          sourceLanguage.toLowerCase();

        const normalizedTarget =
          targetLanguage.toLowerCase();

        // No translation required.
        if (
          normalizedSource ===
          normalizedTarget
        ) {
          return;
        }

        setTranslatingMessages(current => ({
          ...current,
          [message.id]: true,
        }));

        try {
          /*
           * First check whether we already have
           * this translation in the database.
           */
          const existingTranslation =
            await getMessageTranslation(
              message.id,
              normalizedSource,
              normalizedTarget,
            );

          if (
            existingTranslation?.translatedText &&
            existingTranslation.translationStatus ===
            'completed'
          ) {
            setTranslations(current => ({
              ...current,
              [message.id]:
                existingTranslation.translatedText!,
            }));

            return;
          }

          /*
           * Translation does not exist.
           * Ask the Edge Function / MyMemory.
           */
          const result =
            await translateMessage(
              message.textContent,
              normalizedSource,
              normalizedTarget,
            );

          /*
           * Save translation so we don't need
           * to translate this message again.
           */
          const savedTranslation =
            await saveMessageTranslation(
              message.id,
              normalizedSource,
              normalizedTarget,
              result.translatedText,
            );

          if (savedTranslation.translatedText) {
            setTranslations(current => ({
              ...current,
              [message.id]:
                savedTranslation.translatedText!,
            }));
          }
        } catch (translationError) {
          console.error(
            'Message translation error:',
            translationError,
          );
        } finally {
          setTranslatingMessages(current => {
            const next = { ...current };
            delete next[message.id];
            return next;
          });
        }
      },
      [],
    );

  /**
   * Translate a collection of messages.
   */
  const translateMessages =
    useCallback(
      async (
        conversationMessages: Message[],
        userProfile: ViewerProfile,
        userId: string,
        otherUserData: PublicUser,
      ) => {
        await Promise.all(
          conversationMessages.map(message =>
            translateOneMessage(
              message,
              userProfile,
              userId,
              otherUserData,
            ),
          ),
        );
      },
      [translateOneMessage],
    );

  const loadConversation = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          user,
          conversationMessages,
          viewer,
        ] = await Promise.all([
          getUserById(otherUserId),
          getConversationMessages(
            conversationId,
          ),
          loadViewerProfile(),
        ]);

        const visibleMessages =
          clearChatAt
            ? conversationMessages.filter(
              message =>
                new Date(message.createdAt) >
                new Date(clearChatAt),
            )
            : conversationMessages;

        if (!user) {
          throw new Error(
            'Unable to find this user.',
          );
        }

        setOtherUser(user);
        setMessages(visibleMessages);
        setCurrentUserId(viewer.userId);
        setViewerProfile(viewer.profile);

        /*
         * Translate existing messages after
         * loading the conversation.
         */
        await translateMessages(
          visibleMessages,
          viewer.profile,
          viewer.userId,
          user,
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
      loadViewerProfile,
      translateMessages,
      clearChatAt,
    ],
  );

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    const loadClearChatState = async () => {
      try {
        const storageKey =
          getClearChatStorageKey(
            conversationId,
          );

        const storedClearChatAt =
          await AsyncStorage.getItem(
            storageKey,
          );

        if (storedClearChatAt) {
          setClearChatAt(
            storedClearChatAt,
          );
        }
      } catch (storageError) {
        console.error(
          'Unable to load clear chat state:',
          storageError,
        );
      }
    };

    loadClearChatState();
  }, [conversationId]);

  /*
   * Realtime subscription for incoming messages.
   */
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
            mapMessage(payload.new);

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

          /*
           * Translate the incoming message
           * after it arrives through Realtime.
           */
          if (
            viewerProfile &&
            currentUserId &&
            otherUser
          ) {
            translateOneMessage(
              newMessage,
              viewerProfile,
              currentUserId,
              otherUser,
            );
          }
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
  }, [
    conversationId,
    viewerProfile,
    currentUserId,
    otherUser,
    translateOneMessage,
  ]);

  /*
   * Auto-scroll when messages change.
   */
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
    /*
     * The language used for translation display
     * is the viewer's preferred/native language.
     *
     * This is NOT necessarily the language
     * the user typed.
     */
    const targetLanguage =
      getTargetLanguage();

    if (!targetLanguage) {
      throw new Error(
        'Please select your preferred language before sending messages.',
      );
    }

    /*
     * Detect the ACTUAL language of the
     * message being typed.
     *
     * We must not use the user's profile
     * language here because they may type
     * in another language.
     */
    const detection =
      await detectMessageLanguage(
        trimmedText,
        targetLanguage,
      );

    const sourceLanguage =
      detection.detectedLanguage;

    /*
     * Save the detected language with
     * the message.
     */
    const newMessage =
      await sendTextMessage(
        conversationId,
        trimmedText,
        sourceLanguage,
      );

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

    setText('');

    /*
     * We do not translate our own message
     * here.
     *
     * The receiver's device will detect/read
     * source_language and translate it into
     * their preferred language.
     */
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


  const handleClearChat = async () => {
    try {
      const clearTimestamp =
        new Date().toISOString();

      const storageKey =
        getClearChatStorageKey(
          conversationId,
        );

      await AsyncStorage.setItem(
        storageKey,
        clearTimestamp,
      );

      setClearChatAt(
        clearTimestamp,
      );

      setMessages([]);
      setTranslations({});
      setTranslatingMessages({});
      setIsMenuVisible(false);
      setError(null);
    } catch (clearError: any) {
      console.error(
        'Clear chat error:',
        clearError,
      );

      setError(
        clearError?.message ||
        'Unable to clear chat.',
      );
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
        {/* avatar */}

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

        <Pressable
          style={styles.menuButton}
          onPress={() =>
            setIsMenuVisible(true)
          }>
          <Text style={styles.menuButtonText}>
            ⋮
          </Text>
        </Pressable>
      </View>

      {/* ERROR */}

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsMenuVisible(false)
        }>
        <Pressable
          style={styles.menuOverlay}
          onPress={() =>
            setIsMenuVisible(false)
          }>

          <Pressable
            style={styles.menuContainer}
            onPress={event =>
              event.stopPropagation()
            }>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);

                // Mute will be implemented later.
              }}>
              <Text style={styles.menuIcon}>
                🔕
              </Text>

              <Text style={styles.menuItemText}>
                Mute
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);

                // Search will be implemented later.
              }}>
              <Text style={styles.menuIcon}>
                🔍
              </Text>

              <Text style={styles.menuItemText}>
                Search
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={handleClearChat}>
              <Text style={styles.menuIcon}>
                🗑
              </Text>

              <Text style={styles.menuItemText}>
                Clear chat
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);

                // Block will be implemented later.
              }}>
              <Text style={styles.menuIcon}>
                🚫
              </Text>

              <Text style={styles.menuItemText}>
                Block
              </Text>
            </Pressable>

          </Pressable>
        </Pressable>
      </Modal>

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
                currentUserId
                  ? message.senderId ===
                  currentUserId
                  : message.senderId !==
                  otherUserId
              }
              translatedText={
                translations[message.id] ||
                null
              }
              isTranslating={
                !!translatingMessages[
                message.id
                ]
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
  translatedText: string | null;
  isTranslating: boolean;
}

const MessageBubble = ({
  message,
  isMine,
  translatedText,
  isTranslating,
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

        {/* ORIGINAL MESSAGE */}

        <Text
          style={[
            styles.messageText,
            isMine
              ? styles.myMessageText
              : styles.theirMessageText,
          ]}>
          {message.textContent || ''}
        </Text>

        {/* TRANSLATED MESSAGE */}

        {isTranslating && (
          <View
            style={
              styles.translationLoading
            }>
            <ActivityIndicator
              size="small"
              color={
                isMine
                  ? '#FFFFFF'
                  : COLORS.accent
              }
            />

            <Text
              style={[
                styles.translationLoadingText,
                isMine
                  ? styles.myMessageText
                  : styles.theirMessageText,
              ]}>
              Translating...
            </Text>
          </View>
        )}

        {translatedText && (
          <View
            style={[
              styles.translationContainer,
              isMine
                ? styles.myTranslationContainer
                : styles.theirTranslationContainer,
            ]}>

            <Text
              style={[
                styles.translationLabel,
                isMine
                  ? styles.myMessageText
                  : styles.theirMessageText,
              ]}>
              Translation
            </Text>

            <Text
              style={[
                styles.translationText,
                isMine
                  ? styles.myMessageText
                  : styles.theirMessageText,
              ]}>
              {translatedText}
            </Text>
          </View>
        )}

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

  translationContainer: {
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
  },

  myTranslationContainer: {
    borderTopColor:
      'rgba(255,255,255,0.25)',
  },

  theirTranslationContainer: {
    borderTopColor:
      COLORS.border,
  },

  translationLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
    opacity: 0.7,
  },

  translationText: {
    fontSize: 15,
    lineHeight: 21,
  },

  translationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  translationLoadingText: {
    fontSize: 12,
    opacity: 0.7,
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

  menuButton: {
    width: 42,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonText: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
    color: COLORS.primary,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.15)',
  },

  menuContainer: {
    position: 'absolute',
    top: 62,
    right: 14,
    width: 190,
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  menuIcon: {
    width: 30,
    fontSize: 18,
  },

  menuItemText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default ConversationScreen;