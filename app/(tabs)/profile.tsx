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
import { TextInput } from 'react-native';
import { Databases, Query, Client, Account } from 'react-native-appwrite';

// ✅ Setup Appwrite Client and Database
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client);

// ✅ Environment Vars
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const COLLECTION1_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION1_ID!;

// ✅ Optional type if needed
// type SavedMovie = Models.Document & {
//     title: string;
//     poster_url: string;
//     movie_id: number;
//     user_id: string;
//     searchTerm: string;
// };

export default function ProfileScreen() {
    const { user, setUser, logout, updateProfileImage, profileImageUrl } = useAuth();
    const router = useRouter();
    const [savedCount, setSavedCount] = useState(0);
    const [historyCount, setHistoryCount] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

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

            if (!result.canceled && result.assets?.length) {
                const uri = result.assets[0].uri;
                setUploading(true);
                await updateProfileImage(uri); // ✅ uploads to Cloudinary
                Alert.alert('✅ Success', 'Profile image updated!');
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Failed to upload image');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (newName && newName !== user?.name) {
                await account.updateName(newName);
            }
            if (newEmail && newEmail !== user?.email && currentPassword) {
                await account.updateEmail(newEmail, currentPassword);
            }
            const updatedUser = await account.get();
            setUser(updatedUser);
            Alert.alert('✅ Profile updated');
        } catch (error) {
            console.error('Error updating profile info:', error);
            // @ts-ignore
            Alert.alert('❌ Update failed', error.message || 'Something went wrong');
        } finally {
            setSaving(false);
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

            <View className="w-full gap-4 mt-6">
                <TouchableOpacity
                    onPress={() => setShowForm((prev) => !prev)}
                    className="bg-dark-200 py-3 px-4 rounded-lg mb-4"
                >
                    <Text className="text-white font-semibold text-center">
                        {showForm ? 'Hide Edit Profile ▲' : 'Edit Profile ▼'}
                    </Text>
                </TouchableOpacity>

                {showForm && (
                    <View className="gat-4">
                        <TextInput
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Edit Your Name"
                            className="bg-secondary text-white px-4 py-3 rounded-lg"
                            placeholderTextColor="#aaa"
                        />

                        <TextInput
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder="Edit Your Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-secondary text-white px-4 py-3 rounded-lg"
                            placeholderTextColor="#aaa"
                        />

                        {newEmail !== user?.email && (
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Current Password"
                                secureTextEntry
                                className="bg-secondary text-white px-4 py-3 rounded-lg"
                                placeholderTextColor="#aaa"
                            />
                        )}

                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-accent py-3 rounded-lg mt-2"
                            disabled={saving}
                        >
                            <Text className="text-white text-center font-semibold">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
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
