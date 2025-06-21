import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Client, Databases, Query, Models } from 'react-native-appwrite';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { ID } from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

type SavedMovie = Models.Document & {
    title: string;
    poster_url: string;
    movie_id: number;
    user_id: string;
    searchTerm: string;
};

const Saved = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);

    const fetchSaved = async () => {
        if (!user?.$id) return;

        try {
            const res: Models.DocumentList<SavedMovie> = await database.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('user_id', user.$id)]
            );
            setSavedMovies(res.documents);
        } catch (err: any) {
            console.error('Error fetching saved movies:', err.message || err);
        }
    };

    const handleDelete = async (docId: string) => {
        try {
            await database.deleteDocument(DATABASE_ID, COLLECTION_ID, docId);
            fetchSaved(); // refresh
        } catch (err: any) {
            console.error('Error deleting movie:', err.message || err);
            alert('❌ Failed to delete movie');
        }
    };

    useEffect(() => {
        fetchSaved();
    }, [user]);

    const renderItem = ({ item }: { item: SavedMovie }) => (
        <TouchableOpacity
            className="mr-4"
            onPress={() => router.push(`/movies/${item.movie_id}`)}
        >
            <Image
                source={{ uri: item.poster_url }}
                style={{
                    width: 120,
                    height: 180,
                    borderRadius: 10,
                    marginBottom: 10,
                }}
            />
            <Text className="text-white w-[120px]" numberOfLines={1}>
                {item.title}
            </Text>

            <TouchableOpacity
                onPress={() => router.push(`/movies/${item.movie_id}?autoplay=true`)}
                className="bg-accent mt-2 py-1 px-2 rounded"
            >
                <Text className="text-white text-xs text-center">🎬 Play Trailer</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    Alert.alert(
                        'Delete Movie',
                        'Are you sure you want to delete this movie?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.$id) },
                        ]
                    )
                }
                className="bg-red-500 mt-2 py-1 px-2 rounded"
            >
                <Text className="text-white text-xs text-center">🗑 Remove</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View className="bg-primary flex-1 px-4 py-6">
            <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>

            {savedMovies.length === 0 ? (
                <Text className="text-white text-sm">You haven't saved any movies yet.</Text>
            ) : (
                <FlatList
                    data={savedMovies}
                    renderItem={renderItem}
                    keyExtractor={(item) => `${item.movie_id}-${item.$id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default Saved;
