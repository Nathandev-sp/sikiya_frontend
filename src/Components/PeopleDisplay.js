import React, { memo } from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FollowButton from '../Components/FollowButton';
import i18n from '../utils/i18n';
import {
    articleTitleFont,
    generalTextColor,
    generalTextFont,
    generalTitleFont,
    generalTitleSize,
    PrimBtnColor,
    withdrawnTitleColor,
    withdrawnTitleSize,
    homeScreenPadding,
    homeCardVerticalGap,
    homeCardBorderRadius,
    homeCardShadowStyle,
    MainSecondaryBlueColor,
    MainBrownSecondaryColor,
} from "../styles/GeneralAppStyle";
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../utils/imageUrl';

const PeopleDisplay = memo(({ journalist, onFollowToggle }) => {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

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

    const firstname = journalist.firstname || i18n.t('profile.unknown') || "Unknown";
    const lastname = journalist.lastname || "";
    const fullName = `${firstname} ${lastname}`.trim();
    const role = formatRole(journalist.role);
    const isFollowing = journalist.isFollowing || false;
    const isOwnProfile = journalist.isOwnProfile || false;

    const profilePicture = journalist.profile_picture
        ? getImageUrl(journalist.profile_picture)
        : null;

    const affiliation = (
        journalist.journalist_affiliation ||
        journalist.affiliation ||
        ''
    ).trim();

    const getRoleIcon = () => {
        switch (journalist.role) {
            case 'journalist': return 'newspaper-outline';
            case 'thoughtleader': return 'bulb-outline';
            case 'contributor': return 'create-outline';
            default: return 'person-outline';
        }
    };

    const goToAuthorProfile = () => {
        navigation.navigate('AuthorProfile', { userId: journalist._id });
    };

    const handleFollowToggle = (wasFollowing) => {
        if (onFollowToggle && !isOwnProfile) {
            onFollowToggle(journalist._id, wasFollowing);
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
            <View style={[styles.container, { width: width - homeScreenPadding * 1.4 }]}>
                <View style={styles.mainRow}>
                    <View style={styles.avatarShell}>
                        <View style={styles.profilePicContainer}>
                            <Image
                                source={profilePicture
                                    ? { uri: profilePicture }
                                    : require('../../assets/functionalImages/ProfilePic.png')
                                }
                                style={styles.profilePic}
                                resizeMode="cover"
                            />
                            {journalist.role === 'journalist' && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={15} color={MainSecondaryBlueColor} />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={styles.roleNameStack}>
                            <View style={styles.roleBadge}>
                                <Ionicons
                                    name={getRoleIcon()}
                                    size={11}
                                    color={PrimBtnColor}
                                />
                                <Text style={styles.roleText} numberOfLines={1}>{role.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
                        </View>
                        {affiliation ? (
                            <Text
                                style={styles.affiliation}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {affiliation}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.rightSection}>
                        {isOwnProfile ? (
                            <View style={styles.selfProfilePill}>
                                <Ionicons name="person-circle-outline" size={17} color={MainBrownSecondaryColor} />
                                <Text style={styles.selfProfilePillText}>
                                    {i18n.t('profile.you') || 'You'}
                                </Text>
                            </View>
                        ) : (
                            <FollowButton
                                pill
                                pillSubtle
                                initialFollowed={isFollowing}
                                onToggle={handleFollowToggle}
                                followLabel={i18n.t('profile.follow')}
                                followingLabel={i18n.t('profile.followingButton')}
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
        backgroundColor: '#FDFCF8',
        borderRadius: homeCardBorderRadius,
        marginVertical: (homeCardVerticalGap / 2) + 2,
        alignSelf: 'center',
        paddingVertical: 4,
        paddingLeft: 5,
        paddingRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(102, 70, 44, 0.12)',
        borderLeftWidth: 3,
        borderLeftColor: PrimBtnColor,
        ...homeCardShadowStyle,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarShell: {
        width: '34%',
        aspectRatio: 1,
        maxWidth: 84,
        borderRadius: 8,
        backgroundColor: '#F0EDE6',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    profilePicContainer: {
        position: 'relative',
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
    },
    profilePic: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#F0EDE6',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FDFCF8',
        borderRadius: 10,
        padding: 1,
    },
    profileInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 4,
        minWidth: 0,
        gap: 6,
    },
    roleNameStack: {
        minWidth: 0,
        gap: 3,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
    },
    roleText: {
        fontSize: 9,
        fontWeight: '700',
        color: PrimBtnColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.85,
    },
    name: {
        fontSize: generalTitleSize - 0.5,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: articleTitleFont,
        lineHeight: (generalTitleSize - 0.5) * 1.2,
        letterSpacing: 0.05,
    },
    affiliation: {
        fontSize: withdrawnTitleSize - 1,
        fontWeight: '400',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
        letterSpacing: 0.1,
        opacity: 0.88,
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        alignSelf: 'center',
        paddingRight: 2,
    },
    selfProfilePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 24,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: '#FFFCF9',
        borderWidth: 1.5,
        borderColor: 'rgba(102, 70, 44, 0.22)',
        shadowColor: '#2C2416',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    selfProfilePillText: {
        fontWeight: '700',
        fontSize: 13,
        fontFamily: generalTextFont,
        letterSpacing: 0.2,
        color: MainBrownSecondaryColor,
    },
});

export default PeopleDisplay;
