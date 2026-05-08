import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Linking, StatusBar } from 'react-native';
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

const HelpSupportSettingScreen = () => {
    const { t } = useLanguage();
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const faqData = [
        { id: 1, question: t('helpSupport.faq1Question'), answer: t('helpSupport.faq1Answer') },
        { id: 2, question: t('helpSupport.faq2Question'), answer: t('helpSupport.faq2Answer') },
        { id: 3, question: t('helpSupport.faq3Question'), answer: t('helpSupport.faq3Answer') },
        { id: 4, question: t('helpSupport.faq4Question'), answer: t('helpSupport.faq4Answer') },
        { id: 5, question: t('helpSupport.faq5Question'), answer: t('helpSupport.faq5Answer') },
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
            <StatusBar barStyle={'dark-content'} />
            <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                <GoBackButton />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="help-circle-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('helpSupport.helpAndSupport')}</Text>
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryIconWrap}>
                            <Ionicons name="mail-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('helpSupport.contactUs')}</Text>
                    </View>
                    <View style={[styles.listCard, main_Style.genButtonElevation]}>
                        <TouchableOpacity
                            style={[styles.row, styles.rowDivider]}
                            onPress={handleEmailPress}
                            activeOpacity={generalActiveOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={t('helpSupport.email')}
                        >
                            <View style={styles.contactIconBubble}>
                                <Ionicons name="mail-outline" size={22} color={MainBrownSecondaryColor} />
                            </View>
                            <View style={styles.contactTextWrap}>
                                <Text style={styles.contactLabel}>{t('helpSupport.email')}</Text>
                                <Text style={styles.contactValue}>nathan.cibonga@sikiya.org</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={withdrawnTitleColor} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.row}
                            onPress={handlePhonePress}
                            activeOpacity={generalActiveOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={t('helpSupport.phone')}
                        >
                            <View style={styles.contactIconBubble}>
                                <Ionicons name="call-outline" size={22} color={MainBrownSecondaryColor} />
                            </View>
                            <View style={styles.contactTextWrap}>
                                <Text style={styles.contactLabel}>{t('helpSupport.phone')}</Text>
                                <Text style={styles.contactValue}>+27 67 875 1255</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={withdrawnTitleColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryIconWrap}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('helpSupport.frequentlyAskedQuestions')}</Text>
                    </View>
                    <View style={[styles.listCard, main_Style.genButtonElevation]}>
                        {faqData.map((faq, index) => (
                            <View key={faq.id}>
                                <TouchableOpacity
                                    style={styles.faqRow}
                                    onPress={() => toggleFAQ(faq.id)}
                                    activeOpacity={generalActiveOpacity}
                                    accessibilityRole="button"
                                    accessibilityState={{ expanded: expandedFAQ === faq.id }}
                                >
                                    <View style={styles.faqTextWrap}>
                                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                                        {expandedFAQ === faq.id ? (
                                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                        ) : null}
                                    </View>
                                    <Ionicons
                                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                                        size={22}
                                        color={withdrawnTitleColor}
                                        style={styles.faqChevron}
                                    />
                                </TouchableOpacity>
                                {index < faqData.length - 1 ? (
                                    <View style={styles.rowDividerFull} />
                                ) : null}
                            </View>
                        ))}
                    </View>
                </View>

                <VerticalSpacer height={32} />
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
        marginBottom: 22,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    categoryIconWrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTitle: {
        marginLeft: 8,
        fontSize: generalTextSize,
        fontWeight: generalTitleFontWeight,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
    },
    listCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        paddingVertical: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
    },
    rowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    rowDividerFull: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 15,
    },
    contactIconBubble: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: lightBannerBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contactTextWrap: {
        flex: 1,
    },
    contactLabel: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 4,
    },
    contactValue: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTextFont,
    },
    faqRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 15,
    },
    faqTextWrap: {
        flex: 1,
        marginRight: 10,
        paddingRight: 4,
    },
    faqQuestion: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        lineHeight: 22,
    },
    faqAnswer: {
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 20,
        marginTop: 10,
    },
    faqChevron: {
        marginTop: 2,
    },
});

export default HelpSupportSettingScreen;
