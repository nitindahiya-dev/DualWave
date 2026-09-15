import {supabase} from '../supabase/supabaseClient';

export interface MessageTranslation {
  id: string;
  messageId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string | null;
  translationStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

const mapMessageTranslation = (
  data: any,
): MessageTranslation => ({
  id: data.id,
  messageId: data.message_id,
  sourceLanguage: data.source_language,
  targetLanguage: data.target_language,
  translatedText: data.translated_text,
  translationStatus: data.translation_status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

/**
 * Get an existing translation for a message,
 * source language, and target language.
 */
export const getMessageTranslation = async (
  messageId: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<MessageTranslation | null> => {
  const normalizedSourceLanguage =
    sourceLanguage.trim().toLowerCase();

  const normalizedTargetLanguage =
    targetLanguage.trim().toLowerCase();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  if (!normalizedSourceLanguage) {
    throw new Error('Source language is required.');
  }

  if (!normalizedTargetLanguage) {
    throw new Error('Target language is required.');
  }

  if (
    normalizedSourceLanguage ===
    normalizedTargetLanguage
  ) {
    return null;
  }

  const {data, error} = await supabase
    .from('message_translations')
    .select('*')
    .eq('message_id', messageId)
    .eq(
      'source_language',
      normalizedSourceLanguage,
    )
    .eq(
      'target_language',
      normalizedTargetLanguage,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapMessageTranslation(data);
};

/**
 * Save a completed translation.
 *
 * The database has a unique constraint on:
 * (message_id, target_language)
 *
 * Therefore upsert prevents duplicate translations.
 */
export const saveMessageTranslation = async (
  messageId: string,
  sourceLanguage: string,
  targetLanguage: string,
  translatedText: string,
): Promise<MessageTranslation> => {
  const normalizedSourceLanguage =
    sourceLanguage.trim().toLowerCase();

  const normalizedTargetLanguage =
    targetLanguage.trim().toLowerCase();

  const normalizedTranslatedText =
    translatedText.trim();

  if (!messageId) {
    throw new Error('Message ID is required.');
  }

  if (!normalizedSourceLanguage) {
    throw new Error('Source language is required.');
  }

  if (!normalizedTargetLanguage) {
    throw new Error('Target language is required.');
  }

  if (!normalizedTranslatedText) {
    throw new Error(
      'Translated text cannot be empty.',
    );
  }

  if (
    normalizedSourceLanguage ===
    normalizedTargetLanguage
  ) {
    throw new Error(
      'Source and target languages must be different.',
    );
  }

  const {data, error} = await supabase
    .from('message_translations')
    .upsert(
      {
        message_id: messageId,
        source_language:
          normalizedSourceLanguage,
        target_language:
          normalizedTargetLanguage,
        translated_text:
          normalizedTranslatedText,
        translation_status: 'completed',
      },
      {
        onConflict:
          'message_id,target_language',
      },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'Failed to save message translation.',
    );
  }

  return mapMessageTranslation(data);
};

/**
 * Mark a translation as pending.
 */
export const createPendingMessageTranslation =
  async (
    messageId: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<MessageTranslation> => {
    const normalizedSourceLanguage =
      sourceLanguage.trim().toLowerCase();

    const normalizedTargetLanguage =
      targetLanguage.trim().toLowerCase();

    if (!messageId) {
      throw new Error(
        'Message ID is required.',
      );
    }

    if (!normalizedSourceLanguage) {
      throw new Error(
        'Source language is required.',
      );
    }

    if (!normalizedTargetLanguage) {
      throw new Error(
        'Target language is required.',
      );
    }

    if (
      normalizedSourceLanguage ===
      normalizedTargetLanguage
    ) {
      throw new Error(
        'Source and target languages must be different.',
      );
    }

    const {data, error} = await supabase
      .from('message_translations')
      .upsert(
        {
          message_id: messageId,
          source_language:
            normalizedSourceLanguage,
          target_language:
            normalizedTargetLanguage,
          translated_text: null,
          translation_status: 'pending',
        },
        {
          onConflict:
            'message_id,target_language',
        },
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        'Failed to create pending translation.',
      );
    }

    return mapMessageTranslation(data);
  };