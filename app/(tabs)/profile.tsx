import { View, Text, Image, Button } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Models } from 'react-native-appwrite';

const Profile = () => {
    const { user, logout } = useAuth();

    useEffect(() => {
        if (user === null) {
            // 👇 Redirect to login when not logged in
            router.replace('/login');
        }
    }, [user]);

    if (user === undefined) {
        return <Text style={{ color: 'white', padding: 20 }}>Checking session...</Text>;
    }

    if (!user) {
        return null; // Let redirect handle it
    }

    const appwriteUser = user as Models.User<Models.Preferences>;

    return (
        <View className="bg-primary flex-1 items-center justify-center px-6">
            <Image
                source={{ uri: 'https://ui-avatars.com/api/?name=' + appwriteUser.name }}
                className="w-24 h-24 rounded-full mb-4"
            />
            <Text className="text-white text-lg font-bold">{appwriteUser.name}</Text>
            <Text className="text-gray-300 mb-4">{appwriteUser.email}</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
};

export default Profile;
