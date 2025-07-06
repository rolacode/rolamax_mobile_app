import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.132.114:5000/api';

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

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user?._id) return;

            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const savedRes = await fetch(`${BACKEND_URL}/savedMovie/saved/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (savedRes.ok) {
                    const data = await savedRes.json();
                    setSavedCount(data.count);
                }

                const historyRes = await fetch(`${BACKEND_URL}/search/search-history/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (historyRes.ok) {
                    const data = await historyRes.json();
                    setHistoryCount(data.count);
                }
            } catch (err: any) {
                console.error('Error loading counts:', err.message || err);
            }
        };

        fetchCounts();
    }, [user]);

    useEffect(() => {
        if (user) {
            setNewName(user.name || '');
            setNewEmail(user.email || '');
        }
    }, [user]);

    const pickAndUploadImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please grant media library access to upload a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ This works
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });


            if (!result.canceled && result.assets?.length) {
                const uri = result.assets[0].uri;
                if (!uri) {
                    Alert.alert('No Image', 'Image URI is invalid or empty.');
                    return;
                }
                setUploading(true);
                await updateProfileImage(uri);
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Failed to pick or upload image');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!user?._id) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token missing.');
                setSaving(false);
                return;
            }

            const body: { name?: string; email?: string; currentPassword?: string } = {};
            let needsUpdate = false;

            if (newName.trim() !== user.name) {
                body.name = newName.trim();
                needsUpdate = true;
            }

            if (newEmail.trim() !== user.email) {
                if (!currentPassword.trim()) {
                    Alert.alert('Error', 'Current password is required to change email.');
                    setSaving(false);
                    return;
                }
                body.email = newEmail.trim();
                body.currentPassword = currentPassword.trim();
                needsUpdate = true;
            }

            if (!needsUpdate) {
                Alert.alert('Info', 'No changes to save.');
                setSaving(false);
                setShowForm(false);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                Alert.alert('✅ Profile updated', data.message || 'Profile updated successfully!');
                setCurrentPassword('');
                setShowForm(false);
            } else {
                Alert.alert('❌ Update failed', data.message || 'Something went wrong while updating.');
            }
        } catch (error: any) {
            console.error('Error updating profile info:', error);
            Alert.alert('❌ Update failed', 'Network error or an unexpected issue occurred.');
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
                                user?.image ||
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
                    <View className="gap-4">
                        <TextInput
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Edit Your Name"
                            className="bg-secondary text-white px-4 py-3 rounded-lg my-2"
                            placeholderTextColor="#aaa"
                        />
                        <TextInput
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder="Edit Your Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-secondary text-white px-4 py-3 rounded-lg my-2"
                            placeholderTextColor="#aaa"
                        />
                        {newEmail.trim() !== user?.email && (
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Current Password"
                                secureTextEntry
                                className="bg-secondary text-white px-4 py-3 rounded-lg my-2"
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
