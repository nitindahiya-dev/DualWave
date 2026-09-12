import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {COLORS} from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input = ({label, error, ...props}: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        style={[styles.input, error && styles.errorInput]}
        placeholderTextColor="#999999"
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  errorInput: {
    borderColor: COLORS.error,
  },

  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
  },
});

export default Input;