import {supabase} from '../supabase/supabaseClient';

const VOICE_BUCKET = 'voice-messages';

export const uploadVoiceMessage = async (
  audioPath: string,
  conversationId: string,
): Promise<string> => {
  if (!audioPath) {
    throw new Error('Audio path is required.');
  }

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  // Get currently logged-in user
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to upload a voice message.',
    );
  }

  /*
   * Convert the local React Native file into
   * an ArrayBuffer that Supabase Storage can upload.
   */
  const response = await fetch(audioPath);

  if (!response.ok) {
    throw new Error(
      `Unable to read recorded audio file: ${response.status}`,
    );
  }

  const audioData = await response.arrayBuffer();

  /*
   * Storage path:
   *
   * voice-messages/
   *   USER_ID/
   *     CONVERSATION_ID/
   *       unique-file.mp4
   */
  const fileName = `voice_${Date.now()}.mp4`;

  const storagePath =
    `${user.id}/${conversationId}/${fileName}`;

  console.log(
    'Uploading voice message:',
    storagePath,
  );

  const {error: uploadError} =
    await supabase.storage
      .from(VOICE_BUCKET)
      .upload(storagePath, audioData, {
        contentType: 'audio/mp4',
        upsert: false,
      });

  if (uploadError) {
    console.error(
      'Voice message upload failed:',
      uploadError,
    );

    throw uploadError;
  }

  console.log(
    'Voice message uploaded successfully:',
    storagePath,
  );

  return storagePath;
};

export const createVoiceMessage = async (
  conversationId: string,
  audioPath: string,
  durationMs: number,
): Promise<string> => {
  if (!conversationId) {
    throw new Error(
      'Conversation ID is required.',
    );
  }

  if (!audioPath) {
    throw new Error(
      'Audio path is required.',
    );
  }

  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be logged in to create a voice message.',
    );
  }

  const {data, error} = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: 'voice',
      text_content: null,
      source_language: null,
      audio_path: audioPath,
      duration_ms: durationMs,
    })
    .select('*')
    .single();

  if (error) {
    console.error(
      'Unable to create voice message:',
      error,
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      'Voice message was not created.',
    );
  }

  console.log(
    'Voice message created:',
    data.id,
  );

  return data.id;
};