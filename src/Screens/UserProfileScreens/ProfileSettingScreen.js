import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, Linking, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { articleTextSize, articleTitleSize, auth_Style, cardBackgroundColor, commentTextSize, defaultButtonHitslop, generalActiveOpacity, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, generalTitleFontWeight, largeTextSize, main_Style, MainBrownSecondaryColor, MainSecondaryBlueColor, secCardBackgroundColor, withdrawnTitleColor, withdrawnTitleSize } from '../../styles/GeneralAppStyle';
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

const ProfileSettingScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { state } = useContext(AuthContext);
    const { firstname: initialFirstname, lastname: initialLastname } = route.params || {};

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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [userRole, setUserRole] = useState(null);

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
            console.log('Profile image uploaded successfully');
            console.log('Profile image key:', response.data.imageKey);
            console.log('Profile image URL:', response.data.imageUrl);
        } catch (error) {
            console.log('Image upload error:', error);
            console.log('Error response:', error.response?.data);
            console.log('Error status:', error.response?.status);
            Alert.alert('Upload failed', 'Failed to upload profile image. Please try again.');
            setProfileImageKey(null);
        } finally {
            setUploadingImage(false);
        }
    };

    // Pick image from gallery or camera
    const pickImage = async () => {
        Alert.alert(
            "Change Profile Photo",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
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
                    text: "Gallery",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Gallery permission is required to select a photo.');
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
                { text: "Cancel", style: "cancel" }
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
            Alert.alert('Error', 'Failed to update profile');
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
            
            <ScrollView showsVerticalScrollIndicator={false}>
                
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
                                    key={profileImageKey}
                                    source={{ uri: getImageUrl(profileImageKey) }}
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
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
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
                            <Text style={styles.sectionTitle}>Trust Score</Text>
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

                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    {/* Toggle for display name format */}
                    <View style={styles.toggleGroup}>
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleLabel}>Use First & Last Name as Display Name</Text>
                            <Text style={styles.toggleDescription}>
                                {useFullNameAsDisplay 
                                    ? 'Shows "First Last"' 
                                    : 'Use custom display name'}
                            </Text>
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
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        {useFullNameAsDisplay ? (
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledInputText}>{displayName || 'Not set'}</Text>
                            </View>
                        ) : (
                            <View style={styles.inputContainer}>
                                <Ionicons name="at-outline" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputText}
                                    value={customDisplayName}
                                    onChangeText={setCustomDisplayName}
                                    placeholder="Enter custom display name"
                                    placeholderTextColor="#999"
                                    autoCapitalize="none"
                                    hitSlop={defaultButtonHitslop}
                                />
                            </View>
                        )}
                        <Text style={styles.helperText}>
                            {useFullNameAsDisplay 
                                ? 'This is generated from your first and last name' 
                                : 'This is how your name appears to others'}
                        </Text>
                    </View>

                     {/* Interested African Country */}
                     <View style={styles.inputGroup}>
                        <Text style={styles.label}>Interested African Country</Text>
                        <CountryPicker
                            value={interestedCountry}
                            onSelect={country => setInterestedCountry(country)}
                            countryList={AfricanCountries}
                            error={false}
                            label="Select country"
                        />
                        <Text style={styles.helperText}>
                            Which African country's news interests you most?
                        </Text>
                    </View>

                    {/* Biography */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Biography</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={biography}
                            onChangeText={setBiography}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={styles.helperText}>
                            Share your story, interests, or background ({biography.length}/500)
                        </Text>
                    </View>

                   

                    {/* Area of Expertise */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Area of Expertise</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={areaOfExpertise}
                            onChangeText={setAreaOfExpertise}
                            placeholder="What are your areas of expertise?"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                        <Text style={styles.helperText}>
                            List your professional skills, knowledge areas, or interests ({areaOfExpertise.length}/300)
                        </Text>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={[styles.saveButton, main_Style.genButtonElevation]} 
                        onPress={handleSave}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="save-outline" size={18} color={AppScreenBackgroundColor} />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>

                <VerticalSpacer height={20} />

                {/* Verified User Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <TouchableOpacity 
                        style={styles.verificationHeader}
                        onPress={() => setShowVerificationInfo(!showVerificationInfo)}
                        activeOpacity={generalActiveOpacity}
                    >
                        <View style={styles.verificationTitleContainer}>
                            <Text style={styles.sectionTitle}>Verified User</Text>
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
                                    <Text style={styles.verifiedText}>Your account is verified!</Text>
                                    <Text style={styles.verifiedSubtext}>
                                        You have been verified as a trusted member of the Sikiya community.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.verificationText}>
                                        Send us a piece of legal ID with the first name and last name matching your account at the following email:
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
                                        {' '}We should get you verified within 3 business days
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                </View>

                <VerticalSpacer height={20} />

                {/* Password Section */}
                <View style={[styles.formContainer, main_Style.genButtonElevation]}>
                    <Text style={styles.sectionTitle}>Password</Text>
                    
                    <TouchableOpacity 
                        style={[styles.resetPasswordButton, main_Style.genButtonElevation]}
                        onPress={handleResetPassword}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Ionicons name="key-outline" size={18} color="#fff" />
                        <Text style={styles.resetPasswordText}>Request Password Reset</Text>
                    </TouchableOpacity>

                    <Text style={styles.passwordHelperText}>
                        <Ionicons name="information-circle-outline" size={12} color={withdrawnTitleColor} />
                        {' '}We'll send a password reset link to your email address
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
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        padding: 12,
    },
    nameTitleSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    nameTitle: {
        fontSize: articleTitleSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
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
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        backgroundColor: MainSecondaryBlueColor,
        borderRadius: 6,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: commentTextSize,
        fontWeight: generalTitleFontWeight,
        color: generalTitleColor,
        marginBottom: 8,
        fontFamily: generalTextFont,
    },
    input: {
        backgroundColor: secCardBackgroundColor,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
        color: generalTextColor,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: secCardBackgroundColor,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 12,
        minHeight: 44, // Match the height of regular input (10px padding top + 10px bottom + text height)
    },
    inputIcon: {
        fontSize: 18,
        color: withdrawnTitleColor,
        marginRight: 8,
    },
    inputText: {
        flex: 1,
        paddingVertical: 8,
        fontSize: generalTextSize,
        fontFamily: generalTextFont,
    },
    textArea: {
        minHeight: 100,
        maxHeight: 150,
        paddingTop: 10,
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
    },
    disabledInputText: {
        color: '#666',
        fontSize: 15,
        fontFamily: generalTextFont,
    },
    helperText: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        marginTop: 4,
        fontFamily: generalTextFont,
    },
    toggleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 15,
    },
    toggleLabel: {
        fontSize: commentTextSize,
        fontWeight: '500',
        color: generalTextColor,
        fontFamily: generalTextFont,
    },
    toggleDescription: {
        fontSize: withdrawnTitleSize,
        color: withdrawnTitleColor,
        marginTop: 3,
        fontFamily: generalTextFont,
    },
    saveButton: {
        backgroundColor: MainBrownSecondaryColor,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    saveButtonText: {
        color: AppScreenBackgroundColor,
        fontSize: generalTextSize,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
    sectionTitle: {
        fontSize: generalTextSize,
        fontWeight: 'bold',
        color: generalTextColor,
        fontFamily: generalTitleFont,
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