import React, {useState, useCallback, useContext} from 'react';
import {View, StyleSheet, Text, Image, TouchableOpacity} from 'react-native';
import SearchBar from '@nghinv/react-native-search-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

const HomeHeader = () => {
    const [text, setText] = useState('');

    const onChangeText = useCallback((value) => {
        setText(value);
    }, []);

    const chooseLocation = () => {
        console.log('get new location')
    }

    //---------------------------------

    return (
        <View style={styles.mainContainer}>
            <View style = {styles.userIdCont}>
                <View style = {styles.locationCont}>
                    <View style={styles.nameCont}>
                        <Text style={textStyles.nameText}>Hello Nathan!</Text>
                    </View>
                    <TouchableOpacity style={styles.userLocCont} activeOpacity={0.7} onPress={chooseLocation}>
                        <View style={styles.locIconCont}>
                            <Ionicons name="location" size={30} color={'gray'} />
                        </View>
                        <View style={styles.LocAddressCont}>
                            <Text style={textStyles.addressText}>Bloor Street West, Toronto, Ontario, Canada</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style = {styles.profileCont}>
                    <Image
                        style = {styles.profileAvatar}
                        defaultSource={require('../../assets/Images/UserAvatar/CatComputerAvatar.jpg')}  
                    />
                </View>
            </View>
            <SearchBar
                placeholder='Search'
                containerStyle={styles.textInput}
                cancelTitle='Annuler'
                value={text}
                onChangeText={onChangeText}
                // theme={theme.textInput}
                isDarkTheme={true}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    mainContainer: {
        height: 130,
        backgroundColor: '#AD7520', //#B19470 orange #2B4570 Maribe Blue #46659B #2B4570 #516890 #5072A7
        width: '98%',
        alignSelf: 'center',
        padding: 8,
        paddingTop: 5,
        paddingBottom:5,
        borderRadius: 12,
        justifyContent:'center',
    },
    textInput: {
        backgroundColor: '#516890', //#B19470
        height: 40,
        borderRadius: 15,
    },
    userIdCont: {
        height: 75,
        borderRadius: 15,
        marginBottom: 0,
        flexDirection: 'row',
    },
    locationCont: {
        width: '70%',
    },
    profileCont: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileAvatar: {
        height: 65,
        width: 65,
        borderRadius: '100%'
    },
    nameCont: {
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userLocCont: {
        height: '55%',
        flexDirection: 'row',
        backgroundColor: '#2c2c2ecc',
        padding: 5,
        borderRadius: 10,
    },
    locIconCont: {
        width: '22%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    LocAddressCont: {
        width: '78%',
        justifyContent: 'center',
        paddingLeft: 10,
    }
});

const textStyles = StyleSheet.create({
    nameText: {
        fontWeight: '500',
        fontSize: 18,
        color: '#ebf2fa',
    },
    addressText: {
        color: 'gray',
        fontSize: 13,
    }
})

export default HomeHeader;