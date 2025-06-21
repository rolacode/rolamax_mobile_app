import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

interface Props {
    videoUri: string;
}

export default function VideoScreen({ videoUri }: Props) {
    const player = useVideoPlayer({ uri: videoUri }, (player) => {
        player.loop = false;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', {
        isPlaying: player.playing,
    });

    useEffect(() => {
        return () => {
            try {
                if (player?.pause) player.pause();
            } catch (e) {
                // @ts-ignore
                console.warn('Video cleanup failed:', e.message);
            }
        };
    }, []);

    return (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
            <VideoView
                player={player}
                style={{ width: 380, height: 480, backgroundColor: 'black', borderRadius: 12 }}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="cover"
                showsTimecodes
            />
            <View style={{ marginTop: 20 }}>
                <Button
                    title={isPlaying ? 'Pause' : 'Play'}
                    onPress={() => (isPlaying ? player.pause() : player.play())}
                />
            </View>
        </View>
    );
}
