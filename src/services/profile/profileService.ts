import { supabase } from '../supabase/supabaseClient';

export interface CreateProfileParams {
  displayName: string;
  username?: string;
  profilePhotoUrl?: string;
  country?: string;

  /**
   * Can temporarily accept either:
   * - language code: "hi"
   * - language name: "Hindi"
   *
   * The service converts it to the official language code.
   */
  nativeLanguage?: string;

  /**
   * Can temporarily accept either language codes
   * or language names.
   */
  spokenLanguages?: string[];

  /**
   * Preferred communication language.
   *
   * If not provided, nativeLanguage is used.
   */
  preferredLanguage?: string;
}

export interface Profile {
  id: string;
  displayName: string;
  username: string | null;
  profilePhotoUrl: string | null;
  country: string | null;

  /**
   * Stored as a language code.
   *
   * Example: "hi"
   */
  nativeLanguage: string | null;

  /**
   * Stored as language codes.
   *
   * Example: ["hi", "en"]
   */
  spokenLanguages: string[];

  /**
   * Stored as a language code.
   *
   * Example: "hi"
   */
  preferredLanguage: string | null;

  createdAt: string;
  updatedAt: string;
}


/**
 * Database profile row.
 */
interface ProfileRow {
  id: string;
  display_name: string;
  username: string | null;
  profile_photo_url: string | null;
  country: string | null;
  native_language: string | null;
  spoken_languages: string[] | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
}


/**
 * Convert a database profile row into
 * the application Profile type.
 */
const mapProfile = (
  data: ProfileRow,
): Profile => {
  return {
    id: data.id,
    displayName: data.display_name,
    username: data.username,
    profilePhotoUrl: data.profile_photo_url,
    country: data.country,
    nativeLanguage: data.native_language,
    spokenLanguages:
      data.spoken_languages || [],
    preferredLanguage:
      data.preferred_language,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};


/**
 * Resolve a language input to its official
 * language code.
 *
 * Supports:
 *
 * "hi"
 * "Hindi"
 * "हिन्दी"
 *
 * and returns:
 *
 * "hi"
 */
const resolveLanguageCode = async (
  language: string,
): Promise<string> => {
  const value = language.trim();

  if (!value) {
    throw new Error(
      'Language cannot be empty.',
    );
  }

  /*
   * First check whether the supplied value
   * is already a language code.
   */
  const {
    data: codeData,
    error: codeError,
  } = await supabase
    .from('languages')
    .select('code')
    .eq('code', value.toLowerCase())
    .maybeSingle();

  if (codeError) {
    throw codeError;
  }

  if (codeData?.code) {
    return codeData.code;
  }

  /*
   * If it wasn't a code, try English name.
   */
  const {
    data: nameData,
    error: nameError,
  } = await supabase
    .from('languages')
    .select('code')
    .eq('name', value)
    .maybeSingle();

  if (nameError) {
    throw nameError;
  }

  if (nameData?.code) {
    return nameData.code;
  }

  /*
   * Finally try the native language name.
   */
  const {
    data: nativeData,
    error: nativeError,
  } = await supabase
    .from('languages')
    .select('code')
    .eq('native_name', value)
    .maybeSingle();

  if (nativeError) {
    throw nativeError;
  }

  if (nativeData?.code) {
    return nativeData.code;
  }

  throw new Error(
    `Unsupported language: ${language}`,
  );
};


/**
 * Resolve an array of language names/codes
 * into official language codes.
 */
const resolveLanguageCodes = async (
  languages: string[],
): Promise<string[]> => {
  const resolved = await Promise.all(
    languages
      .filter(language => language?.trim())
      .map(language =>
        resolveLanguageCode(language),
      ),
  );

  /*
   * Remove duplicates while preserving order.
   */
  return Array.from(
    new Set(resolved),
  );
};


/**
 * Create a new profile.
 */
export const createProfile = async ({
  displayName,
  username,
  profilePhotoUrl,
  country,
  nativeLanguage,
  spokenLanguages,
  preferredLanguage,
}: CreateProfileParams): Promise<Profile> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to create a profile.',
    );
  }

  /*
   * Convert language names to official codes.
   */
  const resolvedNativeLanguage =
    nativeLanguage
      ? await resolveLanguageCode(
        nativeLanguage,
      )
      : null;

  const resolvedSpokenLanguages =
    spokenLanguages?.length
      ? await resolveLanguageCodes(
        spokenLanguages,
      )
      : [];

  /*
   * Preferred language defaults to native language
   * when the user hasn't explicitly selected one.
   */
  const resolvedPreferredLanguage =
    preferredLanguage
      ? await resolveLanguageCode(
        preferredLanguage,
      )
      : resolvedNativeLanguage;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,

      display_name:
        displayName.trim(),

      username:
        username?.trim().toLowerCase() ||
        null,

      profile_photo_url:
        profilePhotoUrl || null,

      country:
        country || null,

      native_language:
        resolvedNativeLanguage,

      spoken_languages:
        resolvedSpokenLanguages,

      preferred_language:
        resolvedPreferredLanguage,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(
    data as ProfileRow,
  );
};


/**
 * Get the currently authenticated user's profile.
 */
export const getProfile =
  async (): Promise<Profile | null> => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapProfile(
      data as ProfileRow,
    );
  };


/**
 * Update the currently authenticated user's profile.
 */
export const updateProfile = async (
  updates: Partial<CreateProfileParams>,
): Promise<Profile> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to update your profile.',
    );
  }

  const databaseUpdates: Record<
    string,
    unknown
  > = {};

  if (updates.displayName !== undefined) {
    databaseUpdates.display_name =
      updates.displayName.trim();
  }

  if (updates.username !== undefined) {
    databaseUpdates.username =
      updates.username.trim().toLowerCase();
  }

  if (
    updates.profilePhotoUrl !==
    undefined
  ) {
    databaseUpdates.profile_photo_url =
      updates.profilePhotoUrl;
  }

  if (updates.country !== undefined) {
    databaseUpdates.country =
      updates.country;
  }

  /*
   * Convert native language to its official code.
   */
  if (
    updates.nativeLanguage !== undefined
  ) {
    databaseUpdates.native_language =
      updates.nativeLanguage
        ? await resolveLanguageCode(
          updates.nativeLanguage,
        )
        : null;
  }

  /*
   * Convert spoken languages to official codes.
   */
  if (
    updates.spokenLanguages !== undefined
  ) {
    databaseUpdates.spoken_languages =
      await resolveLanguageCodes(
        updates.spokenLanguages,
      );
  }

  /*
   * Convert preferred language to its official code.
   */
  if (
    updates.preferredLanguage !==
    undefined
  ) {
    databaseUpdates.preferred_language =
      updates.preferredLanguage
        ? await resolveLanguageCode(
          updates.preferredLanguage,
        )
        : null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(databaseUpdates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(
    data as ProfileRow,
  );
};