import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {COLORS} from '../../constants/colors';

interface Props {
  navigation: any;
}

const ResetPasswordScreen = ({navigation}: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={styles.back}
          onPress={() => navigation.goBack()}>
          ‹ Back
        </Text>

        <View style={styles.header}>
          <Text style={styles.title}>Create new password</Text>

          <Text style={styles.subtitle}>
            Choose a new password for your DualWave account.
          </Text>
        </View>

        <Input
          label="New password"
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Confirm password"
          placeholder="Enter password again"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          title="Reset password"
          onPress={handleReset}
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
  },

  back: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 48,
  },

  header: {
    marginBottom: 40,
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
});

export default ResetPasswordScreen;