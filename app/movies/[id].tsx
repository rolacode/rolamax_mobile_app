import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';
import Video from 'react-native-video';

const sampleVideo = 'https://www.w3schools.com/html/mov_bbb.mp4'; // replace with a TMDB trailer if possible

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => {
    return (
        <View className="flex-col items-start justify-center mt-5">
            <Text className="text-light-200 font-normal text-sm">{label}</Text>
            <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
        </View>
    );
};

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                {/* ✅ Full-screen video trailer */}
                <Video
                    source={{ uri: sampleVideo }}
                    style={{ width: '100%', height: 300 }}
                    controls
                    resizeMode="cover"
                />

                <View className="flex-col items-start justify-center mt-5 px-5">
                    <Text className="text-xl font-bold text-white">{movie?.title}</Text>

                    <View className="flex-row items-center gap-x-2 mt-2">
                        <Text className="text-light-200 text-sm">{movie?.release_date?.split('-')[0]}</Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
                    </View>

                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">{Math.round(movie?.vote_average ?? 0)}/10</Text>
                        <Text className="text-light-200 text-sm">{movie?.vote_count} votes</Text>
                    </View>

                    <MovieInfo label="Overview" value={movie?.overview} />
                    <MovieInfo label="Genres" value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'} />

                    <View className="flex flex-row items-center justify-between w-1/2">
                        <MovieInfo label="Budget" value={movie?.budget ? `$${(movie.budget / 1_000_000).toFixed(1)} million` : 'N/A'} />
                        <MovieInfo label="Revenue" value={`$${Math.round(movie?.revenue as number) / 1_000_000} million`} />
                    </View>

                    <MovieInfo label="Production Companies" value={movie?.production_companies?.map((c) => c.name).join(' - ') || 'N/A'} />
                </View>
            </ScrollView>

            <TouchableOpacity className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex-row items-center justify-center z-50" onPress={router.back}>
                <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
                <Text className="text-white text-sm font-semibold">Back to Movies</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovieDetails;
