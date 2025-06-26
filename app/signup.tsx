import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Account, Client, ID } from 'react-native-appwrite';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // Make sure this is set correctly in .env.local

const account = new Account(client);

const Signup = () => {
    const router = useRouter();
    const { setUser } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            // Validate inputs manually
            if (!name || !email || !password) {
                alert('Please fill all fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Invalid email address');
                return;
            }

            const userId = ID.unique(); // ✅ always use this
            console.log('Generated userId:', userId);

            if (!email.includes('@') || !email.includes('.')) {
                alert('Please use a valid email');
                return;
            }

            await account.create(userId, email.trim(), password.trim(), name.trim());
            await account.createEmailPasswordSession(email.trim(), password.trim());

            const userData = await account.get();
            setUser(userData);
            router.replace('/'); // ✅ go to homepage
        } catch (err: any) {
            console.error('Signup error:', err);
            alert(`Signup failed: ${err.message}`);
        }
    };

    return (
        <View className="flex-1 bg-primary px-4 justify-center">
            <Text className="text-white text-2xl font-bold mb-6">Sign Up</Text>
            <TextInput
                placeholder="Name"
                className="bg-white rounded p-3 mb-4"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Email"
                className="bg-white rounded p-3 mb-4"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                className="bg-white rounded p-3 mb-6"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity className="bg-button py-3 rounded" onPress={handleSignup}>
                <Text className="text-center text-primary font-bold">Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
                <Text className="text-white text-center">
                    Already have an account?{'Click Here'}<Text className="text-secondary">Login</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Signup;

