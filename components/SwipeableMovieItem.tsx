import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

interface MovieItem {
    _id: string;       // MongoDB's default ID
    title: string;
    poster_url?: string; // Made optional to handle cases where it might be null/undefined
    movie_id: number;  // TMDB movie ID
}

interface SwipeableMovieItemProps {
    item: MovieItem;
    onDelete: (item: MovieItem) => void; // Type-safe onDelete
}

const SwipeableMovieItem = ({ item, onDelete }: SwipeableMovieItemProps) => {
    const router = useRouter();

    const renderRightActions = () => (
        <RectButton // Revert to plain RectButton
            onPress={() => onDelete(item)}
            // Manually apply React Native styles equivalent to the NativeWind classes
            style={{
                backgroundColor: '#dc2626', // bg-red-600
                justifyContent: 'center',  // justify-center
                alignItems: 'flex-end',    // items-end
                paddingRight: 16,          // pr-4 (approximate, Tailwind default is usually 16px for p-4)
                borderRadius: 12,          // rounded-xl (Tailwind 'xl' is often 12px or 16px, using 12px for consistency)
                marginLeft: 8,             // ml-2 (Tailwind default for ml-2 is 8px)
                width: 80,                 // w-20 (Tailwind 'w-20' is 5rem = 80px)
                height: '100%',
            }}
        >
            <Text
                style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 16,
                }}
            >
                🗑 Delete
            </Text>
        </RectButton>
    );

    return (
        <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
            <TouchableOpacity
                onPress={() => router.push(`/movies/${item.movie_id}`)}
                className="mb-4 flex-row bg-dark-200 rounded-lg overflow-hidden flex-1"
            >
                {item.poster_url ? (
                    <Image
                        source={{ uri: item.poster_url }}
                        className="w-[100px] h-[140px] rounded-l-lg"
                    />
                ) : (
                    <View className="w-[100px] h-[140px] rounded-l-lg bg-gray-700 justify-center items-center">
                        <Text className="text-gray-300 text-xs text-center p-2">No Image Available</Text>
                    </View>
                )}

                <View className="flex-1 p-4 justify-between">
                    <Text className="text-white font-semibold text-base mb-1" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/movies/${item.movie_id}?autoplay=true`)}
                        className="bg-accent mt-2 py-1 px-2 rounded-md"
                    >
                        <Text className="text-white text-xs text-center">🎬 Play Trailer</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

export default SwipeableMovieItem;