/**
 * DualWave Communication Types
 *
 * Shared types for:
 * - Languages
 * - Contacts
 * - Conversations
 * - Messages
 * - Message translations
 */

/**
 * Supported communication language.
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;

  /**
   * Whether the current translation infrastructure
   * supports this capability for the language.
   */
  textTranslationEnabled: boolean;
  voiceTranslationEnabled: boolean;
  faceToFaceEnabled: boolean;
}


/**
 * Contact relationship status.
 */
export type ContactStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked';


/**
 * Contact between two DualWave users.
 */
export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}


/**
 * Conversation type.
 *
 * We start with direct and group.
 * Face-to-face will use the same conversation
 * infrastructure rather than creating a separate
 * conversation system.
 */
export type ConversationType =
  | 'direct'
  | 'group';


/**
 * Conversation.
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}


/**
 * Member of a conversation.
 */
export interface ConversationMember {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
}


/**
 * Message type.
 *
 * Text is the first implementation.
 * Voice will use the same message infrastructure later.
 */
export type MessageType =
  | 'text'
  | 'voice';


/**
 * Message.
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;

  textContent: string | null;

  /**
   * BCP-47 / provider language code.
   *
   * Example:
   * hi
   * en
   * zh
   * ja
   */
  sourceLanguage: string | null;

  /**
   * Supabase Storage path for future voice messages.
   */
  audioPath: string | null;

  durationMs: number | null;

  createdAt: string;
  updatedAt: string;
}


/**
 * Translation processing state.
 */
export type TranslationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';


/**
 * Translation of a message into another language.
 */
export interface MessageTranslation {
  id: string;
  messageId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string | null;
  translationStatus: TranslationStatus;
  createdAt: string;
  updatedAt: string;
}