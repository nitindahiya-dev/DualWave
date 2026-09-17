import React, {
    useEffect,
    useState,
} from 'react';

import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Sound from 'react-native-nitro-sound';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

import {
    uploadVoiceMessage,
    createVoiceMessage,
} from '../../services/communication/voiceService';

import {
    startRecording,
    stopRecording,
} from '../../services/communication/audioService';

const AudioTestScreen = () => {
    const [isRecording, setIsRecording] =
        useState(false);

    const [audioPath, setAudioPath] =
        useState('');

    const [durationMs, setDurationMs] =
        useState(0);

    const conversationId =
        '4efcccb8-bfb0-4d93-9017-247991fa1a89';

    const handleStartRecording =
        async () => {
            try {
                await startRecording();

                setIsRecording(true);
                setAudioPath('');
                setDurationMs(0);
            } catch (error) {
                console.error(
                    'Recording start error:',
                    error,
                );

                Alert.alert(
                    'Recording Error',
                    error instanceof Error
                        ? error.message
                        : 'Unable to start recording.',
                );
            }
        };

    const handleStopRecording =
        async () => {
            try {
                const result =
                    await stopRecording();

                setIsRecording(false);
                setAudioPath(result.audioPath);
                setDurationMs(result.durationMs);

                Alert.alert(
                    'Recording Complete',
                    `Audio file created successfully.`,
                );
            } catch (error) {
                console.error(
                    'Recording stop error:',
                    error,
                );

                setIsRecording(false);

                Alert.alert(
                    'Recording Error',
                    error instanceof Error
                        ? error.message
                        : 'Unable to stop recording.',
                );
            }
        };

    const handleUploadRecording =
        async () => {
            if (!audioPath) {
                Alert.alert(
                    'Upload Error',
                    'No recording available.',
                );
                return;
            }

            try {
                console.log(
                    'Starting voice upload...',
                );

                const storagePath =
                    await uploadVoiceMessage(
                        audioPath,
                        conversationId,
                    );

                console.log(
                    'Storage upload complete:',
                    storagePath,
                );

                const messageId =
                    await createVoiceMessage(
                        conversationId,
                        storagePath,
                        durationMs,
                    );

                console.log(
                    'Voice message created:',
                    messageId,
                );

                Alert.alert(
                    'Voice Message Created',
                    `Message ID:\n${messageId}`,
                );
            } catch (error) {
                console.error(
                    'Voice message error:',
                    error,
                );

                Alert.alert(
                    'Voice Message Error',
                    error instanceof Error
                        ? error.message
                        : 'Unable to create voice message.',
                );
            }
        };

    const handlePlayRecording = async () => {
        if (!audioPath) {
            return;
        }

        try {
            console.log(
                'Starting playback:',
                audioPath,
            );

            await Sound.startPlayer(audioPath);

            console.log(
                'Playback started successfully.',
            );
        } catch (error) {
            console.error(
                'Playback error:',
                error,
            );

            Alert.alert(
                'Playback Error',
                error instanceof Error
                    ? error.message
                    : 'Unable to play recording.',
            );
        }
    };

    useEffect(() => {
        const handlePlayback = (event: any) => {
            console.log(
                'Playback:',
                event.currentPosition,
                '/',
                event.duration,
            );
        };

        Sound.addPlayBackListener(handlePlayback);

        return () => {
            Sound.removePlayBackListener();

            Sound.stopPlayer().catch(() => {});
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Audio Recording Test
            </Text>

            <Text style={styles.status}>
                Status:{' '}
                {isRecording
                    ? 'Recording...'
                    : 'Not recording'}
            </Text>

            {!isRecording ? (
                <Button
                    title="Start Recording"
                    onPress={
                        handleStartRecording
                    }
                />
            ) : (
                <Button
                    title="Stop Recording"
                    onPress={
                        handleStopRecording
                    }
                />
            )}

            {audioPath.length > 0 && (
                <View style={styles.playButton}>
                    <Button
                        title="▶ Play Recording"
                        onPress={handlePlayRecording}
                    />

                    <View style={styles.playButton}>
                        <Button
                            title="☁️ Upload Recording"
                            onPress={
                                handleUploadRecording
                            }
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            COLORS.background,
        padding: 24,
        paddingTop: 70,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 20,
    },

    status: {
        fontSize: 16,
        color: COLORS.secondary,
        marginBottom: 30,
    },

    result: {
        marginTop: 30,
        padding: 16,
        borderRadius: 12,
        backgroundColor:
            COLORS.surface,
        borderWidth: 1,
        borderColor:
            COLORS.border,
    },

    resultTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 8,
    },

    playButton: {
        marginTop: 20,
    },

    path: {
        fontSize: 12,
        color: COLORS.secondary,
    },
});

export default AudioTestScreen;