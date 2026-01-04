import { Platform } from 'react-native';

/**
 * Platform detection utility
 * Helps determine which payment system to use based on the platform
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getPaymentPlatform = () => {
    return Platform.OS; // Returns 'ios' or 'android'
};






