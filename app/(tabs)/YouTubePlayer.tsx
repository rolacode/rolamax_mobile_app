import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayerComponent from '@/components/YouTubePlayer';

export default function YouTubePlayerScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const router = useRouter();

    if (!videoId) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-10 left-4 z-10 bg-white/20 px-4 py-2 rounded"
            >
                <Text className="text-white text-sm">⬅ Back</Text>
            </TouchableOpacity>

            <YoutubePlayerComponent videoId={videoId} />
        </View>
    );
}
