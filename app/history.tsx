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
import { useAuth } from '@/context/AuthContext';
import { Client, Databases, ID, Models, Query } from 'react-native-appwrite';
import * as Linking from 'expo-linking';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION1_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION1_ID!;

type ClickDoc = Models.Document & {
    title: string;
    user_id: string;
    movie_id: number;
    timestamp: string;
    poster_url?: string;
};

type GroupedSection = {
    title: string;
    data: ClickDoc[];
};

function groupClicks(clicks: ClickDoc[]): GroupedSection[] {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const grouped = {
        Today: [] as ClickDoc[],
        Yesterday: [] as ClickDoc[],
        Earlier: [] as ClickDoc[],
    };

    for (const click of clicks) {
        const ts = new Date(click.timestamp);
        if (
            ts.toDateString() === today.toDateString()
        ) {
            grouped.Today.push(click);
        } else if (
            ts.toDateString() === yesterday.toDateString()
        ) {
            grouped.Yesterday.push(click);
        } else {
            grouped.Earlier.push(click);
        }
    }

    return Object.entries(grouped)
        .filter(([_, data]) => data.length > 0)
        .map(([title, data]) => ({ title, data }));
}

const WatchHistory = () => {
    const { user } = useAuth();
    const [clicks, setClicks] = useState<ClickDoc[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClicks = async () => {
        if (!user?.$id) return;
        try {
            const res = await database.listDocuments<ClickDoc>(
                DATABASE_ID,
                COLLECTION1_ID,
                [
                    Query.equal('user_id', user.$id),
                    Query.orderDesc('timestamp'),
                ]
            );
            setClicks(res.documents);

        } catch (err) {
            console.error('Error loading watch history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClicks();
    }, [user]);

    const deleteClick = async (id: string) => {
        try {
            await database.deleteDocument(DATABASE_ID, COLLECTION1_ID, id);
            setClicks(prev => prev.filter(c => c.$id !== id));
        } catch (e) {
            Alert.alert('Error', 'Failed to delete item');
        }
    };

    const clearAllClicks = async () => {
        if (!user?.$id) return;

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
                        const res = await database.listDocuments<ClickDoc>(
                            DATABASE_ID,
                            COLLECTION1_ID,
                            [Query.equal('user_id', user.$id)]
                        );

                        const deletions = res.documents.map(doc =>
                            database.deleteDocument(DATABASE_ID, COLLECTION1_ID, doc.$id)
                        );

                        await Promise.all(deletions);
                        setClicks([]); // update state
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete all items');
                    }
                },
            },
        ]);
    };


    const openYouTubeSearch = (title: string) => {
        const query = encodeURIComponent(`${title} full movie`);
        const url = `https://www.youtube.com/results?search_query=${query}`;
        Linking.openURL(url);
    };

    const renderItem = ({ item }: { item: ClickDoc }) => (
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

            <TouchableOpacity onPress={() => deleteClick(item.$id)}>
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
                <ActivityIndicator color="#fff" size="large" />
            ) : (
                <SectionList
                    sections={groupClicks(clicks)}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text className="text-light-100 font-bold text-lg mx-4 mt-4 mb-2">{title}</Text>
                    )}
                    ListEmptyComponent={<Text className="text-white text-center mt-10">No watch history yet.</Text>}
                />
            )}
        </View>
    );
};

export default WatchHistory;
