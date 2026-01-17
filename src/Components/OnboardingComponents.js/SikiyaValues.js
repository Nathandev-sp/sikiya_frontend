import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { generalTitleFont, generalTextFont, mainBrownColor, generalTitleColor, generalTextColor, generalTextSize, generalTitleSize, MainBrownSecondaryColor, auth_Style, withdrawnTitleColor, articleTitleFont } from "../../styles/GeneralAppStyle";

// Example images for each value (replace with your own local or remote images)
const valueImages = [
  require("../../../assets/OnboardingImages/certainty.png"), // Community
  require("../../../assets/OnboardingImages/interview.png"), // Integrity
  require("../../../assets/OnboardingImages/open.png"),   // Innovation
  require("../../../assets/OnboardingImages/balance.png"), // Empowerment
];

const values = [
  { 
    title: "Truth & Accuracy", 
    desc: "Hold journalists accountable.",
    img: valueImages[0]
  },
  { 
    title: "Coverage", 
    desc: "Every story matters.",
    img: valueImages[1]
  },
  { 
    title: "Open Dialogue", 
    desc: "Meaningful conversations.",
    img: valueImages[2]
  },
  { 
    title: "Respect", 
    desc: "Safe, inclusive space.",
    img: valueImages[3]
  },
];



const SikiyaValues = () => {

    const { height } = useWindowDimensions();


  return (
    <View style={[auth_Style.onboardingContainer, {height: height*0.5, width: '94%'}, auth_Style.authElevation]}>
        <View style={styles.mainContainer}>
        <Text style={styles.headerText}>Our Values</Text>
        <View style={styles.valuesGrid}>
            {values.map((val, idx) => (
            <View key={idx} style={styles.valueBox}>
                <View style={styles.valueImageContainer}>
                    <Image source={val.img} style={styles.valueImage} />
                </View>
                <View style={styles.valueTextContainer}>
                    <Text style={styles.valueTitle}>{val.title}</Text>
                    <Text style={styles.valueDesc}>{val.desc}</Text>
                </View>
            </View>
            ))}
        </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  headerText: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize + 4,
    fontWeight: '700',
    color: generalTitleColor,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  valuesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 8,
  },
  valueImageContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueBox: {
    width: '48%',
    height: '60%',
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  valueImage: {
    width: 56,
    height: 56,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  valueTitle: {
    fontFamily: generalTitleFont,
    fontSize: generalTitleSize - 1,
    fontWeight: '700',
    color: generalTitleColor,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  valueDesc: {
    fontFamily: generalTextFont,
    fontSize: generalTextSize - 2,
    color: generalTextColor,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.1,
    paddingHorizontal: 4,
    marginTop: 0,
  },
});

export default SikiyaValues;