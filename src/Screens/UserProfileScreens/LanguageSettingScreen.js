import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, cardBackgroundColor, commentTextSize, generalActiveOpacity, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleFont, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, withdrawnTitleSize } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';
import { useLanguage } from '../../Context/LanguageContext';
import { Context as AuthContext } from '../../Context/AuthContext';
import SikiyaAPI from '../../../API/SikiyaAPI';

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
            description: 'See only English articles and videos',
        },
        {
            id: 'french',
            name: t('language.frenchOnly'),
            description: 'See only French articles and videos',
        },
        {
            id: 'both',
            name: t('language.bothLanguages'),
            description: 'See articles and videos in all languages',
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

    const handleSaveChanges = async () => {
        if (!hasChanges()) {
            Alert.alert(t('common.error'), 'No changes to save');
            return;
        }

        setIsSaving(true);

        try {
            // Update local context and AsyncStorage
            const localResult = await changeLanguagePreferences(selectedAppLanguage, selectedContentLanguage);
            
            if (!localResult.success) {
                throw new Error(localResult.error || 'Failed to update local preferences');
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

            Alert.alert(
                t('common.success'),
                t('language.languageChanged'),
                [{ text: t('common.ok') }]
            );
        } catch (error) {
            console.error('Error saving language preferences:', error);
            Alert.alert(
                t('common.error'),
                error.message || 'Failed to save language preferences',
                [{ text: t('common.ok') }]
            );
        } finally {
            setIsSaving(false);
        }
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
                    <Ionicons name="language-outline" style={settingsStyles.headerIcon} />
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
                                        size={20} 
                                        color={'#007AA3'} 
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
                                        size={20} 
                                        color={'#007AA3'} 
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
                            <ActivityIndicator color="#fff" size="small" />
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
        backgroundColor: '#f8f8f8',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        padding: 16,
    },
    sectionTitle: {
        fontSize: articleTextSize,
        fontWeight: generalTextFontWeight,
        color: withdrawnTitleColor,
        marginBottom: 4,
        fontFamily: generalTitleFont,
    },
    sectionDescription: {
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    selectedLanguageCard: {
        borderColor: '#007AA3',
        backgroundColor: secCardBackgroundColor,
    },
    languageIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
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
        marginBottom: 2,
    },
    languageName: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        marginRight: 8,
    },
    currentBadge: {
        backgroundColor: '#007AA3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: generalTextFont,
    },
    languageNativeName: {
        fontSize: 12,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
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
        borderColor: '#e0e0e0',
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    contentLanguageTextContainer: {
        flex: 1,
    },
    contentLanguageDescription: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 4,
    },
    changeButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    disabledButton: {
        backgroundColor: withdrawnTitleColor,
        opacity: 0.7,
    },
    changeButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        fontFamily: generalTitleFont,
    },
});

export default LanguageSettingScreen;