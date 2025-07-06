import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import SwipeableMovieItem from '@/components/SwipeableMovieItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your document structure based on your Node.js backend's SavedMovie model
type SavedMovie = {
    _id: string; // MongoDB's default ID
    user: string; // User ID
    title: string;
    poster_url?: string;
    movie_id: number; // TMDB movie ID
    createdAt: string; // From timestamps
    updatedAt: string; // From timestamps
};

const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Your backend URL

export default function Saved() {
    const { user } = useAuth();
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletedItem, setDeletedItem] = useState<SavedMovie | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    useEffect(() => {
        const fetchSaved = async () => {
            if (!user?._id) { // <--- CHANGE THIS LINE: from user?.id to user?._id
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Ensure this matches your backend's actual endpoint for getting saved movies
                // Based on our previous discussion, if server.js mounts at /api, and your
                // savedMovieRoutes.js has router.get('/saved', ...), then the path is /api/saved.
                // If you kept app.use('/api/savedMovie', savedMovieRoutes); in server.js
                // then the path is /api/savedMovie/saved. Confirm your server.js setting.
                const response = await fetch(`${BACKEND_URL}/savedMovie`, { // Adjusted for common /api/saved assuming server.js change
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });


                if (response.ok) {
                    const data: SavedMovie[] = await response.json();
                    setSavedMovies(data);
                } else {
                    const errorText = await response.text();
                    console.error('Error fetching saved movies:', response.status, errorText);
                    Alert.alert('Error', 'Failed to load saved movies. Please try again.');
                }
            } catch (err: any) {
                console.error('Network error fetching saved movies:', err.message || err);
                Alert.alert('Error', 'Network issue. Could not load saved movies.');
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, [user]); // Re-run when user changes

    const handleDelete = async (movie: SavedMovie) => {
        // Optimistic UI update
        setSavedMovies((prev) => prev.filter((m) => m._id !== movie._id));
        setDeletedItem(movie);
        setShowUndo(true);

        // Clear any existing undo timer
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        undoTimerRef.current = setTimeout(async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert('Error', 'Authentication token missing. Cannot delete movie.');
                    // Revert if token is missing and we can't confirm deletion
                    setSavedMovies((prev) => [movie, ...prev]);
                    setDeletedItem(null);
                    setShowUndo(false);
                    return;
                }

                // Ensure this matches your backend's actual endpoint for deleting a saved movie
                // If server.js mounts at /api and savedMovieRoutes.js has router.delete('/saved/:id', ...),
                // then the path is /api/saved/:id.
                // If you kept app.use('/api/savedMovie', savedMovieRoutes); in server.js
                // then the path is /api/savedMovie/saved/:id. Confirm your server.js setting.
                const response = await fetch(`${BACKEND_URL}/savedMovie/saved/${movie._id}`, { // Adjusted for common /api/saved/:id
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Backend error deleting movie:', response.status, errorText);
                    Alert.alert('Error', 'Failed to delete movie on server. Reverting changes.');
                    // Revert UI if backend deletion fails
                    setSavedMovies((prev) => [movie, ...prev]);
                }
            } catch (err: any) {
                console.error('Network error deleting movie:', err.message || err);
                Alert.alert('Error', 'Network issue. Failed to delete movie.');
                // Revert UI on network error
                setSavedMovies((prev) => [movie, ...prev]);
            } finally {
                setDeletedItem(null);
                setShowUndo(false);
            }
        }, 4000);
    };

    const undoDelete = () => {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        if (deletedItem) setSavedMovies((prev) => [deletedItem, ...prev]);
        setDeletedItem(null);
        setShowUndo(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <Text className="text-white">Please login to view your saved movies.</Text>
            </View>
        );
    }


    return (
        <View className="bg-primary flex-1 px-4 py-6">
            <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>

            {savedMovies.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400 text-lg">No saved movies yet!</Text>
                </View>
            ) : (
                <FlatList
                    data={savedMovies}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <SwipeableMovieItem item={item} onDelete={() => handleDelete(item)} />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}


            {showUndo && deletedItem && (
                <View className="absolute bottom-4 left-4 right-4 bg-dark-100 p-3 rounded-xl flex-row justify-between items-center z-10">
                    <Text className="text-white">Movie removed</Text>
                    <Text className="text-accent font-bold" onPress={undoDelete}>
                        UNDO
                    </Text>
                </View>
            )}
        </View>
    );
}