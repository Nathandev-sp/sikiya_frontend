/**
 * Android In-App Purchase Service
 * Handles subscription management using react-native-iap for Google Play
 * 
 * IMPORTANT: Before using this in production:
 * 1. Set up your products in Google Play Console
 * 2. Create service account and link to Play Console
 * 3. Test with license testers
 * 
 * This service handles:
 * - Purchase initiation (frontend only)
 * - Purchase token collection
 * - Sending purchase data to backend for verification
 * - Restore purchases
 */

import * as RNIap from 'react-native-iap';
import SikiyaAPI from '../../API/SikiyaAPI';

// Product IDs - Load from environment variables
const PRODUCT_IDS = {
    CONTRIBUTOR_MONTHLY: process.env.EXPO_PUBLIC_GOOGLE_PRODUCT_ID || 'com.nathan.sikiya.premium.monthly',
    THOUGHTLEADER_MONTHLY: process.env.EXPO_PUBLIC_GOOGLE_THOUGHTLEADER_PRODUCT_ID || 'com.nathan.sikiya.thoughtleader.monthly',
};

let isInitialized = false;

/**
 * Initialize the IAP connection
 * Call this when your app starts or when entering payment screens
 */
export const initializeIAP = async () => {
    try {
        if (!isInitialized) {
            await RNIap.initConnection();
            isInitialized = true;
            console.log('Android IAP initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Error initializing Android IAP:', error);
        return false;
    }
};

/**
 * Get available subscription products
 * Returns array of product details
 */
export const getAvailableProducts = async () => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        const productIds = Object.values(PRODUCT_IDS);
        const products = await RNIap.fetchProducts({ skus: productIds, type: 'subs' });
        
        console.log('Available products:', products);
        return Array.isArray(products) ? products : [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

/**
 * Get current subscriptions for the user
 * Returns array of active subscriptions
 */
export const getCurrentSubscriptions = async () => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        const purchases = await RNIap.getAvailablePurchases();
        console.log('Current subscriptions:', purchases);
        return purchases;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }
};

/**
 * Internal helper: trigger an Android subscription purchase, then POST the purchase
 * data to the given backend verification endpoint and resolve once verified.
 * @param {string} productId
 * @param {string} verifyEndpoint - e.g. '/subscription/android/verify-purchase'
 */
const purchaseAndVerify = (productId, verifyEndpoint) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!isInitialized) {
                await initializeIAP();
            }

            // Ensure Google Play Billing has loaded the subscription product.
            const subs = await RNIap.fetchProducts({ skus: [productId], type: 'subs' });
            const matched =
                Array.isArray(subs) &&
                subs.find(s => (s.id || s.productId) === productId);
            if (!matched) {
                throw new Error(
                    `Product "${productId}" was not returned by Google Play. ` +
                    `Make sure it exists in Play Console, is active, and the app is signed with the upload key.`
                );
            }
            console.log('Loaded product from Play Store:', matched.id || matched.productId);
            console.log('Attempting to purchase:', productId, '→', verifyEndpoint);

            let purchaseUpdateSubscription;
            let purchaseErrorSubscription;

            const cleanup = () => {
                if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
                if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            };

            purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
                try {
                    console.log('Purchase successful:', purchase);

                    const purchaseToken = purchase.purchaseToken;
                    const orderId = purchase.orderId;

                    if (!purchaseToken) {
                        throw new Error('No purchase token received from purchase');
                    }

                    const response = await SikiyaAPI.post(verifyEndpoint, {
                        purchaseToken,
                        productId,
                        orderId,
                    });

                    if (response.data.success) {
                        console.log('Purchase verified successfully:', response.data);
                        await RNIap.finishTransaction({ purchase, isConsumable: false });
                        cleanup();
                        resolve({
                            success: true,
                            subscription: response.data.subscription,
                            role: response.data.role,
                        });
                    } else {
                        throw new Error('Purchase verification failed');
                    }
                } catch (error) {
                    console.error('Error processing purchase:', error);
                    cleanup();
                    reject(error);
                }
            });

            purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
                console.error('Purchase error:', error);
                cleanup();

                if (error.code === 'E_USER_CANCELLED') {
                    reject(new Error('Purchase cancelled by user'));
                } else if (error.code === 'E_NETWORK_ERROR') {
                    reject(new Error('Network error. Please check your connection.'));
                } else {
                    reject(new Error(error.message || 'Purchase failed'));
                }
            });

            try {
                await RNIap.requestPurchase({
                    request: {
                        google: {
                            skus: [productId],
                            // If you ever need to support multiple base plans/offers,
                            // you'll pass subscriptionOffers here.
                            subscriptionOffers: [],
                        },
                    },
                    type: 'subs',
                });
            } catch (error) {
                cleanup();
                reject(error);
            }
        } catch (error) {
            console.error('Error initiating purchase:', error);
            reject(error);
        }
    });
};

/**
 * Purchase the Contributor subscription on Android.
 * Sends the purchase token to /subscription/android/verify-purchase for verification.
 * On success, the backend flips User_login.role to 'contributor'.
 */
export const purchaseSubscription = async (productId) => {
    return purchaseAndVerify(productId, '/subscription/android/verify-purchase');
};

/**
 * Purchase the Thought Leader subscription on Android.
 * Backend will reject the purchase unless the user's thoughtLeaderApplication.status === 'approved'.
 * On success, the backend flips User_login.role to 'thoughtleader'.
 */
export const purchaseThoughtLeader = async () => {
    return purchaseAndVerify(
        PRODUCT_IDS.THOUGHTLEADER_MONTHLY,
        '/subscription/android/verify-thoughtleader-finalize'
    );
};

/**
 * Restore previous purchases
 * Verifies purchases with backend and reactivates subscription
 */
export const restorePurchases = async () => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        const purchases = await RNIap.getAvailablePurchases();
        console.log('Restored purchases:', purchases);

        if (!purchases || purchases.length === 0) {
            return {
                success: false,
                message: 'No previous purchases found'
            };
        }

        // Extract purchase data from all purchases
        const purchaseData = purchases
            .map(purchase => ({
                purchaseToken: purchase.purchaseToken,
                productId: purchase.productId
            }))
            .filter(p => p.purchaseToken && p.productId);

        if (purchaseData.length === 0) {
            return {
                success: false,
                message: 'No valid purchase data found'
            };
        }

        // Send purchases to backend for verification
        const response = await SikiyaAPI.post('/subscription/android/restore', {
            purchases: purchaseData
        });

        if (response.data.success) {
            console.log('Purchases restored successfully:', response.data);
            return {
                success: true,
                subscription: response.data.subscription,
                role: response.data.role,
                message: response.data.message
            };
        } else {
            throw new Error('Failed to restore purchases');
        }
    } catch (error) {
        console.error('Error restoring purchases:', error);
        throw error;
    }
};

/**
 * Finish a transaction
 * Call this after successfully processing a purchase on your backend
 * @param {Object} purchase - The purchase object to finish
 */
export const finishTransaction = async (purchase) => {
    try {
        await RNIap.finishTransaction(purchase, false);
        console.log('Transaction finished:', purchase.transactionId);
    } catch (error) {
        console.error('Error finishing transaction:', error);
    }
};

/**
 * Clean up IAP connection
 * Call this when leaving payment screens or when app closes
 */
export const endConnection = async () => {
    try {
        if (isInitialized) {
            await RNIap.endConnection();
            isInitialized = false;
            console.log('Android IAP connection ended');
        }
    } catch (error) {
        console.error('Error ending IAP connection:', error);
    }
};

/**
 * Check if user has active subscription
 * @param {string} productId - The product ID to check
 */
export const hasActiveSubscription = async (productId) => {
    try {
        const subscriptions = await getCurrentSubscriptions();
        return subscriptions.some(sub => sub.productId === productId);
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
};

export default {
    initializeIAP,
    getAvailableProducts,
    getCurrentSubscriptions,
    purchaseSubscription,
    purchaseThoughtLeader,
    restorePurchases,
    finishTransaction,
    endConnection,
    hasActiveSubscription,
    PRODUCT_IDS,
};

