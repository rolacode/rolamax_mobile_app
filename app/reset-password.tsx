import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Define your backend API base URL
const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Or your deployed backend URL

export default function ResetPasswordScreen() {
    const router = useRouter();
    // Assuming your token is passed as a URL parameter like /resetPassword?token=YOUR_TOKEN
    // If it's part of the path like /resetPassword/reset-password/YOUR_TOKEN,
    // you might need to adjust how expo-router captures it or use a different routing strategy.
    // For now, let's assume it's a query parameter for simplicity given the previous context.
    const { token } = useLocalSearchParams<{ token: string }>(); // This will get the 'token' query param

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (!newPassword) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }

        if (!token) {
            Alert.alert('Error', 'Invalid reset link. Token not found.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${BACKEND_URL}/resetPassword/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: newPassword, // Send the new password to your backend
                }),
            });

            const data = await response.json(); // Parse the JSON response from your backend

            if (response.ok) { // Check if the response status is 2xx (success)
                Alert.alert('Success', data.message || 'Your password has been updated');
                router.replace('/login'); // Navigate to login after successful reset
            } else {
                // Handle errors returned from your backend
                Alert.alert('Error', data.message || 'Password reset failed');
            }
        } catch (err: any) {
            // Handle network errors or other unexpected issues
            Alert.alert('Error', 'Network error or an unexpected issue occurred. Please try again.');
            console.error('Password reset error:', err);
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
                placeholderTextColor="#A9A9A9" // Example for better visibility
                secureTextEntry
                className="bg-white rounded p-3 mb-4 text-black" // Added text-black for visibility
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#A9A9A9"
                secureTextEntry
                className="bg-white rounded p-3 mb-6 text-black" // Added text-black for visibility
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