import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { 
    main_Style, 
    MainBrownSecondaryColor, 
    generalTextColor, 
    generalTextFont, 
    generalTextSize,
    generalTitleColor,
    generalTitleFont,
    generalTitleSize,
    generalTitleFontWeight,
    generalActiveOpacity
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';

const NetworkErrorScreen = ({ onRetry }) => {
    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]}>
            <View style={styles.content}>
                {/* Image placeholder - user will add image later */}
                <View style={styles.imageContainer}>
                    <Ionicons 
                        name="cloud-offline-outline" 
                        size={120} 
                        color={MainBrownSecondaryColor} 
                    />
                    {/* Placeholder for user's image */}
                    {/* <Image 
                        source={require('../../../assets/ErrorImages/NetworkError.png')}
                        style={styles.errorImage}
                        resizeMode="contain"
                    /> */}
                </View>

                {/* Error Title */}
                <Text style={styles.title}>Connection Problem</Text>

                {/* Error Message */}
                <Text style={styles.message}>
                    Unable to reach the server. Please check your internet connection and try again.
                </Text>

                {/* Retry Button */}
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={generalActiveOpacity}
                >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.retryIcon} />
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    imageContainer: {
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
    },
    errorImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: generalTitleSize + 4,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 16,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 140,
        ...main_Style.genButtonElevation,
    },
    retryIcon: {
        marginRight: 8,
    },
    retryButtonText: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: generalTextFont,
    },
});

export default NetworkErrorScreen;

