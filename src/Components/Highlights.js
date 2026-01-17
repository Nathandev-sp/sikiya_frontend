import React,{useEffect, useState, useMemo, useRef, useCallback} from 'react';
import { View, Image, StyleSheet, Dimensions, Text, FlatList } from 'react-native';
import FlashNewsItem from './FlashNewsItem';
import samples from '../../SampleContent/samples';
import NewsAPI from '../../API/NewsAPI';
import { bannerBackgroundColor, cardBackgroundColor, main_Style, MainBrownSecondaryColor, mainTitleColor, secCardBackgroundColor } from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HORIZONTAL_MARGIN = 8.5 + 8.5; // left + right margin from FlashNewsItem styles
const ITEM_WIDTH = SCREEN_WIDTH * 0.94 + ITEM_HORIZONTAL_MARGIN;

const HighLight = React.memo(({preloadedHeadlines, hideLogo = false}) => {

   // Making the API Request ------------------ /top-headlines
      const [flashNews, setFlashNews] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const initializedRef = useRef(false);
      const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
      const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
          const idx = viewableItems[0].index ?? 0;
          setCurrentIndex(idx);
        }
      }).current;
  
      useEffect(() => {
        // Only initialize once - never refetch
        if (initializedRef.current) return;
        initializedRef.current = true;
        
        const fetchHeadlines = async () => {
            try {
              if (!preloadedHeadlines) {
                const response = await SikiyaAPI.get('/articles/home/headlines');
                setFlashNews(response.data);
              } else {
                console.log("Using preloaded headlines");
                setFlashNews(preloadedHeadlines);
              }
            } catch (error) {
                console.error('Error fetching headlines:', error);
            }
        };

        fetchHeadlines();
      }, [preloadedHeadlines]);
  
      //------------------------------------------

    //const dataList = samples;

    //console.log('Fetched flash news:', flashNews);

  return (
    <View style={[styles.container, main_Style.genButtonElevation]}>
        {!hideLogo && (
          <View style={styles.logoContainer}>
              <Image 
                  style={styles.logo}
                  source={require("../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png")}
              />
          </View>
        )}
        <View style={styles.stories}>
            <FlatList 
                horizontal= {true}
                showsHorizontalScrollIndicator = {false}
                nestedScrollEnabled={true}
                pagingEnabled={true}
                snapToInterval={ITEM_WIDTH}
                snapToAlignment="center"
                decelerationRate='fast'
                data = {flashNews}
                keyExtractor={(flashNew) => flashNew._id}
                renderItem={({item}) => {
                    return(
                        <FlashNewsItem article = {item} /> 
                    );

                }}            
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={styles.storiesContent}
            />
            
        </View>
    </View>
  );
}, (prevProps, nextProps) => {
    // Custom comparison: rerender only if headlines or hideLogo changes
    if (prevProps.hideLogo !== nextProps.hideLogo) return false;

    const prevHeadlines = prevProps.preloadedHeadlines;
    const nextHeadlines = nextProps.preloadedHeadlines;
    
    if (!prevHeadlines && !nextHeadlines) return true;
    if (!prevHeadlines || !nextHeadlines) return false;
    if (prevHeadlines.length !== nextHeadlines.length) return false;
    if (prevHeadlines === nextHeadlines) return true;
    
    const prevIds = prevHeadlines.map(h => h._id || h.article_id).sort().join(',');
    const nextIds = nextHeadlines.map(h => h._id || h.article_id).sort().join(',');
    
    return prevIds === nextIds;
});

HighLight.displayName = 'HighLight';

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    paddingTop: 0,
    //backgroundColor: 'green',
    borderRadius: 4,
    overflow: 'hidden',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 0,
    //backgroundColor: 'red',
  },
  logo: {
    width: 160,
    height: 60,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  stories: {
    flexDirection: 'column',
    marginTop: 2,
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 16,
  },
  storiesContent: {
    paddingHorizontal: 6,
  },
  storyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  sliderDot: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sliderDotActive: {
    width: 28,
    backgroundColor: MainBrownSecondaryColor,
  },
});

export default HighLight;