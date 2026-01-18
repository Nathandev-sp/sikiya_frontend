/**
 * Push Notification Service
 * Handles push notification registration, permissions, and token management
 * 
 * This service handles:
 * - Requesting notification permissions
 * - Registering device for push notifications
 * - Getting and storing push notification tokens
 * - Sending tokens to backend
 * - Handling incoming notifications
 * - Setting up notification listeners
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SikiyaAPI from '../../API/SikiyaAPI';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Storage keys
const EXPO_PUSH_TOKEN_KEY = 'expoPushToken';
const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionStatus';

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} True if permission granted, false otherwise
 */
export const requestNotificationPermissions = async () => {
  try {
    // Check if device is physical (notifications don't work on simulators/emulators)
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Save permission status
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, finalStatus);

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    console.log('Notification permission granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get the Expo Push Token for this device
 * This token is unique to this device and app installation
 * @returns {Promise<string|null>} The push token or null if unavailable
 */
export const getExpoPushToken = async () => {
  try {
    // Check if device is physical
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check if we already have a stored token
    const storedToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
    if (storedToken) {
      console.log('Using stored push token');
      return storedToken;
    }

    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Get the push token from Expo
    // Use projectId from app.json (EAS project ID)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '960ca8c8-7e44-4e44-9c92-f52c3fc09da2', // From app.json extra.eas.projectId
    });

    const token = tokenData.data;
    
    // Store the token locally
    await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
    
    console.log('Expo Push Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting Expo Push Token:', error);
    return null;
  }
};

/**
 * Register device with backend by sending push token
 * @param {string} pushToken - The Expo push token
 * @returns {Promise<boolean>} True if registration successful
 */
export const registerDeviceWithBackend = async (pushToken) => {
  try {
    if (!pushToken) {
      console.warn('No push token provided');
      return false;
    }

    // Send token to your backend
    // Adjust the endpoint based on your backend API
    const response = await SikiyaAPI.post('/user/push-token', {
      pushToken,
      platform: Platform.OS,
      deviceId: Device.modelName || 'unknown',
    });

    if (response.status === 200 || response.status === 201) {
      console.log('Device registered with backend successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error registering device with backend:', error);
    // Don't throw - this is not critical for app functionality
    return false;
  }
};

/**
 * Initialize push notifications
 * Call this when your app starts (e.g., in App.js)
 * @returns {Promise<boolean>} True if initialization successful
 */
export const initializePushNotifications = async () => {
  try {
    console.log('Initializing push notifications...');

    // Get push token
    const pushToken = await getExpoPushToken();
    
    if (!pushToken) {
      console.warn('Could not get push token');
      return false;
    }

    // Register with backend
    await registerDeviceWithBackend(pushToken);

    console.log('Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Set up notification listeners
 * Call this to handle notifications when app is in foreground/background
 * @param {Function} onNotificationReceived - Callback when notification is received
 * @param {Function} onNotificationTapped - Callback when user taps notification
 * @returns {Array} Array of subscription objects to unsubscribe later
 */
export const setupNotificationListeners = (onNotificationReceived, onNotificationTapped) => {
  const subscriptions = [];

  // Listener for notifications received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  subscriptions.push(receivedSubscription, responseSubscription);
  return subscriptions;
};

/**
 * Send a local notification (for testing or app-triggered notifications)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to attach
 */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // null means show immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

/**
 * Get badge count
 */
export const getBadgeCount = async () => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

/**
 * Set badge count
 * @param {number} count - Badge count to set
 */
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Clear badge count
 */
export const clearBadgeCount = async () => {
  await setBadgeCount(0);
};

/**
 * Unregister device from push notifications
 * Call this when user logs out or disables notifications
 */
export const unregisterDevice = async () => {
  try {
    // Get current token before removing
    const pushToken = await AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
    
    // Remove token from storage
    await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
    
    // Notify backend to remove this specific token
    if (pushToken) {
      try {
        await SikiyaAPI.delete('/user/push-token', {
          data: { pushToken } // Send token to identify which device to remove
        });
        console.log('Push token removed from backend');
      } catch (error) {
        console.error('Error removing push token from backend:', error);
        // Don't throw - local cleanup is still successful
      }
    }
    
    console.log('Device unregistered from push notifications');
  } catch (error) {
    console.error('Error unregistering device:', error);
  }
};

