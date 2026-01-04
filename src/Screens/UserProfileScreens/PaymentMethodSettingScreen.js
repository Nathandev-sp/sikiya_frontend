import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Linking, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { isIOS, isAndroid } from '../../utils/platformUtils';

// Platform-specific imports - Expo Go compatible
import paymentService from '../../services/paymentServiceExpoGo';
import * as WebBrowser from 'expo-web-browser';

const PaymentMethodSettingScreen = () => {
    // Platform detection
    const platform = Platform.OS;
    
    const [expandedCard, setExpandedCard] = useState(null);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(1);
    
    // iOS: Subscription management state
    const [iosSubscriptionActive, setIosSubscriptionActive] = useState(false);
    const [iosLoading, setIosLoading] = useState(false);
    
    // Android: Payment methods state
    const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);

    // Form states for adding new card (Android only)
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    // Android: Stripe payment methods (initialized empty, will be loaded from Stripe)
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Initialize services on mount - Expo Go compatible
    useEffect(() => {
        const initializeServices = async () => {
            if (isIOS) {
                // Check subscription status via backend
                setIosLoading(true);
                try {
                    const status = await paymentService.checkIOSSubscriptionStatus();
                    setIosSubscriptionActive(status.active || false);
                } catch (error) {
                    console.error('Error checking subscription status:', error);
                } finally {
                    setIosLoading(false);
                }
            } else if (isAndroid) {
                // Load saved payment methods via backend
                loadPaymentMethods();
            }
        };

        initializeServices();
    }, []);

    // Load payment methods for Android via backend
    const loadPaymentMethods = async () => {
        setPaymentMethodsLoading(true);
        try {
            const methods = await paymentService.getAndroidPaymentMethods();
            setPaymentMethods(methods);
        } catch (error) {
            console.error('Error loading payment methods:', error);
            Alert.alert('Error', 'Failed to load payment methods');
        } finally {
            setPaymentMethodsLoading(false);
        }
    };

    // iOS: Handle managing subscription through Apple Settings
    const handleIOSManageSubscription = async () => {
        try {
            // Try to open iOS subscription settings
            await paymentService.openIOSSubscriptionSettings();
        } catch (error) {
            // Fallback: Show instructions
            Alert.alert(
                'Manage Subscription',
                'To manage your subscription and payment method:\n\n1. Open Settings app\n2. Tap your name at the top\n3. Tap Subscriptions\n\nOr visit: Settings > App Store > Subscriptions',
                [{ text: 'OK' }]
            );
        }
    };

    const toggleCard = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    const getCardIcon = (type) => {
        switch(type) {
            case 'visa':
                return 'card-outline';
            case 'mastercard':
                return 'card-outline';
            case 'amex':
                return 'card-outline';
            default:
                return 'card-outline';
        }
    };

    const getCardColor = (type) => {
        switch(type) {
            case 'visa':
                return '#1A1F71';
            case 'mastercard':
                return '#EB001B';
            case 'amex':
                return '#006FCF';
            default:
                return MainBrownSecondaryColor;
        }
    };


    // Android: Handle adding payment method via web portal
    const handleAddPaymentMethod = async () => {
        try {
            // Try to open payment portal directly
            await paymentService.openAndroidPaymentPortal();
            
            // Alternatively, create a payment session and open in browser
            // const sessionUrl = await paymentService.createPaymentSession(599);
            // await WebBrowser.openBrowserAsync(sessionUrl, {
            //     presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            // });
        } catch (error) {
            // Fallback: Show instructions
            Alert.alert(
                'Add Payment Method',
                'To add a payment method, please visit our web portal or contact support.\n\nWe\'ll open the payment portal in your browser.',
                [
                    {
                        text: 'Open Browser',
                        onPress: async () => {
                            try {
                                const sessionUrl = await paymentService.createPaymentSession(599);
                                await WebBrowser.openBrowserAsync(sessionUrl);
                                // Reload payment methods when user returns
                                setTimeout(() => {
                                    loadPaymentMethods();
                                }, 2000);
                            } catch (err) {
                                Alert.alert('Error', 'Could not open payment portal. Please try again later.');
                            }
                        }
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    // Android: Handle deleting payment method via backend
    const handleDeleteCard = async (paymentMethodId) => {
        Alert.alert(
            'Delete Payment Method',
            'Are you sure you want to delete this payment method?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await paymentService.deletePaymentMethod(paymentMethodId);
                            if (success) {
                                // Reload payment methods
                                await loadPaymentMethods();
                                setExpandedCard(null);
                                Alert.alert('Success', 'Payment method deleted');
                            } else {
                                Alert.alert('Error', 'Failed to delete payment method');
                            }
                        } catch (error) {
                            console.error('Error deleting payment method:', error);
                            Alert.alert('Error', 'Failed to delete payment method');
                        }
                    }
                }
            ]
        );
    };

    // Android: Handle setting default payment method via backend
    const handleSetAsDefault = async (paymentMethodId) => {
        Alert.alert(
            'Set as Default',
            'Set this card as your default payment method?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const success = await paymentService.setDefaultPaymentMethod(paymentMethodId);
                            if (success) {
                                setCurrentPaymentMethod(paymentMethodId);
                                await loadPaymentMethods();
                                Alert.alert('Success', 'Default payment method updated');
                            } else {
                                Alert.alert('Error', 'Failed to update default payment method');
                            }
                        } catch (error) {
                            console.error('Error setting default payment method:', error);
                            Alert.alert('Error', 'Failed to update default payment method');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <FontAwesome5 name="credit-card" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Payment Methods</Text>
                    {isIOS && (
                        <View style={styles.platformBadge}>
                            <Ionicons name="logo-apple" size={16} color="#fff" />
                            <Text style={styles.platformBadgeText}>iOS</Text>
                        </View>
                    )}
                    {isAndroid && (
                        <View style={[styles.platformBadge, { backgroundColor: '#635BFF' }]}>
                            <Ionicons name="card" size={16} color="#fff" />
                            <Text style={styles.platformBadgeText}>Android</Text>
                        </View>
                    )}
                </View>

                {/* iOS: Apple Subscription Management */}
                {isIOS && (
                    <>
                        <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                            <View style={styles.iosInfoContainer}>
                                <Ionicons name="information-circle" size={24} color={MainSecondaryBlueColor} />
                                <Text style={styles.iosInfoTitle}>Apple Subscription Management</Text>
                            </View>
                            <Text style={styles.iosInfoText}>
                                For iOS subscriptions, payment methods are managed through your Apple ID. 
                                All subscription payments are processed securely by Apple.
                            </Text>
                            
                            <TouchableOpacity
                                style={[styles.manageSubscriptionButton, main_Style.genButtonElevation]}
                                onPress={handleIOSManageSubscription}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="settings-outline" size={20} color="#fff" />
                                <Text style={styles.manageSubscriptionButtonText}>
                                    Manage Subscription in Settings
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <VerticalSpacer height={20} />
                    </>
                )}

                {/* Android: Stripe Payment Methods */}
                {isAndroid && (
                    <>
                        {/* Current Payment Methods Section */}
                        <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                            <Text style={styles.sectionTitle}>Your Payment Methods</Text>
                            
                            {paymentMethodsLoading ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.loadingText}>Loading payment methods...</Text>
                                </View>
                            ) : paymentMethods.length === 0 ? (
                                <View style={styles.emptyStateContainer}>
                                    <Ionicons name="card-outline" size={48} color={withdrawnTitleColor} />
                                    <Text style={styles.emptyStateText}>No payment methods added</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Add a payment method below to get started
                                    </Text>
                                </View>
                            ) : (
                                paymentMethods.map((method, index) => {
                                    // Handle both old format and Stripe format
                                    const methodId = method.id || method.paymentMethodId;
                                    const cardType = method.type || method.card?.brand || 'card';
                                    const lastFour = method.lastFour || method.card?.last4 || '****';
                                    const expiry = method.expiry || `${method.card?.expMonth || 'MM'}/${method.card?.expYear || 'YY'}`;
                                    const holder = method.holder || method.billing_details?.name || 'Cardholder';
                                    
                                    return (
                                        <View key={methodId}>
                                            <TouchableOpacity 
                                                style={styles.paymentItem}
                                                onPress={() => toggleCard(methodId)}
                                                activeOpacity={generalActiveOpacity}
                                            >
                                                <View style={[styles.iconContainer, { backgroundColor: secCardBackgroundColor }]}>
                                                    <Ionicons 
                                                        name={getCardIcon(cardType)} 
                                                        size={16} 
                                                        color={getCardColor(cardType)} 
                                                    />
                                                </View>
                                                <View style={styles.paymentTextContainer}>
                                                    <Text style={styles.paymentLabel}>
                                                        {cardType.charAt(0).toUpperCase() + cardType.slice(1)} •••• {lastFour}
                                                    </Text>
                                                    <Text style={styles.paymentExpiry}>Expires {expiry}</Text>
                                                    
                                                    {/* Expanded Content */}
                                                    {expandedCard === methodId && (
                                                        <View style={styles.expandedContent}>
                                                            <Text style={styles.cardHolderText}>Cardholder: {holder}</Text>
                                                            
                                                            {currentPaymentMethod === methodId ? (
                                                                <View style={styles.currentBadgeContainer}>
                                                                    <Ionicons name="checkmark-circle" size={16} color="#49A078" />
                                                                    <Text style={styles.currentBadgeText}>Current Payment Method</Text>
                                                                </View>
                                                            ) : (
                                                                <View style={styles.actionButtonsContainer}>
                                                                    <TouchableOpacity 
                                                                        style={styles.setDefaultButton}
                                                                        onPress={() => handleSetAsDefault(methodId)}
                                                                        activeOpacity={generalActiveOpacity}
                                                                    >
                                                                        <Ionicons name="star-outline" size={16} color="#49A078" />
                                                                        <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                                                                    </TouchableOpacity>
                                                                    
                                                                    <TouchableOpacity 
                                                                        style={styles.deleteButton}
                                                                        onPress={() => handleDeleteCard(methodId)}
                                                                        activeOpacity={generalActiveOpacity}
                                                                    >
                                                                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                                                        <Text style={styles.deleteButtonText}>Delete Card</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                                <Ionicons 
                                                    name={expandedCard === methodId ? "chevron-up" : "chevron-down"} 
                                                    size={20} 
                                                    color={withdrawnTitleColor} 
                                                />
                                            </TouchableOpacity>
                                            {index < paymentMethods.length - 1 && <View style={styles.divider} />}
                                        </View>
                                    );
                                })
                            )}
                        </View>

                        <VerticalSpacer height={20} />

                        {/* Add Payment Method Section - Android Only */}
                        <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                            <View style={styles.addPaymentInfoContainer}>
                                <Ionicons name="information-circle" size={20} color={MainSecondaryBlueColor} />
                                <Text style={styles.addPaymentInfoText}>
                                    Add or manage payment methods through our secure web portal
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.addPaymentButton, main_Style.genButtonElevation]} 
                                onPress={handleAddPaymentMethod}
                                activeOpacity={generalActiveOpacity}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                <Text style={styles.addPaymentButtonText}>Open Payment Portal</Text>
                            </TouchableOpacity>
                        </View>
                        
                    </>
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
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        padding: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: generalTextColor,
        marginBottom: 12,
        fontFamily: generalTitleFont,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    paymentTextContainer: {
        flex: 1,
    },
    paymentLabel: {
        fontSize: 12,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
        marginBottom: 2,
    },
    paymentExpiry: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    expandedContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    cardHolderText: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 8,
    },
    currentBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    currentBadgeText: {
        fontSize: 11,
        color: '#49A078',
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: generalTextFont,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    setDefaultButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secCardBackgroundColor,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        flex: 1,
    },
    setDefaultButtonText: {
        fontSize: 11,
        color: '#49A078',
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: generalTextFont,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secCardBackgroundColor,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        flex: 1,
    },
    deleteButtonText: {
        fontSize: 11,
        color: '#DC2626',
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: generalTextFont,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 4,
    },
    addPaymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addPaymentTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    addPaymentForm: {
        marginTop: 12,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: generalTextColor,
        marginBottom: 6,
        fontFamily: generalTextFont,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 13,
        fontFamily: generalTextFont,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    rowInputs: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    // iOS specific styles
    iosInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    iosInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    iosInfoText: {
        fontSize: 14,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
        marginBottom: 20,
    },
    manageSubscriptionButton: {
        backgroundColor: MainSecondaryBlueColor,
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    manageSubscriptionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    platformBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
        marginLeft: 8,
    },
    platformBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: generalTextFont,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginTop: 12,
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 13,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    subscriptionStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    subscriptionStatusText: {
        fontSize: 14,
        color: '#49A078',
        fontWeight: '600',
        fontFamily: generalTextFont,
    },
    restoreButton: {
        backgroundColor: secCardBackgroundColor,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
    },
    restoreButtonText: {
        color: MainBrownSecondaryColor,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    // Android web portal styles
    addPaymentInfoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 8,
        backgroundColor: secCardBackgroundColor,
        padding: 12,
        borderRadius: 8,
    },
    addPaymentInfoText: {
        flex: 1,
        fontSize: 13,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    addPaymentButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addPaymentButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
});

export default PaymentMethodSettingScreen;