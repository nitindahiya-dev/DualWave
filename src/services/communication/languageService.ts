import {supabase} from '../supabase/supabaseClient';

import {
  Language,
} from '../../types/communication';


/**
 * Database row returned from Supabase.
 */
interface LanguageRow {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  text_translation_enabled: boolean;
  voice_translation_enabled: boolean;
  face_to_face_enabled: boolean;
}


/**
 * Convert a Supabase language row into
 * the application's Language type.
 */
const mapLanguage = (
  row: LanguageRow,
): Language => {
  return {
    code: row.code,
    name: row.name,
    nativeName: row.native_name,
    isActive: row.is_active,
    textTranslationEnabled:
      row.text_translation_enabled,
    voiceTranslationEnabled:
      row.voice_translation_enabled,
    faceToFaceEnabled:
      row.face_to_face_enabled,
  };
};


/**
 * Get all active languages.
 */
export const getActiveLanguages = async (): Promise<
  Language[]
> => {
  const {data, error} = await supabase
    .from('languages')
    .select(`
      code,
      name,
      native_name,
      is_active,
      text_translation_enabled,
      voice_translation_enabled,
      face_to_face_enabled
    `)
    .eq('is_active', true)
    .order('name', {
      ascending: true,
    });

  if (error) {
    console.error(
      'Get active languages error:',
      error,
    );

    throw error;
  }

  return (data || []).map(
    row => mapLanguage(row as LanguageRow),
  );
};


/**
 * Get one language by its code.
 *
 * Example:
 *
 * getLanguageByCode('hi')
 * getLanguageByCode('zh')
 * getLanguageByCode('ja')
 */
export const getLanguageByCode = async (
  code: string,
): Promise<Language | null> => {
  const normalizedCode = code
    .trim()
    .toLowerCase();

  if (!normalizedCode) {
    return null;
  }

  const {data, error} = await supabase
    .from('languages')
    .select(`
      code,
      name,
      native_name,
      is_active,
      text_translation_enabled,
      voice_translation_enabled,
      face_to_face_enabled
    `)
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error) {
    console.error(
      'Get language by code error:',
      error,
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  return mapLanguage(
    data as LanguageRow,
  );
};


/**
 * Search active languages.
 *
 * Searches both English and native names.
 *
 * Example:
 *
 * searchLanguages('Hindi')
 * searchLanguages('हिन्दी')
 * searchLanguages('Chinese')
 */
export const searchLanguages = async (
  searchTerm: string,
): Promise<Language[]> => {
  const query = searchTerm.trim();

  if (!query) {
    return getActiveLanguages();
  }

  const {data, error} = await supabase
    .from('languages')
    .select(`
      code,
      name,
      native_name,
      is_active,
      text_translation_enabled,
      voice_translation_enabled,
      face_to_face_enabled
    `)
    .eq('is_active', true)
    .or(
      `name.ilike.%${query}%,native_name.ilike.%${query}%`,
    )
    .order('name', {
      ascending: true,
    });

  if (error) {
    console.error(
      'Search languages error:',
      error,
    );

    throw error;
  }

  return (data || []).map(
    row => mapLanguage(row as LanguageRow),
  );
};