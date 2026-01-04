import { useEffect, useState } from 'react';

// Conditionally import AdMob (only if package is installed)
let RewardedAd, RewardedAdEventType, TestIds;
try {
    const admob = require('react-native-google-mobile-ads');
    RewardedAd = admob.RewardedAd;
    RewardedAdEventType = admob.RewardedAdEventType;
    TestIds = admob.TestIds;
} catch (error) {
    // Package not installed or not available (e.g., in Expo Go)
    console.warn('react-native-google-mobile-ads not available:', error.message);
    RewardedAd = null;
    RewardedAdEventType = null;
    TestIds = null;
}

/**
 * Rewarded Ad Hook
 * 
 * Manages rewarded ads (users watch to earn rewards).
 * Use for "Watch ad to unlock more videos" feature.
 * 
 * NOTE: This requires react-native-google-mobile-ads to be installed
 * and a development build (doesn't work in Expo Go).
 * 
 * Usage:
 * const { showRewardedAd, isLoaded } = useRewardedAd();
 * 
 * // Show ad when user wants to unlock content
 * const earned = await showRewardedAd();
 * if (earned) {
 *   // User watched ad, unlock content
 * }
 */
export const useRewardedAd = (adUnitId) => {
    const [rewardedAd, setRewardedAd] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // If AdMob is not available, don't set up ad
        if (!RewardedAd) {
            return;
        }

        // Use test ad unit ID in development, real ID in production
        const unitId = __DEV__
            ? TestIds.REWARDED
            : (adUnitId || process.env.EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID);

        if (!unitId) {
            console.warn('Rewarded ad unit ID not configured');
            return;
        }

        // Create rewarded ad
        const ad = RewardedAd.createForAdRequest(unitId, {
            requestNonPersonalizedAdsOnly: false,
        });

        // Listen for ad loaded event
        const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsLoaded(true);
        });

        // Listen for ad closed event (reload for next use)
        const unsubscribeClosed = ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
            setIsLoaded(false);
            // Reload ad for next use
            ad.load();
        });

        // Load the ad
        ad.load();

        setRewardedAd(ad);

        // Cleanup
        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, [adUnitId]);

    const showRewardedAd = async () => {
        if (!RewardedAd || !rewardedAd || !isLoaded) {
            console.warn('Rewarded ad not available or not loaded yet');
            return false;
        }

        return new Promise((resolve) => {
            // Listen for user earned reward
            const unsubscribeEarned = rewardedAd.addAdEventListener(
                RewardedAdEventType.EARNED_REWARD,
                (reward) => {
                    console.log('User earned reward:', reward);
                    unsubscribeEarned();
                    resolve(true);
                }
            );

            // Listen for ad closed without reward
            const unsubscribeClosed = rewardedAd.addAdEventListener(
                RewardedAdEventType.CLOSED,
                () => {
                    unsubscribeClosed();
                    resolve(false);
                }
            );

            // Show the ad
            rewardedAd.show().catch((error) => {
                console.error('Error showing rewarded ad:', error);
                unsubscribeEarned();
                unsubscribeClosed();
                resolve(false);
            });
        });
    };

    return {
        showRewardedAd,
        isLoaded,
    };
};
