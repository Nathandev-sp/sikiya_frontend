import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

const LineBar = ({barTitle}) => {
    return(
        <View style = {styles.mainContainer}>
            <Text style={styles.title}>{barTitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 8,
        marginBottom: 6,
        backgroundColor: '#BCB19D',
        height: 34,
        width: '98%',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        zIndex: 10,
        shadowColor: '#00000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,

    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#182842',
        
    },
});

export default LineBar;