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

        console.log('🎬 Rewarded ad setup - __DEV__:', __DEV__, 'Unit ID:', unitId);

        if (!unitId) {
            console.warn('❌ Rewarded ad unit ID not configured');
            return;
        }

        // Create rewarded ad
        console.log('🎬 Creating rewarded ad instance...');
        const ad = RewardedAd.createForAdRequest(unitId, {
            requestNonPersonalizedAdsOnly: false,
        });

        console.log('🎬 Rewarded ad instance created');
        console.log('🎬 RewardedAdEventType available:', !!RewardedAdEventType);
        console.log('🎬 AdEventType available:', !!AdEventType);

        // Set up event listeners with fallback approach
        const unsubscribers = [];

        try {
            // Try LOADED event
            const loadedEvent = RewardedAdEventType?.LOADED || AdEventType?.LOADED || 'loaded';
            console.log('🎬 Setting up LOADED listener with event:', loadedEvent);
            const unsubLoaded = ad.addAdEventListener(loadedEvent, () => {
                console.log('✅ Rewarded ad LOADED event fired');
                // IMPORTANT: Add delay before marking as ready
                // AdMob fires LOADED before ad is actually ready to show
                console.log('⏱️  Waiting 15 seconds to ensure ad is fully ready...');
                setTimeout(() => {
                    console.log('✅ Rewarded ad is now ready to show');
                    setIsLoaded(true);
                }, 15000); // 15 second safety delay - rewarded ads need more time
            });
            unsubscribers.push(unsubLoaded);
        } catch (error) {
            console.warn('⚠️ Could not set up LOADED listener:', error.message);
        }

        try {
            // Try CLOSED/DISMISSED event
            const closedEvent = RewardedAdEventType?.CLOSED || AdEventType?.CLOSED || 'closed';
            console.log('🎬 Setting up CLOSED listener with event:', closedEvent);
            const unsubClosed = ad.addAdEventListener(closedEvent, () => {
                console.log('🎬 Rewarded ad closed, reloading for next use...');
                setIsLoaded(false);
                
                // Reload ad for next use
                console.log('📢 Reloading rewarded ad...');
                ad.load();
                
                // The LOADED event listener will handle setting isLoaded=true with delay
                // No need for separate polling here - the event listener above handles it
            });
            unsubscribers.push(unsubClosed);
        } catch (error) {
            console.warn('⚠️ Could not set up CLOSED listener:', error.message);
        }

        try {
            // Try ERROR event
            const errorEvent = AdEventType?.ERROR || 'error';
            console.log('🎬 Setting up ERROR listener with event:', errorEvent);
            const unsubError = ad.addAdEventListener(errorEvent, (error) => {
                console.error('❌ Rewarded ad error:', error);
                setIsLoaded(false);
            });
            unsubscribers.push(unsubError);
        } catch (error) {
            console.warn('⚠️ Could not set up ERROR listener:', error.message);
        }

        // Load the ad
        console.log('📢 Loading rewarded ad with unit ID:', unitId);
        ad.load();

        setRewardedAd(ad);

        // Poll to check if ad is loaded (backup if event listeners fail)
        let pollCount = 0;
        const maxPolls = 60; // 60 seconds max (rewarded ads can take longer)
        const pollInterval = setInterval(() => {
            pollCount++;
            
            // Check if ad has a loaded property or method
            if (ad.loaded === true) {
                console.log('✅ Rewarded ad detected as loaded via polling (backup)');
                clearInterval(pollInterval);
                // Add same safety delay as event listener
                console.log('⏱️  Waiting 15 seconds to ensure ad is fully ready...');
                setTimeout(() => {
                    console.log('✅ Rewarded ad is now ready to show (via polling)');
                    setIsLoaded(true);
                }, 15000); // 15 second safety delay
            } else if (pollCount >= maxPolls) {
                console.warn('⚠️ Rewarded ad polling timeout after 60s');
                console.warn('   Ad may still be loading. Please be patient with rewarded ads.');
                clearInterval(pollInterval);
                // Don't set isLoaded here - wait for actual load
            } else if (pollCount % 5 === 0) {
                // Only log every 5 seconds to reduce spam
                console.log(`🔄 Polling ad status (${pollCount}/${maxPolls})... loaded: ${ad.loaded}`);
            }
        }, 1000);

        // Cleanup
        return () => {
            clearInterval(pollInterval);
            unsubscribers.forEach(unsub => {
                try {
                    unsub();
                } catch (e) {
                    console.warn('Error unsubscribing:', e.message);
                }
            });
        };
    }, [adUnitId, shouldShowAds, userRole]); // Re-run if role changes

    const showRewardedAd = async () => {
        console.log('🎬 showRewardedAd called');
        console.log('🎬 shouldShowAds:', shouldShowAds);
        console.log('🎬 RewardedAd available:', !!RewardedAd);
        console.log('🎬 rewardedAd instance:', !!rewardedAd);
        console.log('🎬 isLoaded:', isLoaded);
        
        // Don't show ads for ad-free roles
        if (!shouldShowAds) {
            console.warn('❌ Not showing ad - ad-free role');
            return false;
        }

        if (!RewardedAd || !rewardedAd || !isLoaded) {
            console.warn('❌ Rewarded ad not available or not loaded yet');
            console.warn('   - RewardedAd:', !!RewardedAd);
            console.warn('   - rewardedAd:', !!rewardedAd);
            console.warn('   - isLoaded:', isLoaded);
            return false;
        }

        return new Promise((resolve) => {
            let resolved = false;
            const cleanupAndResolve = (value) => {
                if (resolved) return;
                resolved = true;
                resolve(value);
            };

            const unsubscribers = [];

            // Listen for user earned reward
            try {
                const earnedEvent = RewardedAdEventType?.EARNED_REWARD || 'rewarded';
                console.log('🎬 Setting up EARNED_REWARD listener with event:', earnedEvent);
                const unsubEarned = rewardedAd.addAdEventListener(
                    earnedEvent,
                    (reward) => {
                        console.log('✅ User earned reward:', reward);
                        cleanupAndResolve(true);
                    }
                );
                unsubscribers.push(unsubEarned);
            } catch (error) {
                console.warn('⚠️ Could not set up EARNED_REWARD listener:', error.message);
            }

            // Listen for ad closed
            try {
                const closedEvent = RewardedAdEventType?.CLOSED || AdEventType?.CLOSED || 'closed';
                console.log('🎬 Setting up CLOSED listener for show with event:', closedEvent);
                const unsubClosed = rewardedAd.addAdEventListener(
                    closedEvent,
                    () => {
                        console.log('Rewarded ad closed during show');
                        // If we got here without earning reward, user dismissed
                        cleanupAndResolve(false);
                    }
                );
                unsubscribers.push(unsubClosed);
            } catch (error) {
                console.warn('⚠️ Could not set up CLOSED listener for show:', error.message);
            }

            // Cleanup function
            const cleanup = () => {
                unsubscribers.forEach(unsub => {
                    try {
                        unsub();
                    } catch (e) {
                        console.warn('Error unsubscribing during show:', e.message);
                    }
                });
            };

            // Show the ad
            console.log('🎬 Calling rewardedAd.show()...');
            rewardedAd.show()
                .then(() => {
                    console.log('✅ rewardedAd.show() called successfully');
                    // Ad will trigger EARNED_REWARD or CLOSED events
                })
                .catch((error) => {
                    console.error('❌ Error showing rewarded ad:', error);
                    cleanup();
                    cleanupAndResolve(false);
                });

            // Timeout fallback - if no events fire within 60 seconds, assume failure
            setTimeout(() => {
                console.warn('⚠️ Rewarded ad timeout - no events received');
                cleanup();
                cleanupAndResolve(false);
            }, 60000);
        });
    };

    return {
        showRewardedAd,
        isLoaded,
    };
};
