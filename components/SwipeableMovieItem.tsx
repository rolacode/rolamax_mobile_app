// ✅ SwipeableMovieItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

interface Props {
    item: {
        $id: string;
        title: string;
        poster_url: string;
        movie_id: number;
    };
    onDelete: (item: any) => void;
}

const SwipeableMovieItem = ({ item, onDelete }: Props) => {
    const router = useRouter();

    const renderRightActions = () => (
        <RectButton
            onPress={() => onDelete(item)}
            style={{ backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 16, borderRadius: 12, height: '100%' }}
        >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>🗑 Delete</Text>
        </RectButton>
    );

    return (
        <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
            <TouchableOpacity
                onPress={() => router.push(`/movies/${item.movie_id}`)}
                className="mb-4 flex-row bg-dark-200 rounded-lg overflow-hidden"
            >
                <Image
                    source={{ uri: item.poster_url }}
                    className="w-[100px] h-[140px] rounded-l-lg"
                />
                <View className="flex-1 p-4 justify-between">
                    <Text className="text-white font-semibold text-base mb-1" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/movies/${item.movie_id}?autoplay=true`)}
                        className="bg-accent mt-2 py-1 px-2 rounded"
                    >
                        <Text className="text-white text-xs text-center">🎬 Play Trailer</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

export default SwipeableMovieItem;
