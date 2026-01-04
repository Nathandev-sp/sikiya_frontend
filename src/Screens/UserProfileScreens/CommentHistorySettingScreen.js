import React from 'react';
import { View, StyleSheet, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generalTextColor, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';

const CommentHistorySettingScreen = () => {
    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="time-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Comment History</Text>
                </View>

                {/* Under Construction Message */}
                <View style={[styles.constructionContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.emoji}>🚧</Text>
                    <Text style={styles.constructionTitle}>Feature Under Construction</Text>
                    <Text style={styles.constructionDescription}>
                        We're currently building this feature to help you track and manage all your comments in one place.
                    </Text>
                    
                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={MainBrownSecondaryColor} />
                            <Text style={styles.featureText}>View all your comment history</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={MainBrownSecondaryColor} />
                            <Text style={styles.featureText}>Edit or delete past comments</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={MainBrownSecondaryColor} />
                            <Text style={styles.featureText}>Track engagement on your comments</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={18} color="#007AA3" />
                        <Text style={styles.infoText}>
                            Stay tuned! This feature will be available in an upcoming update.
                        </Text>
                    </View>
                </View>

                <VerticalSpacer height={30} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollContent: {
        flexGrow: 1,
    },
    constructionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 20,
        padding: 24,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    constructionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 12,
        textAlign: 'center',
    },
    constructionDescription: {
        fontSize: 14,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    featureList: {
        width: '100%',
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    featureText: {
        fontSize: 13,
        color: generalTextColor,
        fontFamily: generalTextFont,
        marginLeft: 12,
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: secCardBackgroundColor,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
});

export default CommentHistorySettingScreen;