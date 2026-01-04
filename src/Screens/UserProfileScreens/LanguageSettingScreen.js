import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, cardBackgroundColor, commentTextSize, generalActiveOpacity, generalTextColor, generalTextFont, generalTextFontWeight, generalTextSize, generalTitleFont, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor, withdrawnTitleSize } from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';

const LanguageSettingScreen = () => {
    const [currentLanguage, setCurrentLanguage] = useState('english'); // Current active language
    const [selectedLanguage, setSelectedLanguage] = useState('english'); // Selected language for change

    const languages = [
        {
            id: 'english',
            name: 'English',
            nativeName: 'English',
            icon: '🇬🇧',
        },
        {
            id: 'french',
            name: 'French',
            nativeName: 'Français',
            icon: '🇫🇷',
        }
    ];

    const handleLanguageChange = () => {
        const selectedLang = languages.find(lang => lang.id === selectedLanguage);
        
        Alert.alert(
            'Change Language',
            `Are you sure you want to change the language to ${selectedLang?.name}? The app will restart to apply changes.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        // TODO: Save language preference to AsyncStorage or API
                        // await AsyncStorage.setItem('userLanguage', selectedLanguage);
                        
                        // Update current language
                        setCurrentLanguage(selectedLanguage);
                        
                        Alert.alert(
                            'Language Changed',
                            'Please restart the app to apply language changes.',
                            [{ text: 'OK' }]
                        );
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
                    <Ionicons name="language-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Language</Text>
                </View>

                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>Select Your Language</Text>
                    
                    {/* Language Options */}
                    {languages.map((language) => (
                        <TouchableOpacity
                            key={language.id}
                            style={[
                                styles.languageCard,
                                selectedLanguage === language.id && styles.selectedLanguageCard
                            ]}
                            onPress={() => setSelectedLanguage(language.id)}
                            activeOpacity={generalActiveOpacity}
                        >
                            <View style={styles.languageIconContainer}>
                                <Text style={styles.languageIcon}>{language.icon}</Text>
                            </View>
                            
                            <View style={styles.languageTextContainer}>
                                <View style={styles.languageNameRow}>
                                    <Text style={styles.languageName}>{language.name}</Text>
                                    {currentLanguage === language.id && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>Current</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                            </View>

                            {selectedLanguage === language.id && (
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

                    <VerticalSpacer height={20} />

                    {/* Change Language Button */}
                    <TouchableOpacity 
                        style={[
                            styles.changeButton, 
                            main_Style.genButtonElevation,
                            selectedLanguage === currentLanguage && styles.disabledButton
                        ]} 
                        onPress={handleLanguageChange}
                        activeOpacity={generalActiveOpacity}
                        disabled={selectedLanguage === currentLanguage}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#fff" style={{marginRight: 8}} />
                        <Text style={styles.changeButtonText}>
                            {selectedLanguage === currentLanguage ? 'Already Using This Language' : 'Change Language & Restart'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.warningText}>
                        <Ionicons name="warning-outline" size={14} color={withdrawnTitleColor} /> 
                        {' '}The app will need to be restarted to apply language changes
                    </Text>
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
        marginBottom: 12,
        fontFamily: generalTitleFont,
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
    warningText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        marginTop: 12,
        textAlign: 'center',
        fontFamily: generalTextFont,
        lineHeight: 16,
    },
});

export default LanguageSettingScreen;