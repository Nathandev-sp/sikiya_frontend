import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, Alert, StatusBar, Linking} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, main_Style, mainBrownColor, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, generalSmallTextSize, articleTitleSize, commentTextSize, lightBannerBackgroundColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Context as AuthContext} from '../../Context/AuthContext';
import { useContext } from 'react';
import SikiyaAPI from '../../../API/SikiyaAPI';
import { useLanguage } from '../../Context/LanguageContext';


const MembershipSettingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {state, refreshAuth} = useContext(AuthContext);
    const { t } = useLanguage();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [processingPackageId, setProcessingPackageId] = useState(null);
    const [isApplyingThoughtLeader, setIsApplyingThoughtLeader] = useState(false);
    const [isFinalizingThoughtLeader, setIsFinalizingThoughtLeader] = useState(false);
    const [thoughtLeaderApplication, setThoughtLeaderApplication] = useState(null);

    // Get current user role from AuthContext state
    const currentUserRole = state?.role || 'general'; // Default to 'general' if role not set
    
    // Check if user is journalist
    const isJournalist = currentUserRole === 'journalist';
    
    // Debug: Log the role being used
    console.log('[MembershipScreen] User role from state:', currentUserRole);
    console.log('[MembershipScreen] Full state:', state);

    useEffect(() => {
        const fetchThoughtLeaderApplication = async () => {
            try {
                const response = await SikiyaAPI.get('/user/profile/');
                const app = response?.data?.thoughtLeaderApplication || null;
                setThoughtLeaderApplication(app);
            } catch (error) {
                console.log('[MembershipScreen] Could not fetch thoughtLeaderApplication:', error?.message);
            }
        };

        fetchThoughtLeaderApplication();
    }, [currentUserRole]);

    const handleBackFromUpgradeFlow = () => {
        const returnTab = route?.params?.returnTab;
        if (returnTab) {
            // Walk up to the navigator that owns the bottom tabs (so we can switch tabs reliably)
            let nav = navigation;
            while (nav) {
                const parent = nav.getParent?.();
                if (!parent) break;
                const state = parent.getState?.();
                const canNavigateToTab = Array.isArray(state?.routeNames) && state.routeNames.includes(returnTab);
                if (canNavigateToTab) {
                    parent.navigate(returnTab);
                    return;
                }
                nav = parent;
            }

            // Fallback: try direct navigate (may still work depending on navigator structure)
            navigation.navigate(returnTab);
            return;
        }
        navigation.goBack();
    };

    // Contributor tier details
    const contributorPlan = {
        id: 1,
        name: t('membershipSettings.planName'),
        price: t('membershipSettings.price'),
        period: t('membershipSettings.period'),
        roleKey: 'contributor',
        tagline: t('membershipSettings.tagline'),
        image: require('../../../assets/OnboardingImages/contributorImage.png'),
        color: '#49A078',
        features: [
            {
                icon: 'infinite-outline',
                title: t('membershipSettings.unlimitedVideoAccess'),
                description: t('membershipSettings.unlimitedVideoDescription')
            },
            {
                icon: 'close-circle-outline',
                title: t('membershipSettings.adFreeExperience'),
                description: t('membershipSettings.adFreeDescription')
            },
            {
                icon: 'chatbubble-ellipses-outline',
                title: t('membershipSettings.fullCommentAccess'),
                description: t('membershipSettings.fullCommentDescription')
            },
            {
                icon: 'person-outline',
                title: t('membershipSettings.visibleProfile'),
                description: t('membershipSettings.visibleProfileDescription')
            },
            {
                icon: 'checkmark-circle-outline',
                title: t('membershipSettings.noRestrictions'),
                description: t('membershipSettings.noRestrictionsDescription')
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
                    t('membershipSettings.manageSubscription'),
                    t('membershipSettings.manageSubscriptionMessage'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { 
                            text: t('membershipSettings.openSettings'),
                            onPress: async () => {
                                try {
                                    await Linking.openURL('app-settings:');
                                } catch (err) {
                                    Alert.alert(
                                        t('membership.settings'),
                                        t('membershipSettings.settingsManageInstructions')
                                    );
                                }
                            }
                        }
                    ]
                );
            } catch (error) {
                console.error('Error opening settings:', error);
                Alert.alert(t('common.error'), t('membershipSettings.couldNotOpenSettings'));
            }
        } else if (Platform.OS === 'android') {
            try {
                const androidIAP = require('../../services/androidIAPService').default;
                await androidIAP.initializeIAP();
                
                // Open Google Play subscription management
                Alert.alert(
                    t('membershipSettings.manageSubscription'),
                    t('membershipSettings.manageSubscriptionMessageGoogle'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { 
                            text: t('membershipSettings.openGooglePlay'),
                            onPress: async () => {
                                try {
                                    await Linking.openURL('https://play.google.com/store/account/subscriptions');
                                } catch (err) {
                                    Alert.alert(t('common.error'), t('membershipSettings.couldNotOpenGooglePlay'));
                                }
                            }
                        }
                    ]
                );
            } catch (error) {
                console.error('Error opening Play Store:', error);
                Alert.alert(t('common.error'), t('membershipSettings.couldNotOpenSettings'));
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
                        t('membershipSettings.purchasesRestored'),
                        t('membershipSettings.subscriptionRestoredSuccess'),
                        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
                    );
                } else {
                    Alert.alert(t('membershipSettings.noPurchasesFound'), result.message || t('membershipSettings.noPreviousPurchases'));
                }
            } else {
                Alert.alert(t('membershipSettings.notAvailable'), t('membershipSettings.restoreOnlyMobile'));
            }
        } catch (error) {
            console.error('Error restoring purchases:', error);
            Alert.alert(t('common.error'), error.message || t('common.tryAgain'));
        } finally {
            setIsSubscribing(false);
        }
    };

    // Subscription handler - upgrade to contributor
    const handleSubscribe = async () => {
        const isTrial = Boolean(state?.isOnTrial) && (Number(state?.daysRemaining ?? 0) > 0);

        // If user is already a paid contributor, take them to subscription management instead of blocking.
        // Trial contributors should still be allowed to purchase (this screen is the upsell surface).
        if (currentUserRole === 'contributor' && !isTrial) {
            await handleManageSubscription();
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
                        try { await refreshAuth(); } catch (e) { /* non-fatal */ }
                        Alert.alert(
                            t('membershipSettings.subscriptionActivated'),
                            t('membershipSettings.subscriptionActivatedMessage'),
                            [
                                {
                                    text: t('common.ok'),
                                    onPress: () => {
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('iOS purchase error:', error);
                    Alert.alert(
                        t('membershipSettings.purchaseFailed'),
                        error.message || t('membershipSettings.purchaseFailedMessage')
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
                        try { await refreshAuth(); } catch (e) { /* non-fatal */ }
                        Alert.alert(
                            t('membershipSettings.subscriptionActivated'),
                            t('membershipSettings.subscriptionActivatedMessage'),
                            [
                                {
                                    text: t('common.ok'),
                                    onPress: () => {
                                        navigation.goBack();
                                    }
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Android purchase error:', error);
                    Alert.alert(
                        t('membershipSettings.purchaseFailed'),
                        error.message || t('membershipSettings.purchaseFailedMessage')
                    );
                } finally {
                    setProcessingPackageId(null);
                    setIsSubscribing(false);
                }
                return;
            } else {
                // Unsupported platform
                Alert.alert(
                    t('membershipSettings.notAvailable'),
                    t('membershipSettings.subscriptionsOnlyMobile'),
                    [{ text: t('common.ok') }]
                );
                setProcessingPackageId(null);
                setIsSubscribing(false);
            }
        } catch (error) {
            console.error('Subscription failed:', error);
            Alert.alert(t('common.error'), t('membershipSettings.failedToStartSubscription'));
            setProcessingPackageId(null);
            setIsSubscribing(false);
        }
    };

    // Check if user is contributor
    const isContributor = currentUserRole === 'contributor';
    const isTrial = Boolean(state?.isOnTrial) && (Number(state?.daysRemaining ?? 0) > 0);
    // Trial users may temporarily have `role=contributor`, but this screen should upsell like a free user.
    const isContributorForUI = isContributor && !isTrial;

    const handleUpgradeToThoughtLeader = async () => {
        setIsApplyingThoughtLeader(true);
        try {
            const response = await SikiyaAPI.post('/subscription/thoughtleader/apply');
            if (response?.data?.success) {
                // Update local state so UI switches immediately
                setThoughtLeaderApplication(response?.data?.application || { status: 'pending' });
                Alert.alert(
                    'Thought Leader',
                    'You have been added to the pending Thought Leaders list for review.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Thought Leader', response?.data?.message || 'Request submitted.');
            }
        } catch (error) {
            console.error('Thought leader apply error:', error?.response?.data || error?.message || error);
            Alert.alert(
                'Thought Leader',
                error?.response?.data?.error || error?.message || 'Could not submit request. Please try again.'
            );
        } finally {
            setIsApplyingThoughtLeader(false);
        }
    };

    // Finalize Thought Leader access by purchasing the subscription.
    // Backend will reject the receipt unless the user's application is admin-approved.
    const handleFinalizeThoughtLeader = async () => {
        setIsFinalizingThoughtLeader(true);
        try {
            if (Platform.OS === 'ios') {
                const iosIAP = require('../../services/iosIAPService').default;
                await iosIAP.initializeIAP();
                const result = await iosIAP.purchaseThoughtLeader();

                if (result?.success) {
                    try { await refreshAuth(); } catch (e) { /* non-fatal */ }
                    Alert.alert(
                        'Thought Leader',
                        'Your subscription is active. Welcome to Thought Leader access!',
                        [
                            {
                                text: t('common.ok'),
                                onPress: () => navigation.goBack(),
                            },
                        ]
                    );
                }
            } else if (Platform.OS === 'android') {
                const androidIAP = require('../../services/androidIAPService').default;
                await androidIAP.initializeIAP();
                const result = await androidIAP.purchaseThoughtLeader();

                if (result?.success) {
                    try { await refreshAuth(); } catch (e) { /* non-fatal */ }
                    Alert.alert(
                        'Thought Leader',
                        'Your subscription is active. Welcome to Thought Leader access!',
                        [
                            {
                                text: t('common.ok'),
                                onPress: () => navigation.goBack(),
                            },
                        ]
                    );
                }
            } else {
                Alert.alert(
                    t('membershipSettings.notAvailable'),
                    t('membershipSettings.subscriptionsOnlyMobile')
                );
            }
        } catch (error) {
            console.error('Thought leader finalize error:', error?.response?.data || error?.message || error);
            Alert.alert(
                t('membershipSettings.purchaseFailed'),
                error?.response?.data?.error || error?.message || t('membershipSettings.purchaseFailedMessage')
            );
        } finally {
            setIsFinalizingThoughtLeader(false);
        }
    };

    const thoughtLeaderStatus = thoughtLeaderApplication?.status || 'none';
    const hasThoughtLeaderWorkflowCard =
        thoughtLeaderStatus === 'pending' ||
        thoughtLeaderStatus === 'approved' ||
        thoughtLeaderStatus === 'rejected' ||
        currentUserRole === 'thoughtleader';

    const renderThoughtLeaderWorkflowCard = () => {
        // NOTE:
        // - 'approved' means approved by admins, but user still needs to finalize payment.
        // - 'active' is treated as fully thought leader (role=thoughtleader).
        const status = currentUserRole === 'thoughtleader' ? 'active' : thoughtLeaderStatus;
        const reason = thoughtLeaderApplication?.rejection_reason || '';

        const badgeLabel =
            status === 'pending'
                ? 'Pending'
                : status === 'approved'
                  ? 'Approved'
                  : status === 'active'
                    ? 'Verified'
                    : 'Rejected';

        const badgeStyle =
            status === 'pending'
                ? styles.tlBadgePending
                : status === 'approved'
                  ? styles.tlBadgeApproved
                  : status === 'active'
                    ? styles.tlBadgeApproved
                    : styles.tlBadgeRejected;

        const badgeTextStyle =
            status === 'pending'
                ? styles.tlBadgeTextPending
                : status === 'approved'
                  ? styles.tlBadgeTextApproved
                  : status === 'active'
                    ? styles.tlBadgeTextApproved
                    : styles.tlBadgeTextRejected;

        return (
            <View style={[styles.thoughtLeaderCard, main_Style.genButtonElevation]}>
                {status === 'active' && (
                    <View style={styles.tlVerifiedCornerBadge} pointerEvents="none">
                        <Text style={styles.tlVerifiedCornerBadgeText}>VERIFIED</Text>
                    </View>
                )}
                <View style={styles.tlStatusHeaderRow}>
                    <View style={styles.thoughtLeaderHeader}>
                        <View style={[styles.thoughtLeaderBadge, status === 'active' && styles.tlMedalBadge]}>
                            <Ionicons name="ribbon" size={status === 'active' ? 26 : 22} color="#fff" />
                        </View>
                        <View style={styles.thoughtLeaderHeaderText}>
                            <Text style={styles.thoughtLeaderTitle}>
                                {status === 'active' ? 'Thought Leader' : 'Thought Leader application'}
                            </Text>
                            {status === 'pending' && (
                                <View style={styles.tlPendingBox}>
                                    <Text style={styles.tlPendingTitle}>Your action</Text>
                                    <View style={styles.tlPendingRow}>
                                        <Ionicons name="mail-outline" size={16} color="#4C1D95" />
                                        <Text style={styles.tlPendingText}>
                                            Send us your ID document at{' '}
                                            <Text style={styles.tlPendingEmail}>support@sikiya.org</Text>
                                        </Text>
                                    </View>
                                    <View style={styles.tlPendingDivider} />
                                    <Text style={styles.tlPendingFootnote}>
                                        Once your ID is verified, we will review your eligibility and send a decision email.
                                    </Text>
                                </View>
                            )}
                            {status === 'approved' && (
                                <Text style={styles.thoughtLeaderSubtitle}>
                                    You just need to finalize your payment to gain Thought Leader access.
                                </Text>
                            )}
                            {status === 'active' && (
                                <Text style={styles.thoughtLeaderSubtitle}>
                                    Your insights are recognized and highlighted across discussions.
                                </Text>
                            )}
                            {status === 'rejected' && (
                                <Text style={styles.thoughtLeaderSubtitle}>
                                    Your application was not approved.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {(status === 'active' || status === 'approved') && (
                    <View style={styles.tlBenefitsSection}>
                        <Text style={styles.tlBenefitsTitle}>Includes</Text>
                        <View style={styles.tlBenefitsList}>
                            <View style={styles.tlBenefitRow}>
                                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#4C1D95" />
                                <Text style={styles.tlBenefitText}>Comment directly on articles as an expert</Text>
                            </View>
                            <View style={styles.tlBenefitRow}>
                                <Ionicons name="trending-up-outline" size={16} color="#4C1D95" />
                                <Text style={styles.tlBenefitText}>Priority visibility in discussions</Text>
                            </View>
                            <View style={styles.tlBenefitRow}>
                                <Ionicons name="ribbon-outline" size={16} color="#4C1D95" />
                                <Text style={styles.tlBenefitText}>Verified Thought Leader badge</Text>
                            </View>
                        </View>
                    </View>
                )}

                {status === 'rejected' && (
                    <View style={styles.tlReasonBox}>
                        <Text style={styles.tlReasonTitle}>Reason</Text>
                        <Text style={styles.tlReasonText}>
                            {reason || 'No reason provided.'}
                        </Text>
                        <Text style={styles.tlRejectedFooter}>
                            Please try again later. Thank you for your intentions to join the list of Sikiya Experts.
                        </Text>
                    </View>
                )}

                {status === 'approved' && (
                    <TouchableOpacity
                        style={styles.tlPrimaryCta}
                        onPress={handleFinalizeThoughtLeader}
                        activeOpacity={generalActiveOpacity}
                        disabled={isFinalizingThoughtLeader}
                    >
                        {isFinalizingThoughtLeader ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.tlPrimaryCtaText}>Processing</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.tlPrimaryCtaText}>Change subscription to finalize</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Status badge belongs at the bottom (except VERIFIED which is shown in the corner) */}
                {status !== 'active' && (
                    <View style={styles.tlStatusRow}>
                        <View style={[styles.tlStatusBadge, badgeStyle]}>
                            <Text style={[styles.tlStatusBadgeText, badgeTextStyle]}>{badgeLabel}</Text>
                        </View>
                    </View>
                )}

            </View>
        );
    };

    // Journalist Premium Access Screen
    if (isJournalist) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton onPress={handleBackFromUpgradeFlow} />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={settingsStyles.headerSection}>
                        <Ionicons name="shield-checkmark" style={settingsStyles.headerIcon} />
                        <Text style={settingsStyles.headerTitle}>{t('membershipSettings.journalistAccess')}</Text>
                    </View>

                    {/* Hero + features: one fused card */}
                    <View style={[styles.journalistCombinedCard, main_Style.genButtonElevation]}>
                        <View style={[styles.heroCard, styles.journalistHeroCard, styles.journalistCombinedHero]}>
                            <View style={styles.journalistBadgeContainer}>
                                <Ionicons name="shield-checkmark" size={50} color="#fff" />
                            </View>
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>{t('membershipSettings.verifiedJournalist')}</Text>
                                <Text style={[styles.heroTagline, styles.journalistHeroTagline]}>{t('membershipSettings.journalistPremiumHeroSubtitle')}</Text>
                                <View style={styles.journalistComplimentaryBadge}>
                                    <Text style={styles.journalistComplimentaryBadgeText}>{t('membershipSettings.complimentary')}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.featuresContainer, styles.journalistCombinedFeatures]}>
                            <Text style={styles.sectionTitle}>{t('membershipSettings.premiumFeaturesIncluded')}</Text>

                            {contributorPlan.features.map((feature, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <View style={[styles.featureIconContainer, styles.journalistFeatureIcon]}>
                                        <Ionicons
                                            name={feature.icon}
                                            size={24}
                                            color="#084C5F"
                                        />
                                    </View>
                                    <View style={styles.featureTextContainer}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureDescription}>{feature.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <VerticalSpacer height={36} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Thought Leader / Applicant screen (separate variant)
    if (hasThoughtLeaderWorkflowCard) {
        const isVerifiedThoughtLeader = currentUserRole === 'thoughtleader';
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={"dark-content"} />
                <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <GoBackButton onPress={handleBackFromUpgradeFlow} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={settingsStyles.headerSection}>
                        <Ionicons name="ribbon-outline" style={settingsStyles.headerIcon} />
                        <Text style={settingsStyles.headerTitle}>
                            {isVerifiedThoughtLeader ? "You're a Thought Leader" : 'Thought Leader Status'}
                        </Text>
                    </View>

                    <View style={styles.actionContainer}>
                        {/* Thought leader status card on top */}
                        {renderThoughtLeaderWorkflowCard()}

                        <VerticalSpacer height={16} />

                        {/* Manage subscription at the bottom */}
                        <TouchableOpacity
                            style={[styles.manageButton, main_Style.genButtonElevation]}
                            onPress={handleManageSubscription}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="settings-outline" size={20} color={withdrawnTitleColor} />
                            <Text style={styles.manageButtonText}>{t('membershipSettings.manageSubscription')}</Text>
                        </TouchableOpacity>

                        <Text style={styles.manageHelper}>
                            {Platform.OS === 'ios' ? t('membershipSettings.manageViaApple') : t('membershipSettings.manageViaGoogle')}
                        </Text>
                    </View>

                    <VerticalSpacer height={4} />

                    {/* Restore Purchases Button (iOS/Android only) */}
                    {(Platform.OS === 'ios' || Platform.OS === 'android') && (
                        <View style={styles.restoreContainer}>
                            <TouchableOpacity
                                style={styles.restoreButton}
                                onPress={handleRestorePurchases}
                                disabled={isSubscribing || isApplyingThoughtLeader}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="refresh-outline" size={18} color={MainBrownSecondaryColor} />
                                <Text style={styles.restoreButtonText}>{t('membershipSettings.restorePurchases')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.restoreHelperText}>
                                {t('membershipSettings.restorePurchasesDescription')}
                            </Text>
                        </View>
                    )}

                    <VerticalSpacer height={30} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton onPress={handleBackFromUpgradeFlow} />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="diamond-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('membershipSettings.planName')}</Text>
                </View>

                {/* Hero Card with Image */}
                <View style={[styles.heroCard, main_Style.genButtonElevation]}>
                    <Image 
                        source={contributorPlan.image} 
                        style={styles.heroImage} 
                    />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{contributorPlan.name}</Text>
                        {!isContributorForUI ? (
                            <>
                                <Text style={styles.heroTagline}>{contributorPlan.tagline}</Text>
                                <View style={styles.heroPriceContainer}>
                                    <Text style={styles.heroPrice}>{contributorPlan.price}</Text>
                                    <Text style={styles.heroPeriod}>{contributorPlan.period}</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.contributorInlineStatus}>
                                    <Text style={styles.contributorInlineStatusText}>Sikiya Contributor</Text>
                                    <View style={styles.contributorInlineDivider} />
                                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                    <Text style={styles.contributorInlineStatusText}>Active</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <VerticalSpacer height={0} />

                {/* Features Section */}
                <View style={[styles.featuresContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>{t('membershipSettings.premiumFeaturesIncluded')}</Text>
                    
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
                {!isContributorForUI ? (
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
                                    <Text style={styles.upgradeButtonText}>{t('membershipSettings.processing')}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.upgradeIconContainer}>
                                        <Ionicons name="diamond" size={24} color="#fff" />
                                    </View>
                                    <View style={styles.upgradeTextContainer}>
                                        <Text style={styles.upgradeButtonTitle}>Unlock Contributor</Text>
                                        
                                    </View>
                                    <Ionicons name="arrow-forward" size={22} color={AppScreenBackgroundColor} />
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <Text style={styles.upgradeHelper}>
                            {Platform.OS === 'ios' ? t('membershipSettings.securePaymentApple') : t('membershipSettings.securePaymentGoogle')}
                        </Text>

                        <View style={styles.tierDividerRow}>
                            <View style={styles.tierDividerLine} />
                            <Text style={styles.tierDividerText}>Go further</Text>
                            <View style={styles.tierDividerLine} />
                        </View>

                        {/* Thought Leader marketing card (only for non-applicants) */}
                        <View style={[styles.thoughtLeaderCard, main_Style.genButtonElevation]}>
                            <View style={styles.thoughtLeaderHeader}>
                                <View style={styles.thoughtLeaderBadge}>
                                    <Ionicons name="ribbon-outline" size={22} color="#fff" />
                                </View>
                                <View style={styles.thoughtLeaderHeaderText}>
                                    <Text style={styles.thoughtLeaderTitle}>Thought Leader Access</Text>
                                    <Text style={styles.thoughtLeaderSubtitle}>Share expert insights. Shape the conversation.</Text>
                                </View>
                            </View>

                            <View style={styles.thoughtLeaderPriceRow}>
                                <Text style={styles.thoughtLeaderPrice}>$9.99</Text>
                                <Text style={styles.thoughtLeaderPeriod}>/ month</Text>
                            </View>

                            <View style={styles.thoughtLeaderDivider} />

                            <Text style={styles.thoughtLeaderSectionTitle}>Includes</Text>
                            <View style={styles.thoughtLeaderBulletList}>
                                <Text style={styles.thoughtLeaderBullet}>• Comment directly on articles as an expert</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Priority visibility in discussions</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Verified Thought Leader badge</Text>
                            </View>

                            <Text style={styles.thoughtLeaderSectionTitle}>Ideal for</Text>
                            <View style={styles.thoughtLeaderBulletList}>
                                <Text style={styles.thoughtLeaderBullet}>• Industry experts</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Analysts &amp; researchers</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Qualified podcasters</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Journalists with strong opinions</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Policy commentators</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Academics &amp; specialists</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.thoughtLeaderSecondaryButton}
                                onPress={handleUpgradeToThoughtLeader}
                                activeOpacity={generalActiveOpacity}
                                disabled={isApplyingThoughtLeader}
                            >
                                {isApplyingThoughtLeader ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#6D28D9" />
                                        <Text style={styles.thoughtLeaderSecondaryButtonText}>Processing</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.thoughtLeaderSecondaryButtonText}>Get Thought Leader Access</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#6D28D9" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Contributor - Show manage button
                    <View style={styles.actionContainer}>
                        {/* Thought Leader marketing card for contributors (only for non-applicants) */}
                        <View style={[styles.thoughtLeaderCard, main_Style.genButtonElevation]}>
                            <View style={styles.thoughtLeaderHeader}>
                                <View style={styles.thoughtLeaderBadge}>
                                    <Ionicons name="ribbon-outline" size={22} color="#fff" />
                                </View>
                                <View style={styles.thoughtLeaderHeaderText}>
                                    <Text style={styles.thoughtLeaderTitle}>Thought Leader Access</Text>
                                    <Text style={styles.thoughtLeaderSubtitle}>Share expert insights. Shape the conversation.</Text>
                                </View>
                            </View>

                            <View style={styles.thoughtLeaderPriceRow}>
                                <Text style={styles.thoughtLeaderPrice}>$9.99</Text>
                                <Text style={styles.thoughtLeaderPeriod}>/ month</Text>
                            </View>

                            <View style={styles.thoughtLeaderDivider} />

                            <Text style={styles.thoughtLeaderSectionTitle}>Includes</Text>
                            <View style={styles.thoughtLeaderBulletList}>
                                <Text style={styles.thoughtLeaderBullet}>• Comment directly on articles as an expert</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Priority visibility in discussions</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Verified Thought Leader badge</Text>
                            </View>

                            <Text style={styles.thoughtLeaderSectionTitle}>Ideal for</Text>
                            <View style={styles.thoughtLeaderBulletList}>
                                <Text style={styles.thoughtLeaderBullet}>• Industry experts</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Analysts &amp; researchers</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Qualified podcasters</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Journalists with strong opinions</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Policy commentators</Text>
                                <Text style={styles.thoughtLeaderBullet}>• Academics &amp; specialists</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.thoughtLeaderButton}
                                onPress={handleUpgradeToThoughtLeader}
                                activeOpacity={generalActiveOpacity}
                                disabled={isApplyingThoughtLeader}
                            >
                                {isApplyingThoughtLeader ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={styles.thoughtLeaderButtonText}>Processing</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.thoughtLeaderButtonText}>Upgrade to Thought Leader</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        <VerticalSpacer height={16} />
                        
                        <TouchableOpacity
                            style={[styles.manageButton, main_Style.genButtonElevation]}
                            onPress={handleManageSubscription}
                            activeOpacity={generalActiveOpacity}
                        >
                            <Ionicons name="settings-outline" size={20} color={withdrawnTitleColor} />
                            <Text style={styles.manageButtonText}>{t('membershipSettings.manageSubscription')}</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.manageHelper}>
                            {Platform.OS === 'ios' ? t('membershipSettings.manageViaApple') : t('membershipSettings.manageViaGoogle')}
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
                            <Text style={styles.restoreButtonText}>{t('membershipSettings.restorePurchases')}</Text>
                        </TouchableOpacity>
                        <Text style={styles.restoreHelperText}>
                            {t('membershipSettings.restorePurchasesDescription')}
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
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        //borderRadius: 12,
        padding: 8,
        marginHorizontal: 16,
        marginTop: 12,
        overflow: 'hidden',
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    heroImage: {
        width: '100%',
        height: 60,
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
        marginBottom: 8,
    },
    heroSubTagline: {
        fontSize: generalSmallTextSize + 1,
        color: 'rgba(255,255,255,0.92)',
        fontFamily: generalTextFont,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: -2,
        marginBottom: 8,
    },
    contributorInlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.22)',
        marginTop: 4,
    },
    contributorInlineStatusText: {
        fontSize: generalSmallTextSize,
        color: 'rgba(255,255,255,0.96)',
        fontFamily: generalTitleFont,
        fontWeight: '600',
    },
    contributorInlineDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.22)',
        marginHorizontal: 2,
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
        backgroundColor: cardBackgroundColor,
        //borderRadius: 12,
        marginHorizontal: 17,
        padding: 16,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        borderBottomRightRadius: 12,
        borderBottomLeftRadius: 12,
    },
    sectionTitle: {
        fontSize: articleTitleSize,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
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
        backgroundColor: '#49A078',
        borderRadius: 12,
        padding: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        //borderWidth: 1,
        //borderColor: '#3d8a5f',
    },
    upgradeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        color: AppScreenBackgroundColor,
        fontFamily: generalTitleFont,
        marginBottom: 0,
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
    tierDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 18,
        marginBottom: 12,
        paddingHorizontal: 6,
    },
    tierDividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.10)',
    },
    tierDividerText: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    // Active Subscription Card (for contributors)
    activeSubscriptionCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderColor: '#49A078',
    },
    activeTitle: {
        fontSize: articleTitleSize,
        fontWeight: 'bold',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginTop: 4,
        marginBottom: 4,
    },
    activeDescription: {
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
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
    thoughtLeaderCard: {
        backgroundColor: '#F4F1FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    thoughtLeaderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    thoughtLeaderBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7C3AED',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    thoughtLeaderHeaderText: {
        flex: 1,
    },
    thoughtLeaderTitle: {
        fontSize: articleTitleSize,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 2,
    },
    thoughtLeaderSubtitle: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    thoughtLeaderPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    thoughtLeaderPrice: {
        fontSize: articleTitleSize + 10,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    thoughtLeaderPeriod: {
        fontSize: generalSmallTextSize + 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginLeft: 6,
    },
    thoughtLeaderDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.08)',
        marginBottom: 12,
    },
    thoughtLeaderSectionTitle: {
        fontSize: commentTextSize,
        fontWeight: '700',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 8,
    },
    thoughtLeaderBulletList: {
        gap: 6,
        marginBottom: 16,
    },
    thoughtLeaderBullet: {
        fontSize: generalSmallTextSize + 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    thoughtLeaderButton: {
        backgroundColor: '#6D28D9',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    thoughtLeaderButtonText: {
        fontSize: commentTextSize,
        fontWeight: '700',
        color: '#fff',
        fontFamily: generalTitleFont,
    },
    thoughtLeaderSecondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.45)',
    },
    thoughtLeaderSecondaryButtonText: {
        fontSize: commentTextSize,
        fontWeight: '700',
        color: '#6D28D9',
        fontFamily: generalTitleFont,
    },
    tlStatusHeaderRow: {
        marginBottom: 6,
    },
    tlStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    tlStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    tlStatusBadgeText: {
        fontSize: generalSmallTextSize,
        fontFamily: generalTitleFont,
        fontWeight: '800',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    tlBadgePending: {
        backgroundColor: 'rgba(109, 40, 217, 0.10)',
        borderColor: 'rgba(109, 40, 217, 0.25)',
    },
    tlBadgeTextPending: {
        color: '#4C1D95',
    },
    tlBadgeApproved: {
        backgroundColor: 'rgba(73, 160, 120, 0.10)',
        borderColor: 'rgba(73, 160, 120, 0.25)',
    },
    tlBadgeTextApproved: {
        color: '#166534',
    },
    tlBadgeRejected: {
        backgroundColor: 'rgba(220, 38, 38, 0.10)',
        borderColor: 'rgba(220, 38, 38, 0.25)',
    },
    tlBadgeTextRejected: {
        color: '#991B1B',
    },
    tlReasonBox: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(220, 38, 38, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.14)',
    },
    tlReasonTitle: {
        fontSize: commentTextSize,
        fontWeight: '800',
        color: '#7F1D1D',
        fontFamily: generalTitleFont,
        marginBottom: 6,
    },
    tlReasonText: {
        fontSize: generalSmallTextSize + 1,
        color: '#7F1D1D',
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    tlRejectedFooter: {
        marginTop: 10,
        fontSize: generalSmallTextSize,
        color: '#7F1D1D',
        fontFamily: generalTextFont,
        lineHeight: 18,
        opacity: 0.95,
    },
    tlPrimaryCta: {
        backgroundColor: '#6D28D9',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.22)',
        shadowColor: '#6D28D9',
        shadowOpacity: 0.22,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
        marginTop: 8,
        marginBottom: 10,
    },
    tlPrimaryCtaText: {
        fontSize: commentTextSize,
        fontWeight: '800',
        color: '#fff',
        fontFamily: generalTitleFont,
        letterSpacing: 0.2,
    },
    tlVerifiedCornerBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(73, 160, 120, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(73, 160, 120, 0.26)',
    },
    tlVerifiedCornerBadgeText: {
        fontSize: 10,
        fontFamily: generalTitleFont,
        fontWeight: '900',
        color: '#166534',
        letterSpacing: 1,
    },
    tlMedalBadge: {
        width: 46,
        height: 46,
        borderRadius: 23,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    tlPendingBox: {
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(109, 40, 217, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(109, 40, 217, 0.14)',
    },
    tlPendingTitle: {
        fontSize: 12,
        fontFamily: generalTitleFont,
        fontWeight: '900',
        color: '#4C1D95',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    tlPendingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tlPendingText: {
        flex: 1,
        fontSize: generalSmallTextSize + 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    tlPendingEmail: {
        color: '#4C1D95',
        fontFamily: generalTitleFont,
        fontWeight: '800',
    },
    tlPendingDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(109, 40, 217, 0.18)',
        marginVertical: 10,
    },
    tlPendingFootnote: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
        opacity: 0.95,
    },
    // (Removed inline pending pill + progress hint)
    tlBenefitsSection: {
        marginTop: 2,
        marginBottom: 10,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    tlBenefitsTitle: {
        fontSize: commentTextSize,
        fontWeight: '800',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginBottom: 8,
    },
    tlBenefitsList: {
        gap: 8,
    },
    tlBenefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tlBenefitText: {
        flex: 1,
        fontSize: generalSmallTextSize + 1,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    // (Removed next-step buttons for now)
    // Loading States
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    // Journalist Premium Screen Styles
    journalistCombinedCard: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    journalistCombinedHero: {
        marginHorizontal: 0,
        marginTop: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    journalistCombinedFeatures: {
        marginHorizontal: 0,
        marginTop: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    journalistHeroCard: {
        backgroundColor: '#0E7490',
    },
    journalistHeroTagline: {
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.95,
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    journalistBadgeContainer: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
    },
    journalistComplimentaryBadge: {
        alignSelf: 'center',
        marginTop: 14,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    journalistComplimentaryBadgeText: {
        fontSize: generalSmallTextSize + 1,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.95)',
        fontFamily: generalTitleFont,
        letterSpacing: 0.2,
    },
    journalistFeatureIcon: {
        backgroundColor: 'rgba(14, 116, 144, 0.14)',
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