import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Account, Client } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const sendPasswordResetEmail = async (email: string) => {
        const resetUrl = 'rolamax://reset-password'; // 👈 Deep link for your app
        await account.createRecovery(email, resetUrl);
    };

    const handleReset = async () => {
        if (!email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(email);
            Alert.alert('Success', 'Password reset link sent to your email.');
            router.push('/login');
        } catch (err: any) {
            Alert.alert('Reset Failed', err.message || 'Something went wrong');
        }
    };

    return (
        <View className="flex-1 bg-primary px-4 justify-center">
            <Text className="text-white text-2xl font-bold mb-6">Reset Password</Text>
            <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#000"
                className="bg-white rounded p-3 mb-6"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TouchableOpacity className="bg-button py-3 rounded" onPress={handleReset}>
                <Text className="text-center text-primary font-bold">Send Reset Link</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ForgotPassword;
