import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { articleTitleSize, auth_Style, bannerBackgroundColor, generalTextColor, generalTitleFont, lightBannerBackgroundColor, main_Style, MainBrownSecondaryColor, withdrawnTitleColor } from "../styles/GeneralAppStyle";
import GoBackButton from "../../NavComponents/GoBackButton";

const AuthScreenMiniHeader = ({ title }) => (
  <View style={[styles.logoContainer]}>
    <Image
      source={require("../../assets/SikiyaLogoV2/NathanApprovedSikiyaLogo1NB.png")}
      style={styles.companyLogo}
    />
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: lightBannerBackgroundColor, //#EEEEEE  	#606060  #A9A9A9 #E0E0E0 #ff9966 #DBDBDB #69747C #e3e3e3 #E5E2DC #d7d2c9
    //borderColor: "#d7d2c9",
    //borderWidth: 1.2,
    //margin: 8,
    //borderRadius: 12,
    marginTop: 10,
    //flexDirection: 'row',
  },
  companyLogo: {
    marginTop: 10,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 20,
    width: '90%',
    //backgroundColor: 'green'
  },
  welcomeTitle: {
    fontFamily: generalTitleFont,
    fontSize: articleTitleSize+5,
    fontWeight: 'bold',
    color: withdrawnTitleColor,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default AuthScreenMiniHeader;