import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../utils/i18n';
import { 
  articleTitleFont, 
  articleTitleFontWeight, 
  articleTitleSize, 
  generalLineHeight, 
  generalSmallTextSize, 
  generalTitleFont, 
  main_Style,
  mainBrownColor 
} from '../styles/GeneralAppStyle';
import TextSlicer from '../Helpers/TextSlicer';
import DateConverter from '../Helpers/DateConverter';
import { getImageUrl } from "../utils/imageUrl";

const FlashNewsItem = ({ article }) => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handlePressFlashNewsItem = () => {
    navigation.navigate('NewsHome', { article: article });
  };

  return (
    <View style={[styles.container, { width: width * 0.94, height: height * 0.3 }]}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={handlePressFlashNewsItem} 
        style={[styles.touchableContainer, main_Style.genButtonElevation]}
        accessibilityRole="button"
        accessibilityLabel={`${i18n.t('flashNews.readArticle')}: ${article.article_title}`}
        accessibilityHint={i18n.t('flashNews.tapToRead')}
      >
        {/* Image with loading state */}
        <Image
          style={styles.image}
          defaultSource={require('../../assets/functionalImages/FrontImagePlaceholder.png')}
          source={{ uri: getImageUrl(article.article_front_image) }}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />

        {/* Loading indicator */}
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={mainBrownColor} />
          </View>
        )}

        {/* Gradient overlay for better text readability */}
        <View style={styles.gradientOverlay} pointerEvents="none" />
        
        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.contentOverlayInner}>
            <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
              {TextSlicer(article.article_title, 70)}
            </Text>
            <View style={styles.metaInfo}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#fff" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {article?.location || i18n.t('flashNews.defaultLocation')}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {DateConverter(article.published_on)}
              </Text>
            </View>
          </View>
        </View>

        {/* Flash badge indicator */}
        <View style={styles.flashBadge}>
          <Ionicons name="flash" size={14} color="#fff" />
          <Text style={styles.flashBadgeText}>{i18n.t('flashNews.flash')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 2,
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  contentOverlayInner: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: articleTitleSize,
    fontWeight: articleTitleFontWeight,
    color: '#fff',
    fontFamily: articleTitleFont,
    marginBottom: 10,
    lineHeight: generalLineHeight,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: generalSmallTextSize,
    color: '#fff',
    fontFamily: generalTitleFont,
    opacity: 0.9,
  },
  dateText: {
    fontSize: generalSmallTextSize,
    color: '#fff',
    fontFamily: generalTitleFont,
    opacity: 0.9,
  },
  flashBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 3,
  },
  flashBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: generalTitleFont,
  },
});

export default FlashNewsItem;