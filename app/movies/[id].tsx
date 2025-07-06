import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import YoutubePlayerComponent from '@/components/YouTubePlayer';
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';

import {
    saveMovie,
    deleteSavedMovie,
    getSavedMovies,
} from '@/services/saveMovie';

import { logSearchHistory } from '@/services/searchHistoryService';

import { Heart, HeartOff } from 'lucide-react-native';
import { scrapeBestYouTubeId } from '@/services/scrapeYouTubeId';

// UPDATED: Define type for movie details to allow poster_path, runtime, and overview to be null
interface MovieDetailsData {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    runtime: number | null;
    vote_average: number;
    vote_count: number;
    overview: string | null; // <--- CHANGED TO string | null
    genres: { id: number; name: string }[];
    budget: number;
    revenue: number;
    production_companies: { id: number; name: string }[];
}

const MovieDetails = () => {
    const { id, autoplay } = useLocalSearchParams<{ id: string; autoplay?: string }>();
    const scrollViewRef = useRef<ScrollView>(null);
    const trailerRef = useRef<View>(null);
    const { user, token } = useAuth();
    const { data: movie, loading } = useFetch<MovieDetailsData>(() => fetchMovieDetails(id as string));
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingScrape, setLoadingScrape] = useState(false);

    useEffect(() => {
        const fetchSavedStatus = async () => {
            if (!user?._id || !token || !movie) {
                setIsSaved(false);
                setSavedDocId(null);
                return;
            }

            try {
                const savedMovies = await getSavedMovies(token);
                const foundMovie = savedMovies.find((sm: any) => sm.movie_id === movie.id);
                if (foundMovie) {
                    setIsSaved(true);
                    setSavedDocId(foundMovie._id);
                } else {
                    setIsSaved(false);
                    setSavedDocId(null);
                }
            } catch (err) {
                console.error('Error checking saved status:', err);
                Alert.alert('Error', 'Failed to load saved status.');
            }
        };
        fetchSavedStatus();
    }, [movie, user, token]);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
                );
                const data = await res.json();
                const video = data.results.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
                if (video) {
                    setTrailerKey(video.key);
                    if (autoplay === 'true') {
                        setTimeout(() => {
                            if (trailerRef.current && scrollViewRef.current?.getInnerViewNode) {
                                trailerRef.current.measureLayout(
                                    scrollViewRef.current.getInnerViewNode(),
                                    (_x: number, y: number) => {
                                        scrollViewRef.current?.scrollTo({ y, animated: true });
                                    },
                                    () => {
                                        console.warn('Scroll error: measureLayout failed');
                                    }
                                );
                            }
                        }, 500);
                    }
                }
            } catch (err) {
                console.error('❌ Error fetching trailer:', err);
            }
        };
        fetchVideo();
    }, [id, autoplay]);

    const handleToggleSave = async () => {
        if (!movie || !user?._id || !token) {
            Alert.alert('Login Required', 'Please log in to save movies.');
            return;
        }

        try {
            if (isSaved && savedDocId) {
                await deleteSavedMovie(savedDocId, token);
                setIsSaved(false);
                setSavedDocId(null);
                Alert.alert('Removed', `"${movie.title}" removed from your list.`);
            } else {
                const savedDoc = await saveMovie(movie, token);
                setIsSaved(true);
                setSavedDocId(savedDoc._id);
                Alert.alert('Saved', `"${movie.title}" added to your list!`);
            }
        } catch (err: any) {
            console.error('Toggle save error:', err);
            Alert.alert('Error', err.message || 'Failed to save/remove movie.');
        }
    };

    const handleWatchMovie = async () => {
        if (!movie?.title || !user?._id || !token) {
            Alert.alert('Login Required', 'Please log in to watch full movies.');
            return;
        }

        try {
            setLoadingScrape(true);

            const year = movie.release_date?.split('-')[0] || '';
            const searchQuery = `${movie.title} ${year} full movie`;

            const bestVideoId = await scrapeBestYouTubeId(searchQuery, token);

            if (bestVideoId) {
                await logSearchHistory(
                    {
                        movie_id: movie.id,
                        title: movie.title,
                        poster_url: movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                            : undefined,
                    },
                    token
                );

                router.push({
                    pathname: '/YouTubePlayer',
                    params: { videoId: bestVideoId },
                });
            } else {
                Alert.alert('Not Found', 'No full movie found on YouTube for this title.');
            }
        } catch (e: any) {
            console.error('❌ Failed to scrape or route:', e);
            Alert.alert('Error', e.message || 'Failed to find or play movie.');
        } finally {
            setLoadingScrape(false);
        }
    };


    return (
        <View className="bg-primary flex-1">
            <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 80, paddingTop: 200 }}>
                <View className="px-5">
                    <TouchableOpacity
                        onPress={handleToggleSave}
                        className="mb-3 self-end bg-dark-100 p-2 rounded-full"
                        disabled={!user || !movie || !token}
                    >
                        {isSaved ? (
                            <Heart fill="#FF4D4D" color="#FF4D4D" />
                        ) : (
                            <HeartOff color="white" />
                        )}
                    </TouchableOpacity>

                    <Text className="text-xl font-bold text-white">{movie?.title}</Text>

                    <View className="flex-row items-center gap-x-2 mt-2">
                        <Text className="text-light-200 text-sm">
                            {movie?.release_date?.split('-')[0]}
                        </Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
                    </View>

                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">
                            {Math.round(movie?.vote_average ?? 0)}/10
                        </Text>
                        <Text className="text-light-200 text-sm">{movie?.vote_count} votes</Text>
                    </View>

                    {trailerKey ? (
                        <View ref={trailerRef} className="mt-6">
                            <YoutubePlayerComponent videoId={trailerKey} />
                        </View>
                    ) : (
                        <Text className="text-light-200 text-sm mt-4">No trailer available</Text>
                    )}

                    <TouchableOpacity
                        onPress={handleWatchMovie}
                        disabled={loadingScrape || !user || !token || !movie}
                        className="bg-green-600 mt-4 py-2 px-4 rounded"
                    >
                        {loadingScrape ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center text-sm font-semibold">
                                🍿 Watch Full Movie on YouTube
                            </Text>
                        )}
                    </TouchableOpacity>

                    <MovieInfo label="Overview" value={movie?.overview} />
                    <MovieInfo
                        label="Genres"
                        value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'}
                    />

                    <View className="flex flex-row items-center justify-between w-full mt-2">
                        <MovieInfo
                            label="Budget"
                            value={
                                movie?.budget
                                    ? `$${(movie.budget / 1_000_000).toFixed(1)} million`
                                    : 'N/A'
                            }
                        />
                        <MovieInfo
                            label="Revenue"
                            value={
                                movie?.revenue
                                    ? `$${(movie.revenue / 1_000_000).toFixed(1)} million`
                                    : 'N/A'
                            }
                        />
                    </View>

                    <MovieInfo
                        label="Production Companies"
                        value={movie?.production_companies?.map((c) => c.name).join(' - ') || 'N/A'}
                    />
                </View>
            </ScrollView>

            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/50">
                    <View className="bg-white p-6 rounded-lg w-4/5">
                        <Text className="text-black font-semibold text-lg mb-4">
                            Watch in App?
                        </Text>
                        <Text className="text-gray-700 mb-6">
                            Would you like to play the full movie here in the app?
                        </Text>

                        <View className="flex-row justify-end">
                            <Pressable onPress={() => setShowModal(false)} className="mr-4">
                                <Text className="text-blue-500 font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleWatchMovie}>
                                <Text className="text-green-600 font-bold">Yes, Play</Text>
                            </Pressable>
                        </View>
                    </View>
                </View> {/* <--- THIS IS THE MISSING CLOSING TAG */}
            </Modal>

            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image
                    source={icons.arrow}
                    className="size-5 mr-1 mt-0.5 rotate-180"
                    tintColor="#fff"
                />
                <Text className="text-white text-sm font-semibold">Back to Movies</Text>
            </TouchableOpacity>
        </View>
    );
};

const MovieInfo = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
    </View>
);

export default MovieDetails;