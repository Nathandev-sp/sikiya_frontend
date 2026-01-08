import React,{useEffect, useState, useMemo} from 'react';
import { View, Image, StyleSheet, Dimensions, Text, FlatList } from 'react-native';
import FlashNewsItem from './FlashNewsItem';
import samples from '../../SampleContent/samples';
import NewsAPI from '../../API/NewsAPI';
import { bannerBackgroundColor, cardBackgroundColor, mainTitleColor } from '../styles/GeneralAppStyle';
import SikiyaAPI from '../../API/SikiyaAPI';

const HighLight = React.memo(({preloadedHeadlines}) => {

   // Making the API Request ------------------ /top-headlines
      const [flashNews, setFlashNews] = useState([]);
  
      useEffect(() => {
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
      }, []);
  
      //------------------------------------------

    //const dataList = samples;

    //console.log('Fetched flash news:', flashNews);

  return (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Image 
                style={styles.logo}
                source={require("../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png")}
            />
        </View>
        <View style={styles.stories}>
            <FlatList 
                horizontal= {true}
                showsHorizontalScrollIndicator = {false}
                nestedScrollEnabled={true}
                pagingEnabled={true}
                snapToInterval={322}
                decelerationRate='fast'
                data = {flashNews}
                keyExtractor={(flashNew) => flashNew._id}
                renderItem={({item}) => {
                    return(
                        <FlashNewsItem article = {item} /> 
                    );

                }}            
            />
        </View>
    </View>
  );
});

HighLight.displayName = 'HighLight';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
    paddingTop: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 2,
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
    flexDirection: 'row',
    marginTop: 2,
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
});

export default HighLight;