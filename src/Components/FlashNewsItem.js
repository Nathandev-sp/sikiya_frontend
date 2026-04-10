import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../utils/i18n';
import { 
  articleTitleFont, 
  articleTitleFontWeight, 
  generalSmallTextSize, 
  generalTitleFont, 
  main_Style,
  mainBrownColor,
  homeCardBorderRadius,
  homeCardShadowStyle,
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
    <View style={[styles.container, { width: width * 0.96, height: height * 0.35 }]}>
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

        {/* Bottom gradient for headline legibility (no separate text box) */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.82)']}
          locations={[0.35, 0.65, 1]}
          style={styles.gradientOverlay}
        />

        {/* Content overlay: metadata above headline */}
        <View style={styles.contentOverlay}>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color="#fff" style={styles.metaIcon} />
            <Text style={styles.metaLine} numberOfLines={1} ellipsizeMode="tail">
              {article?.location || i18n.t('flashNews.defaultLocation')}
              {' \u2022 '}
              {DateConverter(article.published_on)}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            {TextSlicer(article.article_title, 110)}
          </Text>
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
    marginHorizontal: 0,
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: homeCardBorderRadius,
    marginTop: 4,
    marginBottom: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(102, 70, 44, 0.15)',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: homeCardBorderRadius,
    overflow: 'hidden',
    ...homeCardShadowStyle,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: homeCardBorderRadius,
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
    borderRadius: homeCardBorderRadius,
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 26,
    paddingTop: 28,
    zIndex: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaLine: {
    flex: 1,
    fontSize: generalSmallTextSize,
    fontWeight: '500',
    color: '#fff',
    fontFamily: generalTitleFont,
  },
  title: {
    fontSize: 22,
    fontWeight: articleTitleFontWeight,
    color: '#fff',
    fontFamily: articleTitleFont,
    lineHeight: 30,
    letterSpacing: 0.2,
    paddingBottom: Platform.OS === 'android' ? 2 : 1,
  },
  flashBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
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