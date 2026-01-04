import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

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
    const [interstitialAd, setInterstitialAd] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
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

        // Listen for ad closed event (reload for next use)
        const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            setIsLoaded(false);
            // Reload ad for next use
            ad.load();
        });

        // Load the ad
        ad.load();

        setInterstitialAd(ad);

        // Cleanup
        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, [adUnitId]);

    const showAd = async () => {
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
    };
};


