import React, {useState} from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';
import {uploadProfilePhoto} from '../../services/profile/profileStorageService';

interface Props {
  navigation: any;
}

const ProfilePhotoScreen = ({navigation}: Props) => {
  const [imageUri, setImageUri] = useState<string | null>(
    null,
  );

  const [mimeType, setMimeType] = useState<
    string | undefined
  >(undefined);

  const [isUploading, setIsUploading] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const handleChoosePhoto = () => {
    setError(null);

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          setError(
            response.errorMessage ||
              'Unable to select the photo.',
          );
          return;
        }

        const asset = response.assets?.[0];

        if (!asset?.uri) {
          setError('No photo was selected.');
          return;
        }

        setImageUri(asset.uri);
        setMimeType(asset.type);
      },
    );
  };

  const handleContinue = async () => {
    setError(null);

    // User skipped the photo.
    if (!imageUri) {
      navigation.navigate('CreateProfile', {
        profilePhotoUrl: null,
      });

      return;
    }

    setIsUploading(true);

    try {
      const profilePhotoUrl =
        await uploadProfilePhoto(
          imageUri,
          mimeType,
        );

      navigation.navigate('CreateProfile', {
        profilePhotoUrl,
      });
    } catch (uploadError: any) {
      console.error(
        'Profile photo upload error:',
        uploadError,
      );

      setError(
        uploadError?.message ||
          'Unable to upload your photo. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>PROFILE SETUP</Text>

      <Text style={styles.title}>
        Add a profile photo
      </Text>

      <Text style={styles.subtitle}>
        Help people recognize you when you connect with
        them.
      </Text>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatar}
          activeOpacity={0.8}
          onPress={handleChoosePhoto}
          disabled={isUploading}>
          {imageUri ? (
            <Image
              source={{uri: imageUri}}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.camera}>+</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.photoText}>
          {imageUri
            ? 'Tap to change photo'
            : 'Add photo'}
        </Text>

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={isUploading}
          disabled={isUploading}
        />

        {!isUploading && (
          <Text
            style={styles.skip}
            onPress={() =>
              navigation.navigate('CreateProfile', {
                profilePhotoUrl: null,
              })
            }>
            Skip for now
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 60,
  },

  step: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.accent,
    marginBottom: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
  },

  avatarSection: {
    alignItems: 'center',
    marginTop: 70,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  camera: {
    fontSize: 42,
    fontWeight: '300',
    color: COLORS.secondary,
  },

  photoText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.secondary,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },

  bottom: {
    marginTop: 'auto',
    marginBottom: 20,
  },

  skip: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: COLORS.secondary,
  },
});

export default ProfilePhotoScreen;