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

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }

    login({
      id: 'demo-user-001',
      name: 'DualWave User',
      email,
    });
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
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot password?
          </Text>

          <Button
            title="Log in"
            onPress={handleLogin}
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