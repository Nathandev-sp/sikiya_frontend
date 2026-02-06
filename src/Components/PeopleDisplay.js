import React, { memo } from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import FollowButton from '../Components/FollowButton';
import i18n from '../utils/i18n';
import { 
    articleTitleFont, 
    generalTextColor, 
    generalTextFont, 
    generalTitleFont, 
    main_Style,
    mainBrownColor, 
    withdrawnTitleColor, 
    withdrawnTitleSize,
    articleTextSize 
} from "../styles/GeneralAppStyle";
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../utils/imageUrl';

const PeopleDisplay = memo(({ journalist, onFollowToggle }) => {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    // Format role for display with translations
    const formatRole = (role) => {
        if (!role) return i18n.t('profile.generalUser') || 'General User';
        const roleMap = {
            'journalist': i18n.t('journalist.journalist') || 'Journalist',
            'thoughtleader': i18n.t('profile.thoughtLeader') || 'Thought Leader',
            'contributor': i18n.t('onboarding.contributors') || 'Contributor',
            'general': i18n.t('profile.generalUser') || 'General User',
            'needID': i18n.t('profile.pendingVerification') || 'Pending Verification'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    // Fallback for missing data
    const firstname = journalist.firstname || i18n.t('profile.unknown') || "Unknown";
    const lastname = journalist.lastname || "";
    const fullName = `${firstname} ${lastname}`.trim();
    const role = formatRole(journalist.role);
    const isFollowing = journalist.isFollowing || false;
    const isOwnProfile = journalist.isOwnProfile || false;
    
    // Get profile picture URL or use default
    const profilePicture = journalist.profile_picture 
        ? getImageUrl(journalist.profile_picture) 
        : null;

    // Get role icon
    const getRoleIcon = () => {
        switch(journalist.role) {
            case 'journalist': return 'newspaper-outline';
            case 'thoughtleader': return 'bulb-outline';
            case 'contributor': return 'create-outline';
            default: return 'person-outline';
        }
    };

    const goToAuthorProfile = () => {
        navigation.navigate('AuthorProfile', { userId: journalist._id });
    };

    const handleFollowToggle = () => {
        if (onFollowToggle && !isOwnProfile) {
            onFollowToggle(journalist._id, isFollowing);
        }
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={goToAuthorProfile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${i18n.t('profile.profile')}: ${fullName}`}
            accessibilityHint={i18n.t('profile.viewProfile') || 'Tap to view profile'}
        >
            <View style={[
                styles.container,
                main_Style.genContentElevation,
                { width: width * 0.96 }
            ]}>
                <View style={styles.mainRow}>
                    {/* Profile Picture with Border Frame - Left */}
                    <View style={styles.profilePicContainer}>
                        <Image
                            source={profilePicture 
                                ? { uri: profilePicture } 
                                : require('../../assets/functionalImages/ProfilePic.png')
                            }
                            style={styles.profilePic}
                            resizeMode="cover"
                        />
                        {/* Verified badge for journalists */}
                        {journalist.role === 'journalist' && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={18} color="#4A90E2" />
                            </View>
                        )}
                    </View>
                    
                    {/* Profile Info - Middle */}
                    <View style={styles.profileInfoContainer}>
                        <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
                        
                        {/* Role Badge */}
                        <View style={styles.roleBadge}>
                            <Ionicons 
                                name={getRoleIcon()} 
                                size={12} 
                                color={withdrawnTitleColor} 
                            />
                            <Text style={styles.roleText} numberOfLines={1}>{role}</Text>
                        </View>
                    </View>
                    
                    {/* Follow Button - Far Right */}
                    <View style={styles.rightSection}>
                        {isOwnProfile ? (
                            <View style={styles.selfProfileButton}>
                                <Text style={styles.selfProfileText}>
                                    {i18n.t('profile.you') || 'You'}
                                </Text>
                            </View>
                        ) : (
                            <FollowButton 
                                initialFollowed={isFollowing}
                                onToggle={handleFollowToggle}
                            />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

PeopleDisplay.displayName = 'PeopleDisplay';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 4,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        overflow: 'visible',
        borderWidth: 0.2,
        borderColor: 'rgba(0,0,0,0.06)',
        
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicContainer: {
        position: 'relative',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        padding: 0.5,
        backgroundColor: '#FFF',
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F5F5',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 1,
    },
    profileInfoContainer: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    name: {
        fontSize: articleTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: articleTitleFont,
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(157, 115, 64, 0.08)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(157, 115, 64, 0.15)',
    },
    roleText: {
        fontSize: withdrawnTitleSize - 0.5,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    selfProfileButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: 'rgba(157, 115, 64, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(157, 115, 64, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    selfProfileText: {
        fontWeight: '600',
        fontSize: withdrawnTitleSize,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
        color: mainBrownColor,
    },
});

export default PeopleDisplay;