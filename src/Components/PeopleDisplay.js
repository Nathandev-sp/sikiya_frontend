import React from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import FollowButton from '../Components/FollowButton';
import i18n from '../utils/i18n';
import { 
    articleTitleFont, 
    cardBackgroundColor, 
    genBtnBackgroundColor, 
    generalSmallTextSize, 
    generalTextColor, 
    generalTextFont, 
    generalTextFontWeight, 
    generalTitleFont, 
    generalTitleFontWeight, 
    main_Style,
    mainBrownColor, 
    withdrawnTitleColor, 
    withdrawnTitleSize,
    MainBrownSecondaryColor, 
    articleTextSize 
} from "../styles/GeneralAppStyle";
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../utils/imageUrl';

const PeopleDisplay = ({ journalist, onFollowToggle }) => {
    const { width } = useWindowDimensions();

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

    const firstname = journalist.firstname || i18n.t('profile.unknown') || "Unknown";
    const lastname = journalist.lastname || "";
    const role = formatRole(journalist.role);
    const isFollowing = journalist.isFollowing || false;
    const isOwnProfile = journalist.isOwnProfile || false;
    
    // Get profile picture URL or use default
    const profilePicture = journalist.profile_picture 
        ? getImageUrl(journalist.profile_picture) 
        : null;

    const navigation = useNavigation();

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
            activeOpacity={0.75} 
            onPress={goToAuthorProfile}
            accessibilityRole="button"
            accessibilityLabel={`${i18n.t('profile.profile')}: ${firstname} ${lastname}`}
            accessibilityHint={i18n.t('profile.viewProfile') || 'Tap to view profile'}
            style={[
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
                </View>
                
                {/* Profile Info - Middle */}
                <View style={styles.profileInfoContainer}>
                    <Text style={styles.name} numberOfLines={1}>{firstname} {lastname}</Text>
                    
                    {/* Role Badge */}
                    <View style={styles.roleBadge}>
                        <Ionicons 
                            name={journalist.role === 'journalist' ? 'newspaper' : 'person'} 
                            size={10} 
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 8,
        marginVertical: 6,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        zIndex: 10,
        overflow: 'visible',
        borderWidth: 0.8,
        borderColor: "#ccc",
        //shadowColor: '#000',
        //shadowOffset: { width: 0, height: 2 },
        //shadowOpacity: 0.1,
        //shadowRadius: 4,
        //elevation: 3,
        ...main_Style.genButtonElevation
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicContainer: {
        borderRadius: 32,
        borderWidth: 1.2,
        borderColor: "#ccc",
        padding: 1,
        backgroundColor: '#FFF',
        position: 'relative',
        ...main_Style.genButtonElevation
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: genBtnBackgroundColor,
    },
    profileInfoContainer: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
        minHeight: 52,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(157, 115, 64, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 6,
        gap: 4,
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    name: {
        fontSize: articleTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: articleTitleFont,
    },
    roleText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    selfProfileButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: 'rgba(157, 115, 64, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(157, 115, 64, 0.3)',
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