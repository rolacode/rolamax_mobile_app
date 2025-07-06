import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // Added ActivityIndicator for loading feedback
import { useRouter } from 'expo-router';

// Define your backend API base URL
const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Or your deployed backend URL

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator

    const handleReset = async () => {
        if (!email || !email.includes('@')) { // Basic email validation
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true); // Start loading

        try {
            const response = await fetch(`${BACKEND_URL}/resetPassword/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // Send the email in the request body
            });

            const data = await response.json(); // Parse the JSON response from your backend

            if (response.ok) { // Check if the response status is 2xx (success)
                Alert.alert('Success', data.message || 'Password reset link sent to your email.');
                router.push('/login'); // Navigate to login after successful request
            } else {
                // Handle errors returned from your backend
                Alert.alert('Reset Failed', data.message || 'Something went wrong. Please try again.');
            }
        } catch (err: any) {
            // Handle network errors or other unexpected issues
            Alert.alert('Error', 'Network error or an unexpected issue occurred. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    return (
        <View className="flex-1 bg-primary px-4 justify-center">
            <Text className="text-white text-2xl font-bold mb-6">Reset Password</Text>
            <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#A9A9A9" // Changed to a visible color against white background
                className="bg-white rounded p-3 mb-6 text-black" // Added text-black for visibility
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading} // Disable input while loading
            />
            <TouchableOpacity
                className="bg-button py-3 rounded"
                onPress={handleReset}
                disabled={loading} // Disable button while loading
            >
                {loading ? (
                    <ActivityIndicator color="#fff" /> // Show loading spinner
                ) : (
                    <Text className="text-center text-primary font-bold">Send Reset Link</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default ForgotPassword;