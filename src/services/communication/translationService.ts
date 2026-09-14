import {supabase} from '../supabase/supabaseClient';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Translate text from one language to another.
 *
 * The actual AI/provider call will happen through
 * a secure backend function later.
 *
 * API keys must NOT be stored inside the
 * React Native application.
 */
export const translateMessage = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<TranslationResult> => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error(
      'Text cannot be empty.',
    );
  }

  if (!sourceLanguage) {
    throw new Error(
      'Source language is required.',
    );
  }

  if (!targetLanguage) {
    throw new Error(
      'Target language is required.',
    );
  }

  if (
    sourceLanguage === targetLanguage
  ) {
    return {
      translatedText: trimmedText,
      sourceLanguage,
      targetLanguage,
    };
  }

  const {data, error} =
    await supabase.functions.invoke(
      'translate-message',
      {
        body: {
          text: trimmedText,
          sourceLanguage,
          targetLanguage,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (
    !data ||
    typeof data.translatedText !==
      'string'
  ) {
    throw new Error(
      'Invalid translation response.',
    );
  }

  return {
    translatedText:
      data.translatedText,
    sourceLanguage:
      data.sourceLanguage ||
      sourceLanguage,
    targetLanguage:
      data.targetLanguage ||
      targetLanguage,
  };
};