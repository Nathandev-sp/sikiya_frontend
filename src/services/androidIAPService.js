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
    CONTRIBUTOR_MONTHLY: process.env.EXPO_PUBLIC_GOOGLE_PRODUCT_ID || 'com.sikiya.contributor.monthly',
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
        const products = await RNIap.getSubscriptions({ skus: productIds });
        
        console.log('Available products:', products);
        return products;
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
 * Purchase a subscription
 * This initiates the purchase and handles purchase verification with backend
 * @param {string} productId - The product ID to purchase
 * @returns {Promise<Object>} Purchase result with subscription status
 */
export const purchaseSubscription = async (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!isInitialized) {
                await initializeIAP();
            }

            console.log('Attempting to purchase:', productId);
            
            let purchaseUpdateSubscription;
            let purchaseErrorSubscription;

            // Set up purchase update listener BEFORE initiating purchase
            purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
                try {
                    console.log('Purchase successful:', purchase);
                    
                    // Get purchase token (Android equivalent of receipt)
                    const purchaseToken = purchase.purchaseToken;
                    const orderId = purchase.orderId;
                    
                    if (!purchaseToken) {
                        throw new Error('No purchase token received from purchase');
                    }

                    // Send purchase data to backend for verification
                    const response = await SikiyaAPI.post('/subscription/android/verify-purchase', {
                        purchaseToken: purchaseToken,
                        productId: productId,
                        orderId: orderId
                    });

                    if (response.data.success) {
                        console.log('Purchase verified successfully:', response.data);
                        
                        // Finish the transaction
                        await RNIap.finishTransaction(purchase, false);
                        
                        // Clean up listeners
                        if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
                        if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
                        
                        resolve({
                            success: true,
                            subscription: response.data.subscription,
                            role: response.data.role
                        });
                    } else {
                        throw new Error('Purchase verification failed');
                    }
                } catch (error) {
                    console.error('Error processing purchase:', error);
                    // Clean up listeners
                    if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
                    if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
                    reject(error);
                }
            });

            // Set up error listener
            purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
                console.error('Purchase error:', error);
                if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
                if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
                
                // Handle specific error codes
                if (error.code === 'E_USER_CANCELLED') {
                    reject(new Error('Purchase cancelled by user'));
                } else if (error.code === 'E_NETWORK_ERROR') {
                    reject(new Error('Network error. Please check your connection.'));
                } else {
                    reject(new Error(error.message || 'Purchase failed'));
                }
            });

            // Initiate purchase
            try {
                await RNIap.requestSubscription({ sku: productId });
            } catch (error) {
                // Clean up listeners on error
                if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
                if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
                reject(error);
            }
        } catch (error) {
            console.error('Error initiating purchase:', error);
            reject(error);
        }
    });
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
    restorePurchases,
    finishTransaction,
    endConnection,
    hasActiveSubscription,
    PRODUCT_IDS,
};

