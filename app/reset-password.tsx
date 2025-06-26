import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { account } from '@/services/appwrite'; // adjust path if needed

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { userId, secret } = useLocalSearchParams<{ userId: string; secret: string }>();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }

        if (!userId || !secret) {
            Alert.alert('Invalid reset link');
            return;
        }

        try {
            setLoading(true);
            await account.updateRecovery(userId, secret, newPassword,);
            Alert.alert('Success', 'Your password has been updated');
            router.replace('/login');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-primary px-4 justify-center"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text className="text-white text-2xl font-bold mb-6">Set New Password</Text>

            <TextInput
                placeholder="New password"
                secureTextEntry
                className="bg-white rounded p-3 mb-4"
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                placeholder="Confirm new password"
                secureTextEntry
                className="bg-white rounded p-3 mb-6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                className="bg-button py-3 rounded"
                onPress={handleResetPassword}
                disabled={loading}
            >
                <Text className="text-center text-primary font-bold">
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}
