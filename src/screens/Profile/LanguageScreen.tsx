import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '../../components/common/Button';
import {COLORS} from '../../constants/colors';

import {
  getActiveLanguages,
} from '../../services/communication/languageService';
import {
  Language,
} from '../../types/communication';

interface Props {
  navigation: any;
  route: any;
}

const LanguageScreen = ({
  navigation,
  route,
}: Props) => {
  const [languages, setLanguages] =
    useState<Language[]>([]);

  const [selected, setSelected] =
    useState<Language | null>(null);

  const [search, setSearch] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const {
    profilePhotoUrl,
    displayName,
    username,
  } = route.params || {};

  const loadLanguages =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const activeLanguages =
          await getActiveLanguages();

        setLanguages(activeLanguages);
      } catch (languageError: any) {
        console.error(
          'Language loading error:',
          languageError,
        );

        setError(
          languageError?.message ||
            'Unable to load languages.',
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const filteredLanguages =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return languages;
      }

      return languages.filter(language => {
        return (
          language.name
            .toLowerCase()
            .includes(term) ||
          language.nativeName
            .toLowerCase()
            .includes(term) ||
          language.code
            .toLowerCase()
            .includes(term)
        );
      });
    }, [languages, search]);

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    navigation.navigate('Country', {
      profilePhotoUrl,
      displayName,
      username,

      /*
       * Pass the canonical language code.
       * Example:
       * hi → Hindi
       * zh → Chinese
       * es → Spanish
       */
      nativeLanguage: selected.code,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />

        <Text style={styles.loadingText}>
          Loading languages...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadLanguages}>
          <Text style={styles.retryText}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.step}>
        STEP 2 OF 4
      </Text>

      <Text style={styles.title}>
        What's your native language?
      </Text>

      <Text style={styles.subtitle}>
        We'll use this to personalize your
        communication experience.
      </Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search languages..."
        placeholderTextColor={
          COLORS.secondary
        }
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <Text style={styles.resultCount}>
        {filteredLanguages.length}{' '}
        {filteredLanguages.length === 1
          ? 'language'
          : 'languages'}
      </Text>

      <FlatList
        data={filteredLanguages}
        keyExtractor={item => item.code}
        style={styles.list}
        contentContainerStyle={
          styles.listContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isSelected =
            selected?.code === item.code;

          return (
            <TouchableOpacity
              style={[
                styles.language,
                isSelected &&
                  styles.selectedLanguage,
              ]}
              onPress={() =>
                setSelected(item)
              }
              activeOpacity={0.8}>

              <View
                style={
                  styles.languageInfo
                }>
                <Text
                  style={[
                    styles.languageText,
                    isSelected &&
                      styles.selectedText,
                  ]}>
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.nativeName
                  }>
                  {item.nativeName}
                </Text>
              </View>

              {isSelected && (
                <Text style={styles.check}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }>
            <Text
              style={
                styles.emptyTitle
              }>
              No languages found
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Try another language name,
              native name, or language code.
            </Text>
          </View>
        }
      />

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
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.secondary,
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
    marginBottom: 20,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  resultCount: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 10,
    marginBottom: 8,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 10,
  },

  language: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedLanguage: {
    borderColor: COLORS.accent,
    backgroundColor:
      COLORS.accentLight,
  },

  languageInfo: {
    flex: 1,
  },

  languageText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },

  nativeName: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 3,
  },

  selectedText: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  check: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 6,
  },

  bottom: {
    paddingTop: 12,
    paddingBottom: 20,
  },

  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor:
      COLORS.accent,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default LanguageScreen;