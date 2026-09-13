import React, {useState} from 'react';
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
  route: any;
}

const languages = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Chinese',
  'Portuguese',
  'Arabic',
];

const LanguageScreen = ({
  navigation,
  route,
}: Props) => {
  const [selected, setSelected] = useState('');

  const {
    profilePhotoUrl,
    displayName,
    username,
  } = route.params || {};

  const selectLanguage = (language: string) => {
    setSelected(language);
  };

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    navigation.navigate('Country', {
      profilePhotoUrl,
      displayName,
      username,
      nativeLanguage: selected,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>STEP 2 OF 4</Text>

      <Text style={styles.title}>
        What's your native language?
      </Text>

      <Text style={styles.subtitle}>
        We'll use this to personalize your communication
        experience.
      </Text>

      <View style={styles.list}>
        {languages.map(language => {
          const isSelected =
            selected === language;

          return (
            <TouchableOpacity
              key={language}
              style={[
                styles.language,
                isSelected &&
                  styles.selectedLanguage,
              ]}
              onPress={() =>
                selectLanguage(language)
              }
              activeOpacity={0.8}>

              <Text
                style={[
                  styles.languageText,
                  isSelected &&
                    styles.selectedText,
                ]}>
                {language}
              </Text>

              {isSelected && (
                <Text style={styles.check}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 28,
  },

  list: {
    flex: 1,
  },

  language: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedLanguage: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },

  languageText: {
    fontSize: 15,
    color: COLORS.primary,
  },

  selectedText: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  check: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },

  bottom: {
    paddingTop: 16,
    paddingBottom: 20,
  },
});

export default LanguageScreen;