import {supabase} from '../supabase/supabaseClient';

export type MessageType =
  | 'text'
  | 'voice';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  textContent: string | null;
  sourceLanguage: string | null;
  audioPath: string | null;
  durationMs: number | null;
  createdAt: string;
  updatedAt: string;
}

const mapMessage = (
  data: any,
): Message => {
  return {
    id: data.id,
    conversationId:
      data.conversation_id,
    senderId: data.sender_id,
    messageType:
      data.message_type,
    textContent:
      data.text_content,
    sourceLanguage:
      data.source_language,
    audioPath:
      data.audio_path,
    durationMs:
      data.duration_ms,
    createdAt:
      data.created_at,
    updatedAt:
      data.updated_at,
  };
};

const getCurrentUserId = async (): Promise<string> => {
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to send messages.',
    );
  }

  return user.id;
};

/**
 * Load messages from a conversation.
 */
export const getConversationMessages = async (
  conversationId: string,
): Promise<Message[]> => {
  await getCurrentUserId();

  const {data, error} = await supabase
    .from('messages')
    .select('*')
    .eq(
      'conversation_id',
      conversationId,
    )
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(
    mapMessage,
  );
};

/**
 * Send a text message.
 */
export const sendTextMessage = async (
  conversationId: string,
  text: string,
  sourceLanguage?: string | null,
): Promise<Message> => {
  const userId =
    await getCurrentUserId();

  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error(
      'Message cannot be empty.',
    );
  }

  const {data, error} = await supabase
    .from('messages')
    .insert({
      conversation_id:
        conversationId,
      sender_id: userId,
      message_type: 'text',
      text_content: trimmedText,
      source_language:
        sourceLanguage || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'Unable to send message.',
    );
  }

  const {error: conversationError} =
    await supabase
      .from('conversations')
      .update({
        last_message_at:
          data.created_at,
        updated_at:
          data.created_at,
      })
      .eq(
        'id',
        conversationId,
      );

  if (conversationError) {
    console.warn(
      'Unable to update conversation timestamp:',
      conversationError,
    );
  }

  return mapMessage(data);
};

/**
 * Delete a message sent by the
 * current user.
 */
export const deleteMessage = async (
  messageId: string,
): Promise<void> => {
  await getCurrentUserId();

  const {error} = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    throw error;
  }
};