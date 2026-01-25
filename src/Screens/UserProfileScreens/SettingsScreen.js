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
import { useLanguage } from '../../Context/LanguageContext';

const SettingsScreen = () => {
    const route = useRoute();
    const { firstname, lastname } = route.params || {};
    const navigation = useNavigation();
    const { signout } = useContext(AuthContext);
    const { t } = useLanguage();

    const handleLogout = () => {
        Alert.alert(
            t('alerts.signOut'),
            t('alerts.signOutDescription'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('common.yes'),
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
            title: t('generalSettings.profile'),
            icon: <Ionicons name="person-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('ProfileSettings', { firstname, lastname }),
            description: t('generalSettings.profileDescription')
        },
        {
            title: t('generalSettings.membership'),
            icon: <Ionicons name="card-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('SubscriptionSettings', { firstname, lastname }),
            description: t('generalSettings.membershipDescription')
        },
        {
            title: t('generalSettings.commentHistory'),
            icon: <Ionicons name="time-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('CommentSettings', { firstname, lastname }),
            description: t('generalSettings.commentHistoryDescription')
        },
        {
            title: t('generalSettings.language'),
            icon: <Ionicons name="language-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('LanguageSettings', { firstname, lastname }),
            description: t('generalSettings.languageDescription')
        },
        {
            title: t('generalSettings.notificationPreferences'),
            icon: <Ionicons name="notifications-outline" size={24} />,
            onPress: () => navigation.navigate('NotificationPreferences', { firstname, lastname }),
            description: t('generalSettings.notificationPreferencesDescription')
        },
        {
            title: t('generalSettings.helpSupport'),
            icon: <Ionicons name="help-circle-outline" size={24} color="#333" />,
            onPress: () => navigation.navigate('HelpSupportSettings', { firstname, lastname }),
            description: t('generalSettings.helpSupportDescription')
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
                    <Text style={styles.userName}>{t('generalSettings.settings')}</Text>
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
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                    <Ionicons name="log-out-outline" size={18} color={MainBrownSecondaryColor} />
                    <Text style={styles.logoutText}>{t('generalSettings.logout')}</Text>
                </TouchableOpacity>
                
                <VerticalSpacer height={30} />
                
                <Text style={styles.versionText}>Version 1.0.2</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
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