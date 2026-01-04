import React, {useState} from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AppScreenBackgroundColor, { articleTitleFont, articleTitleFontWeight, articleTitleSize, cardBackgroundColor, generalLineHeight, generalSmallTextSize, generalTextColor, generalTextFont, generalTextSize, generalTitleColor, generalTitleFont, mainborderColor, mainBrownColor, mainTitleColor, withdrawnTitleColor } from '../styles/GeneralAppStyle';
import TextSlicer from '../Helpers/TextSlicer';
import DateConverter from '../Helpers/DateConverter';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from "../utils/imageUrl";

const FashNewsItem = ({article}) => {

  const navigation = useNavigation()
  //console.log('Article in FlashNewsItem:', article);

  const HandlePressFlashNewsItem = () => {
    
    navigation.navigate('NewsHome', {article: article})
    
  }
  //console.log('Article in FlashNewsItem:', article);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} onPress={HandlePressFlashNewsItem} style={styles.touchableContainer}>
          <Image
            style={styles.image}
            defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')}
            source={{ uri: getImageUrl(article.article_front_image) }}
            />
            {/* Light Dark Overlay over entire image */}
            <View style={styles.overlay} pointerEvents="none" />
            
            {/* Content Overlay */}
            <View style={styles.contentOverlay}>
              <Text style={styles.title}>{TextSlicer(article.article_title, 70)}</Text>
              <View style={styles.metaInfo}>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={styles.locationText}>
                    {article?.location || "Bukavu, RDC"}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {DateConverter(article.published_on)}
                </Text>
              </View>
            </View>

      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    marginRight: 6,
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 12,
    width: 360,
    height: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    zIndex: 1,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 12,
    zIndex: 2,
  },
  title: {
    fontSize: articleTitleSize,
    fontWeight: articleTitleFontWeight,
    color: '#fff',
    fontFamily: articleTitleFont,
    marginBottom: 10,
    lineHeight: generalLineHeight,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: generalSmallTextSize,
    color: '#fff',
    fontFamily: generalTitleFont,
    opacity: 0.8,
  },
  dateText: {
    fontSize: generalSmallTextSize,
    color: '#fff',
    fontFamily: generalTitleFont,
    opacity: 0.8,
  },
  animation: {
    position: 'absolute',
    fontSize: 10,
    width: 90,
    height: 90,
    top: 0.5,
    left: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  border: {
    borderWidth: 0,
    borderColor: '#9D7340',
  },
});

export default FashNewsItem;