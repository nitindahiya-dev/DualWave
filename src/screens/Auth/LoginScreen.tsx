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
import {useAuthStore} from '../../store/authStore';

interface Props {
  navigation: any;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});

  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const authError = useAuthStore(state => state.authError);
  const clearAuthError = useAuthStore(
    state => state.clearAuthError,
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedEmail = email.trim();

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

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    await login(email, password);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errors.email) {
      setErrors(previous => ({
        ...previous,
        email: undefined,
      }));
    }

    if (authError) {
      clearAuthError();
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password) {
      setErrors(previous => ({
        ...previous,
        password: undefined,
      }));
    }

    if (authError) {
      clearAuthError();
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
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Log in to continue communicating without language barriers.
          </Text>
        </View>

        <View style={styles.form}>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            error={errors.password}
          />

          {authError && (
            <Text style={styles.authError}>
              {authError}
            </Text>
          )}

          <Text
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot password?
          </Text>

          <Button
            title="Log in"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
          </Text>

          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Register')}>
            Create account
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

  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 24,
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

  authError: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: -4,
    marginBottom: 20,
  },

  forgot: {
    alignSelf: 'flex-end',
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: -4,
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

export default LoginScreen;