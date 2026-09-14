import {supabase} from '../supabase/supabaseClient';

export type ConversationType = 'direct';

export interface Conversation {
  id: string;
  type: ConversationType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
}

const mapConversation = (
  data: any,
): Conversation => {
  return {
    id: data.id,
    type: data.type,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastMessageAt: data.last_message_at,
  };
};

const mapConversationMember = (
  data: any,
): ConversationMember => {
  return {
    conversationId: data.conversation_id,
    userId: data.user_id,
    joinedAt: data.joined_at,
    lastReadAt: data.last_read_at,
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
      'You must be logged in to use conversations.',
    );
  }

  return user.id;
};

/**
 * Get or create the direct conversation between
 * the current user and another accepted contact.
 */
export const getOrCreateDirectConversation = async (
  otherUserId: string,
): Promise<string> => {
  const currentUserId =
    await getCurrentUserId();

  if (currentUserId === otherUserId) {
    throw new Error(
      'You cannot create a conversation with yourself.',
    );
  }

  const {data, error} = await supabase.rpc(
    'get_or_create_direct_conversation',
    {
      other_user_id: otherUserId,
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'Unable to create or open conversation.',
    );
  }

  return data;
};

/**
 * Get a conversation by ID.
 */
export const getConversation = async (
  conversationId: string,
): Promise<Conversation | null> => {
  await getCurrentUserId();

  const {data, error} = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapConversation(data);
};

/**
 * Get members of a conversation.
 */
export const getConversationMembers = async (
  conversationId: string,
): Promise<ConversationMember[]> => {
  await getCurrentUserId();

  const {data, error} = await supabase
    .from('conversation_members')
    .select('*')
    .eq(
      'conversation_id',
      conversationId,
    );

  if (error) {
    throw error;
  }

  return (data || []).map(
    mapConversationMember,
  );
};

/**
 * Get all conversations for the current user.
 */
export const getMyConversations = async (): Promise<
  Conversation[]
> => {
  const userId =
    await getCurrentUserId();

  const {data: memberships, error: memberError} =
    await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId);

  if (memberError) {
    throw memberError;
  }

  if (!memberships?.length) {
    return [];
  }

  const conversationIds =
    memberships.map(
      member => member.conversation_id,
    );

  const {data, error} = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('last_message_at', {
      ascending: false,
      nullsFirst: false,
    })
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(
    mapConversation,
  );
};

/**
 * Update the current user's last-read timestamp
 * for a conversation.
 */
export const markConversationAsRead = async (
  conversationId: string,
): Promise<void> => {
  const userId =
    await getCurrentUserId();

  const {error} = await supabase
    .from('conversation_members')
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq(
      'conversation_id',
      conversationId,
    )
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};