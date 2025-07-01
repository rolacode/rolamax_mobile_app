import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Client, Databases, Query } from 'react-native-appwrite';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { loginUser, getUser, logoutUser } from '@/services/appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION1_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION1_ID!;

const Login = () => {
    const router = useRouter();
    const { setUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Validation Error', 'Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);

            // 🔁 Clear previous session if any
            try {
                await logoutUser('current');
            } catch {
                console.log('No active session to delete');
            }

            // 🔐 Authenticate
            await loginUser(email, password);
            const userData = await getUser();
            setUser(userData);

            // ✅ Fetch user's click history
            try {
                const res = await database.listDocuments(
                    DATABASE_ID,
                    COLLECTION1_ID, // your collection ID
                    [Query.equal('user_id', userData.$id)]
                );
                console.log('🎬 Past clicks:', res.documents);
            } catch (e) {
                console.warn('⚠️ Error fetching click history:', e);
            }

            // ✅ Navigate to homepage after login
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Login Failed', err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-primary"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                <View className="px-6">
                    <Text className="text-white text-2xl font-bold mb-8 text-center">Welcome Back</Text>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#000"
                        className="bg-white rounded-lg px-4 py-3 mb-4"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#000"
                        className="bg-white rounded-lg px-4 py-3 mb-6"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity onPress={() => router.push('/forgot')} className="mt-2">
                        <Text className="text-gray-400 text-center underline mb-5">Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`bg-button py-3 rounded-lg ${loading ? 'opacity-50' : ''}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-center text-primary font-bold text-lg">
                            {loading ? 'Logging in...' : 'Login'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/signup')} className="mt-6">
                        <Text className="text-white text-center">
                            Don’t have an account?{' Click Here'}
                            <Text className="text-secondary font-semibold">Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;
