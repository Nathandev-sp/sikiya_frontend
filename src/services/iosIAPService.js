/**
 * iOS In-App Purchase Service
 * Handles subscription management using react-native-iap
 * 
 * IMPORTANT: Before using this in production:
 * 1. Set up your products in App Store Connect
 * 2. Configure your subscription groups
 * 3. Test with sandbox accounts
 * 
 * This service handles:
 * - Purchase initiation (frontend only)
 * - Receipt collection
 * - Sending receipts to backend for verification
 * - Restore purchases
 */

import * as RNIap from 'react-native-iap';
import SikiyaAPI from '../../API/SikiyaAPI';

// Product IDs - Load from environment variables
// Format: 'com.yourcompany.app.productname'
export const PRODUCT_IDS = {
    CONTRIBUTOR_MONTHLY: process.env.EXPO_PUBLIC_APPLE_PRODUCT_ID || 'com.nathan.sikiya.premium.monthly',
    THOUGHTLEADER_MONTHLY: process.env.EXPO_PUBLIC_APPLE_THOUGHTLEADER_PRODUCT_ID || 'com.nathan.sikiya.thoughtleader.monthly',
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
            console.log('IAP initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Error initializing IAP:', error);
        return false;
    }
};

/**
 * Get available subscription products from StoreKit.
 * IMPORTANT: react-native-iap v14 requires this to be called BEFORE
 * any requestSubscription/requestPurchase call, otherwise StoreKit
 * throws "Missing purchase request configuration".
 *
 * @param {string[]} [skus] - Optional explicit list of SKUs to fetch.
 *                            Defaults to all known PRODUCT_IDS.
 */
export const getAvailableProducts = async (skus) => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        const productIds = Array.isArray(skus) && skus.length > 0
            ? skus
            : Object.values(PRODUCT_IDS);

        // react-native-iap@14.7.0 API: use fetchProducts for subscriptions.
        const subscriptions = await RNIap.fetchProducts({ skus: productIds, type: 'subs' });
        console.log(
            'Available subscriptions:',
            Array.isArray(subscriptions) ? subscriptions.map(s => s.id || s.productId) : subscriptions
        );
        return Array.isArray(subscriptions) ? subscriptions : [];
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
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

        const subscriptions = await RNIap.getAvailablePurchases();
        console.log('Current subscriptions:', subscriptions);
        return subscriptions;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }
};

/**
 * Internal helper: trigger an iOS subscription purchase, then POST the receipt
 * to the given backend verification endpoint and resolve once verified.
 * @param {string} productId
 * @param {string} verifyEndpoint - e.g. '/subscription/ios/verify-receipt'
 */
const purchaseAndVerify = (productId, verifyEndpoint) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!isInitialized) {
                await initializeIAP();
            }

            // Ensure StoreKit has loaded the product before requesting purchase.
            const subs = await RNIap.fetchProducts({ skus: [productId], type: 'subs' });
            const matched =
                Array.isArray(subs) &&
                subs.find(s => (s.id || s.productId) === productId);
            if (!matched) {
                throw new Error(
                    `Product "${productId}" was not returned by App Store. ` +
                    `Make sure it exists in App Store Connect, is attached to a subscription group, ` +
                    `and is in the "Ready to Submit" state.`
                );
            }
            console.log('Loaded product from StoreKit:', matched.id || matched.productId);
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

                    const receipt = purchase.transactionReceipt;
                    if (!receipt) {
                        throw new Error('No receipt data received from purchase');
                    }

                    const response = await SikiyaAPI.post(verifyEndpoint, {
                        receiptData: receipt,
                        transactionId: purchase.transactionId || purchase.id,
                    });

                    if (response.data.success) {
                        console.log('Receipt verified successfully:', response.data);
                        await RNIap.finishTransaction({ purchase, isConsumable: false });
                        cleanup();
                        resolve({
                            success: true,
                            subscription: response.data.subscription,
                            role: response.data.role,
                        });
                    } else {
                        throw new Error('Receipt verification failed');
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
                // react-native-iap@14.7.0 API: requestPurchase with the unified request object.
                await RNIap.requestPurchase({
                    request: {
                        apple: {
                            sku: productId,
                            // Important: we finishTransaction after backend verification
                            andDangerouslyFinishTransactionAutomatically: false,
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
 * Purchase the Contributor subscription.
 * Sends the receipt to /subscription/ios/verify-receipt for verification.
 * On success, the backend flips User_login.role to 'contributor'.
 */
export const purchaseSubscription = async (productId) => {
    return purchaseAndVerify(productId, '/subscription/ios/verify-receipt');
};

/**
 * Purchase the Thought Leader subscription.
 * Backend will reject the receipt unless the user's thoughtLeaderApplication.status === 'approved'.
 * On success, the backend flips User_login.role to 'thoughtleader'.
 */
export const purchaseThoughtLeader = async () => {
    return purchaseAndVerify(
        PRODUCT_IDS.THOUGHTLEADER_MONTHLY,
        '/subscription/ios/verify-thoughtleader-finalize'
    );
};

/**
 * Restore previous purchases
 * Useful for users who reinstalled the app or switched devices
 * Verifies receipts with backend and reactivates subscription
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

        // Extract receipt data from all purchases
        const receipts = purchases
            .map(purchase => purchase.transactionReceipt)
            .filter(receipt => receipt !== null && receipt !== undefined);

        if (receipts.length === 0) {
            return {
                success: false,
                message: 'No valid receipts found in purchases'
            };
        }

        // Send receipts to backend for verification
        const response = await SikiyaAPI.post('/subscription/ios/restore', {
            receipts: receipts
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
 * @param {string} transactionId - The transaction ID to finish
 */
export const finishTransaction = async (transactionId) => {
    try {
        await RNIap.finishTransaction(transactionId);
        console.log('Transaction finished:', transactionId);
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
            console.log('IAP connection ended');
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





