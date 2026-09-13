import {supabase} from '../supabase/supabaseClient';

export const uploadProfilePhoto = async (
  imageUri: string,
  mimeType?: string,
): Promise<string> => {
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to upload a profile photo.',
    );
  }

  const fileExtension =
    mimeType?.split('/')[1] || 'jpg';

  const filePath = `${user.id}/avatar.${fileExtension}`;

  const response = await fetch(imageUri);

  if (!response.ok) {
    throw new Error('Unable to read the selected image.');
  }

  const arrayBuffer = await response.arrayBuffer();

  const {error: uploadError} = await supabase.storage
    .from('profile-photos')
    .upload(filePath, arrayBuffer, {
      contentType: mimeType || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {data} = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};