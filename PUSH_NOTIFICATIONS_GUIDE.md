# Push Notifications Setup Guide

This guide explains how push notifications work in React Native with Expo and how to set them up for the Sikiya app.

## 📋 Overview

Push notifications allow your app to send messages to users even when the app is closed. In React Native with Expo, this is handled through:

1. **Expo Push Notification Service (EPNS)** - Expo's managed service for sending push notifications
2. **expo-notifications** - The package that handles receiving and displaying notifications
3. **Your Backend** - Where you store push tokens and send notifications

## 🔄 How Push Notifications Work

### The Flow:

1. **App Requests Permission** → User grants/denies notification permission
2. **App Gets Push Token** → Expo generates a unique token for this device/app
3. **App Sends Token to Backend** → Your backend stores the token associated with the user
4. **Backend Sends Notification** → When you want to notify a user, your backend sends a request to Expo's servers
5. **Expo Delivers Notification** → Expo's servers push the notification to the device
6. **Device Shows Notification** → The device displays the notification to the user

### Key Components:

- **Push Token**: A unique identifier for each device/app installation (looks like `ExponentPushToken[xxxxx]`)
- **Expo Push API**: The endpoint your backend calls to send notifications
- **Notification Handlers**: Code that runs when notifications are received

## 🚀 Setup Steps

### 1. Install Dependencies (✅ Already Done)

```bash
npm install expo-notifications expo-device
```

### 2. Configure app.json (✅ Already Done)

The `app.json` has been updated with the `expo-notifications` plugin configuration.

### 3. Set Up Expo Project ID

You need to set your Expo Project ID. This is required for push tokens to work.

**Option A: Using EAS (Recommended for Production)**

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Your project ID will be in `app.json` under `expo.extra.eas.projectId`

**Option B: Using Expo's Legacy Service**

1. Go to [expo.dev](https://expo.dev)
2. Create/select your project
3. Get your project ID from the project settings
4. Add to your `.env` file:
   ```
   EXPO_PUBLIC_PROJECT_ID=your-project-id-here
   ```

### 4. Backend Setup

Your backend needs to:

1. **Store Push Tokens**: When a user logs in, store their push token
   ```javascript
   // POST /user/push-token
   {
     "pushToken": "ExponentPushToken[xxxxx]",
     "platform": "ios" // or "android",
     "deviceId": "iPhone 13"
   }
   ```

2. **Send Notifications**: When you want to notify a user, send to Expo's API
   ```javascript
   // POST https://exp.host/--/api/v2/push/send
   {
     "to": "ExponentPushToken[xxxxx]",
     "title": "New Article Published",
     "body": "Check out the latest news!",
     "data": {
       "articleId": "123",
       "type": "new_article"
     }
   }
   ```

## 📱 How It Works in Your App

### Initialization

When the app starts and the user is authenticated, the notification service:

1. Checks if the device is physical (notifications don't work on simulators)
2. Requests notification permissions from the user
3. Gets the Expo Push Token
4. Sends the token to your backend for storage

This happens automatically in `App.js` when `state.token` exists.

### Receiving Notifications

The app has two listeners set up:

1. **Foreground Notifications**: When the app is open and a notification arrives
   - Handled by `handleNotificationReceived` in `App.js`
   - You can customize this to show in-app banners, update UI, etc.

2. **Notification Taps**: When the user taps on a notification
   - Handled by `handleNotificationTapped` in `App.js`
   - You can navigate to specific screens based on notification data

### Notification Data Structure

When you send a notification, you can include custom data:

```javascript
{
  "to": "ExponentPushToken[xxxxx]",
  "title": "New Comment",
  "body": "Someone commented on your article",
  "data": {
    "type": "comment",
    "articleId": "123",
    "commentId": "456",
    "userId": "789"
  }
}
```

This data is available in the notification handlers, allowing you to navigate to specific content.

## 🛠️ Using the Notification Service

### Manual Functions

The `notificationService.js` provides several functions you can use:

```javascript
import {
  requestNotificationPermissions,
  getExpoPushToken,
  sendLocalNotification,
  setBadgeCount,
  clearBadgeCount,
} from './src/services/notificationService';

// Request permissions manually (usually automatic)
await requestNotificationPermissions();

// Get the current push token
const token = await getExpoPushToken();

// Send a local notification (for testing)
await sendLocalNotification(
  "Test Notification",
  "This is a test notification",
  { test: true }
);

// Set badge count
await setBadgeCount(5);

// Clear badge count
await clearBadgeCount();
```

### Testing Notifications

#### Using Expo's Tool

1. Get your push token (check console logs when app starts)
2. Go to [Expo Push Notification Tool](https://expo.dev/notifications)
3. Enter your token and send a test notification

#### Using cURL

```bash
curl -H "Content-Type: application/json" \
     -X POST https://exp.host/--/api/v2/push/send \
     -d '{
       "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
       "title": "Test",
       "body": "This is a test notification"
     }'
```

#### Using Your Backend

Create an endpoint that sends notifications:

```javascript
// Backend example (Node.js)
const axios = require('axios');

async function sendPushNotification(pushToken, title, body, data = {}) {
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    });
    return response.data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
```

## 🔐 Permissions & Production Builds

### Development Builds (EAS Build --profile development)

- ✅ **Works with minimal setup** - Just need `EXPO_PUBLIC_PROJECT_ID`
- ✅ Uses Expo's managed push notification service
- ✅ Perfect for testing on physical devices
- ✅ No additional certificates needed

### Production Builds (Standalone Apps / App Store / Play Store)

**iOS**:
- ⚠️ **Requires APNs (Apple Push Notification service) certificates**
  - Create APNs key in Apple Developer Portal
  - Upload to EAS Build when creating production build
  - EAS will automatically configure everything
  - See `PRODUCTION_PUSH_NOTIFICATIONS.md` for detailed steps

**Android**:
- ⚠️ **Requires Firebase Cloud Messaging (FCM)**
  - Create Firebase project
  - Add `google-services.json` to project root
  - Configure in `app.json` (already done)
  - See `PRODUCTION_PUSH_NOTIFICATIONS.md` for detailed steps

**Important**: For production builds, you'll need to set up platform-specific credentials. However, the code you've written will work the same way - Expo handles the routing automatically once credentials are configured.

📖 **See `PRODUCTION_PUSH_NOTIFICATIONS.md` for complete production setup guide.**

## 📝 Important Notes

1. **Physical Devices Only**: Push notifications only work on physical devices, not simulators/emulators
2. **Permissions Required**: Users must grant notification permissions
3. **Token Changes**: Push tokens can change (app reinstall, OS update), so update your backend regularly
4. **Backend Required**: You need a backend to send notifications (Expo only receives them)
5. **Production Setup**: For production, you'll need to configure APNs (iOS) and FCM (Android)

## 🐛 Troubleshooting

### Notifications Not Working?

1. **Check Device**: Make sure you're testing on a physical device
2. **Check Permissions**: Verify notification permissions are granted
3. **Check Token**: Ensure the push token is being generated and sent to backend
4. **Check Backend**: Verify your backend is correctly calling Expo's API
5. **Check Console**: Look for error messages in the console

### Token Not Generated?

- Make sure `EXPO_PUBLIC_PROJECT_ID` is set in your `.env` file
- Check that `expo-notifications` is properly installed
- Verify `app.json` has the notification plugin configured

### Notifications Not Showing?

- Check device notification settings (not just app settings)
- Verify the notification payload is correct
- Check that your backend is successfully calling Expo's API
- Look for errors in Expo's push notification logs

## 🔗 Useful Links

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Expo Push API Reference](https://docs.expo.dev/push-notifications/sending-notifications/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 📚 Next Steps

1. **Set up your Expo Project ID** in `.env` file
2. **Update your backend** to store push tokens and send notifications
3. **Test on a physical device** using Expo Go or a development build
4. **Configure production push certificates** (APNs for iOS, FCM for Android) when ready for production
5. **Customize notification handlers** in `App.js` to navigate to specific screens based on notification data

## 💡 Example: Sending Notification from Backend

Here's a complete example of how your backend might send a notification:

```javascript
// Backend endpoint example
app.post('/notifications/send', async (req, res) => {
  const { userId, title, body, data } = req.body;
  
  // Get user's push token from database
  const user = await User.findById(userId);
  if (!user || !user.pushToken) {
    return res.status(404).json({ error: 'User or push token not found' });
  }
  
  // Send notification via Expo
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: user.pushToken,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    });
    
    res.json({ success: true, result: response.data });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

---

**Need Help?** Check the Expo documentation or reach out with specific questions about your implementation!

