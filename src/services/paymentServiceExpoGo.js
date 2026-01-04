/**
 * Payment Service for Expo Go
 * Since native payment modules don't work in Expo Go, this service:
 * - iOS: Guides users to manage subscriptions through Apple Settings/App Store
 * - Android: Provides web-based payment management or redirects to web portal
 * 
 * For production with custom development builds, you can use the native modules.
 */

import { Platform, Linking } from 'react-native';
import SikiyaAPI from '../../API/SikiyaAPI';

/**
 * iOS: Open App Store Subscriptions page
 * This is the only way to manage subscriptions in Expo Go
 */
export const openIOSSubscriptionSettings = async () => {
    try {
        // Try to open Settings app to subscriptions
        // Note: This URL scheme might not work in all iOS versions
        const settingsUrl = 'app-settings:'; // Opens app settings
        
        const canOpen = await Linking.canOpenURL(settingsUrl);
        if (canOpen) {
            await Linking.openURL(settingsUrl);
        } else {
            // Fallback: Open App Store subscriptions page via web
            await Linking.openURL('https://apps.apple.com/account/subscriptions');
        }
    } catch (error) {
        console.error('Error opening iOS settings:', error);
        // Fallback to web
        Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
};

/**
 * Check iOS subscription status via backend
 * Your backend should verify with Apple's servers
 */
export const checkIOSSubscriptionStatus = async () => {
    try {
        const response = await SikiyaAPI.get('/subscription/ios/status');
        return response.data;
    } catch (error) {
        console.error('Error checking iOS subscription:', error);
        return { active: false, error: error.message };
    }
};

/**
 * Android: Open payment management web portal
 * You'll need to create a web portal for users to manage their Stripe payment methods
 */
export const openAndroidPaymentPortal = async () => {
    try {
        // Replace with your actual payment management portal URL
        // This should be a web app where users can manage their Stripe payment methods
        const portalUrl = 'https://your-app.com/payment-portal'; // Replace with your URL
        
        const canOpen = await Linking.canOpenURL(portalUrl);
        if (canOpen) {
            await Linking.openURL(portalUrl);
        } else {
            throw new Error('Cannot open payment portal');
        }
    } catch (error) {
        console.error('Error opening payment portal:', error);
        throw error;
    }
};

/**
 * Android: Get payment methods via backend API
 * Your backend should fetch from Stripe
 */
export const getAndroidPaymentMethods = async () => {
    try {
        const response = await SikiyaAPI.get('/payment-methods');
        return response.data.paymentMethods || [];
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
    }
};

/**
 * Create subscription checkout session
 * @param {string} planId - The plan ID (e.g., 'contributor')
 * @param {number} amount - Amount in cents (e.g., 599 for $5.99)
 * @param {string} currency - Currency code (default: 'usd')
 */
export const createSubscriptionSession = async (planId, amount, currency = 'usd') => {
    try {
        const response = await SikiyaAPI.post('/subscription/create-checkout', {
            planId,
            amount,
            currency,
            returnUrl: 'sikiya://subscription-success', // Deep link to return to app
        });
        return response.data.sessionUrl || response.data.checkoutUrl;
    } catch (error) {
        console.error('Error creating subscription session:', error);
        throw error;
    }
};

/**
 * Android: Create a payment session URL
 * Your backend creates a Stripe Checkout session and returns the URL
 */
export const createPaymentSession = async (amount, currency = 'usd') => {
    try {
        const response = await SikiyaAPI.post('/payment/create-session', {
            amount,
            currency,
            returnUrl: 'sikiya://payment-success', // Deep link to return to app
        });
        return response.data.sessionUrl;
    } catch (error) {
        console.error('Error creating payment session:', error);
        throw error;
    }
};

/**
 * Android: Delete payment method via backend
 */
export const deletePaymentMethod = async (paymentMethodId) => {
    try {
        const response = await SikiyaAPI.delete(`/payment-methods/${paymentMethodId}`);
        return response.data.success;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
};

/**
 * Android: Set default payment method via backend
 */
export const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
        const response = await SikiyaAPI.post(`/payment-methods/${paymentMethodId}/set-default`);
        return response.data.success;
    } catch (error) {
        console.error('Error setting default payment method:', error);
        throw error;
    }
};

export default {
    openIOSSubscriptionSettings,
    checkIOSSubscriptionStatus,
    openAndroidPaymentPortal,
    getAndroidPaymentMethods,
    createSubscriptionSession,
    createPaymentSession,
    deletePaymentMethod,
    setDefaultPaymentMethod,
};

