import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, Alert, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, main_Style, mainBrownColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, generalSmallTextSize } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Context as AuthContext} from '../../Context/AuthContext';
import { useContext } from 'react';
import SikiyaAPI from '../../../API/SikiyaAPI';
import paymentService from '../../services/paymentServiceExpoGo';
import * as WebBrowser from 'expo-web-browser';


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

    const membershipPackages = [
        {
            id: 1,
            name: 'General User',
            price: 'Free',
            period: '',
            roleKey: 'general',
            icon: 'reader-outline',
            image: require('../../../assets/OnboardingImages/user.png'),
            color: '#026C7C',
            features: [
                'Read all articles',
                'Reply to comments only',
                '5 videos per day (no ads)',
                'Unlock more videos by watching 3 ads',
                'Profile shows "Not a premium user" message',
                'Ads in the app',
            ],
            drawbacks: [
                'Cannot post new comments',
                'Limited video viewing',
                'Profile not visible to others',
                'Ads throughout the app',
            ]
        },
        {
            id: 2,
            name: 'Contributor',
            price: '$4.00',
            period: '/month',
            roleKey: 'contributor',
            icon: 'diamond-outline',
            image: require('../../../assets/OnboardingImages/contributorImage.png'),
            color: '#49A078',
            features: [
                'Full access to all articles',
                'Post and reply to comments',
                'Unlimited video watching',
                'Ad-free experience',
                'Full author profile visible',
                'No viewing restrictions',
            ],
            benefits: [
                'No ads',
                'Unlimited content access',
                'Full engagement features',
                'Professional profile visibility',
            ]
        }
    ];

    const handleMembershipSelect = (index) => {
        setSelectedMembership(index);
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

    // Subscription handler - handles both upgrade and downgrade
    const handleSubscribe = async (packageData) => {
        // Don't allow subscribing to current plan
        const planIndex = membershipPackages.findIndex(p => p.id === packageData.id);
        if (planIndex === currentPlanIndex) {
            Alert.alert('Already Subscribed', 'You are already on this plan.');
            return;
        }

        setProcessingPackageId(packageData.id);
        setIsSubscribing(true);

        try {
            // If downgrading to free, update directly
            if (packageData.roleKey === 'general') {
                try {
                    const response = await SikiyaAPI.post('/subscription/cancel');
                    if (response.data.success) {
                        Alert.alert(
                            'Subscription Cancelled',
                            'You have been downgraded to the free tier. Your subscription will remain active until the end of your billing period.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Refresh user data to update role
                                        // You may want to refresh AuthContext here
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Error cancelling subscription:', error);
                    Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
                } finally {
                    setProcessingPackageId(null);
                    setIsSubscribing(false);
                }
                return;
            }

            // If upgrading to premium, use platform-specific IAP
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
                // Web/Other: Use Stripe checkout (existing flow)
                try {
                    // Create subscription checkout session
                    const response = await SikiyaAPI.post('/subscription/create-checkout', {
                        planId: packageData.roleKey,
                        amount: 400, // $4.00 in cents
                        currency: 'usd',
                        returnUrl: 'sikiya://subscription-success'
                    });
                    
                    const sessionUrl = response.data.sessionUrl || response.data.checkoutUrl;
                    
                    if (sessionUrl && sessionUrl.startsWith('http')) {
                        await WebBrowser.openBrowserAsync(sessionUrl, {
                            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                        });
                        
                        // After returning, check subscription status
                        Alert.alert('Success', 'Subscription completed! Your plan will be activated shortly.');
                    } else {
                        throw new Error('Invalid session URL');
                    }
                } catch (error) {
                    console.error('Subscription error:', error);
                    Alert.alert('Error', 'Failed to start subscription. Please try again.');
                } finally {
                    setProcessingPackageId(null);
                    setIsSubscribing(false);
                }
            }
        } catch (error) {
            console.error('Subscription failed:', error);
            Alert.alert('Error', 'Failed to start subscription. Please try again.');
            setProcessingPackageId(null);
            setIsSubscribing(false);
        }
    };

    // Get current plan index based on user's role from AuthContext
    const getCurrentPlanIndex = React.useCallback(() => {
        // Journalists have premium access (show special screen)
        if (currentUserRole === 'journalist') {
            return -1;
        }
        
        // Map user roles to plan indices
        const roleMapping = {
            'general': 0,      // Free tier - index 0
            'contributor': 1,  // Premium tier ($4/month) - index 1
        };
        
        // Get plan index based on current role
        const planIndex = roleMapping[currentUserRole];
        
        // Debug log
        console.log('[MembershipScreen] getCurrentPlanIndex - Role:', currentUserRole, 'Plan Index:', planIndex);
        
        // Return the plan index, defaulting to 0 (free tier) if role not recognized
        return planIndex !== undefined ? planIndex : 0;
    }, [currentUserRole]);

    // Calculate current plan index based on user's role
    const currentPlanIndex = getCurrentPlanIndex();
    
    // Initialize selected membership to current plan (unless journalist)
    const [selectedMembership, setSelectedMembership] = useState(
        currentPlanIndex === -1 ? 0 : currentPlanIndex
    );
    
    // Update selected membership when role changes
    useEffect(() => {
        const newPlanIndex = getCurrentPlanIndex();
        if (newPlanIndex !== -1) {
            setSelectedMembership(newPlanIndex);
        }
        console.log('[MembershipScreen] Role changed, updated selected membership to:', newPlanIndex);
    }, [currentUserRole, getCurrentPlanIndex]);

    // Journalist Premium Access Screen
    if (isJournalist) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton />
                </View>
                
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.journalistContainer}
                >
                    <View style={styles.journalistContent}>
                        <View style={styles.premiumBadge}>
                            <Ionicons name="shield-checkmark" size={80} color={MainSecondaryBlueColor} />
                        </View>
                        
                        <Text style={styles.journalistTitle}>Premium Access</Text>
                        <Text style={styles.journalistSubtitle}>
                            As a verified journalist, you have full access to all Sikiya features
                        </Text>

                        <View style={styles.premiumFeaturesContainer}>
                            <View style={styles.premiumFeatureRow}>
                                <Ionicons name="checkmark-circle" size={24} color="#49A078" />
                                <Text style={styles.premiumFeatureText}>Unlimited article publishing</Text>
                            </View>
                            <View style={styles.premiumFeatureRow}>
                                <Ionicons name="checkmark-circle" size={24} color="#49A078" />
                                <Text style={styles.premiumFeatureText}>Priority content visibility</Text>
                            </View>
                            <View style={styles.premiumFeatureRow}>
                                <Ionicons name="checkmark-circle" size={24} color="#49A078" />
                                <Text style={styles.premiumFeatureText}>Advanced analytics dashboard</Text>
                            </View>
                            <View style={styles.premiumFeatureRow}>
                                <Ionicons name="checkmark-circle" size={24} color="#49A078" />
                                <Text style={styles.premiumFeatureText}>Direct engagement with readers</Text>
                            </View>
                            <View style={styles.premiumFeatureRow}>
                                <Ionicons name="checkmark-circle" size={24} color="#49A078" />
                                <Text style={styles.premiumFeatureText}>Ad-free experience</Text>
                            </View>
                        </View>

                        <View style={styles.journalistInfoBox}>
                            <Ionicons name="information-circle-outline" size={20} color={MainSecondaryBlueColor} />
                            <Text style={styles.journalistInfoText}>
                                Your journalist account includes all premium features at no additional cost
                            </Text>
                        </View>
                    </View>
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
                    <Ionicons name="card-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Membership</Text>
                </View>

                {/* Debug Info - Shows current role (remove in production) */}
                {__DEV__ && (
                    <View style={styles.debugContainer}>
                        <Text style={styles.debugText}>Current User Role: {state.role || 'not set'}</Text>
                        <Text style={styles.debugText}>Current Plan Index: {currentPlanIndex}</Text>
                        <Text style={styles.debugText}>Selected Membership: {selectedMembership}</Text>
                    </View>
                )}

                {/* Membership Cards */}
                <View style={styles.membershipCardsContainer}>
                    {membershipPackages.map((pkg, index) => {
                        const isCurrentPlan = currentPlanIndex === index;
                        const isSelected = selectedMembership === index;
                        const isProcessing = processingPackageId === pkg.id;
                        
                        return (
                            <TouchableOpacity
                                key={pkg.id}
                                style={[
                                    styles.membershipCard,
                                    isSelected && styles.selectedMembershipCard,
                                    main_Style.genButtonElevation
                                ]}
                                onPress={() => handleMembershipSelect(index)}
                                activeOpacity={generalActiveOpacity}
                            >
                                {/* Bulb Icon */}
                                <View style={styles.bulbContainer}>
                                    <Ionicons 
                                        name={isSelected ? "bulb" : "bulb-outline"} 
                                        size={24} 
                                        color={isSelected ? pkg.color : withdrawnTitleColor} 
                                    />
                                </View>

                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <View style={styles.currentPlanBadge}>
                                        <Ionicons name="checkmark-circle" size={12} color="#fff" />
                                        <Text style={styles.currentPlanText}>CURRENT</Text>
                                    </View>
                                )}

                                <View style={styles.cardHeader}>
                                    <Image source={pkg.image} style={styles.packageImage} />
                                    <Text style={[styles.packageName, { color: pkg.color }]}>
                                        {pkg.name}
                                    </Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.price}>{pkg.price}</Text>
                                        {pkg.period && <Text style={styles.period}>{pkg.period}</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Plan Benefits & Subscribe Section */}
                <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>
                        {membershipPackages[selectedMembership].name} Features
                    </Text>
                    
                    {membershipPackages[selectedMembership].features.map((feature, idx) => (
                        <View key={idx} style={styles.benefitRow}>
                            <Ionicons 
                                name={selectedMembership === 1 ? "checkmark-circle" : "checkmark-circle-outline"} 
                                size={20} 
                                color={selectedMembership === 1 ? "#49A078" : "#026C7C"} 
                            />
                            <Text style={styles.benefitText}>{feature}</Text>
                        </View>
                    ))}
                    
                    {/* Show drawbacks when viewing free tier and user is premium */}
                    {selectedMembership === 0 && currentPlanIndex === 1 && membershipPackages[0].drawbacks && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.drawbacksTitle}>What you'll lose:</Text>
                            {membershipPackages[0].drawbacks.map((drawback, idx) => (
                                <View key={idx} style={styles.drawbackRow}>
                                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                                    <Text style={styles.drawbackText}>{drawback}</Text>
                                </View>
                            ))}
                        </>
                    )}
                    
                    {/* Show benefits when viewing premium tier and user is free */}
                    {selectedMembership === 1 && currentPlanIndex === 0 && membershipPackages[1].benefits && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.benefitsSubtitle}>Premium Benefits:</Text>
                            {membershipPackages[1].benefits.map((benefit, idx) => (
                                <View key={idx} style={styles.benefitRow}>
                                    <Ionicons name="star" size={20} color="#FFD700" />
                                    <Text style={[styles.benefitText, styles.premiumBenefitText]}>{benefit}</Text>
                                </View>
                            ))}
                        </>
                    )}
                    
                    {selectedMembership === currentPlanIndex ? (
                        <View style={styles.currentPlanIndicator}>
                            <Ionicons name="checkmark-circle" size={20} color="#49A078" />
                            <Text style={{fontSize: generalTextSize, fontFamily: generalTextFont, color: generalTextColor}}>You're currently on this plan</Text>
                        </View>
                    ) : selectedMembership === 1 ? (
                        <TouchableOpacity
                            style={[styles.subscribeButton, main_Style.genButtonElevation]}
                            onPress={() => handleSubscribe(membershipPackages[selectedMembership])}
                            activeOpacity={generalActiveOpacity}
                            disabled={isSubscribing && processingPackageId === membershipPackages[selectedMembership].id}
                        >
                            {isSubscribing && processingPackageId === membershipPackages[selectedMembership].id ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.loadingText}>Processing...</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.buttonIconContainer}>
                                        <Ionicons name="diamond" size={22} color="#fff" />
                                    </View>
                                    <View style={styles.buttonTextContainer}>
                                        <Text style={styles.subscribeButtonTitle}>Upgrade to Contributor</Text>
                                        <Text style={styles.subscribeButtonPrice}>
                                            {membershipPackages[selectedMembership].price}{membershipPackages[selectedMembership].period}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.downgradeButton, main_Style.genButtonElevation]}
                            onPress={() => {
                                Alert.alert(
                                    'Downgrade to Free',
                                    'Are you sure you want to downgrade to the free tier? You will lose access to premium features.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { 
                                            text: 'Downgrade', 
                                            style: 'destructive',
                                            onPress: () => handleSubscribe(membershipPackages[selectedMembership])
                                        }
                                    ]
                                );
                            }}
                            activeOpacity={generalActiveOpacity}
                            disabled={isSubscribing && processingPackageId === membershipPackages[selectedMembership].id}
                        >
                            {isSubscribing && processingPackageId === membershipPackages[selectedMembership].id ? (
                                <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                            ) : (
                                <>
                                    <Ionicons name="arrow-down-circle-outline" size={20} color={MainBrownSecondaryColor} style={{ marginRight: 8 }} />
                                    <Text style={styles.downgradeButtonText}>
                                        Downgrade to Free
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Manage Payment Method Button */}
                <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                        style={[styles.managePaymentButton, main_Style.genButtonElevation]}
                        activeOpacity={generalActiveOpacity}
                        onPress={() => {
                            navigation.navigate('PaymentMethodSettings');
                        }}
                    >
                        <Ionicons name="card-outline" size={18} color={MainBrownSecondaryColor} />
                        <Text style={styles.managePaymentText}>Manage Payment Method</Text>
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={20} />
                
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
        backgroundColor: '#f8f8f8',
    },
    packageImage: {
        width: 50,
        height: 50,
    },
    membershipCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 20,
        gap: 12,
    },
    membershipCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedMembershipCard: {
        borderColor: MainSecondaryBlueColor,
    },
    bulbContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    grayedOutBenefit: {
        opacity: 0.5,
    },
    grayedOutBenefitText: {
        color: withdrawnTitleColor,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: 20,
        backgroundColor: cardBackgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    popularText: {
        color: MainBrownSecondaryColor,
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: generalTextFont,
    },
    currentPlanBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: MainSecondaryBlueColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currentPlanText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        fontFamily: generalTextFont,
    },
    cardHeader: {
        alignItems: 'center',
        marginTop: 8,
    },
    packageName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        fontFamily: generalTitleFont,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    period: {
        fontSize: 12,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginLeft: 2,
    },
    benefitsContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        ...main_Style.genButtonElevation,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 16,
        textAlign: 'center',
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 14,
        color: generalTextColor,
        marginLeft: 12,
        fontFamily: generalTextFont,
        flex: 1,
    },
    subscribeButton: {
        backgroundColor: '#49A078',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        flexDirection: 'row',
        minHeight: 64,
        borderWidth: 2,
        borderColor: '#3d8a5f',
    },
    buttonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    buttonTextContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    subscribeButtonTitle: {
        color: '#fff',
        fontSize: generalTextSize + 1,
        fontWeight: '700',
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    subscribeButtonPrice: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: generalTextSize - 1,
        fontWeight: '500',
        fontFamily: generalTextFont,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: generalTextSize,
        fontWeight: '700',
        fontFamily: generalTitleFont,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        color: '#fff',
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        marginLeft: 8,
    },
    currentPlanIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        gap: 10,
        borderWidth: 2,
        borderColor: '#49A078',
    },
    paymentMethodContainer: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    managePaymentButton: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
    },
    managePaymentText: {
        color: MainBrownSecondaryColor,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    // Journalist Premium Screen Styles
    journalistContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    journalistContent: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    premiumBadge: {
        marginBottom: 24,
    },
    journalistTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: MainSecondaryBlueColor,
        fontFamily: generalTitleFont,
        marginBottom: 12,
    },
    journalistSubtitle: {
        fontSize: 16,
        color: generalTextColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    premiumFeaturesContainer: {
        width: '100%',
        marginBottom: 32,
    },
    premiumFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    premiumFeatureText: {
        fontSize: 15,
        color: generalTextColor,
        fontFamily: generalTextFont,
        marginLeft: 12,
    },
    journalistInfoBox: {
        flexDirection: 'row',
        backgroundColor: secCardBackgroundColor,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
    },
    journalistInfoText: {
        flex: 1,
        fontSize: 13,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    drawbacksTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC2626',
        fontFamily: generalTitleFont,
        marginBottom: 12,
        marginTop: 8,
    },
    drawbacksSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 12,
        marginTop: 8,
    },
    benefitsSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginBottom: 12,
        marginTop: 8,
    },
    drawbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    drawbackText: {
        fontSize: 14,
        color: '#DC2626',
        marginLeft: 12,
        fontFamily: generalTextFont,
        flex: 1,
    },
    premiumBenefitText: {
        color: '#49A078',
        fontWeight: '600',
    },
    downgradeButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: MainBrownSecondaryColor,
    },
    downgradeButtonText: {
        color: MainBrownSecondaryColor,
        fontSize: 17,
        fontWeight: '700',
        fontFamily: generalTitleFont,
    },
    debugContainer: {
        backgroundColor: '#fff3cd',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    debugText: {
        fontSize: 12,
        color: '#856404',
        fontFamily: generalTextFont,
        marginBottom: 4,
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