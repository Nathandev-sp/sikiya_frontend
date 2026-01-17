import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SikiyaAPI from '../../API/SikiyaAPI';
import JournalistSubmissionCard from '../Components/JournalistSubmissionCard';
import AppScreenBackgroundColor, { 
  generalTitleColor, 
  generalTitleFont, 
  main_Style, 
  MainBrownSecondaryColor, 
  generalTextFont, 
  secCardBackgroundColor, 
  cardBackgroundColor, 
  withdrawnTitleColor, 
  generalTextColor,
  generalSmallTextSize,
  xlargeTextSize,
  generalTitleFontWeight,
  commentTextSize,
  generalTitleSize
} from '../styles/GeneralAppStyle';
import { StatusBar } from 'expo-status-bar';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';

const JounalistPannelScreen = ({ navigation }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    user_impact: 'Tier 3',
    engagement_score: 0,
    monthly_readers: 0,
    total_articles_published: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch journalist stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const response = await SikiyaAPI.get('/journalist/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Keep default values on error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch journalist submissions
  const fetchSubmissions = async (page = 1, append = false) => {
    if (!append) {
      setLoadingSubmissions(true);
    } else {
      setLoadingMore(true);
    }
    setSubmissionsError(null);
    try {
      const response = await SikiyaAPI.get(`/journalist/submissions?page=${page}&limit=10`);
      const data = response.data;
      const newSubmissions = data.submissions || data || [];
      
      if (append) {
        // Filter out duplicates based on _id before appending
        setSubmissions(prev => {
          const existingIds = new Set(prev.map(s => s._id));
          const uniqueSubmissions = newSubmissions.filter(s => s._id && !existingIds.has(s._id));
          return [...prev, ...uniqueSubmissions];
        });
      } else {
        setSubmissions(newSubmissions);
      }
      
      // Update pagination state
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setHasMore(data.pagination.currentPage < data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (!append) {
        setSubmissionsError('Failed to load submissions');
      }
    } finally {
      setLoadingSubmissions(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(1, false);
  }, []);

  // Refresh submissions when screen comes into focus (e.g., returning from submission screens)
  useFocusEffect(
    useCallback(() => {
      // Refresh submissions when screen is focused
      fetchSubmissions(1, false);
      // Also refresh stats
      const refreshStats = async () => {
        try {
          const response = await SikiyaAPI.get('/journalist/stats');
          setStats(response.data);
        } catch (err) {
          console.error('Error fetching stats:', err);
        }
      };
      refreshStats();
    }, [])
  );

  // Load more submissions
  const loadMoreSubmissions = () => {
    if (!loadingMore && hasMore && !loadingSubmissions) {
      const nextPage = currentPage + 1;
      fetchSubmissions(nextPage, true);
    }
  };

  // Handle button presses
  const handleAddArticle = () => {
    if (navigation) {
      navigation.navigate('NewArticleDisclaimer');
    }
  };

  const handleUploadVideo = () => {
    if (navigation) {
      navigation.navigate('NewVideoDisclaimer');
    }
  };

  return (
    <SafeAreaView style={main_Style.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreSubmissions();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header Section with Sikiya Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Stats Section - Card Style Layout */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Total Articles Published */}
            <View style={styles.statCardPurple}>
              <Text style={styles.statCardTitle}>Total Articles</Text>
              <Text style={styles.statCardValue}>
                {loadingStats ? '...' : stats.total_articles_published}
              </Text>
            </View>
            
            {/* Monthly Readers */}
            <View style={styles.statCardBlue}>
              <Text style={styles.statCardTitle}>Monthly Readers</Text>
              <Text style={styles.statCardValue}>
                {loadingStats ? '...' : stats.monthly_readers.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            {/* Engagement Score */}
            <View style={styles.statCardGreen}>
              <Text style={styles.statCardTitle}>Engagement</Text>
              <Text style={styles.statCardValue}>
                {loadingStats ? '...' : `${stats.engagement_score}%`}
              </Text>
            </View>
            
            {/* User Impact */}
            <View style={styles.statCardOrange}>
              <Text style={styles.statCardTitle}>Impact Tier</Text>
              <Text style={styles.statCardValue}>
                {loadingStats ? '...' : stats.user_impact}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons Row */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, main_Style.genButtonElevation]} 
            onPress={handleAddArticle}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={24} color={generalTextColor} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>New Article</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.videoButton, main_Style.genButtonElevation]} 
            onPress={handleUploadVideo}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam" size={24} color={generalTextColor} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>New Video</Text>
          </TouchableOpacity>
        </View>
        
        {/* Articles Section */}
        <View style={styles.contentContainer}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="document-text" size={20} color={generalTitleColor} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>Your Articles</Text>
          </View>
          
          {loadingSubmissions ? (
            <View style={styles.loadingContainer}>
              <MediumLoadingState />
              <Text style={styles.loadingText}>Loading submissions...</Text>
            </View>
          ) : submissionsError ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={withdrawnTitleColor} />
              <Text style={styles.placeholderText}>{submissionsError}</Text>
            </View>
          ) : submissions.length > 0 ? (
            <>
              <View style={styles.submissionsList}>
                {submissions.map((submission) => (
                  <JournalistSubmissionCard 
                    key={submission._id} 
                    submission={submission} 
                  />
                ))}
              </View>
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={withdrawnTitleColor} />
              <Text style={styles.placeholderText}>Your submitted articles and videos will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    //backgroundColor: 'red',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 0,
    //backgroundColor: 'blue',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPurple: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardBlue: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardGreen: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardOrange: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardTitle: {
    fontSize: generalSmallTextSize,
    color: '#fff',
    fontFamily: generalTitleFont,
    marginBottom: 12,
    marginTop: 4,
  },
  statCardValue: {
    fontSize: xlargeTextSize,
    fontWeight: generalTitleFontWeight,
    color: '#fff',
    fontFamily: generalTitleFont,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: secCardBackgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  videoButton: {
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: generalTextColor,
    fontFamily: generalTitleFont,
    fontSize: commentTextSize,
    fontWeight: generalTitleFontWeight,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: generalTitleSize,
    fontWeight: generalTitleFontWeight,
    color: generalTitleColor,
    fontFamily: generalTitleFont,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 32,
    //backgroundColor: 'red',
  },
  placeholderText: {
    fontSize: generalSmallTextSize,
    color: withdrawnTitleColor,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: generalTextFont,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: generalSmallTextSize,
    color: withdrawnTitleColor,
    marginTop: 12,
    fontFamily: generalTextFont,
  },
  submissionsList: {
    paddingTop: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: generalSmallTextSize,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
});

export default JounalistPannelScreen;
