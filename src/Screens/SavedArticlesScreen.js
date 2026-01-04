import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SikiyaAPI from '../../API/SikiyaAPI';
import SecondaryNewsCart from '../Components/SecondaryNewscart';
import { mainBrownColor, generalTitleColor, generalTitleFont, cardBackgroundColor } from '../styles/GeneralAppStyle';
import Ionicons from '@expo/vector-icons/Ionicons';

const SavedArticlesScreen = ({ navigation }) => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSavedArticles = async (pageNumber = 1, shouldRefresh = false) => {
    if (shouldRefresh) {
      setRefreshing(true);
    } else if (pageNumber === 1) {
      setLoading(true);
    }

    try {
      const response = await SikiyaAPI.get(`/saved/articles/user/?page=${pageNumber}&limit=10`);
      const data = response.data;
      const articles = (data.articles || data.savedArticles || []).map(savedArticle => ({
        ...savedArticle,
        savedArticleId: savedArticle._id,
        saved_on: savedArticle.saved_on
      }));
      
      if (shouldRefresh || pageNumber === 1) {
        setSavedArticles(articles);
      } else {
        setSavedArticles(prevArticles => [...prevArticles, ...articles]);
      }
      
      // Update pagination state
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setHasMoreData(data.pagination.currentPage < data.pagination.totalPages);
        setPage(data.pagination.currentPage);
      } else if (data.count !== undefined) {
        // Fallback for old response format
        const totalPages = Math.ceil(data.count / 10);
        setTotalPages(totalPages);
        setHasMoreData(pageNumber < totalPages);
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
      Alert.alert('Error', 'Failed to load saved articles. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load saved articles when screen is focused
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchSavedArticles(1);
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleRefresh = () => {
    setPage(1);
    fetchSavedArticles(1, true);
  };

  const handleLoadMore = () => {
    if (hasMoreData && !loading && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSavedArticles(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={mainBrownColor} />
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark" size={80} color="#d7d2c9" />
        <Text style={styles.emptyText}>No saved articles yet</Text>
        <Text style={styles.emptySubText}>Articles you save will appear here</Text>
        <TouchableOpacity 
          style={styles.browseButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Articles</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Articles</Text>
      </View>
      
      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={({ item }) => <SecondaryNewsCart article={item} />}
        contentContainerStyle={savedArticles.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[mainBrownColor]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: generalTitleColor,
    fontFamily: generalTitleFont,
  },
  listContent: {
    paddingVertical: 10,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: generalTitleColor,
    marginTop: 15,
    fontFamily: generalTitleFont,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: mainBrownColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default SavedArticlesScreen;
