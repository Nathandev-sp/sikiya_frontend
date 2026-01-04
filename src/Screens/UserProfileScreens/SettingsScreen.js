import React, { useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTitleFontWeight, articleTitleSize, cardBackgroundColor, generalActiveOpacity, generalSmallTextSize, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, withdrawnTitleColor, XsmallTextSize } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Context as AuthContext } from '../../Context/AuthContext';

const SettingsScreen = () => {
    const route = useRoute();
    const { firstname, lastname } = route.params || {};
    const navigation = useNavigation();
    const { signout } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => signout(),
                    style: 'destructive'
                }
            ],
            { cancelable: true }
        );
    };

    // Menu items configuration
    const menuItems = [
        {
            title: 'Profile',
            icon: <Ionicons name="person-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('ProfileSettings', { firstname, lastname }),
            description: 'Edit profile information'
        },
        {
            title: 'Membership',
            icon: <Ionicons name="card-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('SubscriptionSettings', { firstname, lastname }),
            description: 'Manage your subscription'
        },
        {
            title: 'Comment History',
            icon: <Ionicons name="time-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('CommentSettings', { firstname, lastname }),
            description: 'Manage the response to a comment'
        },
        {
            title: 'Language',
            icon: <Ionicons name="language-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('LanguageSettings', { firstname, lastname }),
            description: 'Change app language'
        },
        {
            title: 'Help & Support',
            icon: <Ionicons name="help-circle-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('HelpSupportSettings', { firstname, lastname }),
            description: 'Get assistance and FAQs'
        }
    ];

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                
                <View style={styles.profileSection}>
                    <Text style={styles.userName}>Settings</Text>
                </View>

                <View style={[styles.menuContainer, main_Style.genButtonElevation]}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={styles.menuIconContainer}>
                                {item.icon}
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuDescription}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>
                
                <VerticalSpacer height={20} />
                
                <TouchableOpacity 
                    style={[styles.logoutButton, main_Style.genButtonElevation]} 
                    onPress={handleLogout}
                    activeOpacity={generalActiveOpacity}
                >
                    <Ionicons name="log-out-outline" size={18} color={MainBrownSecondaryColor} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
                
                <VerticalSpacer height={30} />
                
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    profileSection: {
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#5B7FFF',
        marginBottom: 15,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: articleTitleSize,
        fontWeight: articleTitleFontWeight,
        color: MainBrownSecondaryColor,
        marginBottom: 5,
        fontFamily: generalTitleFont
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        fontFamily: generalTextFont
    },
    editProfileButton: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    editProfileText: {
        fontSize: 14,
        color: '#5B7FFF',
    },
    menuContainer: {
        backgroundColor: "#FFF",
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 20,
        paddingVertical: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 10,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        fontFamily: generalTitleFont,
        color: generalTitleColor
    },
    menuDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        marginTop: 2,
        fontFamily: generalTextFont
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secCardBackgroundColor,
        paddingVertical: 12,
        marginHorizontal: 15,
        borderRadius: 8,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        fontFamily: generalTitleFont,
        color: MainBrownSecondaryColor
    },
    versionText: {
        textAlign: 'center',
        color: withdrawnTitleColor,
        fontSize: XsmallTextSize,
        marginBottom: 20,
        fontFamily: generalTextFont,
    }
});

export default SettingsScreen;