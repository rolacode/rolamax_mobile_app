import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Client, Databases, Query, Models } from 'react-native-appwrite';
import { useAuth } from '@/context/AuthContext';

type SavedMovie = Models.Document & {
    title: string;
    poster_url: string;
    movie_id: number;
    user_id: string;
};

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

const Saved = () => {
    const { user } = useAuth();
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

    useEffect(() => {
        fetchSaved();
    }, [user]);

    const renderItem = ({ item }: { item: SavedMovie }) => (
        <TouchableOpacity>
            <Image
                source={{ uri: item.poster_url }}
                style={{
                    width: 120,
                    height: 180,
                    borderRadius: 10,
                    marginBottom: 10,
                }}
            />
            <Text style={{ color: 'white' }}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="bg-primary flex-1 px-4 py-6">
            <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>
            <FlatList
                data={savedMovies}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.$id || `movie-${item.movie_id}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

export default Saved;
