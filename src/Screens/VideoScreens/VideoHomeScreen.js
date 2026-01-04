import React, {useState, useRef} from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import AppScreenBackgroundColor, { articleTitleFont, main_Style, generalTitleColor, MainBrownSecondaryColor } from '../../styles/GeneralAppStyle';
import GoBackButton from '../../../NavComponents/GoBackButton';
import LikeButton from '../../Components/LikeButton';

const VideoHomeScreen = ({ route }) => {
    const { width, height } = useWindowDimensions();
    const { articleId, article } = route.params;

    const videoPlayer = useVideoPlayer("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", player => {
        player.loop = true;
        player.play()
    });

    const handleShare = async () => {
        // Handle share functionality
        console.log('Share button pressed');
        // You can implement share functionality here
    };

    const handleYouTube = async () => {
        // Open YouTube channel
        const youtubeUrl = 'https://youtube.com/@SikiyaChannel'; // Replace with your actual YouTube channel
        try {
            await Linking.openURL(youtubeUrl);
        } catch (error) {
            console.error('Error opening YouTube:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <GoBackButton />
            
            {/* Full Screen Video */}
            <View style={styles.videoContainer}>
                <VideoView 
                    style={[styles.fullScreenVideo, { width, height }]} 
                    player={videoPlayer} 
                    allowsFullscreen 
                    allowsPictureInPicture 
                />
                
                {/* Bottom Card Overlay */}
                <View style={styles.bottomCard}>
                    <View style={styles.cardContent}>
                        {/* Article Title */}
                        <View style={styles.titleSection}>
                            <Text style={styles.articleTitle}>
                                {article?.article_title || "Article Title Here"}
                            </Text>
                        </View>
                        
                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            {/* Like Button */}
                            <View style={styles.buttonContainer}>
                                <LikeButton 
                                    articleId={articleId} 
                                    initialLikes={article?.number_of_likes || 0}
                                />
                            </View>
                            
                            {/* Share Button */}
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Ionicons name="share-outline" size={28} color="white" />
                                <Text style={styles.buttonLabel}>Share</Text>
                            </TouchableOpacity>
                            
                            {/* YouTube Button */}
                            <TouchableOpacity style={styles.actionButton} onPress={handleYouTube}>
                                <Ionicons name="logo-youtube" size={28} color="#FF0000" />
                                <Text style={styles.buttonLabel}>YouTube</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
    },
    fullScreenVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#000',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    cardContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleSection: {
        marginBottom: 20,
    },
    articleTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontFamily: articleTitleFont,
        //lineHeight: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        minWidth: 60,
    },
    buttonLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default VideoHomeScreen;
