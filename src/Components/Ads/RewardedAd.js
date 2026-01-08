import { useEffect, useState, useContext } from 'react';
import { Context as AuthContext } from '../../Context/AuthContext';

// Conditionally import AdMob (only if package is installed)
let RewardedAd, RewardedAdEventType, AdEventType, TestIds;
try {
    const admob = require('react-native-google-mobile-ads');
    RewardedAd = admob.RewardedAd;
    // Try to get RewardedAdEventType, fallback to AdEventType if it doesn't exist
    RewardedAdEventType = admob.RewardedAdEventType;
    AdEventType = admob.AdEventType;
    TestIds = admob.TestIds;
} catch (error) {
    // Package not installed or not available (e.g., in Expo Go)
    console.warn('react-native-google-mobile-ads not available:', error.message);
    RewardedAd = null;
    RewardedAdEventType = null;
    AdEventType = null;
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
    const { state } = useContext(AuthContext);
    const userRole = state?.role;
    const [rewardedAd, setRewardedAd] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Don't show ads for journalist, contributor, or admin
    const adFreeRoles = ['journalist', 'contributor', 'admin'];
    const shouldShowAds = !adFreeRoles.includes(userRole);

    useEffect(() => {
        // If AdMob is not available, don't set up ad
        if (!RewardedAd) {
            return;
        }

        // Don't load ads for ad-free roles
        if (!shouldShowAds) {
            setIsLoaded(false);
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

        // Determine which event type to use - RewardedAdEventType if available, otherwise AdEventType
        const EventType = (RewardedAdEventType && RewardedAdEventType.LOADED) ? RewardedAdEventType : AdEventType;
        
        if (!EventType || !EventType.LOADED || !EventType.CLOSED) {
            console.warn('Ad event types not available or invalid');
            return;
        }

        // Listen for ad loaded event
        const unsubscribeLoaded = ad.addAdEventListener(EventType.LOADED, () => {
            setIsLoaded(true);
        });

        // Listen for ad closed event (reload for next use)
        const unsubscribeClosed = ad.addAdEventListener(EventType.CLOSED, () => {
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
    }, [adUnitId, shouldShowAds, userRole]); // Re-run if role changes

    const showRewardedAd = async () => {
        // Don't show ads for ad-free roles
        if (!shouldShowAds) {
            return false;
        }

        if (!RewardedAd || !rewardedAd || !isLoaded) {
            console.warn('Rewarded ad not available or not loaded yet');
            return false;
        }

        return new Promise((resolve) => {
            // Determine which event type to use
            const EventType = (RewardedAdEventType && RewardedAdEventType.LOADED) ? RewardedAdEventType : AdEventType;
            
            if (!EventType || !EventType.CLOSED) {
                console.warn('Ad event types not available or invalid');
                resolve(false);
                return;
            }

            // Listen for user earned reward - use EARNED_REWARD if available in RewardedAdEventType
            let unsubscribeEarned = null;
            if (RewardedAdEventType && RewardedAdEventType.EARNED_REWARD) {
                unsubscribeEarned = rewardedAd.addAdEventListener(
                    RewardedAdEventType.EARNED_REWARD,
                    (reward) => {
                        console.log('User earned reward:', reward);
                        if (unsubscribeEarned) unsubscribeEarned();
                        resolve(true);
                    }
                );
            } else {
                // Fallback: if EARNED_REWARD doesn't exist, we'll resolve true when ad is shown
                // (This is not ideal but prevents the error)
                console.warn('EARNED_REWARD event type not available, using fallback');
            }

            // Listen for ad closed without reward
            const unsubscribeClosed = rewardedAd.addAdEventListener(
                EventType.CLOSED,
                () => {
                    if (unsubscribeEarned) unsubscribeEarned();
                    unsubscribeClosed();
                    // If we didn't get EARNED_REWARD event, assume user didn't complete the ad
                    if (!RewardedAdEventType || !RewardedAdEventType.EARNED_REWARD) {
                        resolve(false);
                    }
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
