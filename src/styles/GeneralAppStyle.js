import { StyleSheet } from "react-native";

const AppScreenBackgroundColor = '#F8F8F8'; //#FFFFFF #1B263B  #FDFFFC #7083A5 #FDFFFC	#F0F0F0 #FAF9FC #242424 #EBEBEB #eee4da #B0B4A7 #F8F8F8
const MainBrownSecondaryColor = '#66462C'; //blue from the screen header 66462C
const MainBlueColor = '##344E7B'; // Dark purple color for titles #344E7B

const mainBrownColor = '#E5E2DC'; //#E5E2DC #BCB19D
const mainborderColor = '#7A7A7A'; // border color for the cards #CCCCCC #563B25
const mainTitleColor = '#3A2718'; // Title color for the cards ##E6E6E6 
const FollowButtonColor = '#4889B4'; // Follow button color #F0F0F0 #E5E2DC #E5E2DC #E5E2DC #E5E2DC


const cardBackgroundColor = '#E6DFD6'; //#E5E2DC #EBEBEB #DEE1E3 #F7F7F7
const secCardBackgroundColor = '#EBEBEB'; //#E5E2DC #EBEBEB #DEE1E3 #F7F7F7
const bannerBackgroundColor = '#AE8C6F'; // #D7DBD2 #99775C #AE8C6F #A78162
const lightBannerBackgroundColor = '#F6F3EF'; // #E4EEFF #EBF2FE #DBE2EE #D5DDEB
const secBtnColor = '#567C8A';
const PrimBtnColor  = '#66462C';
const authScrreenBackgroundColor = '#F5F3F0'; // Background color for auth screens
const genBtnBackgroundColor = '#EBEBEB'; // General button background color #567C8A #699FFC  #B0C6CE #8EADB8 #5E8897
const MainSecondaryBlueColor = '#007AA3'; // Updated Main Blue Color

// Selected fonts for the app
const articleTitleFont = 'NotoSans-SemiBoldItalic';  //OpenSans-SemiBold  //Oswald-SemiBold Montserrat-Medium
const generalTitleFont = 'OpenSans-SemiBold'; //OpenSans-Bold OpenSans-SemiBold
const generalTextFont = 'OpenSans-Medium';
//Selected Colours for Text
const generalTextColor =  '#182842'; // general Text color
const generalTitleColor = '#575C60';
const withdrawnTitleColor = '#888';
const articleTitleColor = '#44484B'; //#3A3D40 #FFFFFF
 // Selected Text sizes
 const articleTitleSize = 17;
 const generalTitleSize = 16;
 const generalTextSize = 15;
 const articleTextSize = 15.5;
 const commentTextSize = 14;
 const withdrawnTitleSize = 11.5;
 const generalSmallTextSize = 12.5;
 const XsmallTextSize = 10;
 const largeTextSize = 20;
 const xlargeTextSize = 22;
 // Selelcted Font Weights
 const generalTitleFontWeight = '600';
 const generalTextFontWeight = '400';
 const withdrawnTitleFontWeight = '500';
 const articleTitleFontWeight = '600';
 // selected Line Heights
 const generalLineHeight = 22;
 const articleLineHeight = 24;
 const generalSmallLineHeight = 20;
 const withdrawnLineHeight = 18;
 // selected active opacity
 const generalActiveOpacity = 0.7; // General active opacity for buttons and touchable elements

// Main Styling for screens and apps ---------------
const main_Style = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: AppScreenBackgroundColor, //#ECECEC #EEEEEE #FDFFF
        paddingLeft: 4,
        paddingRight: 4, 
    },
    secSafeArea: {
        flex: 1,
        backgroundColor: '#F6F3EF', //#ECECEC #EEEEEE #FDFFF
        paddingLeft: 4,
        paddingRight: 4
    },
    datePosted: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        alignSelf: 'center',
        fontFamily: generalTextFont,
    },
    authorName: {
        fontSize: 12.5,
        fontWeight: '500',
        color: '#182842',
        fontFamily: 'OpenSans-Bold',
    },
    genButtonElevation: {
        zIndex: 8,
        shadowColor: '#000000', // iOS shadow properties
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.3,
        shadowRadius: 0.6,
    },
    loadingAnimation: {
        width: 40,
        height: 40,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

});
// Main styling close-------------------------------

// Auth Styling ------------------------------------
const auth_Style = StyleSheet.create({
  authSafeArea: {
      flex: 1,
      backgroundColor: AppScreenBackgroundColor, //#ECECEC #EEEEEE #FDFFF #F6F3EF #F7F3EF
      paddingLeft: 4,
      paddingRight: 4,
  },
  authLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      marginLeft: 0,
      fontFamily: generalTitleFont,
      color: generalTitleColor,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF", // #F0F6FA #E0EDF5 #EBEBEB #F5F5F5
  },
  authInputContainerFocused: {
    borderColor: '#2BA1E6', // blue #51D6FF #04698F
    borderWidth: 1.5,
    backgroundColor: '#F0F6FA',  // #F0F6FA #E0EDF5
  },
  authLogo: {
    marginRight: 8,
    fontSize: 18,
    color: withdrawnTitleColor,
  },
  authInputBundle: {
    //backgroundColor: 'red',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontFamily: generalTextFont,
    fontSize: generalTextSize,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  authButtonStyle: {
    backgroundColor: '#66462c', // main:#66462c  #B0C6CE #8EADB8 #5E8897
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    zIndex: 10,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.4 },
    shadowOpacity: 0.6,
    shadowRadius: 0.5,
    width: 160,
    alignSelf: 'center',
    marginTop: 100,
  },
  authButtonText: {
    color: "#fff", // white color for button text
    fontFamily: generalTitleFont,
    fontSize: 16,
    fontWeight: '600',
  },
  authElevation: {
    zIndex: 10,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 0.8,
  },
  onboardingContainer: {
    alignSelf: 'center',
    padding: 12,
    paddingVertical:20,
    backgroundColor: cardBackgroundColor,  //#E4EEFF #EBF2FE #DBE2EE #D5DDEB #E9E2D8
    borderRadius: 8,
  },
   formContainer: {
    flex: 1,
    paddingTop: 16,
    //justifyContent: 'center',
  },
  onboardingFormContainer: {
    flex: 1,
    paddingTop: 0,
    //justifyContent: 'center',
  },
  detailFormContainer: {
    flex: 1,
    paddingTop: 0,
    //justifyContent: 'center',
    backgroundColor: AppScreenBackgroundColor,
  },
  goBackBtn: {
    top: 78,
  },
  inputErrorCont: {
    borderColor: '#F4796B',
    borderWidth: 1.5,
  },
  authIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 0,
  },
  authIconCont: {
    backgroundColor: '#66462c', // main:#66462c  #B0C6CE #8EADB8 #5E8897
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    zIndex: 10,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 0.4 },
    shadowOpacity: 0.6,
    shadowRadius: 0.5,
    alignSelf: 'flex-end',
    marginRight: 24,
    marginTop: 50,
  },

});
// -------------------------------------------------

const settingsStyles = StyleSheet.create({
  headerSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingTop: 40,
        //backgroundColor: 'red',

    },
    headerTitle: {
        fontSize: 14,
        marginTop: 4,
        color: withdrawnTitleColor,
        fontFamily: generalTitleFont,
    },
    headerIcon: {
        marginBottom: 4,
        fontSize: 30,
        color: withdrawnTitleColor
    },
})

//Defaults settings
const defaultButtonHitslop = { top: 10, bottom: 10, left: 10, right: 10 };




export default AppScreenBackgroundColor;
export {MainBrownSecondaryColor, 
        MainBlueColor, 
        generalTextColor, 
        mainBrownColor, 
        main_Style,
        auth_Style, 
        mainborderColor, 
        mainTitleColor, 
        FollowButtonColor, 
        articleTitleFont, 
        generalTextFont, 
        generalTitleFont,
        generalTitleColor,
        withdrawnTitleColor,
        cardBackgroundColor,
        defaultButtonHitslop,
        bannerBackgroundColor,
        generalActiveOpacity,
        lightBannerBackgroundColor,
        secBtnColor,
        PrimBtnColor,
        authScrreenBackgroundColor,
        genBtnBackgroundColor,
        secCardBackgroundColor,
        settingsStyles,
        MainSecondaryBlueColor,
        articleTitleColor,
        articleTitleSize,
        generalTitleSize,
        generalTextSize,
        withdrawnTitleSize,
        generalSmallTextSize,
        generalTitleFontWeight,
        generalTextFontWeight,
        withdrawnTitleFontWeight,
        articleTitleFontWeight,
        generalLineHeight,
        articleLineHeight,
        generalSmallLineHeight,
        withdrawnLineHeight,
        articleTextSize,
        commentTextSize,
        XsmallTextSize,
        largeTextSize,
        xlargeTextSize
    };