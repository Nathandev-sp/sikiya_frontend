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
const PRODUCT_IDS = {
    CONTRIBUTOR_MONTHLY: process.env.EXPO_PUBLIC_APPLE_PRODUCT_ID || 'com.sikiya.contributor.monthly',
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
 * Get available subscription products
 * Returns array of product details
 */
export const getAvailableProducts = async () => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        const productIds = Object.values(PRODUCT_IDS);
        const products = await RNIap.getProducts(productIds);
        
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

        const subscriptions = await RNIap.getAvailablePurchases();
        console.log('Current subscriptions:', subscriptions);
        return subscriptions;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }
};

/**
 * Purchase a subscription
 * This initiates the purchase and handles receipt verification with backend
 * @param {string} productId - The product ID to purchase
 * @returns {Promise<Object>} Purchase result with subscription status
 */
export const purchaseSubscription = async (productId) => {
    try {
        if (!isInitialized) {
            await initializeIAP();
        }

        console.log('Attempting to purchase:', productId);
        
        // Set up purchase update listener BEFORE initiating purchase
        const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
            try {
                console.log('Purchase successful:', purchase);
                
                // Get receipt data
                const receipt = purchase.transactionReceipt;
                
                if (!receipt) {
                    throw new Error('No receipt data received from purchase');
                }

                // Send receipt to backend for verification
                const response = await SikiyaAPI.post('/subscription/ios/verify-receipt', {
                    receiptData: receipt,
                    transactionId: purchase.transactionId
                });

                if (response.data.success) {
                    console.log('Receipt verified successfully:', response.data);
                    
                    // Finish the transaction
                    await RNIap.finishTransaction(purchase, false);
                    
                    return {
                        success: true,
                        subscription: response.data.subscription,
                        role: response.data.role
                    };
                } else {
                    throw new Error('Receipt verification failed');
                }
            } catch (error) {
                console.error('Error processing purchase:', error);
                // Don't finish transaction if verification failed
                throw error;
            }
        });

        // Set up error listener
        const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
            console.error('Purchase error:', error);
            purchaseUpdateSubscription.remove();
            purchaseErrorSubscription.remove();
        });

        // Initiate purchase
        await RNIap.requestPurchase(productId, false);
        
        // Note: The actual result comes through the purchaseUpdatedListener
        // This function returns a promise that resolves when purchase completes
        return new Promise((resolve, reject) => {
            // Store resolve/reject for use in listeners
            purchaseUpdateSubscription._resolve = resolve;
            purchaseUpdateSubscription._reject = reject;
        });
    } catch (error) {
        console.error('Error purchasing subscription:', error);
        
        // Handle specific error codes
        if (error.code === 'E_USER_CANCELLED') {
            throw new Error('Purchase cancelled by user');
        } else if (error.code === 'E_NETWORK_ERROR') {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error(error.message || 'Purchase failed');
        }
    }
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
    restorePurchases,
    finishTransaction,
    endConnection,
    hasActiveSubscription,
    PRODUCT_IDS,
};





