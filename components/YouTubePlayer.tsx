import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
    videoId: string;
}

const YouTubePlayer = ({ videoId }: Props) => {
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    return (
        <View style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden' }}>
            <WebView
                source={{ uri: url }}
                style={{ flex: 1 }}
                javaScriptEnabled
                allowsFullscreenVideo
                startInLoadingState
                renderLoading={() => <ActivityIndicator size="large" color="#fff" />}
            />
        </View>
    );
};

export default YouTubePlayer;
