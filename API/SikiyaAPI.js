import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo automatically loads .env files and makes EXPO_PUBLIC_* variables available
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sikiya-backend.onrender.com';

const SikiyaAPI = axios.create({
    baseURL: API_URL,
});

// Add interceptor to dynamically add the token from AsyncStorage
SikiyaAPI.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to detect network errors
SikiyaAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error (no response from server)
    if (!error.response) {
      // Network error - no internet, server unreachable, etc.
      error.isNetworkError = true;
      error.errorType = 'network';
    } else if (error.response.status >= 500) {
      // Server error (5xx) - critical error
      error.isCriticalError = true;
      error.errorType = 'critical';
    }
    return Promise.reject(error);
  }
);

// Saved Articles API Functions
/*export const getSavedArticles = async () => {
  try {
    const response = await SikiyaAPI.get('/saved-articles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLatestSavedArticles = async (limit = 10, page = 1) => {
  try {
    const response = await SikiyaAPI.get(`/api/saved-articles/latest?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveArticle = async (articleId) => {
  if (!articleId) {
    console.error('saveArticle called without articleId');
    throw new Error('Article ID is required');
  }
  
  try {
    console.log('Saving article with ID:', articleId);
    const response = await SikiyaAPI.post('/api/saved-articles', { article_id: articleId });
    console.log('Save article response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in saveArticle:', error.message);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const removeSavedArticle = async (savedArticleId) => {
  try {
    const response = await SikiyaAPI.delete(`/api/saved-articles/${savedArticleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSavedArticleById = async (savedArticleId) => {
  try {
    const response = await SikiyaAPI.get(`/api/saved-articles/${savedArticleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get random journalists
export const getRandomJournalists = async () => {
  try {
    const response = await SikiyaAPI.get('/api/journalists/random');
    return response.data;
  } catch (error) {
    console.error('Error fetching random journalists:', error.message);
    throw error;
  }
};
*/
export default SikiyaAPI;