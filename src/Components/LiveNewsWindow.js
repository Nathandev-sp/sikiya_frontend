import React, {useState} from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AppScreenBackgroundColor, { generalTitleColor, generalTitleFont, mainborderColor, mainBrownColor, MainBrownSecondaryColor, mainTitleColor } from '../styles/GeneralAppStyle';
import TextSlicer from '../Helpers/TextSlicer';
import TextSlicer10w from '../Helpers/TextSlicer10w';

const LiveNewsWindow = ({video}) => {

  const navigation = useNavigation()

  const GoNewsVideoScreen = () => {
    navigation.navigate('NewsVideoScreen', {video: video})
  };

  const {width, height} = useWindowDimensions()

  return (
    <View style={[styles.container, {width: width * 0.46, height: height * 0.14}]}>
      <TouchableOpacity activeOpacity={0.7} onPress={GoNewsVideoScreen}>
      <View >
        <View style = {styles.storyline}>
          <Image style = {styles.image}
            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')} 
            src={video.urlToImage}
            />
        </View>
      </View>
      </TouchableOpacity>
      <View style={[styles.storyTextCont, width > 400 ? {width: width * 0.46} : {width: width * 0.4}]}>
        <Text style = {styles.title}>{TextSlicer10w(video.title)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4,
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    zIndex: 10,
    shadowColor: '#000000', // iOS shadow properties
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
  },
  image: {
    alignSelf: 'center',
    height: '100%',
    width: '100%',
    borderColor: MainBrownSecondaryColor,  //#CC8924
    borderRadius: 4,
    borderBottomStartRadius:0,
    borderBottomEndRadius:0
    ,
    borderBottomWidth: 0,

  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'start',
    color: generalTitleColor,
    fontFamily: generalTitleFont,
    paddingHorizontal: 4,
  },
  border: {
    borderWidth: 0,
    borderColor: '#9D7340',
  },
  storyTextCont: {
    backgroundColor: '#E5E2DC', // #EEEEEE #E0E0E0 #E5E2DC #e3e3e3
    alignSelf: 'center',
    height: 70,
    width: 120,
    paddingLeft: 2,
    paddingRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: MainBrownSecondaryColor,  //#CC8924
    borderBottomEndRadius: 6,
    borderBottomStartRadius: 6,
    borderTopWidth: 0,
  }
});

export default LiveNewsWindow;