import {supabase} from '../supabase/supabaseClient';

export type ContactStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked';

export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

const mapContact = (data: any): Contact => {
  return {
    id: data.id,
    userId: data.user_id,
    contactUserId: data.contact_user_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
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
      'You must be logged in to manage contacts.',
    );
  }

  return user.id;
};

/**
 * Send a contact request to another user.
 */
export const sendContactRequest = async (
  contactUserId: string,
): Promise<Contact> => {
  const userId = await getCurrentUserId();

  if (userId === contactUserId) {
    throw new Error(
      'You cannot send a contact request to yourself.',
    );
  }

  const {data, error} = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      contact_user_id: contactUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapContact(data);
};

/**
 * Get incoming pending contact requests.
 */
export const getIncomingRequests = async (): Promise<Contact[]> => {
  const userId = await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .select('*')
    .eq('contact_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapContact);
};

/**
 * Get contact requests sent by the current user.
 */
export const getOutgoingRequests = async (): Promise<Contact[]> => {
  const userId = await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapContact);
};

/**
 * Get accepted contacts.
 */
export const getContacts = async (): Promise<Contact[]> => {
  const userId = await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .select('*')
    .or(
      `user_id.eq.${userId},contact_user_id.eq.${userId}`,
    )
    .eq('status', 'accepted')
    .order('updated_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapContact);
};

/**
 * Accept an incoming contact request.
 */
export const acceptContactRequest = async (
  contactId: string,
): Promise<Contact> => {
  await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .update({
      status: 'accepted',
    })
    .eq('id', contactId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapContact(data);
};

/**
 * Decline an incoming contact request.
 */
export const declineContactRequest = async (
  contactId: string,
): Promise<Contact> => {
  await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .update({
      status: 'declined',
    })
    .eq('id', contactId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapContact(data);
};

/**
 * Cancel a contact request sent by the current user.
 */
export const cancelContactRequest = async (
  contactId: string,
): Promise<void> => {
  const userId = await getCurrentUserId();

  const {error} = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }
};

/**
 * Remove an existing accepted contact.
 */
export const removeContact = async (
  contactId: string,
): Promise<void> => {
  await getCurrentUserId();

  const {error} = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('status', 'accepted');

  if (error) {
    throw error;
  }
};

/**
 * Find the relationship between the current user
 * and another user.
 */
export const getContactStatus = async (
  otherUserId: string,
): Promise<Contact | null> => {
  const userId = await getCurrentUserId();

  const {data, error} = await supabase
    .from('contacts')
    .select('*')
    .or(
      `and(user_id.eq.${userId},contact_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},contact_user_id.eq.${userId})`,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapContact(data);
};