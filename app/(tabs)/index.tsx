import {ScrollView, Image, View, ActivityIndicator, Text, FlatList, TouchableOpacity} from "react-native";
import {images} from "@/constants/images";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {router, useRouter} from "expo-router";
import {fetchMovies} from "@/services/api";
import useFetch from "@/services/useFetch";
import MovieCard from "@/components/MovieCard";
import {getTrendingMovies} from "@/services/movie";
import TrendingCard from "@/components/TrendingCard";
import React from "react";

export default function Index() {
    const router = useRouter();
    const {
        data: trendingMovies,
        loading: trendingLoading,
        //@ts-ignore
        error: trendingError,
    } = useFetch(getTrendingMovies);

    const {
        data: movies,
        loading: moviesLoading,
        //@ts-ignore
        error: moviesError
    } = useFetch(() => fetchMovies({
        query: ''
    }))


    return (
        <View className="flex-1 bg-primary">
           <Image source={images.bg} className="absolute w-full z-0" />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}>
                <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

                <TouchableOpacity onPress={() => router.push('/history')}>
                    <Text className="text-secondary text-center justify-center text-md mb-5 py-3 px-5 rounded-full font-semibold bg-amber-300">View Watched History</Text>
                </TouchableOpacity>


                {moviesLoading || trendingLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        className="mt-10 self-center"
                    />
                ) : moviesError || trendingError ? (
                    <Text>Error: {moviesError?.message || trendingError?.message}</Text>
                ) : (
                    <View className="flex-1 mt-5">
                        <SearchBar
                            onPress={() => router.push("/search")}
                            placeholder="Search for movies"
                        />

                        {trendingMovies && (
                            <View className="mt-10">
                                <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
                            </View>
                        )}

                        <>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ItemSeparatorComponent={() => <View className="w-4" />}
                                className="mb-4 mt-3"
                                data={trendingMovies}
                                renderItem={({ item, index }) => (
                                    <TrendingCard movie={item} index={index} />
                                )}
                                keyExtractor={(_, index) => `trending-${index}`}
                            />


                            <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>
                            <FlatList
                                data={movies}
                                renderItem={({ item }) => (
                                    <MovieCard {...item} />
                                )}
                                keyExtractor={(item) => `latest-${item.id.toString()}`}
                                numColumns={3}
                                columnWrapperStyle={{
                                    justifyContent: 'flex-start',
                                    gap: 30,
                                    paddingRight: 5,
                                    marginBottom: 10
                                }}
                                className="mt-2 pb-32"
                                scrollEnabled={false}
                            />

                        </>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
