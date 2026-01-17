import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, TextInput, Switch, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenBackgroundColor, { cardBackgroundColor, generalActiveOpacity, generalTextColor, generalTextFont, generalTitleFont, main_Style, MainBrownSecondaryColor, secCardBackgroundColor, settingsStyles, withdrawnTitleColor } from '../../styles/GeneralAppStyle';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import VerticalSpacer from '../../Components/UI/VerticalSpacer';
import GoBackButton from '../../../NavComponents/GoBackButton';
import { useRoute } from '@react-navigation/native';

const GeneralSettingScreen = () => {
    const route = useRoute();
    const { firstname: initialFirstname, lastname: initialLastname } = route.params || {};

    const [firstname, setFirstname] = useState(initialFirstname || '');
    const [lastname, setLastname] = useState(initialLastname || '');
    const [customDisplayName, setCustomDisplayName] = useState('');
    const [useFullNameAsDisplay, setUseFullNameAsDisplay] = useState(true);

    // Generate display name based on toggle
    const displayName = useFullNameAsDisplay 
        ? `${firstname} ${lastname}`.trim() 
        : customDisplayName;

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Saving profile:', { firstname, lastname, displayName, useFullNameAsDisplay });
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
                    <Ionicons name="settings-outline" style={settingsStyles.headerIcon} />
                    <Text style={settingsStyles.headerTitle}>General Settings</Text>
                </View>

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
                            trackColor={{ false: '#d3d3d3', true: MainBrownSecondaryColor }}
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
                            <TextInput
                                style={styles.input}
                                value={customDisplayName}
                                onChangeText={setCustomDisplayName}
                                placeholder="Enter custom display name"
                                placeholderTextColor="#aaa"
                            />
                        )}
                        <Text style={styles.helperText}>
                            {useFullNameAsDisplay 
                                ? 'This is generated from your first and last name' 
                                : 'This is how your name appears to others'}
                        </Text>
                    </View>

                    {/* First Name (non-editable) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <View style={[styles.input, styles.disabledInput]}>
                            <Text style={styles.disabledInputText}>{firstname || 'Not set'}</Text>
                        </View>
                    </View>

                    {/* Last Name (non-editable) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <View style={[styles.input, styles.disabledInput]}>
                            <Text style={styles.disabledInputText}>{lastname || 'Not set'}</Text>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={[styles.saveButton, main_Style.genButtonElevation]} 
                        onPress={handleSave}
                        activeOpacity={generalActiveOpacity}
                    >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    headerSection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: MainBrownSecondaryColor,
        fontFamily: generalTextFont,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        padding: 12,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13.5,
        fontWeight: '600',
        color: generalTextColor,
        marginBottom: 8,
        fontFamily: generalTextFont,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        fontFamily: generalTextFont,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
        fontSize: 11,
        color: withdrawnTitleColor,
        marginTop: 5,
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
        fontSize: 12,
        fontWeight: '500',
        color: generalTextColor,
        fontFamily: generalTextFont,
    },
    toggleDescription: {
        fontSize: 11,
        color: withdrawnTitleColor,
        marginTop: 3,
        fontFamily: generalTextFont,
    },
    saveButton: {
        backgroundColor: cardBackgroundColor,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: MainBrownSecondaryColor,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: generalTitleFont,
    },
});

export default GeneralSettingScreen;