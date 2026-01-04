import { StyleSheet } from "react-native";

// Setting text fonts
const articleTitleFont = 'OpenSans-SemiBold';  //Oswald-SemiBold Montserrat-Medium
const generalTextFont = 'OpenSans-Medium';
const generalTitleFont = 'OpenSans-SemiBold'; //OpenSans-Bold

// Setting text colors
const mainTitleColor = '#3A2718'; // Title color for the cards ##E6E6E6 
const generalTitleColor = '#333';
const withdrawnTitleColor = '#888';
const generalTextColor =  '#182842'; // general Text color

// Defining the font sizes
const fontSizes = {
    xsmall: 9,
    small: 11,
    medium: 13.5,
    large: 15,
    xlarge: 18,
};

const textStyle = StyleSheet.create({
    generalText: {
        fontSize: fontSizes.medium,
        fontFamily: generalTextFont,
        color: generalTextColor,
    },
    generalTitle: {
        marginTop: 4,
        fontSize: fontSizes.medium,
        fontWeight: '500',
        color: generalTextColor,
        lineHeight: 20,
        fontFamily: generalTitleFont,
    },
    MWithdrawnText: {
        fontSize: fontSizes.small,
        fontWeight: '500',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    SWithdrawnText: {
        fontSize: fontSizes.xsmall,
        fontWeight: '500',
        color: withdrawnTitleColor,
        fontFamily: generalTextFont,
    },
    subtitleText: {
        fontSize: fontSizes.large,
        fontWeight: '600',
        fontFamily: generalTitleFont,
        color: generalTitleColor,
    },
    MainArticleTitle: {
        fontSize: fontSizes.xlarge,
        fontWeight: '700',
        color: mainTitleColor,
        fontFamily: articleTitleFont,
    },
});

export default textStyle;   