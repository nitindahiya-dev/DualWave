import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
}

const ProfilePhotoScreen = ({navigation}: Props) => {
  const handleContinue = () => {
    navigation.navigate('CreateProfile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>PROFILE SETUP</Text>

      <Text style={styles.title}>Add a profile photo</Text>

      <Text style={styles.subtitle}>
        Help people recognize you when you connect with them.
      </Text>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatar}
          activeOpacity={0.8}
          onPress={() => console.log('Choose photo')}>
          <Text style={styles.camera}>+</Text>
        </TouchableOpacity>

        <Text style={styles.photoText}>
          Add photo
        </Text>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={handleContinue}
        />

        <Text
          style={styles.skip}
          onPress={handleContinue}>
          Skip for now
        </Text>
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