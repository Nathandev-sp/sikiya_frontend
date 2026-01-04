import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, Linking, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, cardBackgroundColor, commentTextSize, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleFont, generalTitleFontWeight, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';

const HelpSupportSettingScreen = () => {
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const faqData = [
        {
            id: 1,
            question: "How do I reset my password?",
            answer: "Go to Settings > Profile > Account Security and click 'Change Password'. You'll receive a verification code via email to complete the process."
        },
        {
            id: 2,
            question: "How do I upgrade my membership?",
            answer: "Navigate to Settings > Membership and select your desired plan. You can upgrade anytime, and changes take effect on your next billing cycle."
        },
        {
            id: 3,
            question: "Can I save articles for offline reading?",
            answer: "Yes! Tap the bookmark icon on any article to save it. Premium members get unlimited saves, while free users can save up to 10 articles."
        },
        {
            id: 4,
            question: "How do I report inappropriate content?",
            answer: "Tap the three-dot menu on any article or comment and select 'Report'. Our moderation team reviews all reports within 24 hours."
        },
        {
            id: 5,
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay. All transactions are secured with 256-bit encryption."
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
                    <Ionicons name="help-circle-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>Help & Support</Text>
                </View>

                {/* Contact Us Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    
                    {/* Email */}
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={handleEmailPress}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail-outline" size={16} color={MainBrownSecondaryColor} />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <Text style={styles.contactLabel}>Email</Text>
                            <Text style={styles.contactValue}>nathan.cibonga@sikiya.org</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={withdrawnTitleColor} />
                    </TouchableOpacity>

                    {/* Phone */}
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={handlePhonePress}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="call-outline" size={16} color={MainBrownSecondaryColor} />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <Text style={styles.contactLabel}>Phone</Text>
                            <Text style={styles.contactValue}>+27 67 875 1255</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={withdrawnTitleColor} />
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={20} />

                {/* FAQ Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    
                    {faqData.map((faq, index) => (
                        <View key={faq.id}>
                            <TouchableOpacity 
                                style={styles.faqItem}
                                onPress={() => toggleFAQ(faq.id)}
                                activeOpacity={generalActiveOpacity}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons 
                                        name="help-circle-outline" 
                                        size={20} 
                                        color={MainBrownSecondaryColor} 
                                    />
                                </View>
                                <View style={styles.faqTextContainer}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    {expandedFAQ === faq.id && (
                                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                    )}
                                </View>
                                <Ionicons 
                                    name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={withdrawnTitleColor} 
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
        fontWeight: generalTitleFontWeight,
        color: withdrawnTitleColor,
        marginBottom: 12,
        fontFamily: generalTitleFont,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: secCardBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactLabel: {
        fontSize: commentTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: generalTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    faqTextContainer: {
        flex: 1,
    },
    faqQuestion: {
        fontSize: commentTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
        marginBottom: 0,
    },
    faqAnswer: {
        fontSize: generalTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 4,
    },
});

export default HelpSupportSettingScreen;