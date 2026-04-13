import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SikiyaAPI from '../../API/SikiyaAPI';
import JournalistSubmissionCard from '../Components/JournalistSubmissionCard';
import {
  generalTitleFont,
  MainBrownSecondaryColor,
  generalTextFont,
  withdrawnTitleColor,
  generalTitleFontWeight,
  generalTitleSize,
  generalTextSize,
  articleTitleFont,
  articleTitleSize,
  homeScreenPadding,
  homeFeedBackgroundColor,
  lightBannerBackgroundColor,
  PrimBtnColor,
} from '../styles/GeneralAppStyle';
import { StatusBar } from 'expo-status-bar';
import MediumLoadingState from '../Components/LoadingComps/MediumLoadingState';
import { useLanguage } from '../Context/LanguageContext';

const JounalistPannelScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [stats, setStats] = useState({
    user_impact: 'Tier 3',
    engagement_score: 0,
    monthly_readers: 0,
    total_articles_published: 0,
    monthly_articles: 0,
    monthly_videos: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const response = await SikiyaAPI.get('/journalist/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const fetchSubmissions = useCallback(async (page = 1, append = false, { skipListLoader = false } = {}) => {
    if (!append && !skipListLoader) {
      setLoadingSubmissions(true);
    } else if (append) {
      setLoadingMore(true);
    }
    setSubmissionsError(null);
    try {
      const response = await SikiyaAPI.get(`/journalist/submissions?page=${page}&limit=10`);
      const data = response.data;
      const newSubmissions = data.submissions || data || [];

      if (append) {
        setSubmissions((prev) => {
          const existingIds = new Set(prev.map((s) => s._id));
          const uniqueSubmissions = newSubmissions.filter((s) => s._id && !existingIds.has(s._id));
          return [...prev, ...uniqueSubmissions];
        });
      } else {
        setSubmissions(newSubmissions);
      }

      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setHasMore(data.pagination.currentPage < data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (!append) {
        setSubmissionsError(t('journalistPanel.failedToLoad'));
      }
    } finally {
      setLoadingSubmissions(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSubmissions(1, false);
  }, [fetchSubmissions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const statsPromise = SikiyaAPI.get('/journalist/stats')
        .then((response) => setStats(response.data))
        .catch((err) => console.error('Error fetching stats:', err));
      await Promise.all([fetchSubmissions(1, false, { skipListLoader: true }), statsPromise]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchSubmissions]);

  const loadMoreSubmissions = () => {
    if (!loadingMore && hasMore && !loadingSubmissions) {
      const nextPage = currentPage + 1;
      fetchSubmissions(nextPage, true);
    }
  };

  const handleAddArticle = () => {
    navigation?.navigate('NewArticleDisclaimer');
  };

  const handleUploadVideo = () => {
    navigation?.navigate('NewVideoDisclaimer');
  };

  const statVal = (v) => (loadingStats ? '—' : v);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MainBrownSecondaryColor}
            colors={[MainBrownSecondaryColor]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreSubmissions();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/SikiyaLogoV2/Sikiya_Logo_banner.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsSectionLabel}>{t('journalistPanel.thisMonth')}</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('journalistPanel.statArticles')}</Text>
            <Text style={styles.statValue}>{statVal(stats.monthly_articles)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('journalistPanel.statVideos')}</Text>
            <Text style={styles.statValue}>{statVal(stats.monthly_videos)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('journalistPanel.engagement')}</Text>
            <Text style={styles.statValue}>{statVal(`${stats.engagement_score}%`)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t('journalistPanel.impactTier')}</Text>
            <Text style={styles.statValue}>{statVal(stats.user_impact)}</Text>
          </View>
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            style={({ pressed }) => [styles.ctaPrimary, pressed && styles.ctaPressed]}
            onPress={handleAddArticle}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" style={styles.ctaIcon} />
            <Text style={styles.ctaPrimaryText}>{t('journalistPanel.newArticle')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ctaSecondary, pressed && styles.ctaPressed]}
            onPress={handleUploadVideo}
            android_ripple={{ color: 'rgba(129, 88, 55, 0.12)' }}
          >
            <Ionicons name="videocam-outline" size={20} color={MainBrownSecondaryColor} style={styles.ctaIcon} />
            <Text style={styles.ctaSecondaryText}>{t('journalistPanel.newVideo')}</Text>
          </Pressable>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>{t('journalistPanel.yourArticles')}</Text>
          <Text style={styles.sectionSubtitle}>{t('journalistPanel.submissionsSubtitle')}</Text>

          {loadingSubmissions ? (
            <View style={styles.loadingContainer}>
              <MediumLoadingState />
              <Text style={styles.loadingText}>{t('journalistPanel.loadingSubmissions')}</Text>
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
                  <JournalistSubmissionCard key={submission._id} submission={submission} navigation={navigation} />
                ))}
              </View>
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={MainBrownSecondaryColor} />
                  <Text style={styles.loadingMoreText}>{t('journalistPanel.loadingMore')}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={withdrawnTitleColor} />
              <Text style={styles.placeholderText}>{t('journalistPanel.noSubmissionsYet')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: homeFeedBackgroundColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerSection: {
    paddingHorizontal: homeScreenPadding,
    paddingTop: 4,
    paddingBottom: 14,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 36, 22, 0.08)',
    backgroundColor: homeFeedBackgroundColor,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 168,
    height: 54,
  },
  statsCard: {
    marginHorizontal: homeScreenPadding,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 36, 22, 0.08)',
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statsSectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: generalTitleFont,
    fontWeight: '700',
    color: withdrawnTitleColor,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  statDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(44, 36, 22, 0.09)',
  },
  statLabel: {
    fontSize: generalTextSize,
    fontFamily: generalTextFont,
    color: '#5C564E',
  },
  statValue: {
    fontSize: generalTitleSize,
    fontFamily: generalTitleFont,
    fontWeight: generalTitleFontWeight,
    color: PrimBtnColor,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: homeScreenPadding,
    marginTop: 20,
    marginBottom: 8,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MainBrownSecondaryColor,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 999,
    minHeight: 48,
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: MainBrownSecondaryColor,
    minHeight: 48,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaIcon: {
    marginRight: 6,
  },
  ctaPrimaryText: {
    color: '#FFFFFF',
    fontFamily: generalTitleFont,
    fontSize: 14,
    fontWeight: '700',
  },
  ctaSecondaryText: {
    color: MainBrownSecondaryColor,
    fontFamily: generalTitleFont,
    fontSize: 14,
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: homeScreenPadding,
    paddingTop: 22,
  },
  sectionTitle: {
    fontSize: articleTitleSize + 2,
    fontWeight: '700',
    color: PrimBtnColor,
    fontFamily: articleTitleFont,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 13,
    fontFamily: generalTextFont,
    color: withdrawnTitleColor,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: lightBannerBackgroundColor,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 36, 22, 0.06)',
  },
  placeholderText: {
    fontSize: 14,
    color: withdrawnTitleColor,
    textAlign: 'center',
    marginTop: 14,
    fontFamily: generalTextFont,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    fontSize: 13,
    color: withdrawnTitleColor,
    marginTop: 12,
    fontFamily: generalTextFont,
  },
  submissionsList: {
    paddingTop: 4,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 13,
    color: withdrawnTitleColor,
    fontFamily: generalTextFont,
  },
});

export default JounalistPannelScreen;
