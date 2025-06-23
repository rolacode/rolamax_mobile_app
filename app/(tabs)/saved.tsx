import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { Client, Databases, Query, Models } from 'react-native-appwrite';
import { useAuth } from '@/context/AuthContext';
import SwipeableMovieItem from '@/components/SwipeableMovieItem';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// ✅ Define your document structure
type SavedMovie = Models.Document & {
    title: string;
    poster_url: string;
    movie_id: number;
    user_id: string;
    searchTerm: string;
};

export default function Saved() {
    const { user } = useAuth();
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [deletedItem, setDeletedItem] = useState<SavedMovie | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    useEffect(() => {
        const fetchSaved = async () => {
            if (!user?.$id) return;

            try {
                const res = await database.listDocuments<SavedMovie>(
                    DATABASE_ID,
                    COLLECTION_ID,
                    [Query.equal('user_id', user.$id)]
                );


                setSavedMovies(res.documents);
            } catch (err: any) {
                console.error('Error fetching saved movies:', err.message || err);
            }
        };
        fetchSaved();
    }, [user]);

    const handleDelete = async (movie: SavedMovie) => {
        setSavedMovies((prev) => prev.filter((m) => m.$id !== movie.$id));
        setDeletedItem(movie);
        setShowUndo(true);

        undoTimerRef.current = setTimeout(async () => {
            try {
                await database.deleteDocument(DATABASE_ID, COLLECTION_ID, movie.$id);
                setDeletedItem(null);
                setShowUndo(false);
            } catch (err: any) {
                console.error('Error deleting movie:', err.message || err);
            }
        }, 4000);
    };

    const undoDelete = () => {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        if (deletedItem) setSavedMovies((prev) => [deletedItem, ...prev]);
        setDeletedItem(null);
        setShowUndo(false);
    };

    return (
        <View className="bg-primary flex-1 px-4 py-6">
            <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>

            {savedMovies.map((item) => (
                <SwipeableMovieItem key={item.$id} item={item} onDelete={handleDelete} />
            ))}

            {showUndo && deletedItem && (
                <View className="absolute top-1 left-4 right-4 bg-dark-100 p-3 rounded-xl flex-row justify-between items-center">
                    <Text className="text-white">Movie removed</Text>
                    <Text className="text-accent font-bold" onPress={undoDelete}>
                        UNDO
                    </Text>
                </View>
            )}
        </View>
    );
}
