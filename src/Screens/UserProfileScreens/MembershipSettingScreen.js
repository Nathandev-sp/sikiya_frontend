import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, Alert, StatusBar, Linking} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, main_Style, mainBrownColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, generalSmallTextSize, articleTitleSize, commentTextSize } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Context as AuthContext} from '../../Context/AuthContext';
import { useContext } from 'react';
import SikiyaAPI from '../../../API/SikiyaAPI';


const MembershipSettingScreen = () => {
    const navigation = useNavigation();
    const {state} = useContext(AuthContext);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [processingPackageId, setProcessingPackageId] = useState(null);

    // Get current user role from AuthContext state
    const currentUserRole = state?.role || 'general'; // Default to 'general' if role not set
    
    // Check if user is journalist
    const isJournalist = currentUserRole === 'journalist';
    
    // Debug: Log the role being used
    console.log('[MembershipScreen] User role from state:', currentUserRole);
    console.log('[MembershipScreen] Full state:', state);

    // Contributor tier details
    const contributorPlan = {
        id: 1,
        name: 'Sikiya Contributor',
        price: '4.99 USD',
        period: '/month',
        roleKey: 'contributor',
        tagline: 'Full Access to Premium Features',
        image: require('../../../assets/OnboardingImages/contributorImage.png'),
        color: '#49A078',
        features: [
            {
                icon: 'infinite-outline',
                title: 'Unlimited Video Access',
                description: 'Watch unlimited videos with no daily restrictions'
            },
            {
                icon: 'close-circle-outline',
                title: 'Ad-Free Experience',
                description: 'Enjoy content without interruptions or advertisements'
            },
            {
                icon: 'chatbubble-ellipses-outline',
                title: 'Full Comment Access',
                description: 'Post new comments and engage fully with the community'
            },
            {
                icon: 'person-outline',
                title: 'Visible Profile',
                description: 'Your profile is visible to other users and contributors'
            },
            {
                icon: 'checkmark-circle-outline',
                title: 'No Restrictions',
                description: 'Use all features without any limitations'
            }
        ]
    };

    // Open platform-specific subscription management
    const handleManageSubscription = async () => {
        if (Platform.OS === 'ios') {
            try {
                const iosIAP = require('../../services/iosIAPService').default;
                await iosIAP.initializeIAP();
                
                // Open iOS Settings for subscription management
                Alert.alert(
                    'Manage Subscription',
                    'To manage your subscription, you\'ll be directed to your iOS Settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Open Settings',
                            onPress: async () => {
                                try {
                                    await Linking.openURL('app-settings:');
                                } catch (err) {
                                    Alert.alert(
                                        'Settings',
                                        'To manage your subscription:\n\n1. Open Settings app\n2. Tap your name at the top\n3. Tap Subscriptions\n4. Select Sikiya'
                                    );
                                }
                            }
                        }
                    ]
                );
            } catch (error) {
                console.error('Error opening settings:', error);
                Alert.alert('Error', 'Could not open subscription settings.');
            }
        } else if (Platform.OS === 'android') {
            try {
                const androidIAP = require('../../services/androidIAPService').default;
                await androidIAP.initializeIAP();
                
                // Open Google Play subscription management
                Alert.alert(
                    'Manage Subscription',
                    'To manage your subscription, you\'ll be directed to Google Play.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Open Google Play',
                            onPress: async () => {
                                try {
                                    await Linking.openURL('https://play.google.com/store/account/subscriptions');
                                } catch (err) {
                                    Alert.alert('Error', 'Could not open Google Play subscriptions.');
                                }
                            }
                        }
                    ]
                );
            } catch (error) {
                console.error('Error opening Play Store:', error);
                Alert.alert('Error', 'Could not open subscription settings.');
            }
        }
    };

    // Restore purchases handler
    const handleRestorePurchases = async () => {
        setIsSubscribing(true);
        try {
            if (Platform.OS === 'ios') {
                const iosIAP = require('../../services/iosIAPService').default;
                await iosIAP.initializeIAP();
                const result = await iosIAP.restorePurchases();
                
                if (result.success) {
                    Alert.alert(
                        'Purchases Restored',
                        'Your subscription has been restored successfully!',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    Alert.alert('No Purchases Found', result.message || 'No previous purchases were found.');
                }
            } else if (Platform.OS === 'android') {
                const androidIAP = require('../../services/androidIAPService').default;
                await androidIAP.initializeIAP();
                const result = await androidIAP.restorePurchases();
                
                if (result.success) {
                    Alert.alert(
                        'Purchases Restored',
                        'Your subscription has been restored successfully!',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    Alert.alert('No Purchases Found', result.message || 'No previous purchases were found.');
                }
            } else {
                Alert.alert('Not Available', 'Restore purchases is only available on iOS and Android.');
            }
        } catch (error) {
            console.error('Error restoring purchases:', error);
            Alert.alert('Error', error.message || 'Failed to restore purchases. Please try again.');
        } finally {
            setIsSubscribing(false);
        }
    };

    // Subscription handler - upgrade to contributor
    const handleSubscribe = async () => {
        // Check if already subscribed
        if (currentUserRole === 'contributor') {
            Alert.alert('Already Subscribed', 'You already have an active Contributor subscription.');
            return;
        }

        setProcessingPackageId(contributorPlan.id);
        setIsSubscribing(true);

        try {
            // Use platform-specific IAP
            if (Platform.OS === 'ios') {
                // iOS: Use Apple In-App Purchase
                try {
                    const iosIAP = require('../../services/iosIAPService').default;
                    
                    // Initialize IAP
                    await iosIAP.initializeIAP();
                    
                    // Get product ID
                    const productId = iosIAP.PRODUCT_IDS.CONTRIBUTOR_MONTHLY;
                    
                    // Purchase subscription (this handles receipt verification automatically)
                    const result = await iosIAP.purchaseSubscription(productId);
                    
                    if (result.success) {
                        Alert.alert(
                            'Subscription Activated',
                            'Your subscription has been activated successfully!',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Refresh user data
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('iOS purchase error:', error);
                    Alert.alert(
                        'Purchase Failed',
                        error.message || 'Failed to complete purchase. Please try again.'
                    );
                } finally {
                    setProcessingPackageId(null);
                    setIsSubscribing(false);
                }
                return;
            } else if (Platform.OS === 'android') {
                // Android: Use Google Play In-App Purchase
                try {
                    const androidIAP = require('../../services/androidIAPService').default;
                    
                    // Initialize IAP
                    await androidIAP.initializeIAP();
                    
                    // Get product ID
                    const productId = androidIAP.PRODUCT_IDS.CONTRIBUTOR_MONTHLY;
                    
                    // Purchase subscription (this handles purchase verification automatically)
                    const result = await androidIAP.purchaseSubscription(productId);
                    
                    if (result.success) {
                        Alert.alert(
                            'Subscription Activated',
                            'Your subscription has been activated successfully!',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Refresh user data
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Android purchase error:', error);
                    Alert.alert(
                        'Purchase Failed',
                        error.message || 'Failed to complete purchase. Please try again.'
                    );
                } finally {
                    setProcessingPackageId(null);
                    setIsSubscribing(false);
                }
                return;
            } else {
                // Unsupported platform
                Alert.alert(
                    'Not Available',
                    'Subscriptions are only available on iOS and Android devices.',
                    [{ text: 'OK' }]
                );
                setProcessingPackageId(null);
                setIsSubscribing(false);
            }
        } catch (error) {
            console.error('Subscription failed:', error);
            Alert.alert('Error', 'Failed to start subscription. Please try again.');
            setProcessingPackageId(null);
            setIsSubscribing(false);
        }
    };

    // Check if user is contributor
    const isContributor = currentUserRole === 'contributor';

    // Journalist Premium Access Screen
    if (isJournalist) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={settingsStyles.headerSection}>
                        <Ionicons name="shield-checkmark" style={settingsStyles.headerIcon} />
                        <Text style={settingsStyles.headerTitle}>Journalist Access</Text>
                    </View>

                    {/* Hero Card - Journalist Version */}
                    <View style={[styles.heroCard, styles.journalistHeroCard, main_Style.genButtonElevation]}>
                        <View style={styles.journalistBadgeContainer}>
                            <Ionicons name="shield-checkmark" size={50} color="#fff" />
                        </View>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>Verified Journalist</Text>
                            <Text style={styles.heroTagline}>Premium Access Included</Text>
                            <View style={styles.journalistPriceTag}>
                                <Text style={styles.journalistPriceText}>Complimentary</Text>
                            </View>
                        </View>
                    </View>

                    <VerticalSpacer height={20} />

                    {/* Features Section */}
                    <View style={[styles.featuresContainer, main_Style.genButtonElevation]}>
                        <Text style={styles.sectionTitle}>Premium Features Included</Text>
                        
                        {contributorPlan.features.map((feature, idx) => (
                            <View key={idx} style={styles.featureRow}>
                                <View style={[styles.featureIconContainer, styles.journalistFeatureIcon]}>
                                    <Ionicons 
                                        name={feature.icon} 
                                        size={24} 
                                        color={MainSecondaryBlueColor} 
                                    />
                                </View>
                                <View style={styles.featureTextContainer}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <VerticalSpacer height={20} />

                    {/* Journalist Status Card */}
                    <View style={styles.actionContainer}>
                        <View style={[styles.journalistStatusCard]}>
                            <Ionicons name="shield-checkmark" size={22} color={MainSecondaryBlueColor} />
                            <Text style={styles.journalistStatusTitle}>Verified Account</Text>
                            <Text style={styles.journalistStatusDescription}>
                                Your journalist account includes all premium features at no additional cost
                            </Text>
                        </View>
                    </View>

                    <VerticalSpacer height={30} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="diamond-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Sikiya Contributor</Text>
                </View>

                {/* Hero Card with Image */}
                <View style={[styles.heroCard, main_Style.genButtonElevation]}>
                    <Image 
                        source={contributorPlan.image} 
                        style={styles.heroImage} 
                    />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{contributorPlan.name}</Text>
                        <Text style={styles.heroTagline}>{contributorPlan.tagline}</Text>
                        <View style={styles.heroPriceContainer}>
                            <Text style={styles.heroPrice}>{contributorPlan.price}</Text>
                            <Text style={styles.heroPeriod}>{contributorPlan.period}</Text>
                        </View>
                    </View>
                </View>

                <VerticalSpacer height={20} />

                {/* Features Section */}
                <View style={[styles.featuresContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>Premium Features Included</Text>
                    
                    {contributorPlan.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureRow}>
                            <View style={styles.featureIconContainer}>
                                <Ionicons 
                                    name={feature.icon} 
                                    size={24} 
                                    color={contributorPlan.color} 
                                />
                            </View>
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <VerticalSpacer height={20} />

                {/* Action Button - Either Upgrade or Manage */}
                {!isContributor ? (
                    // Free user - Show upgrade button
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[styles.upgradeButton, main_Style.genButtonElevation]}
                            onPress={handleSubscribe}
                            activeOpacity={generalActiveOpacity}
                            disabled={isSubscribing}
                        >
                            {isSubscribing ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#49A078" />
                                    <Text style={styles.upgradeButtonText}>Processing...</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.upgradeIconContainer}>
                                        <Ionicons name="diamond" size={24} color="#fff" />
                                    </View>
                                    <View style={styles.upgradeTextContainer}>
                                        <Text style={styles.upgradeButtonTitle}>Upgrade to Contributor</Text>
                                        <Text style={styles.upgradeButtonSubtitle}>
                                            Unlock all features for {contributorPlan.price}{contributorPlan.period}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={22} color="#49A078" />
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <Text style={styles.upgradeHelper}>
                            Secure payment processed through {Platform.OS === 'ios' ? 'Apple' : 'Google Play'}
                        </Text>
                    </View>
                ) : (
                    // Contributor - Show manage button
                    <View style={styles.actionContainer}>
                        <View style={[styles.activeSubscriptionCard, main_Style.genButtonElevation]}>
                            <Ionicons name="checkmark-circle" size={24} color={contributorPlan.color} />
                            <Text style={styles.activeTitle}>You're a Contributor!</Text>
                            <Text style={styles.activeDescription}>
                                Enjoying all premium features with full access to Sikiya
                            </Text>
                        </View>
                        
                        <VerticalSpacer height={16} />
                        
                        <TouchableOpacity
                            style={[styles.manageButton, main_Style.genButtonElevation]}
                            onPress={handleManageSubscription}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="settings-outline" size={20} color={withdrawnTitleColor} />
                            <Text style={styles.manageButtonText}>Manage Subscription</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.manageHelper}>
                            Manage your subscription through {Platform.OS === 'ios' ? 'Apple Settings' : 'Google Play'}
                        </Text>
                    </View>
                )}

                <VerticalSpacer height={4} />
                
                {/* Restore Purchases Button (iOS/Android only) */}
                {(Platform.OS === 'ios' || Platform.OS === 'android') && (
                    <View style={styles.restoreContainer}>
                        <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={handleRestorePurchases}
                            disabled={isSubscribing}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="refresh-outline" size={18} color={MainBrownSecondaryColor} />
                            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                        </TouchableOpacity>
                        <Text style={styles.restoreHelperText}>
                            Restore previous purchases if you've reinstalled the app or switched devices
                        </Text>
                    </View>
                )}

                <VerticalSpacer height={30} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    // Hero Card Styles
    heroCard: {
        backgroundColor: MainBrownSecondaryColor,
        borderRadius: 16,
        padding: 8,
        marginHorizontal: 16,
        marginTop: 20,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: 80,
        resizeMode: 'contain',
    },
    heroContent: {
        padding: 16,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: articleTitleSize+3,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: generalTitleFont,
        marginBottom: 4,
    },
    heroTagline: {
        fontSize: commentTextSize,
        color: '#fff',
        fontFamily: generalTextFont,
        marginBottom: 12,
    },
    heroPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    heroPrice: {
        fontSize: articleTitleSize+8,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: generalTitleFont,
    },
    heroPeriod: {
        fontSize: commentTextSize,
        color: '#fff',
        fontFamily: generalTextFont,
        marginLeft: 4,
    },
    // Features Section
    featuresContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: articleTitleSize,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        //backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: commentTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    // Action Container
    actionContainer: {
        marginHorizontal: 16,
    },
    // Upgrade Button (for free users)
    upgradeButton: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#3d8a5f',
    },
    upgradeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#49A078',
        alignItems: 'center',
        justifyContent: 'center',
    },
    upgradeTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    upgradeButtonTitle: {
        fontSize: articleTitleSize,
        fontWeight: 'bold',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginBottom: 4,
    },
    upgradeButtonSubtitle: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    upgradeButtonText: {
        fontSize: commentTextSize,
        fontWeight: '600',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginLeft: 10,
    },
    upgradeHelper: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        marginTop: 12,
    },
    // Active Subscription Card (for contributors)
    activeSubscriptionCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#49A078',
    },
    activeTitle: {
        fontSize: articleTitleSize+3,
        fontWeight: 'bold',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginTop: 12,
        marginBottom: 8,
    },
    activeDescription: {
        fontSize: 14,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Manage Button (for contributors)
    manageButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    manageButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        marginLeft: 8,
    },
    manageHelper: {
        fontSize: 12,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        marginTop: 12,
    },
    // Loading States
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    // Journalist Premium Screen Styles
    journalistHeroCard: {
        backgroundColor: MainSecondaryBlueColor,
    },
    journalistBadgeContainer: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
    },
    journalistPriceTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    journalistPriceText: {
        fontSize: commentTextSize,
        fontWeight: '600',
        color: '#fff',
        fontFamily: generalTitleFont,
    },
    journalistFeatureIcon: {
        backgroundColor: 'rgba(2, 108, 124, 0.1)',
    },
    journalistStatusCard: {
        backgroundColor: 'rgba(2, 108, 124, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: MainSecondaryBlueColor,
    },
    journalistStatusTitle: {
        fontSize: articleTitleSize+3,
        fontWeight: 'bold',
        color: MainSecondaryBlueColor,
        fontFamily: generalTitleFont,
        marginTop: 12,
        marginBottom: 8,
    },
    journalistStatusDescription: {
        fontSize: commentTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 20,
    },
    restoreContainer: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    restoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
        backgroundColor: 'transparent',
        gap: 8,
    },
    restoreButtonText: {
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: MainBrownSecondaryColor,
        fontWeight: '600',
    },
    restoreHelperText: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTextFont,
        color: withdrawnTitleColor,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
});

export default MembershipSettingScreen;