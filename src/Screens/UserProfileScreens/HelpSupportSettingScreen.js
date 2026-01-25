import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, Linking, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, cardBackgroundColor, commentTextSize, generalActiveOpacity, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, generalTitleFontWeight, genBtnBackgroundColor, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';
import { useLanguage } from '../../Context/LanguageContext';

const HelpSupportSettingScreen = () => {
    const { t } = useLanguage();
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const faqData = [
        {
            id: 1,
            question: t('helpSupport.faq1Question'),
            answer: t('helpSupport.faq1Answer')
        },
        {
            id: 2,
            question: t('helpSupport.faq2Question'),
            answer: t('helpSupport.faq2Answer')
        },
        {
            id: 3,
            question: t('helpSupport.faq3Question'),
            answer: t('helpSupport.faq3Answer')
        },
        {
            id: 4,
            question: t('helpSupport.faq4Question'),
            answer: t('helpSupport.faq4Answer')
        },
        {
            id: 5,
            question: t('helpSupport.faq5Question'),
            answer: t('helpSupport.faq5Answer')
        }
    ];

    const handleEmailPress = () => {
        Linking.openURL('mailto:nathan.cibonga@sikiya.org');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+27678751255');
    };

    const toggleFAQ = (id) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
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
                    <Ionicons name="help-circle" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('helpSupport.helpAndSupport')}</Text>
                </View>

                {/* Contact Us Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>{t('helpSupport.contactUs')}</Text>
                    
                    {/* Email */}
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={handleEmailPress}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail" size={20} color={MainBrownSecondaryColor} />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <Text style={styles.contactLabel}>{t('helpSupport.email')}</Text>
                            <Text style={styles.contactValue}>nathan.cibonga@sikiya.org</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={withdrawnTitleColor} />
                    </TouchableOpacity>

                    {/* Phone */}
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={handlePhonePress}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="call" size={20} color={MainBrownSecondaryColor} />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <Text style={styles.contactLabel}>{t('helpSupport.phone')}</Text>
                            <Text style={styles.contactValue}>+27 67 875 1255</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={withdrawnTitleColor} />
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={20} />

                {/* FAQ Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>{t('helpSupport.frequentlyAskedQuestions')}</Text>
                    
                    {faqData.map((faq, index) => (
                        <View key={faq.id}>
                            <TouchableOpacity 
                                style={styles.faqItem}
                                onPress={() => toggleFAQ(faq.id)}
                                activeOpacity={generalActiveOpacity}
                            >
                                <View style={styles.faqTextContainer}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    {expandedFAQ === faq.id && (
                                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                    )}
                                </View>
                                <Ionicons 
                                    name={expandedFAQ === faq.id ? "chevron-up-circle" : "chevron-down-circle"} 
                                    size={24} 
                                    color={MainBrownSecondaryColor} 
                                />
                            </TouchableOpacity>
                            {index < faqData.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
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
        backgroundColor: genBtnBackgroundColor,
        borderRadius: 16,
        marginHorizontal: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: generalTextSize,
        fontWeight: '700',
        color: MainBrownSecondaryColor,
        marginBottom: 16,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: '#E5E7EB',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactLabel: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    contactValue: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    faqTextContainer: {
        flex: 1,
        marginRight: 8,
    },
    faqQuestion: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        fontWeight: '600',
        marginBottom: 0,
        letterSpacing: 0.2,
        lineHeight: 20,
    },
    faqAnswer: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
        marginTop: 10,
        paddingRight: 4,
    },
    divider: {
        height: 1.5,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
});

export default HelpSupportSettingScreen;