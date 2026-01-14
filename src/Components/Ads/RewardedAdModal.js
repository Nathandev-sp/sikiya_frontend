import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generalTextColor, generalTextFont, generalTextSize, generalTitleFont, generalTitleSize, MainBrownSecondaryColor, generalActiveOpacity, cardBackgroundColor } from '../../styles/GeneralAppStyle';

/**
 * Rewarded Ad Modal
 * 
 * Modal that prompts user to watch a rewarded ad to continue watching videos.
 * Appears after user watches 10 videos (for general users only).
 */
const RewardedAdModal = ({ 
    visible, 
    onWatchAd, 
    onCancel, 
    isShowingAd, 
    isAdLoaded,
    title = "Watch an Ad to Continue",
    message = "You've watched 10 videos! Watch a short ad to unlock 10 more videos.",
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="videocam" size={64} color={MainBrownSecondaryColor} />
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    
                    <Text style={styles.message}>
                        {message}
                    </Text>
                    
                    {isShowingAd ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={MainBrownSecondaryColor} />
                            <Text style={styles.loadingText}>Loading ad...</Text>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.watchButton, !isAdLoaded && styles.buttonDisabled]}
                                onPress={onWatchAd}
                                disabled={!isAdLoaded || isShowingAd}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="play-circle" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Watch Ad</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                disabled={isShowingAd}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: generalTitleSize,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        color: generalTextColor,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
        opacity: 0.8,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    watchButton: {
        backgroundColor: MainBrownSecondaryColor,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: generalTextSize + 2,
        fontFamily: generalTextFont,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: generalTextColor,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
        opacity: 0.7,
    },
});

export default RewardedAdModal;

