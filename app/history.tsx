import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext'; // Assumed to provide user (with _id) and token
import * as Linking from 'expo-linking';

// IMPORT YOUR NEW BACKEND SERVICE FUNCTIONS
import {
    getWatchHistory,
    deleteWatchHistoryItem,
    clearAllWatchHistory,
} from '@/services/searchHistoryService'; // Path to the new service file

// Define the type for history items from your MongoDB backend
type HistoryDoc = {
    _id: string; // MongoDB's default ID
    title: string;
    user: string; // User's MongoDB _id
    movie_id: number;
    timestamp: string; // ISO string date
    poster_url?: string;
    // Add other fields from your SearchLog model
};

type GroupedSection = {
    title: string;
    data: HistoryDoc[];
};

function groupClicks(clicks: HistoryDoc[]): GroupedSection[] {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const grouped = {
        Today: [] as HistoryDoc[],
        Yesterday: [] as HistoryDoc[],
        Earlier: [] as HistoryDoc[],
    };

    for (const click of clicks) {
        const ts = new Date(click.timestamp);
        if (ts.toDateString() === today.toDateString()) {
            grouped.Today.push(click);
        } else if (ts.toDateString() === yesterday.toDateString()) {
            grouped.Yesterday.push(click);
        } else {
            grouped.Earlier.push(click);
        }
    }

    return Object.entries(grouped)
        .filter(([_, data]) => data.length > 0)
        .map(([title, data]) => ({ title, data: data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) })); // Sort within groups by newest
}

const WatchHistory = () => {
    const { user, token } = useAuth(); // Assuming useAuth provides user (with _id) and token
    const [clicks, setClicks] = useState<HistoryDoc[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClicks = async () => {
        // Ensure user and token are available
        if (!user?._id || !token) {
            setLoading(false);
            setClicks([]); // Clear history if not logged in
            return;
        }
        try {
            const historyData = await getWatchHistory(token);
            setClicks(historyData);
        } catch (err) {
            console.error('Error loading watch history:', err);
            Alert.alert('Error', 'Failed to load watch history.');
            setClicks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClicks();
    }, [user, token]); // Add token to dependency array

    const deleteClick = async (id: string) => {
        if (!token) {
            Alert.alert('Error', 'Not authenticated.');
            return;
        }
        try {
            await deleteWatchHistoryItem(id, token); // Use MongoDB _id for deletion
            setClicks(prev => prev.filter(c => c._id !== id)); // Filter by MongoDB _id
        } catch (e) {
            console.error('Error deleting item:', e);
            Alert.alert('Error', 'Failed to delete item');
        }
    };

    const clearAllClicks = async () => {
        if (!user?._id || !token) {
            Alert.alert('Error', 'Not authenticated.');
            return;
        }

        Alert.alert('Confirm', 'Are you sure you want to delete all watch history?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete All',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await clearAllWatchHistory(token);
                        setClicks([]); // update state
                        Alert.alert('Success', 'All watch history cleared!');
                    } catch (e) {
                        console.error('Error clearing all items:', e);
                        Alert.alert('Error', 'Failed to clear all items');
                    }
                },
            },
        ]);
    };

    // Fix: Corrected template literal syntax
    const openYouTubeSearch = (title: string) => {
        const query = encodeURIComponent(`${title} full movie`);
        const url = `http://googleusercontent.com/youtube.com/${query}`; // <--- FIXED SYNTAX
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    const renderItem = ({ item }: { item: HistoryDoc }) => (
        <View className="flex-row items-center gap-3 p-3 bg-dark-100 rounded-lg mb-2 mx-4">
            <TouchableOpacity onPress={() => openYouTubeSearch(item.title)} className="flex-1">
                <View className="flex-row gap-3">
                    {item.poster_url && (
                        <Image source={{ uri: item.poster_url }} className="w-12 h-16 rounded" resizeMode="cover" />
                    )}
                    <View className="flex-1">
                        <Text className="text-white font-semibold">{item.title}</Text>
                        <Text className="text-light-200 text-xs">
                            Watched: {new Date(item.timestamp).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteClick(item._id)}> {/* Use item._id */}
                <Text className="text-red-400 font-bold">Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-primary pt-12">
            <Text className="text-white text-2xl font-bold text-center mb-4">📜 Watch History</Text>
            {clicks.length > 0 && (
                <TouchableOpacity onPress={clearAllClicks} className="bg-red-500 mx-4 py-2 rounded-lg mb-4">
                    <Text className="text-white text-center font-semibold">Clear All History</Text>
                </TouchableOpacity>
            )}

            {loading ? (
                <ActivityIndicator color="#fff" size="large" className="mt-10" />
            ) : (clicks.length === 0 ? (
                <Text className="text-white text-center mt-10">No watch history yet.</Text>
            ) : (
                <SectionList
                    sections={groupClicks(clicks)}
                    keyExtractor={(item) => item._id} // Use MongoDB _id
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text className="text-light-100 font-bold text-lg mx-4 mt-4 mb-2">{title}</Text>
                    )}
                    ListEmptyComponent={<Text className="text-white text-center mt-10">No watch history yet.</Text>}
                />
            ))}
        </View>
    );
};

export default WatchHistory;