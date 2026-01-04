import React from 'react';
import { View } from 'react-native';
import { useContext } from 'react';
import { Context as AuthContext } from '../../Context/AuthContext';
import BannerAd from './BannerAd';

/**
 * Conditional Ad Wrapper Component
 * 
 * Only renders ads if user role is 'general'.
 * Hides ads for 'contributor' users (ad-free experience).
 * 
 * Usage:
 * <ConditionalAdWrapper position="bottom" />
 */
const ConditionalAdWrapper = ({ position = 'bottom', style }) => {
    const { state } = useContext(AuthContext);
    const userRole = state?.role;

    // Only show ads for general users
    // Hide ads for contributor, journalist, admin, etc.
    if (userRole !== 'general') {
        return null; // Ad-free experience for non-general users
    }

    return <BannerAd position={position} style={style} />;
};

export default ConditionalAdWrapper;


