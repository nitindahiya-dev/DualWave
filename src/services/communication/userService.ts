import {supabase} from '../supabase/supabaseClient';

export interface PublicUser {
  id: string;
  displayName: string;
  username: string | null;
  profilePhotoUrl: string | null;
  country: string | null;
  nativeLanguage: string | null;
  spokenLanguages: string[];
  preferredLanguage: string | null;
}

const mapPublicUser = (data: any): PublicUser => {
  return {
    id: data.id,
    displayName: data.display_name,
    username: data.username,
    profilePhotoUrl: data.profile_photo_url,
    country: data.country,
    nativeLanguage: data.native_language,
    spokenLanguages: data.spoken_languages || [],
    preferredLanguage: data.preferred_language,
  };
};

const PUBLIC_USER_FIELDS = `
  id,
  display_name,
  username,
  profile_photo_url,
  country,
  native_language,
  spoken_languages,
  preferred_language
`;

export const searchUsers = async (
  searchTerm: string,
): Promise<PublicUser[]> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to search for users.',
    );
  }

  const term = searchTerm.trim();

  if (!term) {
    return [];
  }

  const {data, error} = await supabase
    .from('profiles')
    .select(PUBLIC_USER_FIELDS)
    .neq('id', user.id)
    .or(
      `username.ilike.%${term}%,display_name.ilike.%${term}%`,
    )
    .order('display_name', {
      ascending: true,
    })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data || []).map(mapPublicUser);
};

export const getUserById = async (
  userId: string,
): Promise<PublicUser | null> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to view users.',
    );
  }

  const {data, error} = await supabase
    .from('profiles')
    .select(PUBLIC_USER_FIELDS)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapPublicUser(data);
};