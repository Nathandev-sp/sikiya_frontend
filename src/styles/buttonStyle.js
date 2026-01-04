import { StyleSheet } from "react-native";

const buttonStyle = StyleSheet.create({
    mainContainter: {
        backgroundColor: '#E6E1C5',  //#3D6A63 #FFCB77 #E6E1C5
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.3,
        borderColor: '#E9E3E6',
        zIndex: 10,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    raise:{
        backgroundColor: '#7DABA3'
    },
    animation: {
        position: 'absolute',
        width: 45,
        height: 45,
        top:-1,
        left: -1,
        zIndex: 20,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    eventHomeButtonSize: {
        height: 45,
        width: 45,
    }
});

export default buttonStyle;