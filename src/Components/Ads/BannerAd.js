import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Context as AuthContext } from '../../Context/AuthContext';

// Conditionally import AdMob (only if package is installed)
let BannerAdComponent, BannerAdSize, TestIds;
try {
    const admob = require('react-native-google-mobile-ads');
    BannerAdComponent = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
    TestIds = admob.TestIds;
} catch (error) {
    // Package not installed or not available (e.g., in Expo Go)
    console.warn('react-native-google-mobile-ads not available:', error.message);
    BannerAdComponent = null;
}

const BannerAd = ({ 
    position = 'bottom', // 'top' or 'bottom'
    style,
    adUnitId 
}) => {
    const { state } = useContext(AuthContext);
    const userRole = state?.role;
    const [adUnit, setAdUnit] = useState(null);

    // Don't show ads for journalist, contributor, or admin
    const adFreeRoles = ['journalist', 'contributor', 'admin'];
    if (adFreeRoles.includes(userRole)) {
        return null;
    }

    useEffect(() => {
        // If AdMob is not available, don't set ad unit
        if (!BannerAdComponent) {
            return;
        }

        // Use test ad unit ID in development, real ID in production
        if (__DEV__) {
            // Test ad unit ID for development
            setAdUnit(TestIds.BANNER);
        } else {
            // Real ad unit ID from environment variable
            setAdUnit(adUnitId || process.env.EXPO_PUBLIC_ADMOB_BANNER_AD_UNIT_ID);
        }
    }, [adUnitId]);

    // Don't render if AdMob package is not available
    if (!BannerAdComponent || !adUnit) {
        return null;
    }

    return (
        <View style={[styles.container, position === 'top' && styles.topContainer, style]}>
            <Text style={styles.adLabel}>Advertisement</Text>
            <BannerAdComponent
                unitId={adUnit}
                size={BannerAdSize.FULL_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    topContainer: {
        marginTop: Platform.OS === 'ios' ? 6 : 6,
    },
    adLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
});

export default BannerAd;
