import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.132.114:5000/api';

const Signup = () => {
    const router = useRouter();
    const { setUser, setProfileImageUrl } = useAuth(); // ✅ use setProfileImageUrl

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant media library access to upload a profile picture.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImageUri(result.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Invalid email address.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('email', email.trim());
            formData.append('password', password.trim());

            if (profileImageUri) {
                formData.append('avatar', {
                    uri: profileImageUri,
                    name: `profile-${Date.now()}.jpg`,
                    type: 'image/jpeg',
                } as any);
            }

            const response = await fetch(`${BACKEND_URL}/user/register`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json', // Optional but good
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (data.token && data.user) {
                    await AsyncStorage.setItem('userToken', data.token);
                    await AsyncStorage.setItem('user', JSON.stringify(data.user));
                    setUser(data.user);
                    setProfileImageUrl(data.user.image || null);

                    Alert.alert('Success', data.message || 'Account created and logged in!');
                    router.replace('/');
                } else {
                    Alert.alert('Success', data.message || 'Account created. Please log in.');
                    router.replace('/login');
                }
            } else {
                Alert.alert('Signup Failed', data.message || 'Something went wrong. Please try again.');
            }
        } catch (err: any) {
            Alert.alert('Error', 'Network error or an unexpected issue occurred. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-primary px-4 justify-center">
            <Text className="text-white text-2xl font-bold mb-6">Sign Up</Text>

            <TouchableOpacity onPress={pickImage} className="mb-4 self-center">
                {profileImageUri ? (
                    <Image
                        source={{ uri: profileImageUri }}
                        className="w-24 h-24 rounded-full border-2 border-white"
                    />
                ) : (
                    <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center border-2 border-white">
                        <Text className="text-gray-600 text-center">Tap to add profile picture</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TextInput
                placeholder="Name"
                placeholderTextColor="#A9A9A9"
                className="bg-white rounded p-3 mb-4 text-black"
                value={name}
                onChangeText={setName}
                editable={!loading}
            />
            <TextInput
                placeholder="Email"
                placeholderTextColor="#A9A9A9"
                className="bg-white rounded p-3 mb-4 text-black"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                className="bg-white rounded p-3 mb-6 text-black"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
            />
            <TouchableOpacity
                className="bg-button py-3 rounded"
                onPress={handleSignup}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-center text-primary font-bold">Sign Up</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
                <Text className="text-white text-center">
                    Already have an account?{' '}
                    <Text className="text-secondary font-bold">Login</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Signup;
