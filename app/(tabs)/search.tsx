import { Image, View, FlatList, Text, ActivityIndicator } from "react-native";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api"; // This should hit your movie search API (e.g., TMDB)
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";
// import { updateSearchCount } from "@/services/appwrite"; // REMOVE THIS
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Needed for token

const API_BASE_URL = 'http://192.168.132.114:5000/api'; // Your backend URL

// Function to log search activity to your backend
const logSearchActivity = async (userId: string, token: string, searchTerm: string, movie?: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/search-log`, { // Your new backend endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                searchTerm,
                movie_id: movie?.id, // Assuming movie has an 'id'
                movie_title: movie?.title,
                movie_poster: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to log search activity:', response.status, errorText);
        }
    } catch (error) {
        console.error('Network error logging search activity:', error);
    }
};


const Search = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies,
        loading,
        // @ts-ignore
        error,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({ query: searchQuery }), false);

    // Loading user state
    if (user === undefined) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <Text className="text-white">Please login to search for movies</Text>
            </View>
        );
    }

    // Search logic: debounce for API calls
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Log search count to your backend after movies are loaded
    useEffect(() => {
        const handleSearchLog = async () => {
            if (user?.id && movies?.length > 0 && movies?.[0]) { // Use user.id
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    await logSearchActivity(user.id, token, searchQuery, movies[0]);
                }
            }
        };
        handleSearchLog();
    }, [movies, user, searchQuery]); // Depend on movies, user, and searchQuery

    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />

            <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => `search-${item.id}`} // Assuming TMDB movie id
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'center',
                    gap: 16,
                    marginVertical: 16
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>

                        <View className="my-5">
                            <SearchBar
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                            />
                        </View>

                        {loading && (
                            <ActivityIndicator size="large" color="#0000ff" className="my-3" />
                        )}

                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: {error?.message}
                            </Text>
                        )}

                        {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for{' '}
                                <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-10 px-5">
                            <Text className="text-gray-500 text-center">
                                {searchQuery.trim() ? 'No movies found' : 'Search for movies'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;