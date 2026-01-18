import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '../utils/i18n';

// Create the Language Context
const LanguageContext = createContext();

// Create a custom hook to use the LanguageContext
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [appLanguage, setAppLanguage] = useState('en');
  const [contentLanguage, setContentLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preferences on mount
  useEffect(() => {
    loadLanguagePreferences();
  }, []);

  // Update i18n locale when appLanguage changes
  useEffect(() => {
    i18n.locale = appLanguage;
  }, [appLanguage]);

  const loadLanguagePreferences = async () => {
    try {
      // Try to load from AsyncStorage
      const savedAppLanguage = await AsyncStorage.getItem('appLanguage');
      const savedContentLanguage = await AsyncStorage.getItem('contentLanguage');

      if (savedAppLanguage && savedContentLanguage) {
        // Use saved preferences
        setAppLanguage(savedAppLanguage);
        setContentLanguage(savedContentLanguage);
      } else {
        // Detect device language for new users
        const deviceLocale = Localization.getLocales()[0];
        const deviceLanguageCode = deviceLocale?.languageCode || 'en';
        
        // Map device language to our supported languages
        const detectedAppLanguage = deviceLanguageCode === 'fr' ? 'fr' : 'en';
        const detectedContentLanguage = deviceLanguageCode === 'fr' ? 'french' : 'english';
        
        setAppLanguage(detectedAppLanguage);
        setContentLanguage(detectedContentLanguage);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('appLanguage', detectedAppLanguage);
        await AsyncStorage.setItem('contentLanguage', detectedContentLanguage);
      }
    } catch (error) {
      console.error('Error loading language preferences:', error);
      // Default to English on error
      setAppLanguage('en');
      setContentLanguage('english');
    } finally {
      setIsLoading(false);
    }
  };

  const changeAppLanguage = async (newLanguage) => {
    try {
      if (!['en', 'fr'].includes(newLanguage)) {
        throw new Error('Invalid language. Must be "en" or "fr"');
      }

      setAppLanguage(newLanguage);
      await AsyncStorage.setItem('appLanguage', newLanguage);
      
      // Update i18n locale
      i18n.locale = newLanguage;

      return { success: true };
    } catch (error) {
      console.error('Error changing app language:', error);
      return { success: false, error: error.message };
    }
  };

  const changeContentLanguage = async (newContentLanguage) => {
    try {
      if (!['english', 'french', 'both'].includes(newContentLanguage)) {
        throw new Error('Invalid content language. Must be "english", "french", or "both"');
      }

      setContentLanguage(newContentLanguage);
      await AsyncStorage.setItem('contentLanguage', newContentLanguage);

      return { success: true };
    } catch (error) {
      console.error('Error changing content language:', error);
      return { success: false, error: error.message };
    }
  };

  const changeLanguagePreferences = async (newAppLanguage, newContentLanguage) => {
    try {
      if (newAppLanguage && !['en', 'fr'].includes(newAppLanguage)) {
        throw new Error('Invalid app language. Must be "en" or "fr"');
      }

      if (newContentLanguage && !['english', 'french', 'both'].includes(newContentLanguage)) {
        throw new Error('Invalid content language. Must be "english", "french", or "both"');
      }

      if (newAppLanguage) {
        setAppLanguage(newAppLanguage);
        await AsyncStorage.setItem('appLanguage', newAppLanguage);
        i18n.locale = newAppLanguage;
      }

      if (newContentLanguage) {
        setContentLanguage(newContentLanguage);
        await AsyncStorage.setItem('contentLanguage', newContentLanguage);
      }

      return { success: true };
    } catch (error) {
      console.error('Error changing language preferences:', error);
      return { success: false, error: error.message };
    }
  };

  // Translation helper function
  const t = (key, options = {}) => {
    return i18n.t(key, options);
  };

  const value = {
    appLanguage,
    contentLanguage,
    isLoading,
    changeAppLanguage,
    changeContentLanguage,
    changeLanguagePreferences,
    t, // Translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

