import { useContext, useEffect, useState } from 'react';
import { Context as AuthContext } from '../../Context/AuthContext';

// Conditionally import AdMob (only if native module exists in the build)
let InterstitialAd, AdEventType, TestIds;
try {
    const admob = require('react-native-google-mobile-ads');
    InterstitialAd = admob.InterstitialAd;
    AdEventType = admob.AdEventType;
    TestIds = admob.TestIds;
} catch (error) {
    console.warn('react-native-google-mobile-ads not available:', error.message);
    InterstitialAd = null;
    AdEventType = null;
    TestIds = null;
}

/**
 * Interstitial Ad Hook
 * 
 * Manages interstitial (full-screen) ads.
 * Load and show ads between screens/content.
 * 
 * Usage:
 * const { showAd, isLoaded } = useInterstitialAd();
 * 
 * // Show ad when needed
 * await showAd();
 */
export const useInterstitialAd = (adUnitId) => {
    const { state } = useContext(AuthContext);
    const userRole = state?.role;
    const [interstitialAd, setInterstitialAd] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        // If AdMob is not available in this build (e.g., Expo Go), do nothing.
        if (!InterstitialAd || !AdEventType || !TestIds) {
            setInterstitialAd(null);
            setIsLoaded(false);
            setIsShowing(false);
            return;
        }

        // Don't load ads for ad-free roles
        const adFreeRoles = ['journalist', 'contributor', 'thoughtleader', 'admin'];
        if (adFreeRoles.includes(userRole)) {
            setInterstitialAd(null);
            setIsLoaded(false);
            setIsShowing(false);
            return;
        }

        // Use test ad unit ID in development, real ID in production
        const unitId = __DEV__ 
            ? TestIds.INTERSTITIAL 
            : (adUnitId || process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_AD_UNIT_ID);

        if (!unitId) {
            console.warn('Interstitial ad unit ID not configured');
            return;
        }

        // Create interstitial ad
        const ad = InterstitialAd.createForAdRequest(unitId, {
            requestNonPersonalizedAdsOnly: false,
        });

        // Listen for ad loaded event
        const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            setIsLoaded(true);
        });

        const unsubscribeOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
            setIsShowing(true);
        });

        // Listen for ad closed event (reload for next use)
        const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setIsLoaded(false);
            setIsShowing(false);
            // Reload ad for next use
            ad.load();
        });

        const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
            setIsShowing(false);
        });

        // Load the ad
        ad.load();

        setInterstitialAd(ad);

        // Cleanup
        return () => {
            unsubscribeLoaded();
            unsubscribeOpened();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, [adUnitId, userRole]);

    const showAd = async () => {
        const adFreeRoles = ['journalist', 'contributor', 'thoughtleader', 'admin'];
        if (adFreeRoles.includes(userRole)) {
            return false;
        }

        if (!interstitialAd || !isLoaded) {
            console.warn('Interstitial ad not loaded yet');
            return false;
        }

        try {
            await interstitialAd.show();
            return true;
        } catch (error) {
            console.error('Error showing interstitial ad:', error);
            return false;
        }
    };

    return {
        showAd,
        isLoaded,
        isShowing,
    };
};


