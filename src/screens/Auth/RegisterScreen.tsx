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

const RegisterScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Registration API will be connected later.
    navigation.navigate('OTP');
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
          <Input
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.passwordHint}>
            Use at least 8 characters.
          </Text>

          <Button
            title="Create account"
            onPress={handleRegister}
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