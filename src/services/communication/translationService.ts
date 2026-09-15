import { supabase } from '../supabase/supabaseClient';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  detectedLanguage?: string | null;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
}

/**
 * Normalize provider language codes
 * into DualWave database language codes.
 *
 * Example:
 * zh-CN -> zh
 * zh-TW -> zh
 * hi-IN -> hi
 */
const normalizeLanguageCode = (languageCode: string): string => {
  const normalized = languageCode.trim().toLowerCase();

  if (normalized.startsWith('zh')) {
    return 'zh';
  }

  if (normalized.startsWith('hi')) {
    return 'hi';
  }

  return normalized.split('-')[0];
};

/**
 * Detect the actual language of text.
 *
 * The backend uses MyMemory's
 * autodetect capability.
 */
export const detectMessageLanguage = async (
  text: string,
  targetLanguage: string,
): Promise<LanguageDetectionResult> => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('Text cannot be empty.');
  }

  if (!targetLanguage) {
    throw new Error('Target language is required for language detection.');
  }

  const { data, error } = await supabase.functions.invoke('translate-message', {
    body: {
      text: trimmedText,
      sourceLanguage: 'autodetect',
      targetLanguage,
      detectOnly: true,
    },
  });

  if (error) {
    console.error('Language detection Edge Function error:', error);

    const context = (error as any)?.context;

    if (context) {
      try {
        const responseText = await context.text();

        console.error(
          'Language detection Edge Function response:',
          responseText,
        );
      } catch (responseReadError) {
        console.error(
          'Unable to read Edge Function error response:',
          responseReadError,
        );
      }
    }

    throw error;
  }

  if (
    !data ||
    typeof data.detectedLanguage !== 'string' ||
    !data.detectedLanguage.trim()
  ) {
    throw new Error('Unable to detect message language.');
  }

  return {
    detectedLanguage: normalizeLanguageCode(data.detectedLanguage),
  };
};

/**
 * Translate text from one language
 * to another.
 */
export const translateMessage = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<TranslationResult> => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('Text cannot be empty.');
  }

  if (!sourceLanguage) {
    throw new Error('Source language is required.');
  }

  if (!targetLanguage) {
    throw new Error('Target language is required.');
  }

  const normalizedSource = normalizeLanguageCode(sourceLanguage);

  const normalizedTarget = normalizeLanguageCode(targetLanguage);

  if (normalizedSource === normalizedTarget) {
    return {
      translatedText: trimmedText,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget,
    };
  }

  const { data, error } = await supabase.functions.invoke('translate-message', {
    body: {
      text: trimmedText,
      sourceLanguage: normalizedSource,
      targetLanguage: normalizedTarget,
    },
  });

  if (error) {
    throw error;
  }

  if (!data || typeof data.translatedText !== 'string') {
    throw new Error('Invalid translation response.');
  }

  return {
    translatedText: data.translatedText,

    sourceLanguage: data.sourceLanguage || normalizedSource,

    targetLanguage: data.targetLanguage || normalizedTarget,

    detectedLanguage: data.detectedLanguage
      ? normalizeLanguageCode(data.detectedLanguage)
      : null,
  };
};
