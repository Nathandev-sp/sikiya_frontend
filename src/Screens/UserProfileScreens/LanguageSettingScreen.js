import React, { useState, useContext, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, {
    generalActiveOpacity,
    generalSmallTextSize,
    generalTextColor,
    generalTextFont,
    generalTextFontWeight,
    generalTextSize,
    generalTitleFont,
    generalTitleFontWeight,
    main_Style,
    MainBrownSecondaryColor,
    settingsStyles,
    withdrawnTitleColor,
    lightBannerBackgroundColor,
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useLanguage } from '../../Context/LanguageContext';
import { Context as AuthContext } from '../../Context/AuthContext';
import SikiyaAPI from '../../../API/SikiyaAPI';
import * as Updates from 'expo-updates';

const LanguageSettingScreen = () => {
    const { state } = useContext(AuthContext);
    const { appLanguage, contentLanguage, changeLanguagePreferences, t } = useLanguage();
    const [saving, setSaving] = useState(false);

    const appLanguages = [
        { id: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
        { id: 'fr', name: 'French', nativeName: 'Français', icon: '🇫🇷' },
    ];

    const contentLanguages = [
        { id: 'english', name: t('language.englishOnly'), description: t('language.englishOnlyDescription') },
        { id: 'french', name: t('language.frenchOnly'), description: t('language.frenchOnlyDescription') },
        { id: 'both', name: t('language.bothLanguages'), description: t('language.bothLanguagesDescription') },
    ];

    const reloadApp = async () => {
        try {
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Error reloading app:', error);
            Alert.alert(t('common.success'), t('language.languageUpdated'), [{ text: t('common.ok') }]);
        }
    };

    const persistToBackend = useCallback(
        async (nextApp, nextContent) => {
            if (!state?.token) return;
            try {
                await SikiyaAPI.put(
                    '/user/language-preferences',
                    { appLanguage: nextApp, contentLanguage: nextContent },
                    { headers: { Authorization: `Bearer ${state.token}` } }
                );
            } catch (apiError) {
                console.error('Error updating language preferences on backend:', apiError);
            }
        },
        [state?.token]
    );

    const handleSelectAppLanguage = async (languageId) => {
        if (languageId === appLanguage || saving) return;

        Alert.alert(t('language.changeLanguage'), t('language.reloadPrompt'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.continue'),
                onPress: async () => {
                    setSaving(true);
                    try {
                        const localResult = await changeLanguagePreferences(languageId, contentLanguage);
                        if (!localResult.success) {
                            throw new Error(localResult.error || t('language.failedToUpdate'));
                        }
                        await persistToBackend(languageId, contentLanguage);
                        await reloadApp();
                    } catch (error) {
                        console.error('Error saving app language:', error);
                        Alert.alert(t('common.error'), error.message || t('language.failedToSave'), [
                            { text: t('common.ok') },
                        ]);
                    } finally {
                        setSaving(false);
                    }
                },
            },
        ]);
    };

    const handleSelectContentLanguage = async (languageId) => {
        if (languageId === contentLanguage || saving) return;

        setSaving(true);
        try {
            const localResult = await changeLanguagePreferences(appLanguage, languageId);
            if (!localResult.success) {
                throw new Error(localResult.error || t('language.failedToUpdate'));
            }
            await persistToBackend(appLanguage, languageId);
        } catch (error) {
            console.error('Error saving content language:', error);
            Alert.alert(t('common.error'), error.message || t('language.failedToSave'), [{ text: t('common.ok') }]);
        } finally {
            setSaving(false);
        }
    };

    const renderSelectableRow = (key, selected, onPress, label, description, isLast) => (
        <TouchableOpacity
            key={key}
            style={[
                styles.preferenceItem,
                !isLast && styles.preferenceItemBorder,
                selected && styles.preferenceItemSelected,
            ]}
            onPress={onPress}
            activeOpacity={generalActiveOpacity}
            disabled={saving}
        >
            <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceLabel}>{label}</Text>
                {description ? <Text style={styles.preferenceDescription}>{description}</Text> : null}
            </View>
            {selected ? (
                <Ionicons name="checkmark" size={22} color={MainBrownSecondaryColor} />
            ) : (
                <View style={styles.checkPlaceholder} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={'dark-content'} />
            <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                <GoBackButton />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="language-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('settings.language')}</Text>
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="phone-portrait-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('language.appLanguage')}</Text>
                    </View>

                    <View style={[styles.preferencesContainer, main_Style.genButtonElevation]}>
                        {appLanguages.map((language, idx) =>
                            renderSelectableRow(
                                language.id,
                                appLanguage === language.id,
                                () => handleSelectAppLanguage(language.id),
                                `${language.icon} ${language.name}`,
                                language.nativeName !== language.name ? language.nativeName : null,
                                idx === appLanguages.length - 1
                            )
                        )}
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="newspaper-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('language.contentLanguage')}</Text>
                    </View>

                    <View style={[styles.preferencesContainer, main_Style.genButtonElevation]}>
                        {contentLanguages.map((language, idx) =>
                            renderSelectableRow(
                                language.id,
                                contentLanguage === language.id,
                                () => handleSelectContentLanguage(language.id),
                                language.name,
                                language.description,
                                idx === contentLanguages.length - 1
                            )
                        )}
                    </View>
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
    categoryContainer: {
        marginBottom: 25,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: withdrawnTitleColor,
        marginLeft: 8,
        fontFamily: generalTitleFont,
    },
    preferencesContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    preferenceItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    preferenceItemSelected: {
        backgroundColor: lightBannerBackgroundColor,
    },
    preferenceTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    preferenceLabel: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        marginBottom: 4,
        fontFamily: generalTitleFont,
    },
    preferenceDescription: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    checkPlaceholder: {
        width: 22,
        height: 22,
    },
});

export default LanguageSettingScreen;
