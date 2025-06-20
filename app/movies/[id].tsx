import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { database, storage } from '@/services/appwrite';
import { icons } from '@/constants/icons';
import VideoScreen from "@/app/movies/VideoPlayer";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
    </View>
);

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const [movie, setMovie] = useState<any>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const doc = await database.getDocument(DATABASE_ID, COLLECTION_ID, id as string);
                setMovie(doc);

                // If there's a videoId, fetch stream URL from Appwrite
                if (doc.videoId) {
                    const filePreview = storage.getFileView('movies', doc.videoId);
                    setVideoUri(filePreview.href);
                } else {
                    setVideoUri(null); // No video
                }
            } catch (error) {
                console.error('Failed to fetch movie:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingTop: 200 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : (
                    <>
                        {videoUri ? (
                            <View><VideoScreen videoUri={videoUri} /></View>
                        ) : (
                            <Image
                                source={{ uri: movie?.poster_url }}
                                style={{ width: '100%', height: 300, borderRadius: 12 }}
                                resizeMode="cover"
                            />
                        )}

                        <View className="flex-col items-start justify-center mt-5 px-5">
                            <Text className="text-xl font-bold text-white">{movie?.title}</Text>
                            <MovieInfo label="Overview" value={movie?.description} />
                            <MovieInfo label="Genre" value={movie?.genre} />
                        </View>
                    </>
                )}
            </ScrollView>

            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
                <Text className="text-white text-sm font-semibold">Back to Movies</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovieDetails;
