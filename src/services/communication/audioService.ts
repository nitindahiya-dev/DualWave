import {
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Sound from 'react-native-nitro-sound';

let isRecording = false;
let recordingDurationMs = 0;

export interface RecordingResult {
  audioPath: string;
  durationMs: number;
}

const requestMicrophonePermission =
  async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const result =
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'DualWave needs access to your microphone to record voice messages.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

    return (
      result === PermissionsAndroid.RESULTS.GRANTED
    );
  };

export const startRecording = async (): Promise<void> => {
  if (isRecording) {
    return;
  }

  const hasPermission =
    await requestMicrophonePermission();

  if (!hasPermission) {
    throw new Error(
      'Microphone permission was denied.',
    );
  }

  try {
    recordingDurationMs = 0;

    await Sound.startRecorder();

    Sound.addRecordBackListener((event: any) => {
      recordingDurationMs =
        event.currentPosition || 0;
    });

    isRecording = true;

    console.log('Audio recording started.');
  } catch (error) {
    console.error(
      'Unable to start audio recording:',
      error,
    );

    throw error;
  }
};

export const stopRecording =
  async (): Promise<RecordingResult> => {
    if (!isRecording) {
      throw new Error(
        'No audio recording is currently active.',
      );
    }

    try {
      const audioPath =
        await Sound.stopRecorder();

      Sound.removeRecordBackListener();

      isRecording = false;

      const durationMs =
        Math.round(recordingDurationMs);

      console.log(
        'Audio recording stopped:',
        audioPath,
      );

      console.log(
        'Recording duration:',
        durationMs,
        'ms',
      );

      recordingDurationMs = 0;

      return {
        audioPath,
        durationMs,
      };
    } catch (error) {
      Sound.removeRecordBackListener();

      isRecording = false;
      recordingDurationMs = 0;

      console.error(
        'Unable to stop audio recording:',
        error,
      );

      throw error;
    }
  };

export const getIsRecording = (): boolean => {
  return isRecording;
};