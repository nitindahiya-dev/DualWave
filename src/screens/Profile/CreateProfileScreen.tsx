import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
  route: any;
}

const CreateProfileScreen = ({
  navigation,
  route,
}: Props) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const profilePhotoUrl =
    route.params?.profilePhotoUrl || null;

  const handleContinue = () => {
    if (!name.trim()) {
      return;
    }

    if (!username.trim()) {
      return;
    }

    navigation.navigate('Language', {
      profilePhotoUrl,
      displayName: name.trim(),
      username: username.trim().toLowerCase(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <Text style={styles.step}>
          STEP 1 OF 4
        </Text>

        <Text style={styles.title}>
          Tell us about yourself
        </Text>

        <Text style={styles.subtitle}>
          This information helps people recognize you
          on DualWave.
        </Text>

        <Input
          label="Display name"
          placeholder="How should people call you?"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Input
          label="Username"
          placeholder="@username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
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
    marginBottom: 40,
  },
});

export default CreateProfileScreen;