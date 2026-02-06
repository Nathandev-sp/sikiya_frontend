import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, Linking, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, articleTitleSize, auth_Style, cardBackgroundColor, commentTextSize, defaultButtonHitslop, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, largeTextSize, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize, lightBannerBackgroundColor, genBtnBackgroundColor, mainBrownColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
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
    const [showVerificationInfo, setShowVerificationInfo] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [profileImageKey, setProfileImageKey] = useState(null);
    const [profileImageVersion, setProfileImageVersion] = useState(Date.now()); // Cache-busting version
    const [uploadingImage, setUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const { t } = useLanguage();
    
    // Focus states for inputs
    const [displayNameFocused, setDisplayNameFocused] = useState(false);
    const [biographyFocused, setBiographyFocused] = useState(false);
    const [areaOfExpertiseFocused, setAreaOfExpertiseFocused] = useState(false);

    //Adding states for loading and error handling can be done here
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadUserProfile = async () => {
        setIsLoading(true);
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
            setIsVerified(profile.isVerified || false);
            setUserRole(profile.role || null);
            setProfileImageKey(profile.profile_picture || null);
        } catch (error) {
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
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
            // Update version to force image refresh (cache-busting)
            setProfileImageVersion(Date.now());
            console.log('Profile image uploaded successfully');
            console.log('Profile image key:', response.data.imageKey);
            console.log('Profile image URL:', response.data.imageUrl);
        } catch (error) {
            console.log('Image upload error:', error);
            console.log('Error response:', error.response?.data);
            console.log('Error status:', error.response?.status);
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
            setIsLoading(true);
            
            const response = await SikiyaAPI.put('/settings/user/profile', {
                displayName: customDisplayName,
                bio: biography,
                interested_african_country: interestedCountry,
                area_of_expertise: areaOfExpertise,
                useFullNameAsDisplay: useFullNameAsDisplay,
                profile_picture: profileImageKey // Include profile image key if uploaded
            });

            if (response.data.success) {
                console.log('Profile updated successfully');
                
                // Update local state with returned profile data
                const updatedProfile = response.data.profile;
                setFirstname(updatedProfile.firstname);
                setLastname(updatedProfile.lastname);
                setCustomDisplayName(updatedProfile.displayName);
                setBiography(updatedProfile.bio);
                setInterestedCountry(updatedProfile.interested_african_country);
                setAreaOfExpertise(updatedProfile.area_of_expertise);
                setRespectScore(updatedProfile.trust_score);
                setIsVerified(updatedProfile.isVerified);
                
                // Navigate back and trigger refresh on UserProfileScreen
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('alerts.error'), t('alerts.errorDescription'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailPress = () => {
        Linking.openURL('mailto:nathan.cibonga@sikiya.org');
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

    if (isLoading) {
        return (
            <SafeAreaView style={[main_Style.safeArea]} edges={['top', 'left', 'right']}>
                <BigLoaderAnim />
            </SafeAreaView>
        );
    }
    console.log('Profile image key:', profileImageKey);
    console.log('Profile image URL updated:', getImageUrl(profileImageKey));

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
            >
                
                {/* Header Section */}
                <View style={styles.headerSection}>
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
                                    onError={(error) => {
                                        console.log('Image load error:', error);
                                    }}
                                />
                            ) : (
                                <Image 
                                    source={require('../../../assets/functionalImages/ProfilePic.png')}
                                    style={styles.profileImage} 
                                />
                            )}
                        </View>
                        <View style={styles.cameraIconOverlay}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {userRole && (
                        <View style={styles.roleTag}>
                            <Text style={styles.roleTagText}>{getRoleDisplayText(userRole)}</Text>
                        </View>
                    )}
                </View>

                {/* Respect Score Display */}
                <View style={[styles.formContainerName, main_Style.genButtonElevation]}>
                    {/* Name Title Section */}
                    <View style={styles.nameTitleSection}>
                        <Text style={styles.nameTitle}>
                            {firstname && lastname 
                                ? `${firstname} ${lastname}`.trim()
                                : firstname || lastname || 'Name not set'}
                        </Text>
                    </View>
                    
                    <View style={styles.scoreContainer}>
                        <View style={styles.scoreTitleContainer}>
                            <Ionicons name="trophy-outline" size={24} color={MainSecondaryBlueColor} />
                            <Text style={styles.sectionTitle}>{t('profile.trustScore')}</Text>
                        </View>
                        <View style={styles.scoreValueContainer}>
                            <Text style={styles.scorePercentage}>{respectScore}%</Text>
                            <View style={styles.scoreBarBackground}>
                                <View style={[styles.scoreBarFill, { width: `${respectScore}%` }]} />
                            </View>
                        </View>
                    </View>
                </View>

                <VerticalSpacer height={20} />

                <View style={[styles.formContainerDetails, main_Style.genButtonElevation]}>
                    {/* Toggle for display name format */}
                    <View style={styles.toggleGroup}>
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleLabel}>{t('profileSettings.useFullNameAsDisplay')}</Text>
                        </View>
                        <Switch
                            value={useFullNameAsDisplay}
                            onValueChange={setUseFullNameAsDisplay}
                            trackColor={{ false: '#d3d3d3', true: '#007AA3' }}
                            thumbColor={'#fff'}
                        />
                    </View>

                    <VerticalSpacer height={20} />

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

                    {/* Biography */}
                    <View style={styles.inputGroup} ref={biographyContainerRef}>
                        <View style={styles.labelContainer}>
                            
                            <Text style={styles.label}>{t('profile.bio')}</Text>
                        </View>
                        <TextInput
                            ref={biographyInputRef}
                            style={[
                                styles.input, 
                                styles.textArea,
                                biographyFocused && styles.inputFocused
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
                                // Scroll to a specific position to bring input into view
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ y: 400, animated: true });
                                }, 300);
                            }}
                            onBlur={() => setBiographyFocused(false)}
                        />
                        <Text style={styles.helperText}>
                            {t('onboarding.descriptionPlaceholder')} ({biography.length}/500)
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
                                styles.textArea,
                                areaOfExpertiseFocused && styles.inputFocused
                            ]}
                            value={areaOfExpertise}
                            onChangeText={setAreaOfExpertise}
                            placeholder={t('onboarding.areaOfExpertisePlaceholder')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            onFocus={() => {
                                setAreaOfExpertiseFocused(true);
                                // Scroll to a specific position to bring input into view
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ y: 600, animated: true });
                                }, 300);
                            }}
                            onBlur={() => setAreaOfExpertiseFocused(false)}
                        />
                        <Text style={styles.helperText}>
                            {t('profileSettings.listYourProfessionalSkillsKnowledgeAreasOrInterests')} ({areaOfExpertise.length}/300)
                        </Text>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={[styles.saveButton, main_Style.genButtonElevation]} 
                        onPress={handleSave}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="save-outline" size={18} color={AppScreenBackgroundColor} />
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={20} />

                {/* Verified User Section */}
                <View style={[styles.formContainerDetails, main_Style.genButtonElevation]}>
                    <TouchableOpacity 
                        style={styles.verificationHeader}
                        onPress={() => setShowVerificationInfo(!showVerificationInfo)}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.verificationTitleContainer}>
                            <Text style={styles.sectionTitle}>{t('profileSettings.verifiedUser')}</Text>
                            {isVerified ? (
                                <Ionicons name="checkmark-circle" size={20} color="#49A078" />
                            ) : (
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            )}
                        </View>
                        <Ionicons 
                            name={showVerificationInfo ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={withdrawnTitleColor} 
                        />
                    </TouchableOpacity>

                    {showVerificationInfo && (
                        <View style={styles.verificationContent}>
                            <View style={styles.divider} />
                            
                            {isVerified ? (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="shield-checkmark" size={40} color="#49A078" />
                                    <Text style={styles.verifiedText}>{t('profileSettings.yourAccountIsVerified')}</Text>
                                    <Text style={styles.verifiedSubtext}>
                                        {t('profileSettings.haveBeenSikiyaVerified')}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.verificationText}>
                                        {t('profileSettings.sendUsID')}
                                    </Text>
                                    
                                    <TouchableOpacity 
                                        style={styles.emailButton}
                                        onPress={handleEmailPress}
                                        activeOpacity={generalActiveOpacity}
                                    >
                                        <Ionicons name="mail-outline" size={16} color={MainBrownSecondaryColor} />
                                        <Text style={styles.emailText}>nathan.cibonga@sikiya.org</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.verificationFooter}>
                                        <Ionicons name="time-outline" size={12} color={withdrawnTitleColor} />
                                        {' '}{t('profileSettings.getVerifiedWithin')}
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
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
    headerSection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingTop: 60,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImageWrapper: {
        //borderRadius: 45,
        //padding: 2.5,
        overflow: 'hidden',
        
    },
    profileImageLoading: {
        borderColor: '#ccc',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 2.5,
        borderWidth: 2,
        borderColor: MainSecondaryBlueColor,
        backgroundColor: AppScreenBackgroundColor,
        //backgroundColor: 'red',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: MainSecondaryBlueColor,
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    roleTag: {
        marginTop: 8,
        alignSelf: 'center',
        backgroundColor: MainSecondaryBlueColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    roleTagText: {
        color: '#fff',
        fontSize: generalTextSize,
        fontWeight: '600',
        fontFamily: generalTitleFont,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formContainerName: {
        backgroundColor: cardBackgroundColor,
        borderRadius: 12,
        marginHorizontal: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    formContainerDetails: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 12,
        padding: 12,
        
    },
    nameTitleSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: generalTextColor,
    },
    nameTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTextColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
    },
    scoreContainer: {
        paddingVertical: 8,
    },
    scoreTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    scoreValueContainer: {
        marginTop: 0,
    },
    scorePercentage: {
        fontSize: largeTextSize,
        fontWeight: 'bold',
        color: MainSecondaryBlueColor,
        fontFamily: generalTitleFont,
        textAlign: 'center',
        marginBottom: 12,
    },
    scoreBarBackground: {
        height: 8,
        backgroundColor: AppScreenBackgroundColor,
        borderRadius: 6,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        backgroundColor: MainSecondaryBlueColor,
        borderRadius: 6,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    label: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTextColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
        borderWidth: 1,
        borderColor: MainBrownSecondaryColor,
        zIndex: 8,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 0.2 },
        shadowOpacity: 0.2,
        shadowRadius: 0.3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 12,
        //paddingVertical: 10,
        zIndex: 8,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 0.2 },
        shadowOpacity: 0.2,
        shadowRadius: 0.3,
    },
    inputIcon: {
        fontSize: 20,
        color: MainBrownSecondaryColor,
        marginRight: 10,
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
    inputFocused: {
        borderColor: '#2BA1E6',
        borderWidth: 1.2,
        backgroundColor: '#F0F6FA',
        shadowColor: '#2BA1E6',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledInput: {
        backgroundColor: secCardBackgroundColor,
        borderColor: '#ccc',
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
        lineHeight: 16,
        fontStyle: 'italic',
    },
    toggleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: '#E5E7EB',
        marginBottom: 4,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    toggleLabel: {
        fontSize: generalTextSize,
        fontWeight: '600',
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.2,
    },
    toggleDescription: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        marginTop: 4,
        fontFamily: generalTextFont,
        lineHeight: 16,
    },
    saveButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 12,
        shadowColor: MainBrownSecondaryColor,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: '700',
        fontFamily: generalTitleFont,
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: generalTextSize,
        fontWeight: '700',
        color: generalTitleColor,
        fontFamily: generalTitleFont,
        letterSpacing: 0.3,
    },
    verificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verificationTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verificationContent: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
    },
    verificationText: {
        fontSize: commentTextSize,
        color: generalTextColor,
        fontFamily: generalTextFont,
        lineHeight: 18,
        marginBottom: 12,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: secCardBackgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 8,
        marginBottom: 12,
    },
    emailText: {
        fontSize: commentTextSize,
        color: MainBrownSecondaryColor,
        fontFamily: generalTextFont,
        fontWeight: '500',
    },
    verificationFooter: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        alignSelf: 'center',
        fontStyle: 'italic',
    },
    resetPasswordButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    resetPasswordText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    passwordHelperText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 8,
        textAlign: 'center',
    },
    verifiedBadge: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        marginTop: 4,
    },
    verifiedText: {
        fontSize: commentTextSize,
        fontWeight: '600',
        color: '#49A078',
        fontFamily: generalTitleFont,
        marginTop: 12,
    },
    verifiedSubtext: {
        fontSize: 11,
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default ProfileSettingScreen;