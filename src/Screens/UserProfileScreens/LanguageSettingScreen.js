import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, cardBackgroundColor, commentTextSize, generalActiveOpacity, generalSmallTextSize, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleFont, genBtnBackgroundColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, mainBrownColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, withdrawnTitleSize } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';
import { useLanguage } from '../../Context/LanguageContext';
import { Context as AuthContext } from '../../Context/AuthContext';
import SikiyaAPI from '../../../API/SikiyaAPI';
import * as Updates from 'expo-updates';

const LanguageSettingScreen = () => {
    const { state } = useContext(AuthContext);
    const { appLanguage, contentLanguage, changeLanguagePreferences, t } = useLanguage();
    
    const [selectedAppLanguage, setSelectedAppLanguage] = useState(appLanguage);
    const [selectedContentLanguage, setSelectedContentLanguage] = useState(contentLanguage);
    const [isSaving, setIsSaving] = useState(false);

    const appLanguages = [
        {
            id: 'en',
            name: 'English',
            nativeName: 'English',
            icon: '🇬🇧',
        },
        {
            id: 'fr',
            name: 'French',
            nativeName: 'Français',
            icon: '🇫🇷',
        }
    ];

    const contentLanguages = [
        {
            id: 'english',
            name: t('language.englishOnly'),
            description: t('language.englishOnlyDescription'),
        },
        {
            id: 'french',
            name: t('language.frenchOnly'),
            description: t('language.frenchOnlyDescription'),
        },
        {
            id: 'both',
            name: t('language.bothLanguages'),
            description: t('language.bothLanguagesDescription'),
        }
    ];

    // Sync state with context when context changes
    useEffect(() => {
        setSelectedAppLanguage(appLanguage);
        setSelectedContentLanguage(contentLanguage);
    }, [appLanguage, contentLanguage]);

    const hasChanges = () => {
        return selectedAppLanguage !== appLanguage || selectedContentLanguage !== contentLanguage;
    };

    const reloadApp = async () => {
        try {
            // Reload the app to apply language changes
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Error reloading app:', error);
            // Fallback: just show success message
            Alert.alert(
                t('common.success'),
                t('language.languageUpdated'),
                [{ text: t('common.ok') }]
            );
        }
    };

    const handleSaveChanges = async () => {
        if (!hasChanges()) {
            Alert.alert(t('common.error'), t('language.noChangesToSave'));
            return;
        }

        // Show confirmation alert before reloading
        Alert.alert(
            t('language.changeLanguage'),
            t('language.reloadPrompt'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('common.continue'),
                    onPress: async () => {
                        setIsSaving(true);

                        try {
                            // Update local context and AsyncStorage
                            const localResult = await changeLanguagePreferences(selectedAppLanguage, selectedContentLanguage);
                            
                            if (!localResult.success) {
                                throw new Error(localResult.error || t('language.failedToUpdate'));
                            }

                            // Update on backend
                            try {
                                await SikiyaAPI.put(
                                    '/user/language-preferences',
                                    {
                                        appLanguage: selectedAppLanguage,
                                        contentLanguage: selectedContentLanguage,
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${state.token}`,
                                        },
                                    }
                                );
                            } catch (apiError) {
                                console.error('Error updating language preferences on backend:', apiError);
                                // Don't throw - local changes are already saved
                            }

                            // Reload the app to apply changes
                            await reloadApp();
                        } catch (error) {
                            console.error('Error saving language preferences:', error);
                            Alert.alert(
                                t('common.error'),
                                error.message || t('language.failedToSave'),
                                [{ text: t('common.ok') }]
                            );
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Header Section */}
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="language" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('language.appLanguage')}</Text>
                </View>

                {/* App Language Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>{t('language.selectAppLanguage')}</Text>
                    <Text style={styles.sectionDescription}>{t('language.appLanguageDescription')}</Text>
                    
                    <VerticalSpacer height={12} />
                    
                    {/* App Language Options */}
                    {appLanguages.map((language) => (
                        <TouchableOpacity
                            key={language.id}
                            style={[
                                styles.languageCard,
                                main_Style.genContentElevation,
                                selectedAppLanguage === language.id && styles.selectedLanguageCard
                            ]}
                            onPress={() => setSelectedAppLanguage(language.id)}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={styles.languageIconContainer}>
                                <Text style={styles.languageIcon}>{language.icon}</Text>
                            </View>
                            
                            <View style={styles.languageTextContainer}>
                                <View style={styles.languageNameRow}>
                                    <Text style={styles.languageName}>{language.name}</Text>
                                    {appLanguage === language.id && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>{t('common.current') || 'Current'}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                            </View>

                            {selectedAppLanguage === language.id && (
                                <View style={styles.checkmarkContainer}>
                                    <Ionicons 
                                        name="checkmark-circle" 
                                        size={22} 
                                        color={MainBrownSecondaryColor} 
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <VerticalSpacer height={20} />

                {/* Content Language Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>{t('language.selectContentLanguage')}</Text>
                    <Text style={styles.sectionDescription}>{t('language.contentLanguageDescription')}</Text>
                    
                    <VerticalSpacer height={12} />
                    
                    {/* Content Language Options */}
                    {contentLanguages.map((language) => (
                        <TouchableOpacity
                            key={language.id}
                            style={[
                                styles.contentLanguageCard,
                                main_Style.genContentElevation,
                                selectedContentLanguage === language.id && styles.selectedLanguageCard
                            ]}
                            onPress={() => setSelectedContentLanguage(language.id)}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={styles.contentLanguageTextContainer}>
                                <View style={styles.languageNameRow}>
                                    <Text style={styles.languageName}>{language.name}</Text>
                                    {contentLanguage === language.id && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>{t('common.current') || 'Current'}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.contentLanguageDescription}>{language.description}</Text>
                            </View>

                            {selectedContentLanguage === language.id && (
                                <View style={styles.checkmarkContainer}>
                                    <Ionicons 
                                        name="checkmark-circle" 
                                        size={22} 
                                        color={MainBrownSecondaryColor} 
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <VerticalSpacer height={20} />

                {/* Save Changes Button */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <TouchableOpacity 
                        style={[
                            styles.changeButton, 
                            main_Style.genButtonElevation,
                            (!hasChanges() || isSaving) && styles.disabledButton
                        ]} 
                        onPress={handleSaveChanges}
                        activeOpacity={generalActiveOpacity}
                        disabled={!hasChanges() || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
                                <Text style={styles.changeButtonText}>{t('language.reloadingApp')}</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="#fff" style={{marginRight: 8}} />
                                <Text style={styles.changeButtonText}>
                                    {!hasChanges() ? t('common.noChanges') || 'No Changes' : t('common.save')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={30} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        padding: 18,
        
    },
    sectionTitle: {
        fontSize: generalTextSize+1,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        marginBottom: 8,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
    },
    sectionDescription: {
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
        marginBottom: 4,
    },
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 0.8,
        borderColor: "#CCC",
        marginBottom: 12,
        backgroundColor: AppScreenBackgroundColor,
    },
    selectedLanguageCard: {
        borderColor: MainBrownSecondaryColor,
        borderWidth: 1.2,
        backgroundColor: lightBannerBackgroundColor,
    },
    languageIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    languageIcon: {
        fontSize: 24,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    languageName: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginRight: 8,
        letterSpacing: 0.2,
    },
    currentBadge: {
        backgroundColor: '#2BA1E6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: generalTextFont,
        letterSpacing: 0.3,
    },
    languageNativeName: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        fontStyle: 'italic',
    },
    checkmarkContainer: {
        marginLeft: 8,
    },
    contentLanguageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        backgroundColor: AppScreenBackgroundColor,
    },
    contentLanguageTextContainer: {
        flex: 1,
    },
    contentLanguageDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 4,
        lineHeight: 18,
    },
    changeButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 4,
        shadowColor: MainBrownSecondaryColor,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: withdrawnTitleColor,
        opacity: 0.7,
    },
    changeButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: '700',
        fontFamily: generalTitleFont,
        letterSpacing: 0.5,
    },
});

export default LanguageSettingScreen;