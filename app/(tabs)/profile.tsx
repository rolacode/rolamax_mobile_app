import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Databases, Query, Client, Models, } from 'react-native-appwrite';

// ✅ Setup Appwrite Client and Database
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// ✅ Environment Vars
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const COLLECTION1_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION1_ID!;

// ✅ Optional type if needed
type SavedMovie = Models.Document & {
    title: string;
    poster_url: string;
    movie_id: number;
    user_id: string;
    searchTerm: string;
};

export default function ProfileScreen() {
    const { user, logout, updateProfileImage, profileImageUrl } = useAuth();
    const router = useRouter();
    const [savedCount, setSavedCount] = useState(0);
    const [historyCount, setHistoryCount] = useState(0);
    const [uploading, setUploading] = useState(false);

    // ✅ Fetch saved/history count
    useEffect(() => {
        if (!user?.$id) return;

        const fetchCounts = async () => {
            try {
                const saved = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
                    Query.equal('user_id', user.$id),
                ]);
                const history = await database.listDocuments(DATABASE_ID, COLLECTION1_ID, [
                    Query.equal('user_id', user.$id),
                ]);
                setSavedCount(saved.total);
                setHistoryCount(history.total);
            } catch (err) {
                console.error('Error loading counts', err);
            }
        };

        fetchCounts();
    }, [user]);

    // ✅ Image Picker logic
    const pickAndUploadImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            console.log(result);

            if (!result.canceled && result.assets?.length) {
                const uri = result.assets[0].uri;
                setUploading(true);
                await updateProfileImage(uri); // ✅ uses context's updateProfileImage
                Alert.alert('✅ Success', 'Profile image updated!');
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Failed to upload image');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="flex-1 bg-primary px-6 py-10 items-center">
            {uploading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : (
                <TouchableOpacity onPress={pickAndUploadImage}>
                    <Image
                        source={{
                            uri:
                                profileImageUrl ||
                                `https://ui-avatars.com/api/?name=${user?.name || 'User'}`,
                        }}
                        className="w-24 h-24 rounded-full mb-4"
                    />
                </TouchableOpacity>
            )}

            <Text className="text-white text-xl font-semibold mb-1">
                {user?.name || 'User'}
            </Text>
            <Text className="text-light-300 text-sm mb-6">{user?.email}</Text>

            <View className="w-full flex-row justify-around mb-6">
                <TouchableOpacity onPress={() => router.push('/saved')} className="items-center">
                    <Text className="text-white text-2xl font-bold">{savedCount}</Text>
                    <Text className="text-light-300">Saved</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/history')} className="items-center">
                    <Text className="text-white text-2xl font-bold">{historyCount}</Text>
                    <Text className="text-light-300">History</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={logout}
                className="bg-red-500 px-6 py-2 rounded-full mt-4"
            >
                <Text className="text-white text-base font-semibold">🚪 Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
