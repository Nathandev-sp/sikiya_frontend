import React from "react";
import { View, Text, StyleSheet, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import FollowButton from '../Components/FollowButton';
import { articleTitleColor, articleTitleFont, cardBackgroundColor, genBtnBackgroundColor, generalSmallTextSize, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, lightBannerBackgroundColor, mainBrownColor, secCardBackgroundColor, withdrawnTitleColor } from "../styles/GeneralAppStyle";
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../utils/imageUrl';

const PeopleDisplay = ({ journalist, onFollowToggle }) => {
    const { width, height } = useWindowDimensions();

    // Format role for display
    const formatRole = (role) => {
        if (!role) return 'General User';
        const roleMap = {
            'journalist': 'Journalist',
            'thoughtleader': 'Thought Leader',
            'contributor': 'Contributor',
            'general': 'General User',
            'needID': 'Pending Verification'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    const firstname = journalist.firstname || "Unknown";
    const lastname = journalist.lastname || "";
    const role = formatRole(journalist.role);
    const isFollowing = journalist.isFollowing || false;
    
    // Get profile picture URL or use default
    const profilePicture = journalist.profile_picture 
        ? getImageUrl(journalist.profile_picture) 
        : null;

    const navigation = useNavigation()

    const goToAuthorProfile = () => {
        navigation.navigate('AuthorProfile', { userId: journalist._id })
    }

    const handleFollowToggle = () => {
        if (onFollowToggle) {
            onFollowToggle(journalist._id, isFollowing);
        }
    }

    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={goToAuthorProfile}
            style={[
                styles.container,
                { width: width * 0.95 }
            ]}>
            <View style={styles.mainRow}>
                {/* Profile Picture - Left */}
                <Image
                    source={profilePicture 
                        ? { uri: profilePicture } 
                        : require('../../assets/functionalImages/ProfilePic.png')
                    }
                    style={styles.profilePic}
                    resizeMode="cover"
                />
                
                {/* Profile Info - Middle */}
                <View style={styles.profileInfoContainer}>
                    <Text style={styles.name} numberOfLines={1}>{firstname} {lastname}</Text>
                    <View style={styles.roleInfo}>
                        <Text style={styles.roleText} numberOfLines={1}>{role}</Text>
                    </View>
                </View>
                
                {/* Follow Button - Far Right */}
                <View style={styles.rightSection}>
                    <FollowButton 
                        initialFollowed={isFollowing}
                        onToggle={handleFollowToggle}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#F8F8F8',
        //borderRadius: 12,
        marginVertical: 6,
        alignSelf: 'center',
        padding: 6,
        paddingHorizontal: 16,
        zIndex: 10,
        overflow: 'hidden',
        //borderWidth: 1.5,
        //borderColor: '#E8E8E8',
        // iOS Shadow
        //shadowColor: '#000',
        //shadowOffset: {
        //    width: 0,
        //    height: 2,
        //},
        //shadowOpacity: 0.1,
        //shadowRadius: 4,
        // Android Elevation
        //elevation: 3,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: genBtnBackgroundColor,
    },
    profileInfoContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
        minHeight: 52,
        alignItems: 'flex-start',
    },
    roleInfo: {
        marginTop: 3,
        alignSelf: 'flex-start',
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    journalistLabel: {
        fontSize: 9,
        fontWeight: '500',
        color: generalTextColor,
        marginTop: 2,
        fontFamily: generalTextFont,
    },
    name: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: articleTitleColor,
        fontFamily: articleTitleFont,
        alignSelf: 'flex-start',
    },
    sectionTitle: {
        fontSize: generalSmallTextSize,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    roleText: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
});

export default PeopleDisplay;