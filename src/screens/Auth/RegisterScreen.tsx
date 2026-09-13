import React, { useState } from 'react';
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
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

interface Props {
  navigation: any;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const register = useAuthStore(
    state => state.register,
  );

  const isLoading = useAuthStore(
    state => state.isLoading,
  );

  const authError = useAuthStore(
    state => state.authError,
  );

  const clearAuthError = useAuthStore(
    state => state.clearAuthError,
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Name validation
    if (!trimmedName) {
      newErrors.name = 'Name is required.';
    }

    // Email validation
    if (!trimmedEmail) {
      newErrors.email = 'Email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password =
        'Password must be at least 8 characters.';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword =
        'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        'Passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const result = await register(
      name,
      email,
      password,
    );

    if (result.needsEmailConfirmation) {
      navigation.navigate('OTP', {
        email: email.trim().toLowerCase(),
      });

      return;
    }

    if (useAuthStore.getState().isAuthenticated) {
      return;
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    clearAuthError();

    if (errors.name) {
      setErrors(previous => ({
        ...previous,
        name: undefined,
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    clearAuthError();

    if (errors.email) {
      setErrors(previous => ({
        ...previous,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    clearAuthError();

    if (errors.password || errors.confirmPassword) {
      setErrors(previous => ({
        ...previous,
        password: undefined,
        confirmPassword: undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    clearAuthError();

    if (errors.confirmPassword) {
      setErrors(previous => ({
        ...previous,
        confirmPassword: undefined,
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <Text
          style={styles.back}
          onPress={() => navigation.goBack()}>
          ‹ Back
        </Text>

        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>

          <Text style={styles.subtitle}>
            Create your DualWave account and start connecting with people
            around the world.
          </Text>
        </View>

        <View style={styles.form}>
          {authError && (
            <Text style={styles.authError}>
              {authError}
            </Text>
          )}
          <Input
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={handleNameChange}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            error={errors.password}
          />

          <Text style={styles.passwordHint}>
            Use at least 8 characters.
          </Text>

          <Input
            label="Confirm password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
          </Text>

          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  authError: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },

  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 24,
  },

  back: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 40,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
  },

  form: {
    width: '100%',
  },

  passwordHint: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 24,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },

  footerText: {
    color: COLORS.secondary,
    fontSize: 14,
  },

  link: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;