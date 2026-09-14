import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    Pressable,
    View,
} from 'react-native';
import { AppScreenProps } from '../../types/navigation';

import { COLORS } from '../../constants/colors';
import {
    PublicUser,
    searchUsers,
} from '../../services/communication/userService';

type Props = AppScreenProps<'People'>;

const PeopleScreen = ({ navigation }: Props) => {
    const [search, setSearch] =
        useState('');

    const [users, setUsers] =
        useState<PublicUser[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const handleSearch = async (
        value: string,
    ) => {
        setSearch(value);

        const term = value.trim();

        if (!term) {
            setUsers([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await searchUsers(term);
            setUsers(results);
        } catch (searchError: any) {
            console.error(
                'User search error:',
                searchError,
            );

            setError(
                searchError?.message ||
                'Unable to search users.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderUser = ({
        item,
    }: {
        item: PublicUser;
    }) => {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.userCard,
                    pressed && styles.userCardPressed,
                ]}
                onPress={() =>
                    navigation.navigate('UserProfile', {
                        userId: item.id,
                    })
                }>

                {item.profilePhotoUrl ? (
                    <Image
                        source={{
                            uri: item.profilePhotoUrl,
                        }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {item.displayName
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.name}>
                        {item.displayName}
                    </Text>

                    {item.username && (
                        <Text style={styles.username}>
                            @{item.username}
                        </Text>
                    )}

                    {item.nativeLanguage && (
                        <Text style={styles.language}>
                            Language: {item.nativeLanguage}
                        </Text>
                    )}
                </View>

                <Text style={styles.arrow}>
                    ›
                </Text>

            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                value={search}
                onChangeText={handleSearch}
                placeholder="Search by username or name"
                placeholderTextColor={COLORS.secondary}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
            />

            {isLoading && (
                <ActivityIndicator
                    size="small"
                    color={COLORS.accent}
                    style={styles.loader}
                />
            )}

            {error && (
                <Text style={styles.error}>
                    {error}
                </Text>
            )}

            {!isLoading &&
                !error &&
                search.trim() &&
                users.length === 0 && (
                    <Text style={styles.empty}>
                        No users found.
                    </Text>
                )}

            <FlatList
                data={users}
                keyExtractor={item => item.id}
                renderItem={renderUser}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                    users.length === 0
                        ? styles.emptyList
                        : undefined
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },

    searchInput: {
        height: 52,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.primary,
    },

    loader: {
        marginTop: 16,
    },

    error: {
        color: '#D32F2F',
        marginTop: 16,
    },

    emptyList: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    empty: {
        color: COLORS.secondary,
        marginTop: 30,
        textAlign: 'center',
    },

    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 18,
        padding: 14,
        marginTop: 14,
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
    },

    avatarPlaceholder: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.accentLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 23,
        fontWeight: '700',
        color: COLORS.accent,
    },

    userCardPressed: {
        opacity: 0.7,
    },

    arrow: {
        fontSize: 28,
        color: COLORS.secondary,
        marginLeft: 8,
    },

    userInfo: {
        marginLeft: 14,
        flex: 1,
    },

    name: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.primary,
    },

    username: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 3,
    },

    language: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 5,
    },
});

export default PeopleScreen;