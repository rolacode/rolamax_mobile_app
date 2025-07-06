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
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const API_BASE_URL = 'http://192.168.132.114:5000/api';

const Login = () => {
    const router = useRouter();
    const { setUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Validation Error', 'Please enter both email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Validation Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', data.message || 'Login successful!');

                // *** IMPORTANT FIX HERE ***
                if (data.token && data.user) {
                    await AsyncStorage.setItem('userToken', data.token); // Store the token
                    setUser(data.user); // Update global auth context
                    router.replace('/'); // Go to homepage
                } else {
                    Alert.alert('Login Error', 'Backend did not provide user data or token. Please try again.');
                }

            } else {
                Alert.alert('Login Failed', data.message || 'Invalid email or password.');
            }
        } catch (err: any) {
            Alert.alert('Error', 'Network error or an unexpected issue occurred. Please try again.');
            console.error('Login error:', err);
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
                        placeholderTextColor="#A9A9A9"
                        className="bg-white rounded-lg px-4 py-3 mb-4 text-black"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#A9A9A9"
                        className="bg-white rounded-lg px-4 py-3 mb-6 text-black"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />

                    <TouchableOpacity onPress={() => router.push('/forgot')} className="mt-2">
                        <Text className="text-gray-400 text-center underline mb-5">Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`bg-button py-3 rounded-lg ${loading ? 'opacity-50' : ''}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-center text-primary font-bold text-lg">Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/signup')} className="mt-6">
                        <Text className="text-white text-center">
                            Don’t have an account?{' '}
                            <Text className="text-secondary font-semibold">Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;