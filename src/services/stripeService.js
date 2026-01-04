/**
 * Stripe Payment Service for Android
 * Handles payment method management using @stripe/stripe-react-native
 * 
 * IMPORTANT: Before using this in production:
 * 1. Get your Stripe publishable key from Stripe Dashboard
 * 2. Set up your backend to create Payment Intents
 * 3. Store your secret key securely on the backend
 */

import { initStripe, useStripe, useElements } from '@stripe/stripe-react-native';

// Replace with your actual Stripe publishable key
// Get this from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // Replace with your key

let isStripeInitialized = false;

/**
 * Initialize Stripe
 * Call this when your app starts
 */
export const initializeStripe = async () => {
    try {
        if (!isStripeInitialized) {
            await initStripe({
                publishableKey: STRIPE_PUBLISHABLE_KEY,
                merchantIdentifier: 'merchant.com.sikiya', // Optional, for Apple Pay
            });
            isStripeInitialized = true;
            console.log('Stripe initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        return false;
    }
};

/**
 * Create a Payment Intent on your backend
 * This should call your backend API to create a payment intent
 * @param {number} amount - Amount in cents (e.g., 599 for $5.99)
 * @param {string} currency - Currency code (default: 'usd')
 */
export const createPaymentIntent = async (amount, currency = 'usd') => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch('https://your-backend.com/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth token here
            },
            body: JSON.stringify({
                amount,
                currency,
            }),
        });

        const data = await response.json();
        return data.clientSecret;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

/**
 * Create a Setup Intent for saving payment methods
 * This allows users to save cards without making an immediate payment
 */
export const createSetupIntent = async () => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch('https://your-backend.com/api/create-setup-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth token here
            },
        });

        const data = await response.json();
        return data.clientSecret;
    } catch (error) {
        console.error('Error creating setup intent:', error);
        throw error;
    }
};

/**
 * Get saved payment methods for the current user
 * This should call your backend API
 */
export const getSavedPaymentMethods = async () => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch('https://your-backend.com/api/payment-methods', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth token here
            },
        });

        const data = await response.json();
        return data.paymentMethods || [];
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
    }
};

/**
 * Delete a payment method
 * @param {string} paymentMethodId - The Stripe payment method ID
 */
export const deletePaymentMethod = async (paymentMethodId) => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch(`https://your-backend.com/api/payment-methods/${paymentMethodId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth token here
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
};

/**
 * Set a payment method as default
 * @param {string} paymentMethodId - The Stripe payment method ID
 */
export const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch(`https://your-backend.com/api/payment-methods/${paymentMethodId}/set-default`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your auth token here
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error setting default payment method:', error);
        throw error;
    }
};

export default {
    initializeStripe,
    createPaymentIntent,
    createSetupIntent,
    getSavedPaymentMethods,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    STRIPE_PUBLISHABLE_KEY,
};






