import {supabase} from '../supabase/supabaseClient';

export interface CreateProfileParams {
  displayName: string;
  username?: string;
  profilePhotoUrl?: string;
  country?: string;
  nativeLanguage?: string;
  spokenLanguages?: string[];
}

export interface Profile {
  id: string;
  displayName: string;
  username: string | null;
  profilePhotoUrl: string | null;
  country: string | null;
  nativeLanguage: string | null;
  spokenLanguages: string[];
  createdAt: string;
  updatedAt: string;
}

const mapProfile = (data: any): Profile => {
  return {
    id: data.id,
    displayName: data.display_name,
    username: data.username,
    profilePhotoUrl: data.profile_photo_url,
    country: data.country,
    nativeLanguage: data.native_language,
    spokenLanguages: data.spoken_languages || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const createProfile = async ({
  displayName,
  username,
  profilePhotoUrl,
  country,
  nativeLanguage,
  spokenLanguages,
}: CreateProfileParams): Promise<Profile> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be logged in to create a profile.');
  }

  const {data, error} = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: displayName.trim(),
      username: username?.trim().toLowerCase() || null,
      profile_photo_url: profilePhotoUrl || null,
      country: country || null,
      native_language: nativeLanguage || null,
      spoken_languages: spokenLanguages || [],
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
};

export const getProfile = async (): Promise<Profile | null> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const {data, error} = await supabase
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

  return mapProfile(data);
};

export const updateProfile = async (
  updates: Partial<CreateProfileParams>,
): Promise<Profile> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be logged in to update your profile.');
  }

  const databaseUpdates: Record<string, any> = {};

  if (updates.displayName !== undefined) {
    databaseUpdates.display_name =
      updates.displayName.trim();
  }

  if (updates.username !== undefined) {
    databaseUpdates.username =
      updates.username.trim().toLowerCase();
  }

  if (updates.profilePhotoUrl !== undefined) {
    databaseUpdates.profile_photo_url =
      updates.profilePhotoUrl;
  }

  if (updates.country !== undefined) {
    databaseUpdates.country = updates.country;
  }

  if (updates.nativeLanguage !== undefined) {
    databaseUpdates.native_language =
      updates.nativeLanguage;
  }

  if (updates.spokenLanguages !== undefined) {
    databaseUpdates.spoken_languages =
      updates.spokenLanguages;
  }

  const {data, error} = await supabase
    .from('profiles')
    .update(databaseUpdates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
};