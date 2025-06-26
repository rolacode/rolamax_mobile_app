import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const YoutubePlayerComponent = ({ videoId }: { videoId: string }) => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    return (
        <View style={styles.container}>
            <YoutubePlayer
                height={screenHeight}
                width={screenWidth}
                videoId={videoId}
                play
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});

export default YoutubePlayerComponent;
