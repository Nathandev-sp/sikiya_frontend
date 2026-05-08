import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, {
    defaultButtonHitslop,
    generalActiveOpacity,
    generalSmallTextSize,
    generalTextColor,
    generalTextFont,
    generalTextFontWeight,
    generalTextSize,
    generalTitleFont,
    generalTitleFontWeight,
    largeTextSize,
    main_Style,
    MainBrownSecondaryColor,
    secCardBackgroundColor,
    settingsStyles,
    withdrawnTitleColor,
    withdrawnTitleSize,
    lightBannerBackgroundColor,
    articleTitleSize,
    generalTitleColor,
} from '../../styles/GeneralAppStyle';
import { Ionicons } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import CountryPicker from '../../Components/CountryPicker';
import AfricanCountries from '../../../assets/Data/AfricanCountries.json';
import SikiyaAPI from '../../../API/SikiyaAPI';
import BigLoaderAnim from '../../Components/LoadingComps/BigLoaderAnim';
import * as ImagePicker from 'expo-image-picker';
import SmallLoadingState from '../../Components/LoadingComps/SmallLoadingState';
import { getImageUrl } from '../../utils/imageUrl';
import { Context as AuthContext } from '../../Context/AuthContext';
import { useLanguage } from '../../Context/LanguageContext';

const ProfileSettingScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { state } = useContext(AuthContext);
    const { firstname: initialFirstname, lastname: initialLastname } = route.params || {};
    const scrollViewRef = useRef(null);
    const displayNameInputRef = useRef(null);
    const biographyInputRef = useRef(null);
    const areaOfExpertiseInputRef = useRef(null);
    const displayNameContainerRef = useRef(null);
    const biographyContainerRef = useRef(null);
    const areaOfExpertiseContainerRef = useRef(null);

    const [firstname, setFirstname] = useState(initialFirstname || '');
    const [lastname, setLastname] = useState(initialLastname || '');
    const [customDisplayName, setCustomDisplayName] = useState('');
    const [useFullNameAsDisplay, setUseFullNameAsDisplay] = useState(true);
    const [biography, setBiography] = useState('');
    const [interestedCountry, setInterestedCountry] = useState('');
    const [areaOfExpertise, setAreaOfExpertise] = useState('');
    const [respectScore, setRespectScore] = useState(75); // Example score
    const [profileImageKey, setProfileImageKey] = useState(null);
    const [profileImageVersion, setProfileImageVersion] = useState(Date.now()); // Cache-busting version
    const [uploadingImage, setUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const { t } = useLanguage();
    
    // Focus states for inputs
    const [displayNameFocused, setDisplayNameFocused] = useState(false);
    const [biographyFocused, setBiographyFocused] = useState(false);
    const [areaOfExpertiseFocused, setAreaOfExpertiseFocused] = useState(false);

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadUserProfile = async () => {
        setIsInitialLoading(true);
        try {
            const response = await SikiyaAPI.get('/settings/user/profile');
            const profile = response.data;
            setFirstname(profile.firstname || '');
            setLastname(profile.lastname || '');
            
            // Check if displayName is custom or matches first+last name
            const defaultDisplayName = `${profile.firstname || ''} ${profile.lastname || ''}`.trim();
            const hasCustomDisplayName = profile.displayName && profile.displayName !== defaultDisplayName;
            
            setCustomDisplayName(profile.displayName || '');
            setUseFullNameAsDisplay(!hasCustomDisplayName); // Toggle is OFF if custom display name exists
            
            setBiography(profile.bio || '');
            setInterestedCountry(profile.interested_african_country || '');
            setAreaOfExpertise(profile.area_of_expertise || '');
            setRespectScore(profile.trust_score || 0);
            setUserRole(profile.role || null);
            setProfileImageKey(profile.profile_picture || null);
        } catch (err) {
            Alert.alert(t('common.error'), t('alerts.errorDescription'));
        } finally {
            setIsInitialLoading(false);
        }
    };

    // Upload image to server
    const uploadImage = async (uri) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            });

            const response = await SikiyaAPI.post('/user/profile/upload-profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setProfileImageKey(response.data.imageKey);
            setProfileImageVersion(Date.now());
        } catch (error) {
            Alert.alert(t('alerts.uploadFailed'), t('alerts.uploadFailedDescription'));
            setProfileImageKey(null);
        } finally {
            setUploadingImage(false);
        }
    };

    // Pick image from gallery or camera
    const pickImage = async () => {
        Alert.alert(
            t('alerts.changeProfilePhoto'),
            t('alerts.chooseOption'),
            [
                {
                    text: t('alerts.camera'),
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert(t('alerts.permissionNeeded'), t('alerts.cameraPermissionDescription'));
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            uploadImage(result.assets[0].uri);
                        }
                    }
                },
                {
                    text: t('alerts.gallery'),
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert(t('alerts.permissionNeeded'), t('alerts.galleryPermissionDescription'));
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            uploadImage(result.assets[0].uri);
                        }
                    }
                },
                { text: t('common.cancel'), style: "cancel" }
            ]
        );
    };

    //Load profile when the component is mounted
    useEffect(() => {
        loadUserProfile();
    }, []);

    // Generate display name based on toggle
    const displayName = useFullNameAsDisplay 
        ? `${firstname} ${lastname}`.trim() 
        : customDisplayName;

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const response = await SikiyaAPI.put('/settings/user/profile', {
                displayName: customDisplayName,
                bio: biography,
                interested_african_country: interestedCountry,
                area_of_expertise: areaOfExpertise,
                useFullNameAsDisplay: useFullNameAsDisplay,
                profile_picture: profileImageKey // Include profile image key if uploaded
            });

            if (response.data.success) {
                // Update local state with returned profile data
                const updatedProfile = response.data.profile;
                setFirstname(updatedProfile.firstname);
                setLastname(updatedProfile.lastname);
                setCustomDisplayName(updatedProfile.displayName);
                setBiography(updatedProfile.bio);
                setInterestedCountry(updatedProfile.interested_african_country);
                setAreaOfExpertise(updatedProfile.area_of_expertise);
                setRespectScore(updatedProfile.trust_score);

                // Navigate back and trigger refresh on UserProfileScreen
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('alerts.error'), t('alerts.errorDescription'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        Alert.alert(
            'Request Password Reset',
            'We will send a password reset link to your email address. Continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Send Link',
                    onPress: async () => {
                        try {
                            // Get user's email from state
                            const userEmail = state?.email;
                            
                            if (!userEmail) {
                                Alert.alert('Error', 'Unable to retrieve your email address. Please use the Forgot Password screen.');
                                return;
                            }

                            // Call API to request password reset
                            const response = await SikiyaAPI.post('/forgot-password', { email: userEmail });
                            
                            Alert.alert(
                                'Reset Link Sent',
                                'A password reset link has been sent to your email. Please check your email and click the link to reset your password.',
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            console.error('Error requesting password reset:', error);
                            const errorMessage = error.response?.data?.error || error.message || 'Failed to send reset link. Please try again.';
                            Alert.alert('Error', errorMessage);
                        }
                    }
                }
            ]
        );
    };

    const getRoleDisplayText = (role) => {
        if (!role) return '';
        const roleMap = {
            'journalist': 'Journalist',
            'thoughtleader': 'Thought Leader',
            'contributor': 'Contributor',
            'general': 'Member',
            'needID': 'Member'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    if (isInitialLoading) {
        return (
            <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
                <StatusBar barStyle={'dark-content'} />
                <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                    <GoBackButton />
                </View>
                <View style={styles.initialLoadingBox}>
                    <BigLoaderAnim />
                    <Text style={styles.loadingSubtext}>{t('common.loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[main_Style.safeArea, styles.container]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                <GoBackButton />
            </View>

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                contentInset={{ bottom: 40 }}
                scrollIndicatorInsets={{ bottom: 40 }}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={settingsStyles.headerSection}>
                    <Ionicons name="person-circle-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>{t('generalSettings.profileSettings')}</Text>
                </View>

                <View style={styles.heroBlock}>
                    <TouchableOpacity
                        style={styles.profileImageContainer}
                        onPress={pickImage}
                        activeOpacity={0.7}
                        disabled={uploadingImage}
                    >
                        <View style={[styles.profileImageWrapper, uploadingImage && styles.profileImageLoading]}>
                            {uploadingImage ? (
                                <SmallLoadingState />
                            ) : profileImageKey ? (
                                <Image
                                    key={`${profileImageKey}-${profileImageVersion}`}
                                    source={{
                                        uri: `${getImageUrl(profileImageKey)}?v=${profileImageVersion}`,
                                    }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <Image
                                    source={require('../../../assets/functionalImages/ProfilePic.png')}
                                    style={styles.profileImage}
                                />
                            )}
                        </View>
                        <View style={styles.cameraIconOverlay}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {userRole ? (
                        <View style={styles.roleTag}>
                            <Text style={styles.roleTagText}>{getRoleDisplayText(userRole)}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="trophy-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('profile.trustScore')}</Text>
                    </View>
                    <View style={[styles.listCard, main_Style.genButtonElevation]}>
                        <View style={styles.nameTitleSection}>
                            <Text style={styles.nameTitle}>
                                {firstname && lastname
                                    ? `${firstname} ${lastname}`.trim()
                                    : firstname || lastname || '—'}
                            </Text>
                        </View>
                        <View style={styles.scoreRow}>
                            <Text style={styles.scorePercentage}>{respectScore}%</Text>
                            <View style={styles.scoreBarBackground}>
                                <View style={[styles.scoreBarFill, { width: `${Math.min(100, Math.max(0, respectScore))}%` }]} />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="create-outline" size={20} color={withdrawnTitleColor} />
                        </View>
                        <Text style={styles.categoryTitle}>{t('generalSettings.profile')}</Text>
                    </View>
                    <View style={[styles.listCard, main_Style.genButtonElevation]}>
                    <View style={styles.toggleGroup}>
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleLabel}>{t('profileSettings.useFullNameAsDisplay')}</Text>
                        </View>
                        <Switch
                            value={useFullNameAsDisplay}
                            onValueChange={setUseFullNameAsDisplay}
                            trackColor={{ false: '#d3d3d3', true: MainBrownSecondaryColor }}
                            thumbColor={'#fff'}
                        />
                    </View>

                    {/* Display Name (editable when toggle is OFF) */}
                    <View style={styles.inputGroup} ref={displayNameContainerRef}>
                        <View style={styles.labelContainer}>
                           
                            <Text style={styles.label}>{t('profile.displayName')}</Text>
                        </View>
                        {useFullNameAsDisplay ? (
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledInputText}>{displayName || 'Not set'}</Text>
                            </View>
                        ) : (
                            <View style={[
                                styles.inputContainer,
                                displayNameFocused && styles.inputFocused
                            ]}>
                                <Ionicons name="at-outline" style={styles.inputIcon} />
                                <TextInput
                                    ref={displayNameInputRef}
                                    style={styles.inputText}
                                    value={customDisplayName}
                                    onChangeText={setCustomDisplayName}
                                    placeholder={t('profileSettings.displayNamePlaceholder')}
                                    placeholderTextColor="#aaa"
                                    autoCapitalize="none"
                                    hitSlop={defaultButtonHitslop}
                                    onFocus={() => {
                                        setDisplayNameFocused(true);
                                        // Scroll to a specific position to bring input into view
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                                        }, 300);
                                    }}
                                    onBlur={() => setDisplayNameFocused(false)}
                                />
                            </View>
                        )}
                        <Text style={styles.helperText}>
                            {useFullNameAsDisplay 
                                ? t('profileSettings.thisIsGeneratedFromYourFirstLastName') 
                                : t('profileSettings.thisIsHowYourNameAppearsToOthers')}
                        </Text>
                    </View>

                     {/* Interested African Country */}
                     <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            
                            <Text style={styles.label}>{t('profile.africanCountryOfInterest')}</Text>
                        </View>
                        <CountryPicker
                            value={interestedCountry}
                            onSelect={country => setInterestedCountry(country)}
                            countryList={AfricanCountries}
                            error={false}
                            label={t('profile.africanCountryOfInterest')}
                            placeholder={t('profile.africanCountryOfInterestPlaceholder')}
                        />
                        <Text style={styles.helperText}>
                            {t('profile.africanCountryOfInterestPlaceholder')}
                        </Text>
                    </View>

                    {/* Area of Expertise */}
                    <View style={styles.inputGroup} ref={areaOfExpertiseContainerRef}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{t('profile.areaOfExpertise')}</Text>
                        </View>
                        <TextInput
                            ref={areaOfExpertiseInputRef}
                            style={[
                                styles.input,
                                styles.inputBrownBorder,
                                styles.textAreaExpertise,
                                areaOfExpertiseFocused && styles.inputFocused,
                            ]}
                            value={areaOfExpertise}
                            onChangeText={setAreaOfExpertise}
                            placeholder={t('onboarding.areaOfExpertisePlaceholder')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                            onFocus={() => {
                                setAreaOfExpertiseFocused(true);
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ y: 400, animated: true });
                                }, 300);
                            }}
                            onBlur={() => setAreaOfExpertiseFocused(false)}
                        />
                        <Text style={styles.helperText}>
                            {`${t('profileSettings.listYourProfessionalSkillsKnowledgeAreasOrInterests')} (${areaOfExpertise.length}/300)`}
                        </Text>
                    </View>

                    {/* Biography */}
                    <View style={styles.inputGroup} ref={biographyContainerRef}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{t('profile.bio')}</Text>
                        </View>
                        <TextInput
                            ref={biographyInputRef}
                            style={[
                                styles.input,
                                styles.inputBrownBorder,
                                styles.textArea,
                                biographyFocused && styles.inputFocused,
                            ]}
                            value={biography}
                            onChangeText={setBiography}
                            placeholder={t('profile.bioPlaceholder')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            onFocus={() => {
                                setBiographyFocused(true);
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ y: 520, animated: true });
                                }, 300);
                            }}
                            onBlur={() => setBiographyFocused(false)}
                        />
                        <Text style={styles.helperText}>
                            {t('onboarding.descriptionPlaceholder')} ({biography.length}/500)
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, main_Style.genButtonElevation, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        activeOpacity={generalActiveOpacity}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={AppScreenBackgroundColor} size="small" />
                        ) : (
                            <Ionicons name="save-outline" size={18} color={AppScreenBackgroundColor} />
                        )}
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                    </TouchableOpacity>
                    </View>
                </View>

                <VerticalSpacer height={35} />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor,
    },
    initialLoadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSubtext: {
        marginTop: 12,
        fontSize: generalSmallTextSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    heroBlock: {
        alignItems: 'center',
        paddingTop: 4,
        paddingBottom: 8,
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
    listCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 0.8,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImageWrapper: {
        overflow: 'hidden',
    },
    profileImageLoading: {
        opacity: 0.85,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 2,
        borderWidth: 3,
        borderColor: MainBrownSecondaryColor,
        backgroundColor: AppScreenBackgroundColor,
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: MainBrownSecondaryColor,
        borderRadius: 18,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    roleTag: {
        marginTop: 4,
        alignSelf: 'center',
        backgroundColor: MainBrownSecondaryColor,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    roleTagText: {
        color: '#fff',
        fontSize: generalSmallTextSize,
        fontWeight: '600',
        fontFamily: generalTitleFont,
        letterSpacing: 0.4,
    },
    nameTitleSection: {
        marginBottom: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    nameTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
    },
    scoreRow: {
        paddingTop: 8,
    },
    scorePercentage: {
        fontSize: largeTextSize,
        fontWeight: 'bold',
        color: MainBrownSecondaryColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
        marginBottom: 8,
    },
    scoreBarBackground: {
        height: 8,
        backgroundColor: secCardBackgroundColor,
        borderRadius: 6,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        backgroundColor: MainBrownSecondaryColor,
        borderRadius: 6,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    label: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    inputBrownBorder: {
        borderWidth: 0.5,
        borderColor: MainBrownSecondaryColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        paddingHorizontal: 12,
    },
    inputIcon: {
        fontSize: 20,
        color: MainBrownSecondaryColor,
        marginRight: 8,
    },
    inputText: {
        flex: 1,
        paddingVertical: 10,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
    },
    textArea: {
        minHeight: 110,
        maxHeight: 160,
        paddingTop: 12,
        paddingBottom: 12,
    },
    /** ~2 lines — compact vs bio */
    textAreaExpertise: {
        minHeight: 52,
        maxHeight: 72,
        paddingTop: 10,
        paddingBottom: 10,
    },
    inputFocused: {
        borderColor: MainBrownSecondaryColor,
        borderWidth: 1,
        backgroundColor: lightBannerBackgroundColor,
    },
    disabledInput: {
        backgroundColor: lightBannerBackgroundColor,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    disabledInputText: {
        color: generalTextColor,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
    },
    helperText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        marginTop: 6,
        fontFamily: generalTextFont,
        lineHeight: 18,
    },
    toggleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 14,
    },
    toggleLabel: {
        fontSize: generalTextSize,
        fontWeight: generalTextFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
    },
    saveButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: '700',
        fontFamily: generalTitleFont,
    },
});

export default ProfileSettingScreen;